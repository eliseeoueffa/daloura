// Routes des comptes : /api/auth/*
import {
  emailValide,
  normaliserEmail,
  normaliserPrenom,
  prenomValide,
  verifierCode,
} from "../../shared/validation";
import type { Mailer, ModeleEmail } from "../email/mailer";
import { burnCodeCheck, hashCode, randomToken, sha256Hex, verifyCode } from "../lib/crypto";
import { erreur, HttpError, ipDe, json, lireJson, texte } from "../lib/http";
import { bloquer, dureeBlocage, MAX_ESSAIS, remiseAZero, reserverTentative } from "../lib/lockout";
import { consommer, LIMITES } from "../lib/rateLimit";
import {
  appareilConnu,
  cookieAppareil,
  cookieSession,
  cookieSessionEfface,
  creerSession,
  sessionCourante,
  supprimerSession,
  versClient,
  type UtilisatriceRow,
} from "./session";

export type Deps = {
  db: D1Database;
  mailer: Mailer;
  now: () => number;
  appUrl: string;
  /** Pour finir un travail après la réponse (ctx.waitUntil). */
  waitUntil: (p: Promise<unknown>) => void;
};

const HEURE = 3_600_000;
const DUREE_LIEN_REINITIALISATION = HEURE;
const DUREE_LIEN_VERIFICATION = 24 * HEURE;

type Ctx = { request: Request; deps: Deps };

function emailDuCorps(body: Record<string, unknown>): string {
  const email = normaliserEmail(texte(body.email));
  if (!emailValide(email)) throw new HttpError(400, "email_invalide");
  return email;
}

function codeDuCorps(body: Record<string, unknown>): string {
  const code = texte(body.code);
  const err = verifierCode(code);
  if (err === "format") throw new HttpError(400, "code_format");
  if (err === "trop_simple") throw new HttpError(400, "code_trop_simple");
  return code;
}

async function limiter(deps: Deps, key: string, limite: (typeof LIMITES)[keyof typeof LIMITES]) {
  if (!(await consommer(deps.db, key, limite, deps.now()))) throw new HttpError(429, "trop_de_tentatives");
}

/** Crée un jeton à usage unique (lien par email) et renvoie le jeton en clair. */
async function creerJeton(
  deps: Deps,
  table: "reset_tokens" | "email_verifications",
  userId: string,
  dureeMs: number,
): Promise<{ jeton: string; hash: string }> {
  const jeton = randomToken();
  const hash = await sha256Hex(jeton);
  const now = deps.now();
  await deps.db
    .prepare(`INSERT INTO ${table} (token_hash, user_id, expires_at, created_at) VALUES (?1, ?2, ?3, ?4)`)
    .bind(hash, userId, now + dureeMs, now)
    .run();
  return { jeton, hash };
}

/** Consomme un jeton : valide, non expiré et jamais utilisé. Atomique. Renvoie l'utilisatrice. */
async function consommerJeton(
  deps: Deps,
  table: "reset_tokens" | "email_verifications",
  jeton: string,
): Promise<string | null> {
  if (!jeton) return null;
  const row = await deps.db
    .prepare(
      `UPDATE ${table} SET used_at = ?2
       WHERE token_hash = ?1 AND used_at IS NULL AND expires_at > ?2
       RETURNING user_id`,
    )
    .bind(await sha256Hex(jeton), deps.now())
    .first<{ user_id: string }>();
  return row?.user_id ?? null;
}

function envoyer(deps: Deps, to: string, modele: ModeleEmail, variables: Record<string, string>, key: string) {
  deps.waitUntil(
    deps.mailer.send({ to, modele, variables, idempotencyKey: key }).catch((e) => {
      console.error(`Échec d'envoi de l'email ${modele}`, e);
    }),
  );
}

async function envoyerVerification(deps: Deps, user: { id: string; email: string; prenom: string }) {
  const { jeton, hash } = await creerJeton(deps, "email_verifications", user.id, DUREE_LIEN_VERIFICATION);
  envoyer(
    deps,
    user.email,
    "verification",
    { prenom: user.prenom, lien: `${deps.appUrl}/email-verifie?jeton=${jeton}` },
    `verification:${hash}`,
  );
}

async function connecter(deps: Deps, request: Request, user: UtilisatriceRow, status = 200): Promise<Response> {
  const jeton = await creerSession(deps.db, user.id, deps.now());
  const headers = new Headers();
  headers.append("set-cookie", cookieSession(request, jeton));
  headers.append("set-cookie", cookieAppareil(request));
  return json({ utilisatrice: versClient(user) }, status, headers);
}

const SELECT_USER = "SELECT id, email, prenom, trial_used, email_verified_at FROM users";

// POST /api/auth/email-disponible — écran Connexion, avant de choisir le code.
async function emailDisponible({ request, deps }: Ctx) {
  await limiter(deps, `email-disponible:ip:${ipDe(request)}`, LIMITES.emailDisponibleIp);
  const email = emailDuCorps(await lireJson(request));
  const row = await deps.db.prepare("SELECT 1 FROM users WHERE email = ?1").bind(email).first();
  return json({ disponible: row === null });
}

// POST /api/auth/inscription — après Consentement.
async function inscription({ request, deps }: Ctx) {
  await limiter(deps, `inscription:ip:${ipDe(request)}`, LIMITES.inscriptionIp);
  const body = await lireJson(request);
  const prenom = normaliserPrenom(texte(body.prenom));
  if (!prenomValide(prenom)) throw new HttpError(400, "prenom_invalide");
  const email = emailDuCorps(body);
  const code = codeDuCorps(body);
  if (body.consentement !== true) throw new HttpError(400, "consentement_requis");

  const now = deps.now();
  const id = crypto.randomUUID();
  const h = await hashCode(code);
  const insert = await deps.db
    .prepare(
      `INSERT INTO users (id, email, prenom, code_hash, code_salt, code_iterations, consent_at, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?7)
       ON CONFLICT(email) DO NOTHING`,
    )
    .bind(id, email, prenom, h.hash, h.salt, h.iterations, now)
    .run();
  if (insert.meta.changes === 0) return erreur("email_existant", 409);

  const user: UtilisatriceRow = { id, email, prenom, trial_used: 0, email_verified_at: null };
  await envoyerVerification(deps, user);
  return connecter(deps, request, user, 201);
}

// POST /api/auth/connexion — écran CodeSaisie.
async function connexion({ request, deps }: Ctx) {
  await limiter(deps, `connexion:ip:${ipDe(request)}`, LIMITES.connexionIp);
  const body = await lireJson(request);
  const email = emailDuCorps(body);
  const code = texte(body.code);
  if (!/^\d{4}$/.test(code)) throw new HttpError(400, "code_format");

  const now = deps.now();
  const user = await deps.db
    .prepare(
      `SELECT id, email, prenom, trial_used, email_verified_at, code_hash, code_salt, code_iterations, locked_until
       FROM users WHERE email = ?1`,
    )
    .bind(email)
    .first<UtilisatriceRow & { code_hash: string; code_salt: string; code_iterations: number; locked_until: number | null }>();

  if (!user) {
    await burnCodeCheck(code);
    return erreur("code_incorrect", 401);
  }

  const tentative = await reserverTentative(deps.db, user.id, now);
  if (!tentative) {
    return erreur("bloquee", 423, { jusqua: user.locked_until && user.locked_until > now ? user.locked_until : null });
  }

  const ok = await verifyCode(code, { hash: user.code_hash, salt: user.code_salt, iterations: user.code_iterations });
  if (ok) {
    await remiseAZero(deps.db, user.id).run();
    return connecter(deps, request, user);
  }
  if (tentative.tentative >= MAX_ESSAIS) {
    const jusqua = await bloquer(deps.db, user.id, tentative.lock_count, now);
    return erreur("bloquee", 423, { jusqua });
  }
  return erreur("code_incorrect", 401, {
    essaisRestants: MAX_ESSAIS - tentative.tentative,
    // Pour l'écran : « Après, la connexion est bloquée N minutes. »
    prochainBlocageMinutes: dureeBlocage(tentative.lock_count + 1) / 60_000,
  });
}

// POST /api/auth/deconnexion
async function deconnexion({ request, deps }: Ctx) {
  await supprimerSession(deps.db, request);
  return new Response(null, { status: 204, headers: { "set-cookie": cookieSessionEfface(request) } });
}

// GET /api/auth/session
async function session({ request, deps }: Ctx) {
  const s = await sessionCourante(deps.db, request, deps.now());
  if (!s) return erreur("non_connectee", 401, { appareilConnu: appareilConnu(request) });
  const headers: HeadersInit = s.prolongee ? { "set-cookie": cookieSession(request, s.jeton) } : {};
  return json({ utilisatrice: versClient(s.user) }, 200, headers);
}

// POST /api/auth/code-oublie — même réponse que l'email existe ou non. Le travail (recherche,
// jeton, email) se fait après la réponse pour que le temps de réponse ne trahisse rien.
async function codeOublie({ request, deps }: Ctx) {
  await limiter(deps, `code-oublie:ip:${ipDe(request)}`, LIMITES.codeOublieIp);
  const email = emailDuCorps(await lireJson(request));
  deps.waitUntil(
    (async () => {
      // Limite par email silencieuse : la dépasser ne change pas la réponse.
      if (!(await consommer(deps.db, `code-oublie:email:${email}`, LIMITES.codeOublieEmail, deps.now()))) return;
      const user = await deps.db
        .prepare("SELECT id, email, prenom FROM users WHERE email = ?1")
        .bind(email)
        .first<{ id: string; email: string; prenom: string }>();
      if (!user) return;
      const { jeton, hash } = await creerJeton(deps, "reset_tokens", user.id, DUREE_LIEN_REINITIALISATION);
      envoyer(
        deps,
        user.email,
        "reinitialisation",
        { prenom: user.prenom, lien: `${deps.appUrl}/code-nouveau?jeton=${jeton}` },
        `reinitialisation:${hash}`,
      );
    })().catch((e) => console.error("Échec de code-oublie", e)),
  );
  return json({ ok: true }, 202);
}

// POST /api/auth/nouveau-code — depuis le lien « code oublié ».
async function nouveauCode({ request, deps }: Ctx) {
  const body = await lireJson(request);
  const code = codeDuCorps(body); // vérifié avant de consommer le jeton
  const userId = await consommerJeton(deps, "reset_tokens", texte(body.jeton));
  if (!userId) return erreur("lien_invalide", 400);

  const now = deps.now();
  const h = await hashCode(code);
  await deps.db.batch([
    deps.db
      .prepare(
        `UPDATE users SET code_hash = ?2, code_salt = ?3, code_iterations = ?4,
           email_verified_at = COALESCE(email_verified_at, ?5)
         WHERE id = ?1`,
      )
      .bind(userId, h.hash, h.salt, h.iterations, now),
    remiseAZero(deps.db, userId),
    // Le code a changé : on ferme toutes les sessions et on annule les autres liens.
    deps.db.prepare("DELETE FROM sessions WHERE user_id = ?1").bind(userId),
    deps.db.prepare("UPDATE reset_tokens SET used_at = ?2 WHERE user_id = ?1 AND used_at IS NULL").bind(userId, now),
  ]);
  const user = await deps.db.prepare(`${SELECT_USER} WHERE id = ?1`).bind(userId).first<UtilisatriceRow>();
  if (!user) return erreur("lien_invalide", 400);
  envoyer(deps, user.email, "code_change", { prenom: user.prenom }, `code_change:${userId}:${now}`);
  return connecter(deps, request, user);
}

// POST /api/auth/verifier-email — depuis le lien reçu après l'inscription.
async function verifierEmail({ request, deps }: Ctx) {
  const body = await lireJson(request);
  const userId = await consommerJeton(deps, "email_verifications", texte(body.jeton));
  if (!userId) return erreur("lien_invalide", 400);
  await deps.db
    .prepare("UPDATE users SET email_verified_at = COALESCE(email_verified_at, ?2) WHERE id = ?1")
    .bind(userId, deps.now())
    .run();
  return json({ ok: true });
}

// POST /api/auth/renvoyer-verification — connectée, email pas encore vérifié.
async function renvoyerVerification({ request, deps }: Ctx) {
  const s = await sessionCourante(deps.db, request, deps.now());
  if (!s) return erreur("non_connectee", 401);
  if (s.user.email_verified_at !== null) return json({ dejaVerifie: true });
  await limiter(deps, `verification:user:${s.user.id}`, LIMITES.verificationEmail);
  await envoyerVerification(deps, s.user);
  return json({ ok: true }, 202);
}

type Handler = (ctx: Ctx) => Promise<Response>;

export const AUTH_ROUTES: Record<string, Partial<Record<"GET" | "POST", Handler>>> = {
  "/api/auth/email-disponible": { POST: emailDisponible },
  "/api/auth/inscription": { POST: inscription },
  "/api/auth/connexion": { POST: connexion },
  "/api/auth/deconnexion": { POST: deconnexion },
  "/api/auth/session": { GET: session },
  "/api/auth/code-oublie": { POST: codeOublie },
  "/api/auth/nouveau-code": { POST: nouveauCode },
  "/api/auth/verifier-email": { POST: verifierEmail },
  "/api/auth/renvoyer-verification": { POST: renvoyerVerification },
};
