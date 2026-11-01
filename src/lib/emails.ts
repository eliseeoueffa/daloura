// Règles d'email partagées par l'appli et le Worker (mêmes vérifications des deux côtés).
export const normaliserEmail = (e: unknown) => (typeof e === "string" ? e.trim().toLowerCase() : "");
export const emailValide = (e: string) => e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
