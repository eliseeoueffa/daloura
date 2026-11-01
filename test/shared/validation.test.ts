import { describe, expect, it } from "vitest";
import {
  codeTropSimple,
  emailValide,
  normaliserEmail,
  normaliserPrenom,
  prenomValide,
  verifierCode,
} from "../../shared/validation";

describe("email", () => {
  it("normalise en minuscules sans espaces autour", () => {
    expect(normaliserEmail("  Awa.K@Gmail.COM ")).toBe("awa.k@gmail.com");
  });
  it.each(["awa@gmail.com", "a@b.co", "awa+daloura@mail.ci"])("accepte %s", (e) => {
    expect(emailValide(e)).toBe(true);
  });
  it.each(["", "awa", "awa@", "@gmail.com", "awa@gmail", "awa k@gmail.com"])("refuse « %s »", (e) => {
    expect(emailValide(e)).toBe(false);
  });
  it("accepte 254 caractères, refuse 255", () => {
    const domaine = "@exemple.com"; // 12 caractères
    expect(emailValide("a".repeat(254 - domaine.length) + domaine)).toBe(true);
    expect(emailValide("a".repeat(255 - domaine.length) + domaine)).toBe(false);
  });
});

describe("prénom", () => {
  it("garde le premier mot", () => {
    expect(normaliserPrenom("  Awa Koné ")).toBe("Awa");
  });
  it("garde les prénoms composés avec un tiret", () => {
    expect(normaliserPrenom("Marie-Claire")).toBe("Marie-Claire");
  });
  it("coupe à 20 caractères, accents et emoji compris", () => {
    expect(normaliserPrenom("A".repeat(25))).toHaveLength(20);
    expect(Array.from(normaliserPrenom("É".repeat(19) + "🌸🌸"))).toHaveLength(20);
  });
  it("refuse un prénom vide ou sans lettre", () => {
    expect(prenomValide(normaliserPrenom("   "))).toBe(false);
    expect(prenomValide("1234")).toBe(false);
    expect(prenomValide("Aïcha")).toBe(true);
  });
});

describe("code secret", () => {
  it.each(["0000", "1111", "9999", "1234", "4321", "6789", "9876", "0123", "1212", "2580"])(
    "refuse le code trop simple %s",
    (c) => {
      expect(codeTropSimple(c)).toBe(true);
      expect(verifierCode(c)).toBe("trop_simple");
    },
  );
  it.each(["2468", "7395", "1357", "0480", "1235"])("accepte %s", (c) => {
    expect(verifierCode(c)).toBeNull();
  });
  it.each(["", "123", "12345", "12a4", " 1234", "١٢٣٤"])("refuse le format « %s »", (c) => {
    expect(verifierCode(c)).toBe("format");
  });
});
