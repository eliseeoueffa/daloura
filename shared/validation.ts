// Règles partagées entre l'appli et le Worker : les mêmes vérifications des deux côtés.

export const EMAIL_MAX = 254;
export const PRENOM_MAX = 20;
export const CODE_LONGUEUR = 4;

/** Email en minuscules, sans espaces autour : c'est la forme stockée et comparée. */
export function normaliserEmail(brut: string): string {
  return brut.trim().toLowerCase();
}

export function emailValide(email: string): boolean {
  return email.length > 0 && email.length <= EMAIL_MAX && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Prénom affiché et stocké : le premier mot seulement, 20 caractères max.
 * « Awa Koné » devient « Awa ». Renvoie "" si rien d'utilisable.
 */
export function normaliserPrenom(brut: string): string {
  const premier = brut.trim().split(/\s+/)[0] ?? "";
  return Array.from(premier).slice(0, PRENOM_MAX).join("");
}

export function prenomValide(prenom: string): boolean {
  return prenom.length > 0 && Array.from(prenom).length <= PRENOM_MAX && /\p{L}/u.test(prenom);
}

/** Codes trop faciles à deviner, refusés à l'inscription et au changement de code. */
export function codeTropSimple(code: string): boolean {
  if (/^(\d)\1{3}$/.test(code)) return true; // 0000, 1111…
  const chiffres = Array.from(code, Number);
  const pas = chiffres[1] - chiffres[0];
  if ((pas === 1 || pas === -1) && chiffres.every((c, i) => i === 0 || c - chiffres[i - 1] === pas)) {
    return true; // 1234, 4321, 6789…
  }
  return ["1212", "2580", "0852", "1122", "6969", "1004"].includes(code);
}

export type ErreurCode = "format" | "trop_simple";

export function verifierCode(code: string): ErreurCode | null {
  if (!/^\d{4}$/.test(code)) return "format";
  if (codeTropSimple(code)) return "trop_simple";
  return null;
}
