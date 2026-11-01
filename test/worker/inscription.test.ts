import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { creerClient, INSCRIPTION } from "./helpers";

describe("POST /api/auth/email-disponible", () => {
  it("dit si l'email est libre, sans tenir compte des majuscules", async () => {
    const c = creerClient();
    expect(
      (
        await c.appeler("POST", "/api/auth/email-disponible", {
          email: "awa.k@gmail.com",
        })
      ).body,
    ).toEqual({
      disponible: true,
    });
    await c.appeler("POST", "/api/auth/inscription", INSCRIPTION);
    expect(
      (
        await c.appeler("POST", "/api/auth/email-disponible", {
          email: " AWA.K@gmail.com",
        })
      ).body,
    ).toEqual({
      disponible: false,
    });
  });

  it("refuse un email mal formé", async () => {
    const c = creerClient();
    const r = await c.appeler("POST", "/api/auth/email-disponible", {
      email: "awa@",
    });
    expect(r.status).toBe(400);
    expect(r.body.error).toBe("email_invalide");
  });

  it("limite à 30 vérifications par heure et par IP", async () => {
    const c = creerClient();
    for (let i = 0; i < 30; i++) {
      expect(
        (
          await c.appeler("POST", "/api/auth/email-disponible", {
            email: `a${i}@b.co`,
          })
        ).status,
      ).toBe(200);
    }
    expect(
      (
        await c.appeler("POST", "/api/auth/email-disponible", {
          email: "x@b.co",
        })
      ).status,
    ).toBe(429);
    expect(
      (
        await c.appeler(
          "POST",
          "/api/auth/email-disponible",
          { email: "x@b.co" },
          { ip: "10.0.0.2" },
        )
      ).status,
    ).toBe(200);
    c.avancer(3_600_000);
    expect(
      (
        await c.appeler("POST", "/api/auth/email-disponible", {
          email: "x@b.co",
        })
      ).status,
    ).toBe(200);
  });
});

describe("POST /api/auth/inscription", () => {
  it("crée le compte, ouvre la session et envoie le lien de vérification", async () => {
    const c = creerClient();
    const r = await c.appeler("POST", "/api/auth/inscription", INSCRIPTION);
    expect(r.status).toBe(201);
    expect(r.body.utilisatrice).toEqual({
      prenom: "Awa",
      email: "awa.k@gmail.com",
      emailVerifie: false,
      essaiUtilise: false,
    });

    const cookies = r.headers.getSetCookie();
    const session = cookies.find((s) =>
      s.startsWith("__Host-daloura_session="),
    )!;
    expect(session).toMatch(/HttpOnly/);
    expect(session).toMatch(/Secure/);
    expect(session).toMatch(/SameSite=Lax/);
    expect(session).toMatch(/Path=\//);
    expect(session).toMatch(/Max-Age=7776000/); // 90 jours
    expect(cookies.some((s) => s.startsWith("__Host-daloura_appareil=1"))).toBe(
      true,
    );

    const mail = c.mailer.dernier("verification")!;
    expect(mail.to).toBe("awa.k@gmail.com");
    expect(mail.variables.prenom).toBe("Awa");
    expect(mail.variables.lien).toMatch(
      /^https:\/\/daloura\.test\/email-verifie\?jeton=/,
    );
    expect(mail.idempotencyKey).toMatch(/^verification:/);
  });

  it("ne stocke ni le code ni les jetons en clair", async () => {
    const c = creerClient();
    await c.appeler("POST", "/api/auth/inscription", INSCRIPTION);
    const user = await env.DB.prepare("SELECT * FROM users").first();
    expect(JSON.stringify(user)).not.toContain("2468");
    const jetonSession = c.cookies["__Host-daloura_session"];
    const sessions = await env.DB.prepare("SELECT id FROM sessions").all();
    expect(JSON.stringify(sessions.results)).not.toContain(jetonSession);
    const verifs = await env.DB.prepare(
      "SELECT token_hash FROM email_verifications",
    ).all();
    expect(JSON.stringify(verifs.results)).not.toContain(
      c.mailer.jeton("verification"),
    );
  });

  it("refuse un email déjà utilisé (409 email_existant)", async () => {
    const c = creerClient();
    await c.appeler("POST", "/api/auth/inscription", INSCRIPTION);
    const r = await c.appeler("POST", "/api/auth/inscription", {
      ...INSCRIPTION,
      email: "AWA.K@gmail.com ",
    });
    expect(r.status).toBe(409);
    expect(r.body.error).toBe("email_existant");
  });

  it.each([
    [{ prenom: "  " }, "prenom_invalide"],
    [{ prenom: "1234" }, "prenom_invalide"],
    [{ email: "awa" }, "email_invalide"],
    [{ email: "a".repeat(250) + "@b.co" }, "email_invalide"],
    [{ code: "123" }, "code_format"],
    [{ code: "0000" }, "code_trop_simple"],
    [{ code: "1234" }, "code_trop_simple"],
    [{ consentement: false }, "consentement_requis"],
    [{ consentement: "true" }, "consentement_requis"],
  ])("refuse %o → %s", async (champ, code) => {
    const c = creerClient();
    const r = await c.appeler("POST", "/api/auth/inscription", {
      ...INSCRIPTION,
      ...champ,
    });
    expect(r.status).toBe(400);
    expect(r.body.error).toBe(code);
    expect(
      await env.DB.prepare("SELECT count(*) AS n FROM users").first("n"),
    ).toBe(0);
  });

  it("garde seulement le premier mot du prénom, 20 caractères max", async () => {
    const c = creerClient();
    const r = await c.appeler("POST", "/api/auth/inscription", {
      ...INSCRIPTION,
      prenom: "Christelle-Marie-Ange Koffi",
    });
    expect(r.body.utilisatrice.prenom).toBe("Christelle-Marie-Ang");
  });

  it("limite à 10 inscriptions par heure et par IP", async () => {
    const c = creerClient();
    for (let i = 0; i < 10; i++) {
      await c.appeler("POST", "/api/auth/inscription", {
        ...INSCRIPTION,
        email: `awa${i}@b.co`,
      });
    }
    const r = await c.appeler("POST", "/api/auth/inscription", {
      ...INSCRIPTION,
      email: "awa10@b.co",
    });
    expect(r.status).toBe(429);
  });
});

describe("vérification de l'email", () => {
  it("le lien vérifie l'email une seule fois", async () => {
    const c = creerClient();
    await c.appeler("POST", "/api/auth/inscription", INSCRIPTION);
    const jeton = c.mailer.jeton("verification");

    expect(
      (await c.appeler("POST", "/api/auth/verifier-email", { jeton })).status,
    ).toBe(200);
    expect(
      (await c.appeler("GET", "/api/auth/session")).body.utilisatrice
        .emailVerifie,
    ).toBe(true);

    const r = await c.appeler("POST", "/api/auth/verifier-email", { jeton });
    expect(r.status).toBe(400);
    expect(r.body.error).toBe("lien_invalide");
  });

  it("marche même sans être connectée (lien ouvert dans un autre navigateur)", async () => {
    const c = creerClient();
    await c.appeler("POST", "/api/auth/inscription", INSCRIPTION);
    const r = await c.appeler(
      "POST",
      "/api/auth/verifier-email",
      { jeton: c.mailer.jeton("verification") },
      { sansCookie: true },
    );
    expect(r.status).toBe(200);
  });

  it("le lien expire après 24 heures", async () => {
    const c = creerClient();
    await c.appeler("POST", "/api/auth/inscription", INSCRIPTION);
    c.avancer(24 * 3_600_000 + 1);
    const r = await c.appeler("POST", "/api/auth/verifier-email", {
      jeton: c.mailer.jeton("verification"),
    });
    expect(r.body.error).toBe("lien_invalide");
  });

  it("refuse un jeton inventé ou vide", async () => {
    const c = creerClient();
    expect(
      (await c.appeler("POST", "/api/auth/verifier-email", { jeton: "abc" }))
        .status,
    ).toBe(400);
    expect(
      (await c.appeler("POST", "/api/auth/verifier-email", {})).status,
    ).toBe(400);
  });

  it("renvoie un lien, 3 fois par heure maximum", async () => {
    const c = creerClient();
    await c.appeler("POST", "/api/auth/inscription", INSCRIPTION);
    for (let i = 0; i < 3; i++) {
      expect(
        (await c.appeler("POST", "/api/auth/renvoyer-verification", {})).status,
      ).toBe(202);
    }
    expect(
      (await c.appeler("POST", "/api/auth/renvoyer-verification", {})).status,
    ).toBe(429);
    expect(
      c.mailer.envoyes.filter((e) => e.modele === "verification"),
    ).toHaveLength(4);
  });

  it("ne renvoie rien si l'email est déjà vérifié ou sans session", async () => {
    const c = creerClient();
    expect(
      (await c.appeler("POST", "/api/auth/renvoyer-verification", {})).status,
    ).toBe(401);
    await c.appeler("POST", "/api/auth/inscription", INSCRIPTION);
    await c.appeler("POST", "/api/auth/verifier-email", {
      jeton: c.mailer.jeton("verification"),
    });
    const r = await c.appeler("POST", "/api/auth/renvoyer-verification", {});
    expect(r.body).toEqual({ dejaVerifie: true });
  });
});
