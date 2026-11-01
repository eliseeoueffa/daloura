// Photos dans R2 (binding MEDIA, bucket privé « daloura-media »).
//
// En attendant les comptes (étape 2), chaque téléphone est identifié par un identifiant aléatoire
// de 128 bits qu'il génère et garde (en-tête X-Daloura-Appareil). Il sert de clé secrète : on ne le
// stocke jamais, on range les photos sous son empreinte SHA-256 :
//   appareils/<empreinte>/selfie.jpg
//   appareils/<empreinte>/inspirations/<coiffure>.jpg
// Le front n'envoie qu'après le consentement (écran Consentement). Rien n'est public : les photos ne
// se lisent qu'avec l'identifiant de l'appareil (et, plus tard, par la génération des aperçus).

export const TAILLE_MAX = 5 * 1024 * 1024; // le front envoie des JPEG de ~0,2 à 1 Mo
const TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

type Env = { MEDIA: R2Bucket; DB: D1Database };

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
  const appareil = request.headers.get("x-daloura-appareil") ?? "";
  if (!/^[a-f0-9]{32}$/.test(appareil)) return erreur("appareil_invalide", 401);
  const dossier = `appareils/${await empreinte(appareil)}/`;
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
      const liste = await env.MEDIA.list({ prefix: dossier });
      if (liste.objects.length)
        await env.MEDIA.delete(liste.objects.map((o) => o.key));
      return json({ ok: true, supprimees: liste.objects.length });
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
