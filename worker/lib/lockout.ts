// Blocage après des codes faux (validé par Elisée) : 5 erreurs, puis 2 minutes de blocage.
// La durée double à chaque nouveau blocage (2, 4, 8… jusqu'à 60 minutes) et repart de zéro
// dès une connexion réussie ou un nouveau code. Sans ça, un robot testerait les 10 000 codes
// en moins de 3 jours.

export const MAX_ESSAIS = 5;
const MINUTE = 60_000;
export const BLOCAGE_BASE = 2 * MINUTE;
export const BLOCAGE_MAX = 60 * MINUTE;

/** Durée du blocage numéro `n` (1 pour le premier). */
export function dureeBlocage(n: number): number {
  return Math.min(BLOCAGE_BASE * 2 ** Math.max(0, n - 1), BLOCAGE_MAX);
}

/**
 * Réserve une tentative avant de vérifier le code : l'incrément est atomique, donc même
 * 100 requêtes envoyées en même temps ne peuvent tester que 5 codes avant le blocage.
 * Renvoie null si le compte est bloqué (ou si les 5 tentatives sont déjà prises).
 */
export async function reserverTentative(
  db: D1Database,
  userId: string,
  now: number,
): Promise<{ tentative: number; lock_count: number } | null> {
  return db
    .prepare(
      `UPDATE users SET failed_attempts = failed_attempts + 1
       WHERE id = ?1 AND (locked_until IS NULL OR locked_until <= ?2) AND failed_attempts < ?3
       RETURNING failed_attempts AS tentative, lock_count`,
    )
    .bind(userId, now, MAX_ESSAIS)
    .first();
}

/** Bloque le compte après la 5e erreur. Renvoie la fin du blocage. */
export async function bloquer(
  db: D1Database,
  userId: string,
  lockCount: number,
  now: number,
): Promise<number> {
  const jusqua = now + dureeBlocage(lockCount + 1);
  await db
    .prepare(
      `UPDATE users SET failed_attempts = 0, lock_count = lock_count + 1, locked_until = ?2
       WHERE id = ?1 AND failed_attempts >= ?3`,
    )
    .bind(userId, jusqua, MAX_ESSAIS)
    .run();
  return jusqua;
}

/** Connexion réussie ou nouveau code : on efface erreurs et blocages. */
export function remiseAZero(
  db: D1Database,
  userId: string,
): D1PreparedStatement {
  return db
    .prepare(
      "UPDATE users SET failed_attempts = 0, lock_count = 0, locked_until = NULL WHERE id = ?1",
    )
    .bind(userId);
}
