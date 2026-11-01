// Hachage du code secret et jetons aléatoires (WebCrypto du runtime Workers).

// Les Workers plafonnent PBKDF2 à 100 000 itérations. Le nombre est stocké avec chaque hash
// pour pouvoir l'augmenter plus tard sans casser les comptes existants.
export const PBKDF2_ITERATIONS = 100_000;

const enc = new TextEncoder();

export function toBase64(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

export function fromBase64(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

function toBase64Url(bytes: Uint8Array): string {
  return toBase64(bytes)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function randomBytes(n: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(n));
}

/** Jeton opaque pour les cookies et les liens envoyés par email (256 bits). */
export function randomToken(): string {
  return toBase64Url(randomBytes(32));
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(value));
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

export type CodeHash = { hash: string; salt: string; iterations: number };

async function pbkdf2(
  code: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(code),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256,
  );
  return new Uint8Array(bits);
}

export async function hashCode(
  code: string,
  iterations = PBKDF2_ITERATIONS,
): Promise<CodeHash> {
  const salt = randomBytes(16);
  const hash = await pbkdf2(code, salt, iterations);
  return { hash: toBase64(hash), salt: toBase64(salt), iterations };
}

export async function verifyCode(
  code: string,
  stored: CodeHash,
): Promise<boolean> {
  const candidate = await pbkdf2(
    code,
    fromBase64(stored.salt),
    stored.iterations,
  );
  const expected = fromBase64(stored.hash);
  if (candidate.byteLength !== expected.byteLength) return false;
  return crypto.subtle.timingSafeEqual(candidate, expected);
}

// Hash factice : quand l'email est inconnu, on calcule quand même un PBKDF2 pour que le temps
// de réponse ne révèle pas si le compte existe.
let dummy: Promise<CodeHash> | undefined;
export async function burnCodeCheck(code: string): Promise<void> {
  dummy ??= hashCode("0000");
  await verifyCode(code, await dummy);
}
