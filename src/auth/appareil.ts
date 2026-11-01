// Marqueur « un compte a déjà été créé ou ouvert sur ce téléphone ». Il sert seulement à
// afficher l'écran EssaiDejaUtilise avant l'inscription. Le serveur pose aussi un cookie
// équivalent (appareilConnu dans /api/auth/session) au cas où le stockage est vidé.
const CLE = "daloura:appareil";

export function marquerAppareil(): void {
  try {
    localStorage.setItem(CLE, "1");
  } catch {
    /* navigation privée ou stockage bloqué : le cookie du serveur prend le relais */
  }
}

export function appareilMarque(): boolean {
  try {
    return localStorage.getItem(CLE) === "1";
  } catch {
    return false;
  }
}
