// Hachage du code secret à 4 chiffres (PBKDF2-SHA256 natif, sel aléatoire), utilisé par Better Auth.
// Un code de 4 chiffres n'a que 10 000 possibilités : ce n'est pas le coût du hachage qui le protège
// mais le blocage après 3 erreurs (comptes.ts). On garde donc un coût modéré, compatible avec la
// limite de CPU des Workers. Le nombre d'itérations est stocké avec le hachage.
const ITERATIONS = 20_000;

const b64 = (b: Uint8Array) => btoa(String.fromCharCode(...b));
const deb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function pbkdf2(code: string, sel: Uint8Array, iterations: number): Promise<Uint8Array> {
  const cle = await crypto.subtle.importKey("raw", new TextEncoder().encode(code), "PBKDF2", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: sel, iterations }, cle, 256));
}

export async function hacherCode(code: string): Promise<string> {
  const sel = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${ITERATIONS}$${b64(sel)}$${b64(await pbkdf2(code, sel, ITERATIONS))}`;
}

export async function verifierCode(code: string, stocke: string): Promise<boolean> {
  const [algo, it, sel, attendu] = stocke.split("$");
  if (algo !== "pbkdf2" || !sel || !attendu || !Number(it)) return false;
  const obtenu = await pbkdf2(code, deb64(sel), Number(it));
  const ref = deb64(attendu);
  if (obtenu.length !== ref.length) return false;
  let diff = 0;
  for (let i = 0; i < ref.length; i++) diff |= obtenu[i] ^ ref[i]; // comparaison à temps constant
  return diff === 0;
}
