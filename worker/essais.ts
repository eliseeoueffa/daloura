// Essais : lancement (débit des perles côté serveur), suivi, lecture des aperçus.
//   POST /api/essais                         { coiffures: ["knotless", …] } → { essai, cout, solde }
//   GET  /api/essais/<id>                    → { id, statut, provisoire, apercus: [{ id, coiffure, statut }] }
//   GET  /api/essais/<id>/apercus/<apercu>   → l'image
// Tout exige d'être connectée ; on ne voit que ses propres essais.
import { compteConnecte, type EnvComptes } from "./comptes";
import { choisirGenerateur, genererEssai, type EnvGeneration } from "./generation";
import { lancerEssai } from "./perles";
import { dossierCompte } from "./photos";

type Env = EnvComptes & EnvGeneration;

const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "cache-control": "no-store" } });
const erreur = (code: string, status: number, extra: Record<string, unknown> = {}) =>
  json({ error: code, ...extra }, status);

export async function routeEssais(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  chemin: string,
): Promise<Response> {
  const compte = await compteConnecte(request, env);
  if (!compte) return erreur("non_connecte", 401);
  const db = env.DB;
  const dossier = dossierCompte(compte.id);

  if (chemin === "" && request.method === "POST") {
    if (!(request.headers.get("content-type") ?? "").includes("application/json")) return erreur("json_attendu", 415);
    const corps = (await request.json().catch(() => null)) as { coiffures?: unknown } | null;
    const coiffures = Array.isArray(corps?.coiffures) ? corps.coiffures.filter((c) => typeof c === "string") : [];
    if (new Set(coiffures).size !== coiffures.length || coiffures.length !== (corps?.coiffures as unknown[])?.length)
      return erreur("coiffures_invalides", 400);

    const u = await db
      .prepare("SELECT selfie_consent_at FROM users WHERE id = ?")
      .bind(compte.id)
      .first<{ selfie_consent_at: number | null }>();
    if (!u?.selfie_consent_at) return erreur("consentement_requis", 403);

    if (coiffures.length) {
      const connues = await db
        .prepare(`SELECT COUNT(*) AS n FROM styles WHERE slug IN (${coiffures.map(() => "?").join(",")})`)
        .bind(...coiffures)
        .first<{ n: number }>();
      if (connues?.n !== coiffures.length) return erreur("coiffures_invalides", 400);
    }

    // Les photos doivent déjà être sur le serveur (envoyées par la synchronisation).
    const manquantes: string[] = [];
    if (!(await env.MEDIA.head(`${dossier}selfie.jpg`))) manquantes.push("selfie");
    for (const c of coiffures) if (!(await env.MEDIA.head(`${dossier}inspirations/${c}.jpg`))) manquantes.push(c);
    if (manquantes.length && coiffures.length) return erreur("photos_manquantes", 409, { manquantes });

    const r = await lancerEssai(
      db,
      compte.id,
      coiffures.map((styleSlug) => ({ styleSlug })),
    );
    if (!r.ok) {
      if (r.raison === "solde_insuffisant") return erreur("solde_insuffisant", 402, { manque: r.manque });
      return erreur(r.raison === "nombre_de_coiffures" ? "coiffures_invalides" : r.raison, 400);
    }

    // Copie figée des photos de l'essai : changer d'inspiration ensuite ne change pas cet essai.
    const base = `${dossier}essais/${r.trialId}/`;
    const copier = async (de: string, vers: string) => {
      const o = await env.MEDIA.get(de);
      if (o) await env.MEDIA.put(vers, await o.arrayBuffer(), { httpMetadata: o.httpMetadata });
    };
    await copier(`${dossier}selfie.jpg`, `${base}selfie.jpg`);
    await Promise.all(
      coiffures.map(async (c, i) => {
        const cle = `${base}inspiration-${c}.jpg`;
        await copier(`${dossier}inspirations/${c}.jpg`, cle);
        await db.prepare("UPDATE previews SET inspiration_key = ? WHERE id = ?").bind(cle, r.generations[i]).run();
      }),
    );

    ctx.waitUntil(genererEssai(env, r.trialId));
    return json({ essai: r.trialId, cout: r.cout, solde: r.solde }, 201);
  }

  const m = /^\/([\w-]{8,64})(?:\/apercus\/([\w-]{8,64}))?$/.exec(chemin);
  if (!m || request.method !== "GET") return erreur("not_found", 404);
  const essai = await db
    .prepare("SELECT id, status FROM trials WHERE id = ? AND user_id = ?")
    .bind(m[1], compte.id)
    .first<{ id: string; status: string }>();
  if (!essai) return erreur("not_found", 404);

  if (!m[2]) {
    const { results } = await db
      .prepare("SELECT id, style_slug, status FROM previews WHERE trial_id = ? ORDER BY position")
      .bind(essai.id)
      .all<{ id: string; style_slug: string; status: string }>();
    return json({
      id: essai.id,
      statut: essai.status,
      provisoire: choisirGenerateur(env).provisoire,
      apercus: results.map((p) => ({ id: p.id, coiffure: p.style_slug, statut: p.status })),
    });
  }

  const p = await db
    .prepare("SELECT photo_key FROM previews WHERE id = ? AND trial_id = ? AND status = 'ready'")
    .bind(m[2], essai.id)
    .first<{ photo_key: string }>();
  const o = p && (await env.MEDIA.get(p.photo_key));
  if (!o) return erreur("not_found", 404);
  return new Response(o.body, {
    headers: {
      "content-type": o.httpMetadata?.contentType ?? "image/jpeg",
      "cache-control": "private, max-age=86400",
      "x-content-type-options": "nosniff",
    },
  });
}
