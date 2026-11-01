// Solde de perles affiché par les écrans.
// Connectée : son vrai solde (GET /api/compte/moi). Sans compte (relecture des écrans via /ecrans) :
// des fausses données cohérentes entre elles, calculées depuis perles.ts (rien en dur ici).
import { useCompte } from "./compte";
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
  const { compte } = useCompte();
  return compte ? compte.perles : SOLDE_EXEMPLE[moment];
}
