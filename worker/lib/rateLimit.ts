// Limite de tentatives à fenêtre fixe, stockée dans D1 (exacte et testable).

export type Limite = { max: number; fenetreMs: number };

const HEURE = 3_600_000;

// Beaucoup de téléphones partagent la même IP chez les opérateurs mobiles : les limites par IP
// restent larges, le vrai frein sur le code est le blocage par compte.
export const LIMITES = {
  connexionIp: { max: 30, fenetreMs: HEURE },
  emailDisponibleIp: { max: 30, fenetreMs: HEURE },
  inscriptionIp: { max: 10, fenetreMs: HEURE },
  codeOublieIp: { max: 10, fenetreMs: HEURE },
  codeOublieEmail: { max: 3, fenetreMs: HEURE },
  verificationEmail: { max: 3, fenetreMs: HEURE },
} satisfies Record<string, Limite>;

/**
 * Compte une tentative pour `key`. Renvoie false si la limite est dépassée.
 * Une seule requête SQL : l'insertion ou la mise à jour est atomique.
 */
export async function consommer(db: D1Database, key: string, limite: Limite, now: number): Promise<boolean> {
  const row = await db
    .prepare(
      `INSERT INTO rate_limits (key, window_start, count) VALUES (?1, ?2, 1)
       ON CONFLICT(key) DO UPDATE SET
         count = CASE WHEN window_start <= ?2 - ?3 THEN 1 ELSE count + 1 END,
         window_start = CASE WHEN window_start <= ?2 - ?3 THEN ?2 ELSE window_start END
       RETURNING count`,
    )
    .bind(key, now, limite.fenetreMs)
    .first<{ count: number }>();
  return (row?.count ?? 1) <= limite.max;
}
