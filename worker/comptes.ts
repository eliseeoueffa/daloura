// Comptes : email + code secret à 4 chiffres, sessions par cookie, code oublié par email (MakiSend).
//
// Sécurité :
// - le code est haché (PBKDF2-SHA256, 100 000 itérations, sel aléatoire), jamais stocké en clair ;
// - 3 codes faux de suite => connexion bloquée 15 minutes (compteur incrémenté de façon atomique) ;
// - session = jeton aléatoire de 256 bits dans un cookie HttpOnly/Secure/SameSite=Lax ; en base, seule
//   son empreinte SHA-256 est gardée ;
// - les requêtes qui modifient quelque chose doivent être en JSON (un autre site ne peut pas en
//   envoyer sans autorisation CORS) ;
// - lien « code oublié » : jeton de 256 bits, valable 30 minutes, une seule fois, 3 envois par heure max.
import { emailValide, normaliserEmail } from "../src/lib/emails";
import { offrirBienvenue } from "./perles";

export type EnvComptes = { DB: D1Database; MAKISEND_URL?: string; MAKISEND_API_KEY?: string };

export const ESSAIS_MAX = 3;
export const BLOCAGE_MS = 15 * 60_000;
const SESSION_MS = 90 * 24 * 3600_000;
const LIEN_MS = 30 * 60_000;
const LIENS_PAR_HEURE = 3;
const ITERATIONS = 100_000;
export const COOKIE = "__Host-daloura";

const json = (data: unknown, status = 200, headers: HeadersInit = {}) =>
  Response.json(data, { status, headers: { "cache-control": "no-store", ...headers } });
const erreur = (code: string, status: number, extra: Record<string, unknown> = {}) =>
  json({ error: code, ...extra }, status);

// ─── Outils ─────────────────────────────────────────────────────────────────

const b64 = (b: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(b)));
const deb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
const aleatoire = (n: number) =>
  b64(crypto.getRandomValues(new Uint8Array(n))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const sha256 = async (s: string) => hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));

async function pbkdf2(code: string, sel: Uint8Array, iterations: number): Promise<Uint8Array> {
  const cle = await crypto.subtle.importKey("raw", new TextEncoder().encode(code), "PBKDF2", false, ["deriveBits"]);
  return new Uint8Array(
    await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: sel, iterations }, cle, 256),
  );
}

export async function hacherCode(code: string): Promise<string> {
  const sel = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${ITERATIONS}$${b64(sel)}$${b64(await pbkdf2(code, sel, ITERATIONS))}`;
}

export async function verifierCode(code: string, stocke: string): Promise<boolean> {
  const [algo, it, sel, attendu] = stocke.split("$");
  if (algo !== "pbkdf2" || !sel || !attendu) return false;
  const obtenu = await pbkdf2(code, deb64(sel), Number(it));
  const ref = deb64(attendu);
  if (obtenu.length !== ref.length) return false;
  let diff = 0;
  for (let i = 0; i < ref.length; i++) diff |= obtenu[i] ^ ref[i]; // comparaison à temps constant
  return diff === 0;
}

export const codeValide = (c: unknown): c is string => typeof c === "string" && /^\d{4}$/.test(c);

function lireCookie(request: Request, nom: string): string | null {
  for (const morceau of (request.headers.get("cookie") ?? "").split(";")) {
    const [k, ...v] = morceau.trim().split("=");
    if (k === nom) return v.join("=");
  }
  return null;
}

const cookieSession = (jeton: string) =>
  `${COOKIE}=${jeton}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_MS / 1000}`;
const cookieEfface = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

async function ouvrirSession(db: D1Database, userId: string, appareil: string | null, now: number) {
  const jeton = aleatoire(32);
  await db
    .prepare("INSERT INTO sessions (token_hash, user_id, device_id, created_at, expires_at, last_seen_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(await sha256(jeton), userId, appareil, now, now + SESSION_MS, now)
    .run();
  return cookieSession(jeton);
}

/** L'utilisatrice connectée, ou null. */
export async function compteConnecte(
  request: Request,
  db: D1Database,
  now = Date.now(),
): Promise<{ id: string; email: string; perles: number } | null> {
  const jeton = lireCookie(request, COOKIE);
  if (!jeton) return null;
  return db
    .prepare(
      "SELECT u.id, u.email, u.perles FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?",
    )
    .bind(await sha256(jeton), now)
    .first<{ id: string; email: string; perles: number }>();
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
Ouvre ce lien (valable 30 minutes) :
${lien}

Si ce n'est pas toi, ignore cet email : ton code actuel reste valable.

Daloura`;
  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#F5EFE6;font-family:Arial,sans-serif;color:#49332F">
<div style="max-width:440px;margin:0 auto;padding:32px 20px">
<p style="font-size:22px;font-weight:bold;color:#702D43;margin:0 0 20px">daloura</p>
<p style="font-size:16px;line-height:1.5">Tu as demandé à choisir un nouveau code secret.</p>
<p style="margin:28px 0"><a href="${lien}" style="background:#702D43;color:#FFFBF4;text-decoration:none;font-weight:bold;padding:14px 22px;border-radius:10px;display:inline-block">Choisir mon nouveau code</a></p>
<p style="font-size:14px;line-height:1.5">Ce lien est valable 30 minutes. Si ce n'est pas toi, ignore cet email : ton code actuel reste valable.</p>
</div></body></html>`;
  return { subject: "Ton lien pour choisir un nouveau code Daloura", html, text };
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
export async function routeComptes(request: Request, env: EnvComptes, chemin: string, now = Date.now()) {
  const db = env.DB;

  if (chemin === "/moi" && request.method === "GET") {
    const c = await compteConnecte(request, db, now);
    return c ? json({ email: c.email, perles: c.perles }) : erreur("non_connecte", 401);
  }
  if (request.method !== "POST") return erreur("not_found", 404);
  const corps = await corpsJson(request);
  if (!corps) return erreur("json_attendu", 415);

  if (chemin === "/deconnexion") {
    const jeton = lireCookie(request, COOKIE);
    if (jeton) await db.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(jeton)).run();
    return json({ ok: true }, 200, { "set-cookie": cookieEfface() });
  }

  if (chemin === "/nouveau-code") {
    const jeton = typeof corps.jeton === "string" ? corps.jeton : "";
    if (!codeValide(corps.code)) return erreur("code_invalide", 400);
    const lien = await db
      .prepare(
        `SELECT ec.id, u.id AS user_id FROM email_codes ec JOIN users u ON u.email = ec.email
         WHERE ec.code_hash = ? AND ec.purpose = 'reset_code' AND ec.used_at IS NULL AND ec.expires_at > ?`,
      )
      .bind(await sha256(jeton), now)
      .first<{ id: string; user_id: string }>();
    if (!lien) return erreur("lien_invalide", 400);
    const r = await db.batch([
      db.prepare("UPDATE email_codes SET used_at = ? WHERE id = ? AND used_at IS NULL").bind(now, lien.id),
      db
        .prepare(
          "UPDATE users SET code_hash = ?, failed_attempts = 0, locked_until = NULL, updated_at = ? WHERE id = ? AND EXISTS (SELECT 1 FROM email_codes WHERE id = ? AND used_at = ?)",
        )
        .bind(await hacherCode(corps.code), now, lien.user_id, lien.id, now),
      // Nouveau code : toutes les anciennes sessions sont fermées.
      db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(lien.user_id),
    ]);
    if (!r[0].meta.changes) return erreur("lien_invalide", 400); // utilisé en même temps ailleurs
    const u = await db.prepare("SELECT email, perles FROM users WHERE id = ?").bind(lien.user_id).first<{ email: string; perles: number }>();
    return json(u, 200, { "set-cookie": await ouvrirSession(db, lien.user_id, appareilDe(request), now) });
  }

  const email = normaliserEmail(corps.email);
  if (!emailValide(email)) return erreur("email_invalide", 400);

  if (chemin === "/verifier-email") {
    const u = await db.prepare("SELECT 1 FROM users WHERE email = ?").bind(email).first();
    return json({ existe: !!u });
  }

  if (chemin === "/inscription") {
    if (!codeValide(corps.code)) return erreur("code_invalide", 400);
    const id = crypto.randomUUID();
    try {
      await db
        .prepare("INSERT INTO users (id, email, code_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)")
        .bind(id, email, await hacherCode(corps.code), now, now)
        .run();
    } catch (e) {
      if (String(e).includes("UNIQUE")) return erreur("email_existant", 409);
      throw e;
    }
    const appareil = appareilDe(request);
    const cadeau = await offrirBienvenue(db, id, appareil, now);
    return json({ email, perles: cadeau.ok ? cadeau.perles : 0, cadeau: cadeau.ok ? "offert" : cadeau.raison }, 201, {
      "set-cookie": await ouvrirSession(db, id, appareil, now),
    });
  }

  if (chemin === "/connexion") {
    if (!codeValide(corps.code)) return erreur("code_invalide", 400);
    const u = await db
      .prepare("SELECT id, code_hash, locked_until, perles FROM users WHERE email = ?")
      .bind(email)
      .first<{ id: string; code_hash: string; locked_until: number | null; perles: number }>();
    if (!u) return erreur("compte_inconnu", 404);
    if (u.locked_until && u.locked_until > now) return erreur("bloque", 423, { jusqua: u.locked_until });
    if (await verifierCode(corps.code, u.code_hash)) {
      await db.prepare("UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?").bind(u.id).run();
      return json({ email, perles: u.perles }, 200, {
        "set-cookie": await ouvrirSession(db, u.id, appareilDe(request), now),
      });
    }
    // Compteur atomique : deux essais simultanés comptent bien pour deux.
    const r = await db
      .prepare("UPDATE users SET failed_attempts = failed_attempts + 1 WHERE id = ? RETURNING failed_attempts")
      .bind(u.id)
      .first<{ failed_attempts: number }>();
    const rates = r?.failed_attempts ?? ESSAIS_MAX;
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
    const u = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    // Même réponse que le compte existe ou non (sauf panne d'envoi).
    if (!u) return json({ ok: true });
    const recents = await db
      .prepare("SELECT COUNT(*) AS n FROM email_codes WHERE email = ? AND purpose = 'reset_code' AND created_at > ?")
      .bind(email, now - 3600_000)
      .first<{ n: number }>();
    if ((recents?.n ?? 0) >= LIENS_PAR_HEURE) return json({ ok: true });
    const jeton = aleatoire(32);
    const id = crypto.randomUUID();
    await db
      .prepare("INSERT INTO email_codes (id, email, purpose, code_hash, created_at, expires_at) VALUES (?, ?, 'reset_code', ?, ?, ?)")
      .bind(id, email, await sha256(jeton), now, now + LIEN_MS)
      .run();
    const lien = `${new URL(request.url).origin}/code-nouveau?jeton=${jeton}`;
    const envoye = await envoyerEmail(env, { to: email, cle: id, ...emailNouveauCode(lien) });
    if (!envoye) {
      await db.prepare("DELETE FROM email_codes WHERE id = ?").bind(id).run();
      return erreur("email_indisponible", 503);
    }
    return json({ ok: true });
  }

  return erreur("not_found", 404);
}
