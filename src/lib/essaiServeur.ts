// Essai lancé sur le serveur (worker/essais.ts) : lancement, suivi, adresses des aperçus.
// Seul l'identifiant de l'essai en cours est gardé sur le téléphone (avec les coiffures demandées).
import { useEffect, useState } from "react";
import { appareil } from "./appareil";

export type Apercu = {
  id: string;
  coiffure: string;
  statut: "pending" | "processing" | "ready" | "failed";
};
export type Essai = {
  id: string;
  statut: Apercu["statut"];
  provisoire: boolean;
  apercus: Apercu[];
};
type Memo = { id: string; coiffures: string[] };

const CLE = "daloura-essai";

export function essaiMemorise(): Memo | null {
  try {
    const m = JSON.parse(localStorage.getItem(CLE) ?? "null") as Memo | null;
    return m && typeof m.id === "string" && Array.isArray(m.coiffures)
      ? m
      : null;
  } catch {
    return null;
  }
}
function memoriser(m: Memo | null) {
  try {
    if (m) localStorage.setItem(CLE, JSON.stringify(m));
    else localStorage.removeItem(CLE);
  } catch {
    /* stockage indisponible : l'essai reste suivi le temps de la visite */
  }
}
/** Nouveau choix de coiffures : le prochain passage par Attente lancera un nouvel essai. */
export const oublierEssai = () => memoriser(null);

export type ResultatLancement =
  | { ok: true; id: string }
  | { ok: false; error: string; manque?: number; manquantes?: string[] };

let lancementEnCours: { cle: string; p: Promise<ResultatLancement> } | null =
  null;

/** Lance l'essai de ces coiffures, ou reprend celui déjà lancé pour les mêmes coiffures. */
export function lancerEssai(coiffures: string[]): Promise<ResultatLancement> {
  const cle = coiffures.join(",");
  const deja = essaiMemorise();
  if (deja && deja.coiffures.join(",") === cle)
    return Promise.resolve({ ok: true, id: deja.id });
  if (lancementEnCours?.cle === cle) return lancementEnCours.p; // double montage de l'écran
  const p = (async (): Promise<ResultatLancement> => {
    try {
      const r = await fetch("/api/essais", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-daloura-appareil": appareil(),
        },
        body: JSON.stringify({ coiffures }),
      });
      const d = (await r.json().catch(() => ({}))) as Record<string, unknown>;
      if (!r.ok)
        return {
          ok: false,
          error: String(d.error ?? "erreur"),
          ...d,
        } as ResultatLancement;
      memoriser({ id: String(d.essai), coiffures });
      return { ok: true, id: String(d.essai) };
    } catch {
      return { ok: false, error: "hors_ligne" };
    } finally {
      lancementEnCours = null;
    }
  })();
  lancementEnCours = { cle, p };
  return p;
}

export async function lireEssai(id: string): Promise<Essai | null> {
  try {
    const r = await fetch(`/api/essais/${id}`);
    return r.ok ? ((await r.json()) as Essai) : null;
  } catch {
    return null;
  }
}

export const urlApercu = (essai: string, apercu: string) =>
  `/api/essais/${essai}/apercus/${apercu}`;

/** L'essai mémorisé, relu sur le serveur (pour les écrans d'aperçus). */
export function useEssaiServeur(): Essai | null {
  const [essai, setEssai] = useState<Essai | null>(null);
  useEffect(() => {
    const m = essaiMemorise();
    if (m) void lireEssai(m.id).then(setEssai);
  }, []);
  return essai;
}
