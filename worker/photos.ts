import { compteConnecte, type EnvComptes } from "./comptes";

// Photos dans R2 (binding MEDIA, bucket privé « daloura-media »). Rien n'est public.
//
// Connectée : dossier du compte, comptes/<userId>/ (selfie.jpg, inspirations/<coiffure>.jpg, et aussi
// essais/… et apercus/… écrits par worker/essais.ts). Le front n'envoie qu'une fois connectée ET après
// l'accord sur l'écran Consentement.
// Sans compte (ancien fonctionnement, gardé par sécurité) : dossier du téléphone, appareils/<sha256(id)>/,
// identifié par l'en-tête X-Daloura-Appareil (identifiant aléatoire de 128 bits, jamais stocké en clair).
// Ce dossier est vidé dès qu'elle est connectée, et purgé après 30 jours (worker/purge.ts).

export const TAILLE_MAX = 5 * 1024 * 1024; // le front envoie des JPEG de ~0,2 à 1 Mo
const TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

type Env = EnvComptes & { MEDIA: R2Bucket };

/** Dossier R2 des photos d'un compte (selfie, inspirations, aperçus). */
export const dossierCompte = (userId: string) => `comptes/${userId}/`;
/** Dossier R2 des photos envoyées par un téléphone avant la création du compte. */
export const dossierAppareil = async (appareil: string) => `appareils/${await empreinte(appareil)}/`;

async function viderDossier(media: R2Bucket, prefixe: string): Promise<number> {
  let n = 0;
  let curseur: string | undefined;
  do {
    const l = await media.list({ prefix: prefixe, cursor: curseur });
    if (l.objects.length) await media.delete(l.objects.map((o) => o.key));
    n += l.objects.length;
    curseur = l.truncated ? l.cursor : undefined;
  } while (curseur);
  return n;
}
export { viderDossier };

const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "cache-control": "no-store" } });
const erreur = (code: string, status: number) => json({ error: code }, status);

async function empreinte(appareil: string): Promise<string> {
  const h = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(appareil),
  );
  return [...new Uint8Array(h)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Vérifie les premiers octets : on ne fait pas confiance au Content-Type annoncé. */
function typeReel(octets: Uint8Array): (typeof TYPES)[number] | null {
  const b = octets;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47)
    return "image/png";
  if (
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50
  )
    return "image/webp";
  return null;
}

/** Lit le corps en refusant au-delà de TAILLE_MAX, même si Content-Length ment ou manque. */
async function lireCorps(
  request: Request,
): Promise<Uint8Array | "trop_gros" | "vide"> {
  const annonce = Number(request.headers.get("content-length") ?? "0");
  if (annonce > TAILLE_MAX) return "trop_gros";
  if (!request.body) return "vide";
  const morceaux: Uint8Array[] = [];
  let total = 0;
  const lecteur = request.body.getReader();
  for (;;) {
    const { done, value } = await lecteur.read();
    if (done) break;
    total += value.byteLength;
    if (total > TAILLE_MAX) {
      await lecteur.cancel();
      return "trop_gros";
    }
    morceaux.push(value);
  }
  if (total === 0) return "vide";
  const tout = new Uint8Array(total);
  let i = 0;
  for (const m of morceaux) {
    tout.set(m, i);
    i += m.byteLength;
  }
  return tout;
}

/**
 * Routes :
 *   GET    /api/photos                         → { selfie: {id}|null, inspirations: [{style, id}] }
 *   PUT    /api/photos/selfie                  (corps : l'image ; en-tête X-Photo-Id facultatif)
 *   PUT    /api/photos/inspirations/<coiffure>
 *   GET    /api/photos/selfie | /api/photos/inspirations/<coiffure>  → l'image
 *   DELETE /api/photos/selfie | /api/photos/inspirations/<coiffure> | /api/photos (tout)
 */
export async function routePhotos(
  request: Request,
  env: Env,
  chemin: string,
): Promise<Response> {
  // Connectée : ses photos vont dans le dossier de son compte. Sinon (avant la création du compte),
  // dans celui de son téléphone. Le téléphone faisant foi, le dossier du téléphone est vidé dès qu'elle
  // est connectée : la synchronisation suivante renvoie tout dans le dossier du compte.
  const appareil = request.headers.get("x-daloura-appareil") ?? "";
  const appareilOk = /^[a-f0-9]{32}$/.test(appareil);
  const compte = await compteConnecte(request, env);
  if (!compte && !appareilOk) return erreur("appareil_invalide", 401);
  const dossier = compte ? dossierCompte(compte.id) : await dossierAppareil(appareil);
  if (compte && appareilOk && request.method === "GET" && chemin === "") {
    await viderDossier(env.MEDIA, await dossierAppareil(appareil));
  }
  const m = request.method;

  if (chemin === "") {
    if (m === "GET") {
      const liste = await env.MEDIA.list({
        prefix: dossier,
        include: ["customMetadata"],
      });
      let selfie: { id: string } | null = null;
      const inspirations: { style: string; id: string }[] = [];
      for (const o of liste.objects) {
        const nom = o.key.slice(dossier.length);
        const id = o.customMetadata?.id ?? o.etag;
        if (nom === "selfie.jpg") selfie = { id };
        else if (nom.startsWith("inspirations/"))
          inspirations.push({ style: nom.slice(13, -4), id });
      }
      return json({ selfie, inspirations });
    }
    if (m === "DELETE") {
      // Tout : selfie, inspirations et aperçus (et ce qui resterait dans le dossier du téléphone).
      let n = await viderDossier(env.MEDIA, dossier);
      if (compte && appareilOk) n += await viderDossier(env.MEDIA, await dossierAppareil(appareil));
      return json({ ok: true, supprimees: n });
    }
    return erreur("methode", 405);
  }

  let cle: string;
  if (chemin === "/selfie") cle = `${dossier}selfie.jpg`;
  else {
    const style = /^\/inspirations\/([a-z-]{2,40})$/.exec(chemin)?.[1];
    if (!style) return erreur("not_found", 404);
    const connu = await env.DB.prepare("SELECT 1 FROM styles WHERE slug = ?")
      .bind(style)
      .first();
    if (!connu) return erreur("coiffure_inconnue", 404);
    cle = `${dossier}inspirations/${style}.jpg`;
  }

  if (m === "PUT") {
    const corps = await lireCorps(request);
    if (corps === "trop_gros") return erreur("photo_trop_lourde", 413);
    if (corps === "vide") return erreur("photo_vide", 400);
    const type = typeReel(corps);
    if (!type) return erreur("pas_une_image", 415);
    const id =
      (request.headers.get("x-photo-id") ?? "").slice(0, 64) ||
      crypto.randomUUID();
    await env.MEDIA.put(cle, corps, {
      httpMetadata: { contentType: type },
      customMetadata: { id, envoyeLe: new Date().toISOString() },
    });
    return json({ ok: true, id }, 201);
  }
  if (m === "GET") {
    const o = await env.MEDIA.get(cle);
    if (!o) return erreur("not_found", 404);
    return new Response(o.body, {
      headers: {
        "content-type": o.httpMetadata?.contentType ?? "image/jpeg",
        "cache-control": "private, no-store",
        "x-content-type-options": "nosniff",
      },
    });
  }
  if (m === "DELETE") {
    await env.MEDIA.delete(cle);
    return json({ ok: true });
  }
  return erreur("methode", 405);
}
