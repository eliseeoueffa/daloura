// Logique des perles côté serveur. Toujours appelée par le Worker, jamais par le front :
// le front envoie une action (« essai de ces 2 coiffures »), le serveur calcule le coût ici.
//
// Atomicité : D1 n'a pas de transaction interactive, mais un db.batch() s'exécute en une seule
// transaction (tout ou rien). Chaque mouvement écrit donc, dans le même batch, la ligne de
// perle_ledger ET le solde en cache users.perles. La contrainte CHECK (perles >= 0) fait échouer
// tout le batch si le solde ne suffit pas, même si deux requêtes arrivent en même temps ; les index
// uniques de perle_ledger empêchent un double crédit (bienvenue, paiement, remboursement).
import {
  COUT_GENERATION,
  PERLES_BIENVENUE,
  coutEssai,
  coutRecap,
  nbCoiffuresValide,
  sachet,
  voteAutorise,
} from "../src/lib/perles";

type Echec<R extends string> = { ok: false; raison: R };

const id = () => crypto.randomUUID();

function message(e: unknown): string {
  return e instanceof Error
    ? `${e.message} ${String((e as { cause?: unknown }).cause ?? "")}`
    : String(e);
}

/** Le batch a échoué parce que le solde serait passé sous 0 (CHECK perles >= 0 de users). */
const soldeNegatif = (e: unknown) =>
  message(e).includes("CHECK constraint failed: perles >= 0");
/** Le batch a heurté une contrainte d'unicité (sur la table donnée si précisée). */
const doublon = (e: unknown, table = "") =>
  message(e).includes(`UNIQUE constraint failed: ${table}`);

export async function solde(
  db: D1Database,
  userId: string,
): Promise<number | null> {
  const r = await db
    .prepare("SELECT perles FROM users WHERE id = ?")
    .bind(userId)
    .first<{ perles: number }>();
  return r ? r.perles : null;
}

/** Ligne de journal + mise à jour du solde en cache, à placer dans un batch. */
function mouvement(
  db: D1Database,
  userId: string,
  delta: number,
  reason: string,
  refId: string | null,
  now: number,
) {
  return [
    db
      .prepare(
        "INSERT INTO perle_ledger (id, user_id, delta, reason, ref_id, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .bind(id(), userId, delta, reason, refId, now),
    db
      .prepare(
        "UPDATE users SET perles = perles + ?, updated_at = ? WHERE id = ?",
      )
      .bind(delta, now, userId),
  ];
}

/**
 * Mouvement conditionnel : la ligne de journal n'est écrite que si `condition` (SQL) est vraie au
 * moment du batch, et le solde n'augmente que de ce qui a vraiment été écrit. Permet de vérifier
 * un état (paiement pas encore crédité, génération pas réussie) dans la même transaction.
 */
function mouvementSi(
  db: D1Database,
  ligneId: string,
  userId: string,
  delta: number,
  reason: string,
  refId: string,
  now: number,
  condition: string,
  params: unknown[],
) {
  return [
    db
      .prepare(
        `INSERT INTO perle_ledger (id, user_id, delta, reason, ref_id, created_at) SELECT ?, ?, ?, ?, ?, ? WHERE ${condition}`,
      )
      .bind(ligneId, userId, delta, reason, refId, now, ...params),
    db
      .prepare(
        "UPDATE users SET perles = perles + COALESCE((SELECT delta FROM perle_ledger WHERE id = ?), 0), updated_at = ? WHERE id = ?",
      )
      .bind(ligneId, now, userId),
  ];
}

async function ligneEcrite(db: D1Database, ligneId: string): Promise<boolean> {
  return (
    (await db
      .prepare("SELECT 1 FROM perle_ledger WHERE id = ?")
      .bind(ligneId)
      .first()) !== null
  );
}

// ─── Cadeau de bienvenue ────────────────────────────────────────────────────

/** 3 perles offertes, une seule fois par compte et une seule fois par téléphone. */
export async function offrirBienvenue(
  db: D1Database,
  userId: string,
  deviceId: string | null,
  now = Date.now(),
): Promise<
  | { ok: true; perles: number }
  | Echec<"deja_offert_compte" | "deja_offert_telephone">
> {
  const stmts = mouvement(db, userId, PERLES_BIENVENUE, "welcome", null, now);
  if (deviceId) {
    // Clé primaire : échoue (et annule tout le batch) si ce téléphone a déjà reçu le cadeau.
    stmts.push(
      db
        .prepare(
          "INSERT INTO welcome_devices (device_id, user_id, created_at) VALUES (?, ?, ?)",
        )
        .bind(deviceId, userId, now),
    );
  }
  try {
    await db.batch(stmts);
  } catch (e) {
    if (doublon(e, "perle_ledger"))
      return { ok: false, raison: "deja_offert_compte" };
    if (doublon(e, "welcome_devices"))
      return { ok: false, raison: "deja_offert_telephone" };
    throw e;
  }
  return { ok: true, perles: PERLES_BIENVENUE };
}

// ─── Achat d'un sachet (Itaja) ──────────────────────────────────────────────

/** Crée le paiement en attente. Prix et perles viennent de perles.ts, jamais du front. */
export async function creerPaiement(
  db: D1Database,
  userId: string,
  sachetId: string,
  now = Date.now(),
): Promise<
  | { ok: true; paymentId: string; montantXof: number; perles: number }
  | Echec<"sachet_inconnu">
> {
  const s = sachet(sachetId);
  if (!s) return { ok: false, raison: "sachet_inconnu" };
  const paymentId = id();
  await db
    .prepare(
      "INSERT INTO payments (id, user_id, sachet_id, amount_xof, perles, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind(paymentId, userId, s.id, s.prixXof, s.perles, now)
    .run();
  return { ok: true, paymentId, montantXof: s.prixXof, perles: s.perles };
}

/**
 * Crédite un sachet. À appeler SEULEMENT après avoir vérifié chez Itaja que le paiement est payé
 * (Itaja fait foi : un paiement marqué « échoué » chez nous puis confirmé par Itaja est crédité).
 * Une seule fois par paiement : une deuxième notification Itaja, même simultanée ou avec une autre
 * référence, ne crédite rien.
 */
export async function crediterAchat(
  db: D1Database,
  paymentId: string,
  itajaRef: string,
  now = Date.now(),
): Promise<
  { ok: true; perles: number } | Echec<"paiement_inconnu" | "deja_credite">
> {
  const p = await db
    .prepare("SELECT user_id, perles, status FROM payments WHERE id = ?")
    .bind(paymentId)
    .first<{ user_id: string; perles: number; status: string }>();
  if (!p) return { ok: false, raison: "paiement_inconnu" };
  if (p.status === "paid") return { ok: false, raison: "deja_credite" };
  const ligneId = id();
  try {
    await db.batch([
      // Ne passe à « payé » que si personne ne l'a fait entre-temps ; la ligne du journal n'est
      // écrite que si C'EST ce batch qui a posé sa référence Itaja et sa date.
      db
        .prepare(
          "UPDATE payments SET status = 'paid', paid_at = ?, provider_ref = ? WHERE id = ? AND status <> 'paid'",
        )
        .bind(now, itajaRef, paymentId),
      ...mouvementSi(
        db,
        ligneId,
        p.user_id,
        p.perles,
        "purchase",
        itajaRef,
        now,
        "EXISTS (SELECT 1 FROM payments WHERE id = ? AND status = 'paid' AND provider_ref = ? AND paid_at = ?)",
        [paymentId, itajaRef, now],
      ),
    ]);
  } catch (e) {
    if (doublon(e)) return { ok: false, raison: "deja_credite" };
    throw e;
  }
  if (!(await ligneEcrite(db, ligneId)))
    return { ok: false, raison: "deja_credite" };
  return { ok: true, perles: p.perles };
}

// ─── Essais et générations ──────────────────────────────────────────────────

export type EssaiLance = {
  ok: true;
  trialId: string;
  generations: string[];
  cout: number;
  solde: number;
};

/** Lance un essai de 1 à MAX_COIFFURES coiffures : débite COUT_GENERATION perles par coiffure. */
export async function lancerEssai(
  db: D1Database,
  userId: string,
  coiffures: { styleSlug: string; inspirationId?: string | null }[],
  now = Date.now(),
): Promise<
  | EssaiLance
  | Echec<"nombre_de_coiffures" | "compte_inconnu">
  | { ok: false; raison: "solde_insuffisant"; manque: number }
> {
  if (!nbCoiffuresValide(coiffures.length))
    return { ok: false, raison: "nombre_de_coiffures" };
  const cout = coutEssai(coiffures.length);
  const avant = await solde(db, userId);
  if (avant === null) return { ok: false, raison: "compte_inconnu" };
  if (avant < cout)
    return { ok: false, raison: "solde_insuffisant", manque: cout - avant };

  const trialId = id();
  const generations = coiffures.map(() => id());
  const stmts: D1PreparedStatement[] = [
    db
      .prepare(
        "INSERT INTO trials (id, user_id, status, created_at) VALUES (?, ?, 'pending', ?)",
      )
      .bind(trialId, userId, now),
  ];
  coiffures.forEach((c, i) => {
    stmts.push(
      db
        .prepare(
          "INSERT INTO previews (id, trial_id, position, style_slug, inspiration_id, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .bind(
          generations[i],
          trialId,
          i + 1,
          c.styleSlug,
          c.inspirationId ?? null,
          now,
        ),
      ...mouvement(
        db,
        userId,
        -COUT_GENERATION,
        "generation",
        generations[i],
        now,
      ),
    );
  });
  try {
    await db.batch(stmts);
  } catch (e) {
    // Une autre dépense est passée entre la lecture du solde et le batch : rien n'a été débité.
    if (soldeNegatif(e)) {
      const s = (await solde(db, userId)) ?? 0;
      return {
        ok: false,
        raison: "solde_insuffisant",
        manque: Math.max(cout - s, 0),
      };
    }
    throw e;
  }
  return {
    ok: true,
    trialId,
    generations,
    cout,
    solde: (await solde(db, userId)) ?? 0,
  };
}

/** Génération ratée : marque l'aperçu en échec et rend ses perles, une seule fois. Jamais pour un aperçu réussi. */
export async function rembourserGeneration(
  db: D1Database,
  generationId: string,
  erreur: string | null = null,
  now = Date.now(),
): Promise<
  | { ok: true; perles: number }
  | Echec<"generation_inconnue" | "deja_rembourse" | "generation_reussie">
> {
  const g = await db
    .prepare(
      "SELECT user_id, -delta AS perles FROM perle_ledger WHERE reason = 'generation' AND ref_id = ?",
    )
    .bind(generationId)
    .first<{ user_id: string; perles: number }>();
  if (!g) return { ok: false, raison: "generation_inconnue" };
  const ligneId = id();
  try {
    await db.batch([
      // Le statut est vérifié dans la transaction : un aperçu déjà réussi n'est ni remboursé ni modifié.
      ...mouvementSi(
        db,
        ligneId,
        g.user_id,
        g.perles,
        "refund",
        generationId,
        now,
        "EXISTS (SELECT 1 FROM previews WHERE id = ? AND status <> 'ready')",
        [generationId],
      ),
      db
        .prepare(
          "UPDATE previews SET status = 'failed', error = ? WHERE id = ? AND status <> 'ready'",
        )
        .bind(erreur, generationId),
    ]);
  } catch (e) {
    if (doublon(e, "perle_ledger"))
      return { ok: false, raison: "deja_rembourse" };
    throw e;
  }
  if (!(await ligneEcrite(db, ligneId)))
    return { ok: false, raison: "generation_reussie" };
  return { ok: true, perles: g.perles };
}

// ─── Vote du cercle (gratuit) ───────────────────────────────────────────────

/** Ouvre le vote : gratuit, possible seulement à partir de MIN_COIFFURES_VOTE coiffures. */
export async function ouvrirVote(
  db: D1Database,
  trialId: string,
  fermeLe: number,
): Promise<
  | { ok: true; voteSlug: string }
  | Echec<"essai_inconnu" | "pas_assez_de_coiffures">
> {
  const t = await db
    .prepare(
      "SELECT (SELECT COUNT(*) FROM previews WHERE trial_id = t.id) AS n FROM trials t WHERE t.id = ?",
    )
    .bind(trialId)
    .first<{ n: number }>();
  if (!t) return { ok: false, raison: "essai_inconnu" };
  if (!voteAutorise(t.n))
    return { ok: false, raison: "pas_assez_de_coiffures" };
  const voteSlug = id().replace(/-/g, "").slice(0, 12);
  await db
    .prepare(
      "UPDATE trials SET vote_slug = COALESCE(vote_slug, ?), vote_closes_at = ? WHERE id = ?",
    )
    .bind(voteSlug, fermeLe, trialId)
    .run();
  const r = await db
    .prepare("SELECT vote_slug FROM trials WHERE id = ?")
    .bind(trialId)
    .first<{ vote_slug: string }>();
  return { ok: true, voteSlug: r!.vote_slug };
}

// ─── Hair Recap (payé en perles) ────────────────────────────────────────────

export async function acheterRecap(
  db: D1Database,
  userId: string,
  mois: number,
  periode: { debut: string; fin: string },
  now = Date.now(),
): Promise<
  | { ok: true; recapId: string; cout: number; solde: number }
  | Echec<"duree_inconnue" | "compte_inconnu">
  | { ok: false; raison: "solde_insuffisant"; manque: number }
> {
  const cout = coutRecap(mois);
  if (cout === undefined) return { ok: false, raison: "duree_inconnue" };
  const avant = await solde(db, userId);
  if (avant === null) return { ok: false, raison: "compte_inconnu" };
  if (avant < cout)
    return { ok: false, raison: "solde_insuffisant", manque: cout - avant };
  const recapId = id();
  try {
    await db.batch([
      db
        .prepare(
          "INSERT INTO recaps (id, user_id, months, perles, period_start, period_end, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(recapId, userId, mois, cout, periode.debut, periode.fin, now),
      ...mouvement(db, userId, -cout, "recap", recapId, now),
    ]);
  } catch (e) {
    if (soldeNegatif(e)) {
      const s = (await solde(db, userId)) ?? 0;
      return {
        ok: false,
        raison: "solde_insuffisant",
        manque: Math.max(cout - s, 0),
      };
    }
    throw e;
  }
  return { ok: true, recapId, cout, solde: (await solde(db, userId)) ?? 0 };
}
