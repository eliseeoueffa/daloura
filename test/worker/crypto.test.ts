import { describe, expect, it } from "vitest";
import {
  hashCode,
  PBKDF2_ITERATIONS,
  randomToken,
  sha256Hex,
  verifyCode,
} from "../../worker/lib/crypto";
import {
  BLOCAGE_BASE,
  BLOCAGE_MAX,
  dureeBlocage,
} from "../../worker/lib/lockout";

describe("hachage du code", () => {
  it("vérifie le bon code et refuse un autre", async () => {
    const h = await hashCode("2468");
    expect(h.iterations).toBe(PBKDF2_ITERATIONS);
    expect(await verifyCode("2468", h)).toBe(true);
    expect(await verifyCode("2469", h)).toBe(false);
  });
  it("utilise un sel différent à chaque fois", async () => {
    const [a, b] = await Promise.all([hashCode("2468"), hashCode("2468")]);
    expect(a.salt).not.toBe(b.salt);
    expect(a.hash).not.toBe(b.hash);
  });
  it("ne contient jamais le code en clair", async () => {
    const h = await hashCode("2468");
    expect(JSON.stringify(h)).not.toContain("2468");
  });
});

describe("jetons", () => {
  it("sont longs, aléatoires et utilisables dans une URL", () => {
    const a = randomToken();
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(randomToken()).not.toBe(a);
  });
  it("sha256Hex donne 64 caractères hexadécimaux", async () => {
    expect(await sha256Hex("x")).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("durée du blocage", () => {
  it("2 minutes, puis double, plafonnée à 1 heure", () => {
    expect(dureeBlocage(1)).toBe(BLOCAGE_BASE);
    expect(dureeBlocage(2)).toBe(2 * BLOCAGE_BASE);
    expect(dureeBlocage(3)).toBe(4 * BLOCAGE_BASE);
    expect(dureeBlocage(6)).toBe(BLOCAGE_MAX);
    expect(dureeBlocage(50)).toBe(BLOCAGE_MAX);
  });
});
