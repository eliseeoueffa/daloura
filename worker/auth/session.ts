// Sessions longues : cookie HttpOnly, Secure, SameSite=Lax. La base ne garde que l'empreinte
// SHA-256 du jeton : une fuite de la base ne permet pas de se connecter.
import { randomToken, sha256Hex } from "../lib/crypto";
import { lireCookie } from "../lib/http";

const JOUR = 86_400_000;
export const SESSION_DUREE = 90 * JOUR;
const PROLONGER_APRES = JOUR; // on ne réécrit la session qu'une fois par jour au plus

// En HTTPS, le préfixe __Host- impose Secure, Path=/ et aucun Domain. En local (http), pas de
// Secure, sinon le navigateur du téléphone refuse le cookie.
function nomCookie(request: Request, base: string): string {
  return new URL(request.url).protocol === "https:" ? `__Host-${base}` : base;
}

function cookie(request: Request, base: string, valeur: string, maxAgeS: number): string {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${nomCookie(request, base)}=${valeur}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeS}${secure}`;
}

export const cookieSession = (request: Request, jeton: string) =>
  cookie(request, "daloura_session", jeton, SESSION_DUREE / 1000);

export const cookieSessionEfface = (request: Request) => cookie(request, "daloura_session", "", 0);

// Marqueur « un compte a déjà été créé ou ouvert sur ce téléphone » : sert à afficher
// l'écran EssaiDejaUtilise. Il complète le marqueur gardé par l'appli dans le navigateur.
export const cookieAppareil = (request: Request) => cookie(request, "daloura_appareil", "1", 5 * 365 * 86_400);

export const appareilConnu = (request: Request) => lireCookie(request, nomCookie(request, "daloura_appareil")) === "1";

export async function creerSession(db: D1Database, userId: string, now: number): Promise<string> {
  const jeton = randomToken();
  await db
    .prepare("INSERT INTO sessions (id, user_id, created_at, last_seen_at, expires_at) VALUES (?1, ?2, ?3, ?3, ?4)")
    .bind(await sha256Hex(jeton), userId, now, now + SESSION_DUREE)
    .run();
  return jeton;
}

export type UtilisatriceRow = {
  id: string;
  email: string;
  prenom: string;
  trial_used: number;
  email_verified_at: number | null;
};

export async function sessionCourante(
  db: D1Database,
  request: Request,
  now: number,
): Promise<{ user: UtilisatriceRow; jeton: string; prolongee: boolean } | null> {
  const jeton = lireCookie(request, nomCookie(request, "daloura_session"));
  if (!jeton) return null;
  const id = await sha256Hex(jeton);
  const row = await db
    .prepare(
      `SELECT s.last_seen_at, u.id, u.email, u.prenom, u.trial_used, u.email_verified_at
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.id = ?1 AND s.expires_at > ?2`,
    )
    .bind(id, now)
    .first<UtilisatriceRow & { last_seen_at: number }>();
  if (!row) return null;
  const prolongee = now - row.last_seen_at > PROLONGER_APRES;
  if (prolongee) {
    await db
      .prepare("UPDATE sessions SET last_seen_at = ?2, expires_at = ?3 WHERE id = ?1")
      .bind(id, now, now + SESSION_DUREE)
      .run();
  }
  const { last_seen_at: _, ...user } = row;
  return { user, jeton, prolongee };
}

export async function supprimerSession(db: D1Database, request: Request): Promise<void> {
  const jeton = lireCookie(request, nomCookie(request, "daloura_session"));
  if (jeton) await db.prepare("DELETE FROM sessions WHERE id = ?1").bind(await sha256Hex(jeton)).run();
}

/** Ce que l'appli reçoit : jamais d'identifiant interne ni de hash. */
export function versClient(user: UtilisatriceRow) {
  return {
    prenom: user.prenom,
    email: user.email,
    emailVerifie: user.email_verified_at !== null,
    essaiUtilise: user.trial_used === 1,
  };
}
