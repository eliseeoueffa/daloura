// Photos de l'utilisatrice (selfie, inspirations rangées par coiffure) et coiffures choisies pour
// l'essai en préparation. Tout est gardé DANS LE NAVIGATEUR (IndexedDB) jusqu'à l'envoi vers R2
// (étape 3) : rien ne quitte le téléphone pour l'instant.
// Si IndexedDB est indisponible (navigation privée…), tout reste en mémoire le temps de la visite.
import { useEffect, useState, useSyncExternalStore } from "react";
import { IMG } from "../assets/images";
import { COIFFURES } from "./coiffures";
import { oublierEssai } from "./essaiServeur";

/** Photo d'inspiration, rangée dans la case d'une coiffure (slug de src/lib/coiffures.ts). */
export type Inspiration = {
  id: string;
  blob: Blob;
  createdAt: number;
  style: string;
};

const BASE = "daloura-photos";
const TABLE = "photos";
const CLE_SELFIE = "selfie";
const CLE_INSPIRATIONS = "inspirations";
const CLE_ESSAI = "essai";
const CLE_CONSENTEMENT = "consentement";

/** Taille max d'un côté après redimensionnement : assez pour l'IA, léger pour le téléphone. */
const COTE_MAX = 1600;

// ─── Stockage ───────────────────────────────────────────────────────────────

let ouverture: Promise<IDBDatabase | null> | null = null;
function ouvrir(): Promise<IDBDatabase | null> {
  ouverture ??= new Promise((resolve) => {
    try {
      const req = indexedDB.open(BASE, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(TABLE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return ouverture;
}

const memoire = new Map<string, unknown>();

async function lire<T>(cle: string): Promise<T | undefined> {
  const db = await ouvrir();
  if (!db) return memoire.get(cle) as T | undefined;
  return new Promise((resolve) => {
    try {
      const req = db.transaction(TABLE).objectStore(TABLE).get(cle);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => resolve(memoire.get(cle) as T | undefined);
    } catch {
      resolve(memoire.get(cle) as T | undefined);
    }
  });
}

async function ecrire(cle: string, valeur: unknown): Promise<void> {
  if (valeur === undefined) memoire.delete(cle);
  else memoire.set(cle, valeur);
  const db = await ouvrir();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(TABLE, "readwrite");
      if (valeur === undefined) tx.objectStore(TABLE).delete(cle);
      else tx.objectStore(TABLE).put(valeur, cle);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

// ─── État partagé entre écrans ──────────────────────────────────────────────

type Etat = {
  selfie: Blob | null;
  inspirations: Inspiration[];
  essai: string[];
  /** Date de l'accord donné sur l'écran Consentement : sans lui, aucune photo ne quitte le téléphone. */
  consentement: number | null;
  charge: boolean;
};
let etat: Etat = {
  selfie: null,
  inspirations: [],
  essai: [],
  consentement: null,
  charge: false,
};
const abonnes = new Set<() => void>();
const publier = (e: Partial<Etat>) => {
  etat = { ...etat, ...e };
  abonnes.forEach((f) => f());
};

/** Lecture de l'état hors React (envoi vers R2, src/lib/envoi.ts). */
export const etatPhotos = () => etat;
export function surChangement(f: () => void): () => void {
  abonnes.add(f);
  return () => abonnes.delete(f);
}

/** Photos enregistrées avant le rangement par coiffure : chacune prend une case libre. */
function rangerAnciennes(liste: Partial<Inspiration>[]): Inspiration[] {
  const prises = new Set(liste.map((i) => i.style).filter(Boolean));
  const libres = COIFFURES.map((c) => c.slug).filter((s) => !prises.has(s));
  return liste
    .map((i) => (i.style ? i : { ...i, style: libres.shift() }))
    .filter((i): i is Inspiration => Boolean(i.style && i.blob && i.id));
}

let chargement: Promise<void> | null = null;
function charger() {
  chargement ??= Promise.all([
    lire<Blob>(CLE_SELFIE),
    lire<Partial<Inspiration>[]>(CLE_INSPIRATIONS),
    lire<string[]>(CLE_ESSAI),
    lire<number>(CLE_CONSENTEMENT),
  ]).then(([s, i, e, c]) =>
    publier({
      selfie: lisible(s) ? s : null,
      inspirations: rangerAnciennes(i ?? []).filter((x) => lisible(x.blob)),
      essai: e ?? [],
      consentement: c ?? null,
      charge: true,
    }),
  );
  return chargement;
}

function usePhotos(): Etat {
  const e = useSyncExternalStore(
    (f) => {
      abonnes.add(f);
      return () => abonnes.delete(f);
    },
    () => etat,
  );
  useEffect(() => {
    void charger();
  }, []);
  return e;
}

/** Adresse locale (blob:) d'une photo, libérée quand l'écran la quitte. */
export function useUrl(blob: Blob | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!blob) return setUrl(null);
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url;
}

// ─── Préparation des images ─────────────────────────────────────────────────

/** Redimensionne et recompresse en JPEG (une photo de téléphone fait souvent 5 à 12 Mo). */
export async function preparer(
  source: Blob | HTMLCanvasElement,
): Promise<Blob> {
  const img =
    source instanceof HTMLCanvasElement ? source : await decoder(source);
  const r = Math.min(1, COTE_MAX / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * r));
  canvas.height = Math.max(1, Math.round(img.height * r));
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  if ("close" in img && typeof img.close === "function") img.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("image_illisible"))),
      "image/jpeg",
      0.85,
    ),
  );
}

/**
 * Lit une photo. Deux méthodes (certains téléphones refusent la première sur les très grosses photos).
 * Si aucune ne marche (souvent une photo HEIC, que les navigateurs ne savent pas lire), on REFUSE la
 * photo : la garder telle quelle donnait une image cassée et un envoi refusé par le serveur.
 */
async function decoder(
  blob: Blob,
): Promise<
  { width: number; height: number } & CanvasImageSource & { close?: () => void }
> {
  try {
    return await createImageBitmap(blob, { imageOrientation: "from-image" });
  } catch {
    /* on essaie l'autre méthode */
  }
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    if (!img.naturalWidth) throw new Error("vide");
    return Object.assign(img, {
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  } catch {
    throw new Error("image_illisible");
  } finally {
    // L'image décodée reste utilisable après la libération de l'adresse.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

/** Types que l'appli produit (et que le serveur accepte). Une photo d'un autre type est illisible. */
const TYPES_LISIBLES = ["image/jpeg", "image/png", "image/webp"];
const lisible = (b: Blob | null | undefined): b is Blob =>
  !!b && b.size > 0 && TYPES_LISIBLES.includes(b.type);

/** Message pour une photo refusée. */
export const MESSAGE_PHOTO_ILLISIBLE =
  "Ton téléphone n'arrive pas à lire cette photo (souvent une photo au format HEIC). Choisis-en une autre, ou fais une capture d'écran de la photo et choisis la capture.";

// ─── API des écrans ─────────────────────────────────────────────────────────

export function useSelfie() {
  const { selfie, charge } = usePhotos();
  return {
    selfie,
    charge,
    async enregistrer(photo: Blob) {
      await ecrire(CLE_SELFIE, photo);
      publier({ selfie: photo });
    },
    async supprimer() {
      await ecrire(CLE_SELFIE, undefined);
      publier({ selfie: null });
    },
  };
}

export function useInspirations() {
  const { inspirations, charge } = usePhotos();
  const enregistrer = async (liste: Inspiration[]) => {
    await ecrire(CLE_INSPIRATIONS, liste);
    publier({ inspirations: liste });
  };
  return {
    inspirations,
    charge,
    /** La photo d'inspiration de cette coiffure, s'il y en a une. */
    de: (style: string) => inspirations.find((i) => i.style === style),
    /** Met la photo dans la case de cette coiffure (remplace l'ancienne). Lève une erreur si illisible. */
    async mettre(style: string, fichier: Blob) {
      const blob = await preparer(fichier);
      await charger();
      await enregistrer([
        ...etat.inspirations.filter((i) => i.style !== style),
        { id: crypto.randomUUID(), blob, createdAt: Date.now(), style },
      ]);
    },
    async retirer(style: string) {
      await charger();
      await enregistrer(etat.inspirations.filter((i) => i.style !== style));
      if (etat.essai.includes(style)) {
        const e = etat.essai.filter((s) => s !== style);
        await ecrire(CLE_ESSAI, e);
        publier({ essai: e });
      }
    },
  };
}

/** Coiffures choisies pour l'essai en préparation, dans l'ordre du choix. */
export function useEssai() {
  const { essai, charge } = usePhotos();
  return {
    essai,
    charge,
    async choisir(styles: string[]) {
      oublierEssai(); // nouveau choix : nouvel essai à lancer
      await ecrire(CLE_ESSAI, styles);
      publier({ essai: styles });
    },
  };
}

/** Accord donné sur l'écran Consentement : autorise l'envoi des photos vers le serveur. */
export function useConsentement() {
  const { consentement, charge } = usePhotos();
  return {
    consentement,
    charge,
    async donner() {
      const quand = Date.now();
      await ecrire(CLE_CONSENTEMENT, quand);
      publier({ consentement: quand });
    },
  };
}

export { charger as chargerPhotos };

/** Efface selfie, inspirations et essai en cours de ce navigateur (Profil). */
export async function effacerPhotos() {
  await Promise.all([
    ecrire(CLE_SELFIE, undefined),
    ecrire(CLE_INSPIRATIONS, undefined),
    ecrire(CLE_ESSAI, undefined),
  ]);
  publier({ selfie: null, inspirations: [], essai: [] });
}

/** Selfie à afficher : la vraie photo si elle existe, sinon l'illustration provisoire. */
export function useSelfieAffiche(repli: string = IMG.selfie) {
  const { selfie } = useSelfie();
  const url = useUrl(selfie);
  return {
    selfie: url ?? repli,
    selfieStyle: url
      ? ({ width: "100%", height: "100%", objectFit: "cover" } as const)
      : undefined,
  };
}
