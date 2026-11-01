// Solde de perles affiché par les écrans.
// PROVISOIRE : tant que les comptes (étape 2) ne sont pas branchés, les écrans montrent des
// fausses données cohérentes entre elles, calculées depuis perles.ts (rien en dur ici).
// Quand l'API existera, useSolde() lira GET /api/perles et ce fichier sera le seul à changer.
import {
  MAX_COIFFURES,
  SACHETS,
  SACHET_CONSEILLE,
  coutEssai,
  sachet,
} from "./perles";

const conseille = sachet(SACHET_CONSEILLE)!.perles; // 21 : elle vient d'acheter My Hair Era
const apresEssai = conseille - coutEssai(MAX_COIFFURES); // 12 : après un essai complet
const apresAchat = apresEssai + conseille; // 33 : elle recharge My Hair Era
const plusGrosSachet = Math.max(...SACHETS.map((s) => s.perles)); // 57

/** Fausses données, par moment du parcours. */
export const SOLDE_EXEMPLE = {
  avantEssai: conseille,
  apresEssai,
  vide: 0,
  apresAchat,
  recapSuffisant: plusGrosSachet,
  recapInsuffisant: apresAchat,
} as const;

export type MomentSolde = keyof typeof SOLDE_EXEMPLE;

export function useSolde(moment: MomentSolde): number {
  return SOLDE_EXEMPLE[moment];
}
