// Génération des aperçus. Le générateur est interchangeable : aujourd'hui un générateur PROVISOIRE
// (sans IA), demain le service d'IA choisi. Seule la fonction choisirGenerateur() changera.
import { rembourserGeneration } from "./perles";

export type EntreeGeneration = { selfie: ArrayBuffer; inspiration: ArrayBuffer; coiffure: string };
export type Generateur = {
  nom: string;
  /** true tant que ce n'est pas une vraie IA : l'appli l'indique honnêtement. */
  provisoire: boolean;
  generer(e: EntreeGeneration): Promise<{ image: ArrayBuffer; type: string }>;
};

/** Sans IA : l'« aperçu » est la photo d'inspiration elle-même, pour faire tourner toute la chaîne. */
const provisoire: Generateur = {
  nom: "provisoire",
  provisoire: true,
  async generer({ inspiration }) {
    return { image: inspiration, type: "image/jpeg" };
  },
};

/** Pour les tests : échoue toujours (vérifie le remboursement). */
const echecTest: Generateur = {
  nom: "echec-test",
  provisoire: true,
  async generer() {
    throw new Error("échec simulé");
  },
};

export type EnvGeneration = { DB: D1Database; MEDIA: R2Bucket; GENERATEUR?: string };

export function choisirGenerateur(env: EnvGeneration): Generateur {
  return env.GENERATEUR === "echec-test" ? echecTest : provisoire;
}

/** Fabrique un aperçu ; en cas d'échec, l'aperçu passe en « failed » et ses perles sont rendues. */
export async function traiterApercu(env: EnvGeneration, apercuId: string): Promise<void> {
  const db = env.DB;
  const a = await db
    .prepare(
      `SELECT p.id, p.trial_id, p.style_slug, p.inspiration_key, t.user_id
       FROM previews p JOIN trials t ON t.id = p.trial_id WHERE p.id = ? AND p.status = 'pending'`,
    )
    .bind(apercuId)
    .first<{ id: string; trial_id: string; style_slug: string; inspiration_key: string; user_id: string }>();
  if (!a) return;
  await db.prepare("UPDATE previews SET status = 'processing' WHERE id = ?").bind(a.id).run();
  try {
    const [selfie, inspiration] = await Promise.all([
      env.MEDIA.get(`comptes/${a.user_id}/essais/${a.trial_id}/selfie.jpg`),
      env.MEDIA.get(a.inspiration_key),
    ]);
    if (!selfie || !inspiration) throw new Error("photos introuvables");
    const r = await choisirGenerateur(env).generer({
      selfie: await selfie.arrayBuffer(),
      inspiration: await inspiration.arrayBuffer(),
      coiffure: a.style_slug,
    });
    const cle = `comptes/${a.user_id}/apercus/${a.id}.jpg`;
    await env.MEDIA.put(cle, r.image, { httpMetadata: { contentType: r.type } });
    await db
      .prepare("UPDATE previews SET status = 'ready', photo_key = ?, ready_at = ? WHERE id = ?")
      .bind(cle, Date.now(), a.id)
      .run();
  } catch (e) {
    await rembourserGeneration(db, a.id, e instanceof Error ? e.message.slice(0, 200) : "erreur");
  }
}

/** Fabrique tous les aperçus d'un essai, puis fixe son statut (prêt si au moins un a réussi). */
export async function genererEssai(env: EnvGeneration, essaiId: string): Promise<void> {
  const db = env.DB;
  await db.prepare("UPDATE trials SET status = 'processing' WHERE id = ? AND status = 'pending'").bind(essaiId).run();
  const { results } = await db
    .prepare("SELECT id FROM previews WHERE trial_id = ? ORDER BY position")
    .bind(essaiId)
    .all<{ id: string }>();
  await Promise.all(results.map((p) => traiterApercu(env, p.id)));
  await db
    .prepare(
      `UPDATE trials SET
         status = CASE WHEN EXISTS (SELECT 1 FROM previews WHERE trial_id = ?1 AND status = 'ready') THEN 'ready' ELSE 'failed' END,
         ready_at = ?2
       WHERE id = ?1`,
    )
    .bind(essaiId, Date.now())
    .run();
}
