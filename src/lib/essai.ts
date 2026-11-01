// Les looks de l'essai en cours, tels que choisis sur Choix-essai ou Choix-3.
// Tant que l'IA n'est pas branchée, l'« aperçu » affiché est l'illustration de la coiffure.
import { COIFFURES, ESSAI_EXEMPLE, coiffure, type Coiffure } from "./coiffures";
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
