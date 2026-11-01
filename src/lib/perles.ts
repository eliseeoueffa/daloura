// La perle, monnaie de Daloura. SEUL endroit où se règlent les chiffres :
// importé par le front (src/) et par le Worker (worker/). Ne jamais réécrire ces nombres ailleurs.

/** Valeur de référence d'une perle, en F CFA (susceptible d'évoluer). */
export const VALEUR_PERLE_XOF = 50;

/** Coût d'une génération (1 coiffure générée sur le visage). */
export const COUT_GENERATION = 3;

/** Nombre de coiffures par essai. */
export const MIN_COIFFURES = 1;
export const MAX_COIFFURES = 3;

/** Le vote du cercle (gratuit) n'est possible qu'à partir de ce nombre de coiffures. */
export const MIN_COIFFURES_VOTE = 2;

/** Cadeau de bienvenue, une seule fois par compte. */
export const PERLES_BIENVENUE = 3;

export type SachetId = "hair-moment" | "hair-era" | "hair-year";
export type Sachet = { id: SachetId; nom: string; prixXof: number; perles: number };

/** Sachets achetés via Itaja. Toujours des multiples de COUT_GENERATION. */
export const SACHETS: readonly Sachet[] = [
  { id: "hair-moment", nom: "My Hair Moment", prixXof: 500, perles: 9 },
  { id: "hair-era", nom: "My Hair Era", prixXof: 1000, perles: 21 },
  { id: "hair-year", nom: "My Hair Year", prixXof: 2500, perles: 57 },
];

/** Sachet mis en avant sur Offres et Recharger. */
export const SACHET_CONSEILLE: SachetId = "hair-era";

export type RecapMois = 3 | 6 | 12;

/** My Hair Recap, payé en perles (sans Itaja). */
export const RECAPS: readonly { mois: RecapMois; perles: number }[] = [
  { mois: 3, perles: 20 },
  { mois: 6, perles: 40 },
  { mois: 12, perles: 80 },
];

// ─── Calculs ────────────────────────────────────────────────────────────────

export function sachet(id: string): Sachet | undefined {
  return SACHETS.find((s) => s.id === id);
}

/** Nombre de coiffures qu'un sachet permet de générer. */
export function generationsDe(perles: number): number {
  return Math.floor(perles / COUT_GENERATION);
}

export function nbCoiffuresValide(n: number): boolean {
  return Number.isInteger(n) && n >= MIN_COIFFURES && n <= MAX_COIFFURES;
}

/** Coût d'un essai de n coiffures (3, 6 ou 9 perles). Lève une erreur hors de 1..MAX_COIFFURES. */
export function coutEssai(n: number): number {
  if (!nbCoiffuresValide(n)) throw new RangeError(`essai de ${n} coiffures impossible`);
  return n * COUT_GENERATION;
}

export function voteAutorise(nbCoiffures: number): boolean {
  return nbCoiffures >= MIN_COIFFURES_VOTE;
}

export function coutRecap(mois: number): number | undefined {
  return RECAPS.find((r) => r.mois === mois)?.perles;
}

// ─── Affichage ──────────────────────────────────────────────────────────────

/** « perle » ou « perles » : en français, 0 et 1 restent au singulier. */
export function motPerles(n: number): string {
  return Math.abs(n) < 2 ? "perle" : "perles";
}

/** « 0 perle », « 1 perle », « 21 perles ». */
export function formatPerles(n: number): string {
  return `${n} ${motPerles(n)}`;
}

/** « 1 coiffure », « 7 coiffures ». */
export function formatCoiffures(n: number): string {
  return `${n} coiffure${Math.abs(n) < 2 ? "" : "s"}`;
}

/** « 1 000 F » (espace insécable fine entre les milliers, comme sur les maquettes). */
export function formatXof(n: number): string {
  return `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} F`;
}

/** « 3, 6 ou 12 » : les durées de recap, pour les phrases. */
export function dureesRecap(): string {
  const m = RECAPS.map((r) => String(r.mois));
  return m.length > 1 ? `${m.slice(0, -1).join(", ")} ou ${m[m.length - 1]}` : m.join("");
}
