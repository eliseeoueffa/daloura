import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { creerClient, INSCRIPTION } from "./helpers";

async function inscrite() {
  const c = creerClient();
  await c.appeler("POST", "/api/auth/inscription", INSCRIPTION);
  return c;
}

describe("POST /api/auth/code-oublie", () => {
  it("envoie un lien de réinitialisation avec le prénom", async () => {
    const c = await inscrite();
    const r = await c.appeler("POST", "/api/auth/code-oublie", { email: "AWA.K@gmail.com" });
    expect(r.status).toBe(202);
    const mail = c.mailer.dernier("reinitialisation")!;
    expect(mail.to).toBe("awa.k@gmail.com");
    expect(mail.variables.prenom).toBe("Awa");
    expect(mail.variables.lien).toMatch(/^https:\/\/daloura\.test\/code-nouveau\?jeton=[\w-]{43}$/);
  });

  it("répond exactement pareil que l'email existe ou non", async () => {
    const c = await inscrite();
    const existe = await c.appeler("POST", "/api/auth/code-oublie", { email: INSCRIPTION.email });
    const inconnu = await c.appeler("POST", "/api/auth/code-oublie", { email: "inconnue@b.co" });
    expect(inconnu.status).toBe(existe.status);
    expect(inconnu.body).toEqual(existe.body);
    expect([...inconnu.headers.keys()]).toEqual([...existe.headers.keys()]);
    expect(c.mailer.envoyes.filter((e) => e.modele === "reinitialisation")).toHaveLength(1);
  });

  it("n'envoie que 3 liens par heure pour un même email, sans changer la réponse", async () => {
    const c = await inscrite();
    for (let i = 0; i < 5; i++) {
      expect((await c.appeler("POST", "/api/auth/code-oublie", { email: INSCRIPTION.email }, { ip: `10.2.0.${i}` })).status).toBe(
        202,
      );
    }
    expect(c.mailer.envoyes.filter((e) => e.modele === "reinitialisation")).toHaveLength(3);
  });

  it("limite à 10 demandes par heure et par IP", async () => {
    const c = creerClient();
    for (let i = 0; i < 10; i++) await c.appeler("POST", "/api/auth/code-oublie", { email: `x${i}@b.co` });
    expect((await c.appeler("POST", "/api/auth/code-oublie", { email: "y@b.co" })).status).toBe(429);
  });
});

describe("POST /api/auth/nouveau-code", () => {
  async function avecLien() {
    const c = await inscrite();
    await c.appeler("POST", "/api/auth/code-oublie", { email: INSCRIPTION.email });
    return { c, jeton: c.mailer.jeton("reinitialisation") };
  }

  it("change le code, connecte, et envoie la confirmation", async () => {
    const { c, jeton } = await avecLien();
    c.oublierCookies();
    const r = await c.appeler("POST", "/api/auth/nouveau-code", { jeton, code: "7395" });
    expect(r.status).toBe(200);
    expect(c.cookies["__Host-daloura_session"]).toBeTruthy();
    expect(c.mailer.dernier("code_change")!.variables).toEqual({ prenom: "Awa" });

    c.oublierCookies();
    expect((await c.appeler("POST", "/api/auth/connexion", { email: INSCRIPTION.email, code: "2468" })).status).toBe(401);
    expect((await c.appeler("POST", "/api/auth/connexion", { email: INSCRIPTION.email, code: "7395" })).status).toBe(200);
  });

  it("le lien ne sert qu'une fois", async () => {
    const { c, jeton } = await avecLien();
    await c.appeler("POST", "/api/auth/nouveau-code", { jeton, code: "7395" });
    const r = await c.appeler("POST", "/api/auth/nouveau-code", { jeton, code: "1357" });
    expect(r.status).toBe(400);
    expect(r.body.error).toBe("lien_invalide");
  });

  it("le lien expire après 1 heure", async () => {
    const { c, jeton } = await avecLien();
    c.avancer(3_600_000);
    expect((await c.appeler("POST", "/api/auth/nouveau-code", { jeton, code: "7395" })).body.error).toBe("lien_invalide");
  });

  it("un code trop simple est refusé sans gâcher le lien", async () => {
    const { c, jeton } = await avecLien();
    expect((await c.appeler("POST", "/api/auth/nouveau-code", { jeton, code: "1111" })).body.error).toBe("code_trop_simple");
    expect((await c.appeler("POST", "/api/auth/nouveau-code", { jeton, code: "7395" })).status).toBe(200);
  });

  it("débloque le compte", async () => {
    const { c, jeton } = await avecLien();
    for (let i = 0; i < 5; i++) await c.appeler("POST", "/api/auth/connexion", { email: INSCRIPTION.email, code: "1357" });
    expect((await c.appeler("POST", "/api/auth/connexion", { email: INSCRIPTION.email, code: "2468" })).status).toBe(423);
    await c.appeler("POST", "/api/auth/nouveau-code", { jeton, code: "7395" });
    c.oublierCookies();
    expect((await c.appeler("POST", "/api/auth/connexion", { email: INSCRIPTION.email, code: "7395" })).status).toBe(200);
  });

  it("ferme les autres sessions et annule les autres liens", async () => {
    const c = await inscrite();
    const autreTelephone = { ...c.cookies };
    await c.appeler("POST", "/api/auth/code-oublie", { email: INSCRIPTION.email });
    const premier = c.mailer.jeton("reinitialisation");
    c.avancer(1000);
    await c.appeler("POST", "/api/auth/code-oublie", { email: INSCRIPTION.email });
    const second = c.mailer.jeton("reinitialisation");

    await c.appeler("POST", "/api/auth/nouveau-code", { jeton: second, code: "7395" });

    const cookie = `__Host-daloura_session=${autreTelephone["__Host-daloura_session"]}`;
    expect((await c.appeler("GET", "/api/auth/session", undefined, { headers: { cookie } })).status).toBe(401);
    expect((await c.appeler("POST", "/api/auth/nouveau-code", { jeton: premier, code: "1357" })).status).toBe(400);
    expect(await env.DB.prepare("SELECT count(*) AS n FROM sessions").first("n")).toBe(1);
  });

  it("vérifie aussi l'email (le lien prouve qu'elle reçoit les mails)", async () => {
    const { c, jeton } = await avecLien();
    const r = await c.appeler("POST", "/api/auth/nouveau-code", { jeton, code: "7395" });
    expect(r.body.utilisatrice.emailVerifie).toBe(true);
  });
});
