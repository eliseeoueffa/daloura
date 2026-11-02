// Les looks de l'essai en cours, tels que choisis sur Choix-essai ou Choix-3.
// Tant que l'IA n'est pas branchée, l'« aperçu » affiché est l'illustration de la coiffure.
import { COIFFURES, ESSAI_EXEMPLE, coiffure, type Coiffure } from "./coiffures";
import { useEssaiServeur, urlApercu } from "./essaiServeur";
import { useEssai } from "./photos";

export function useLooks(): Coiffure[] {
  const { essai } = useEssai();
  const slugs = essai.length ? essai : ESSAI_EXEMPLE;
  return slugs.map((s) => coiffure(s) ?? COIFFURES[0]);
}

/** « un », « deux », « trois » pour les titres. */
export function enLettres(n: number): string {
  return (
    ["zéro", "un", "deux", "trois", "quatre", "cinq", "six"][n] ?? String(n)
  );
}

/** Aperçus réels de l'essai lancé sur le serveur, par coiffure (null tant qu'il n'y en a pas). */
export function useApercusReels() {
  const essai = useEssaiServeur();
  const parCoiffure = new Map(
    (essai?.apercus ?? []).map((a) => [
      a.coiffure,
      {
        statut: a.statut,
        url: a.statut === "ready" && essai ? urlApercu(essai.id, a.id) : null,
      },
    ]),
  );
  return { essai, de: (slug: string) => parCoiffure.get(slug) ?? null };
}

/** Style d'une vraie photo d'aperçu (remplit le cadre), l'illustration garde le sien. */
export const STYLE_PHOTO = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
} as const;
