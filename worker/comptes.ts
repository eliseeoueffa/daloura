// Comptes : email + code secret à 4 chiffres, gérés par Better Auth (worker/auth.ts).
// Nos routes /api/compte/* enveloppent Better Auth pour ajouter ce que Daloura demande :
// - code de exactement 4 chiffres ;
// - 3 codes faux de suite => connexion bloquée 15 minutes (compteur atomique dans users) ;
// - 3 perles offertes à l'inscription (une fois par compte et par téléphone) ;
// - lien « code oublié » par email via MakiSend (3 par heure au plus), valable 30 minutes, une fois ;
// - requêtes qui modifient quelque chose en JSON seulement (un autre site ne peut pas en envoyer).
// La session est le cookie de Better Auth (HttpOnly, Secure, SameSite=Lax).
import { creerAuth, LIEN_MINUTES, type EnvAuth } from "./auth";
import { emailValide, normaliserEmail } from "../src/lib/emails";
import { offrirBienvenue } from "./perles";

export { hacherCode, verifierCode } from "./codes";

export type EnvComptes = EnvAuth & { MAKISEND_URL?: string; MAKISEND_API_KEY?: string };

export const ESSAIS_MAX = 3;
export const BLOCAGE_MS = 15 * 60_000;
const LIENS_PAR_HEURE = 3;

const json = (data: unknown, status = 200, headers?: Headers) => {
  const h = new Headers(headers);
  h.set("cache-control", "no-store");
  return Response.json(data, { status, headers: h });
};
const erreur = (code: string, status: number, extra: Record<string, unknown> = {}) =>
  json({ error: code, ...extra }, status);
export const codeValide = (c: unknown): c is string => typeof c === "string" && /^\d{4}$/.test(c);

/** Ne garde, d'une réponse de Better Auth, que les cookies à renvoyer au navigateur. */
function cookiesDe(r: Response): Headers {
  const h = new Headers();
  for (const c of r.headers.getSetCookie()) h.append("set-cookie", c);
  return h;
}

async function corpsJson(request: Request): Promise<Record<string, unknown> | null> {
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) return null;
  try {
    const c = await request.json();
    return c && typeof c === "object" ? (c as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

const appareilDe = (request: Request) => {
  const a = request.headers.get("x-daloura-appareil") ?? "";
  return /^[a-f0-9]{32}$/.test(a) ? a : null;
};

// ─── Email (MakiSend) ───────────────────────────────────────────────────────

async function envoyerEmail(
  env: EnvComptes,
  message: { to: string; subject: string; html: string; text: string; cle: string },
): Promise<boolean> {
  if (!env.MAKISEND_URL || !env.MAKISEND_API_KEY) return false;
  const r = await fetch(new URL("/send-email", env.MAKISEND_URL), {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.MAKISEND_API_KEY}`,
      "content-type": "application/json",
      "idempotency-key": message.cle,
    },
    body: JSON.stringify({ to: message.to, subject: message.subject, html: message.html, text: message.text }),
  }).catch(() => null);
  return !!r && r.status >= 200 && r.status < 300;
}

function emailNouveauCode(lien: string) {
  const text = `Bonjour,

Tu as demandé à choisir un nouveau code secret pour Daloura.
Ouvre ce lien (valable ${LIEN_MINUTES} minutes) :
${lien}

Si ce n'est pas toi, ignore cet email : ton code actuel reste valable.

Daloura`;
  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#F5EFE6;font-family:Arial,sans-serif;color:#49332F">
<div style="max-width:440px;margin:0 auto;padding:32px 20px">
<p style="font-size:22px;font-weight:bold;color:#702D43;margin:0 0 20px">daloura</p>
<p style="font-size:16px;line-height:1.5">Tu as demandé à choisir un nouveau code secret.</p>
<p style="margin:28px 0"><a href="${lien}" style="background:#702D43;color:#FFFBF4;text-decoration:none;font-weight:bold;padding:14px 22px;border-radius:10px;display:inline-block">Choisir mon nouveau code</a></p>
<p style="font-size:14px;line-height:1.5">Ce lien est valable ${LIEN_MINUTES} minutes. Si ce n'est pas toi, ignore cet email : ton code actuel reste valable.</p>
</div></body></html>`;
  return { subject: "Ton lien pour choisir un nouveau code Daloura", html, text };
}

// ─── Session ────────────────────────────────────────────────────────────────

/** L'utilisatrice connectée (profil de l'appli), ou null. */
export async function compteConnecte(
  request: Request,
  env: EnvComptes,
): Promise<{ id: string; email: string; perles: number } | null> {
  if (!env.BETTER_AUTH_SECRET) return null;
  const auth = creerAuth(env, new URL(request.url).origin, async () => {});
  const s = await auth.api.getSession({ headers: request.headers }).catch(() => null);
  if (!s) return null;
  return env.DB.prepare("SELECT id, email, perles FROM users WHERE id = ?")
    .bind(s.user.id)
    .first<{ id: string; email: string; perles: number }>();
}

// ─── Routes ─────────────────────────────────────────────────────────────────

/**
 *   POST /api/compte/verifier-email { email }        → { existe }
 *   POST /api/compte/inscription   { email, code }   → { email, perles } + cookie
 *   POST /api/compte/connexion     { email, code }   → { email, perles } + cookie
 *   POST /api/compte/deconnexion
 *   GET  /api/compte/moi                             → { email, perles } | 401
 *   POST /api/compte/code-oublie   { email }         → { ok } (toujours, sauf panne d'envoi)
 *   POST /api/compte/nouveau-code  { jeton, code }   → { email, perles } + cookie
 */
export async function routeComptes(request: Request, env: EnvComptes, chemin: string) {
  // Sans secret, Better Auth ne peut pas signer les sessions : on refuse plutôt que d'être fragile.
  if (!env.BETTER_AUTH_SECRET) return erreur("configuration_incomplete", 503);
  const db = env.DB;
  const origine = new URL(request.url).origin;
  let lienEnvoye: boolean | null = null;
  const auth = creerAuth(env, origine, async ({ email, jeton }) => {
    const lien = `${origine}/code-nouveau?jeton=${encodeURIComponent(jeton)}`;
    lienEnvoye = await envoyerEmail(env, { to: email, cle: jeton, ...emailNouveauCode(lien) });
  });

  if (chemin === "/moi" && request.method === "GET") {
    const c = await compteConnecte(request, env);
    return c ? json({ email: c.email, perles: c.perles }) : erreur("non_connecte", 401);
  }
  if (request.method !== "POST") return erreur("not_found", 404);
  const corps = await corpsJson(request);
  if (!corps) return erreur("json_attendu", 415);

  if (chemin === "/deconnexion") {
    const r = await auth.api.signOut({ headers: request.headers, asResponse: true }).catch(() => null);
    return json({ ok: true }, 200, r ? cookiesDe(r) : undefined);
  }

  if (chemin === "/nouveau-code") {
    const jeton = typeof corps.jeton === "string" ? corps.jeton : "";
    if (!codeValide(corps.code)) return erreur("code_invalide", 400);
    const lien = await db
      .prepare(
        `SELECT u.id, u.email FROM auth_verification v JOIN users u ON u.id = v.value
         WHERE v.identifier = ? AND v.expires_at > ?`,
      )
      .bind(`reset-password:${jeton}`, new Date().toISOString())
      .first<{ id: string; email: string }>();
    if (!lien) return erreur("lien_invalide", 400);
    const r = await auth.api
      .resetPassword({ body: { newPassword: corps.code, token: jeton }, headers: request.headers, asResponse: true })
      .catch(() => null);
    if (!r || !r.ok) return erreur("lien_invalide", 400);
    await db.prepare("UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?").bind(lien.id).run();
    const s = await auth.api.signInEmail({
      body: { email: lien.email, password: corps.code },
      headers: request.headers,
      asResponse: true,
    });
    const u = await db.prepare("SELECT email, perles FROM users WHERE id = ?").bind(lien.id).first();
    return json(u, 200, cookiesDe(s));
  }

  const email = normaliserEmail(corps.email);
  if (!emailValide(email)) return erreur("email_invalide", 400);

  if (chemin === "/verifier-email") {
    const u = await db.prepare("SELECT 1 FROM auth_user WHERE email = ?").bind(email).first();
    return json({ existe: !!u });
  }

  if (chemin === "/inscription") {
    if (!codeValide(corps.code)) return erreur("code_invalide", 400);
    const r = await auth.api
      .signUpEmail({ body: { email, password: corps.code, name: "" }, headers: request.headers, asResponse: true })
      .catch((e: unknown) => e);
    if (!(r instanceof Response) || !r.ok) {
      const deja = await db.prepare("SELECT 1 FROM auth_user WHERE email = ?").bind(email).first();
      if (deja) return erreur("email_existant", 409);
      throw r instanceof Error ? r : new Error(`inscription : ${r instanceof Response ? r.status : String(r)}`);
    }
    const u = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first<{ id: string }>();
    const cadeau = await offrirBienvenue(db, u!.id, appareilDe(request));
    return json(
      { email, perles: cadeau.ok ? cadeau.perles : 0, cadeau: cadeau.ok ? "offert" : cadeau.raison },
      201,
      cookiesDe(r),
    );
  }

  if (chemin === "/connexion") {
    if (!codeValide(corps.code)) return erreur("code_invalide", 400);
    const now = Date.now();
    const u = await db
      .prepare("SELECT id, locked_until, perles FROM users WHERE email = ?")
      .bind(email)
      .first<{ id: string; locked_until: number | null; perles: number }>();
    if (!u) return erreur("compte_inconnu", 404);
    if (u.locked_until && u.locked_until > now) return erreur("bloque", 423, { jusqua: u.locked_until });
    const r = await auth.api
      .signInEmail({ body: { email, password: corps.code }, headers: request.headers, asResponse: true })
      .catch(() => null);
    if (r?.ok) {
      await db.prepare("UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?").bind(u.id).run();
      return json({ email, perles: u.perles }, 200, cookiesDe(r));
    }
    // Compteur atomique : deux essais simultanés comptent bien pour deux.
    const c = await db
      .prepare("UPDATE users SET failed_attempts = failed_attempts + 1 WHERE id = ? RETURNING failed_attempts")
      .bind(u.id)
      .first<{ failed_attempts: number }>();
    const rates = c?.failed_attempts ?? ESSAIS_MAX;
    if (rates >= ESSAIS_MAX) {
      await db
        .prepare("UPDATE users SET failed_attempts = 0, locked_until = ? WHERE id = ?")
        .bind(now + BLOCAGE_MS, u.id)
        .run();
      return erreur("bloque", 423, { jusqua: now + BLOCAGE_MS });
    }
    return erreur("code_incorrect", 401, { restantes: ESSAIS_MAX - rates });
  }

  if (chemin === "/code-oublie") {
    const u = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first<{ id: string }>();
    // Même réponse que le compte existe ou non (sauf panne d'envoi).
    if (!u) return json({ ok: true });
    const recents = await db
      .prepare(
        "SELECT COUNT(*) AS n FROM auth_verification WHERE value = ? AND identifier LIKE 'reset-password:%' AND created_at > ?",
      )
      .bind(u.id, new Date(Date.now() - 3600_000).toISOString())
      .first<{ n: number }>();
    if ((recents?.n ?? 0) >= LIENS_PAR_HEURE) return json({ ok: true });
    await auth.api.requestPasswordReset({ body: { email, redirectTo: "/code-nouveau" }, headers: request.headers });
    if (lienEnvoye !== true) {
      // Lien non envoyé : on l'efface pour qu'il ne compte pas et ne traîne pas.
      await db
        .prepare(
          "DELETE FROM auth_verification WHERE value = ? AND identifier LIKE 'reset-password:%' AND created_at = (SELECT MAX(created_at) FROM auth_verification WHERE value = ?)",
        )
        .bind(u.id, u.id)
        .run();
      return erreur("email_indisponible", 503);
    }
    return json({ ok: true });
  }

  return erreur("not_found", 404);
}
