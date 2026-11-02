// Suppressions automatiques, une fois par jour (cron dans wrangler.jsonc). Elles appliquent les durées
// annoncées dans la politique de confidentialité (src/pages/Confidentialite.tsx) : les garder alignées.
import { dossierCompte, viderDossier } from "./photos";

type Env = { DB: D1Database; MEDIA: R2Bucket };

const JOUR = 24 * 3600_000;
export const INACTIVITE_MAX = 2 * 365 * JOUR; // compte sans connexion depuis 2 ans
export const VOTES_MAX = 365 * JOUR; // votes : 12 mois après la fermeture
export const PHOTOS_APPAREIL_MAX = 30 * JOUR; // photos d'un téléphone jamais rattachées à un compte

/** Supprime un compte et tout ce qui s'y rattache ; les paiements sont archivés sans lien avec elle. */
export async function supprimerCompte(env: Env, userId: string, now = Date.now()): Promise<void> {
  await viderDossier(env.MEDIA, dossierCompte(userId));
  await env.DB.batch([
    env.DB.prepare(
      `INSERT OR IGNORE INTO paiements_archives (id, sachet_id, amount_xof, perles, provider, provider_ref, created_at, paid_at, archive_le)
       SELECT id, sachet_id, amount_xof, perles, provider, provider_ref, created_at, paid_at, ? FROM payments
       WHERE user_id = ? AND status = 'paid'`,
    ).bind(now, userId),
    env.DB.prepare("DELETE FROM auth_user WHERE id = ?").bind(userId), // sessions, comptes, par cascade
    env.DB.prepare("DELETE FROM users WHERE id = ?").bind(userId), // essais, aperçus, votes, carnet, perles… par cascade
  ]);
}

export async function purger(env: Env, now = Date.now()) {
  const db = env.DB;
  const iso = new Date(now).toISOString();
  const bilan = { sessions: 0, liens: 0, votes: 0, comptes: 0, photosAppareils: 0 };

  bilan.sessions = (await db.prepare("DELETE FROM auth_session WHERE expires_at < ?").bind(iso).run()).meta.changes;
  bilan.liens = (await db.prepare("DELETE FROM auth_verification WHERE expires_at < ?").bind(iso).run()).meta.changes;
  bilan.votes = (
    await db
      .prepare("DELETE FROM votes WHERE trial_id IN (SELECT id FROM trials WHERE vote_closes_at < ?)")
      .bind(now - VOTES_MAX)
      .run()
  ).meta.changes;

  // Comptes inactifs depuis 2 ans (par lots, pour rester dans les limites d'une exécution).
  const { results } = await db
    .prepare("SELECT id FROM users WHERE COALESCE(derniere_connexion, created_at) < ? LIMIT 50")
    .bind(now - INACTIVITE_MAX)
    .all<{ id: string }>();
  for (const u of results) await supprimerCompte(env, u.id, now);
  bilan.comptes = results.length;

  // Photos envoyées par un téléphone et jamais rattachées à un compte.
  let curseur: string | undefined;
  do {
    const l = await env.MEDIA.list({ prefix: "appareils/", cursor: curseur });
    const vieux = l.objects.filter((o) => o.uploaded.getTime() < now - PHOTOS_APPAREIL_MAX).map((o) => o.key);
    if (vieux.length) await env.MEDIA.delete(vieux);
    bilan.photosAppareils += vieux.length;
    curseur = l.truncated ? l.cursor : undefined;
  } while (curseur);

  console.log("purge", JSON.stringify(bilan));
  return bilan;
}
