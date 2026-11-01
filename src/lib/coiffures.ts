// Les coiffures proposées. Les slugs sont ceux de la table styles (migrations/0001_init.sql).
// img : illustration provisoire, affichée tant qu'elle n'a pas mis sa propre photo d'inspiration,
// et à la place de l'aperçu tant que l'IA n'est pas branchée.
import { IMG } from "../assets/images";

export type Coiffure = { slug: string; nom: string; img: string };

export const COIFFURES: readonly Coiffure[] = [
  { slug: "knotless", nom: "Knotless", img: IMG.knotless },
  { slug: "fulani", nom: "Fulani", img: IMG.fulani },
  { slug: "bantu-knots", nom: "Bantu knots", img: IMG.knots },
  { slug: "perruque", nom: "Perruque", img: IMG.perruque },
  { slug: "cheveux-naturels", nom: "Cheveux naturels", img: IMG.afro },
  { slug: "locks", nom: "Locks", img: IMG.locs },
];

export function coiffure(slug: string): Coiffure | undefined {
  return COIFFURES.find((c) => c.slug === slug);
}

/** Exemple montré quand aucun essai n'est en cours (relecture des écrans via /ecrans). */
export const ESSAI_EXEMPLE = ["fulani", "bantu-knots", "knotless"];
