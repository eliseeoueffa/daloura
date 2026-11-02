// Identifiant aléatoire de ce téléphone (128 bits), gardé dans le navigateur. Sert à n'offrir les
// perles de bienvenue qu'une fois par téléphone.
const CLE_APPAREIL = "daloura-appareil";
let appareilMemoire: string | null = null;

export function appareil(): string {
  try {
    const deja = localStorage.getItem(CLE_APPAREIL);
    if (deja && /^[a-f0-9]{32}$/.test(deja)) return deja;
  } catch {
    // stockage indisponible : identifiant le temps de la visite
  }
  appareilMemoire ??= [...crypto.getRandomValues(new Uint8Array(16))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  try {
    localStorage.setItem(CLE_APPAREIL, appareilMemoire);
  } catch {
    /* rien */
  }
  return appareilMemoire;
}

