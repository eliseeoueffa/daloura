import { env } from "cloudflare:test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BLOCAGE_MS, hacherCode, verifierCode } from "../comptes";
const COOKIE = "__Secure-daloura.session_token";
import worker from "../index";
import { PERLES_BIENVENUE } from "../../src/lib/perles";

const emailUnique = () => `${crypto.randomUUID().slice(0, 8)}@test.daloura`;
const appareil = () => crypto.randomUUID().replace(/-/g, "");

function appel(chemin: string, corps?: unknown, opts: { cookie?: string; appareil?: string; methode?: string } = {}) {
  const headers = new Headers();
  if (corps !== undefined) headers.set("content-type", "application/json");
  if (opts.cookie) headers.set("cookie", opts.cookie);
  if (opts.appareil) headers.set("x-daloura-appareil", opts.appareil);
  const req = new Request(`https://daloura.test/api/compte${chemin}`, {
    method: opts.methode ?? (corps === undefined ? "GET" : "POST"),
    headers,
    body: corps === undefined ? undefined : JSON.stringify(corps),
  });
  return worker.fetch(req as Request<unknown, IncomingRequestCfProperties>, env as never);
}
const cookieDe = (r: Response) =>
  r.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");

// Faux MakiSend : on garde les emails « envoyés ».
let emails: { url: string; auth: string | null; corps: { to: string; subject: string; html: string; text: string } }[];
let makisendRepond = 202;
beforeEach(() => {
  emails = [];
  makisendRepond = 202;
  const vrai = globalThis.fetch;
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const url = String(input instanceof Request ? input.url : input);
    if (!url.startsWith(env.MAKISEND_URL)) return vrai(input, init);
    emails.push({ url, auth: new Headers(init?.headers).get("authorization"), corps: JSON.parse(String(init?.body)) });
    return new Response(JSON.stringify({ emailId: "e1" }), { status: makisendRepond });
  });
});
afterEach(() => vi.restoreAllMocks());

async function inscrire(email = emailUnique(), code = "2580", tel = appareil()) {
  const r = await appel("/inscription", { email, code }, { appareil: tel });
  return { r, email, code, cookie: cookieDe(r) };
}

describe("code secret", () => {
  it("est haché et vérifié", async () => {
    const h = await hacherCode("1234");
    expect(h).not.toContain("1234");
    expect(await verifierCode("1234", h)).toBe(true);
    expect(await verifierCode("1235", h)).toBe(false);
  });
});

describe("inscription", () => {
  it("crée le compte, offre 3 perles, ouvre la session", async () => {
    const { r, email, cookie } = await inscrire();
    expect(r.status).toBe(201);
    expect(await r.json()).toMatchObject({ email, perles: PERLES_BIENVENUE });
    expect(r.headers.get("set-cookie")).toMatch(new RegExp(`^${COOKIE.replace(".", "\\.")}=.+`));
    expect(r.headers.get("set-cookie")!.toLowerCase()).toMatch(/httponly/);
    expect(r.headers.get("set-cookie")!.toLowerCase()).toMatch(/secure/);
    expect(r.headers.get("set-cookie")!.toLowerCase()).toMatch(/samesite=lax/);
    expect(await (await appel("/moi", undefined, { cookie })).json()).toEqual({ email, perles: PERLES_BIENVENUE });
    const u = await env.DB.prepare(
      "SELECT a.password FROM auth_account a JOIN auth_user u ON u.id = a.user_id WHERE u.email = ?",
    )
      .bind(email)
      .first<{ password: string }>();
    expect(u!.password.startsWith("pbkdf2$")).toBe(true);
  });

  it("refuse un email déjà utilisé (même en majuscules)", async () => {
    const { email } = await inscrire();
    expect((await appel("/inscription", { email: email.toUpperCase(), code: "1111" })).status).toBe(409);
    expect(await (await appel("/verifier-email", { email })).json()).toEqual({ existe: true });
    expect(await (await appel("/verifier-email", { email: emailUnique() })).json()).toEqual({ existe: false });
  });

  it("refuse un email ou un code invalides", async () => {
    expect((await appel("/inscription", { email: "pas-un-email", code: "1234" })).status).toBe(400);
    expect((await appel("/inscription", { email: emailUnique(), code: "12a4" })).status).toBe(400);
    expect((await appel("/inscription", { email: emailUnique(), code: "12345" })).status).toBe(400);
  });

  it("deuxième compte sur le même téléphone : pas de nouvelles perles offertes", async () => {
    const tel = appareil();
    await inscrire(emailUnique(), "2580", tel);
    const { r } = await inscrire(emailUnique(), "2580", tel);
    expect(await r.json()).toMatchObject({ perles: 0, cadeau: "deja_offert_telephone" });
  });

  it("exige du JSON (protection contre les formulaires d'autres sites)", async () => {
    const req = new Request("https://daloura.test/api/compte/inscription", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "email=a@b.co&code=1234",
    });
    expect((await worker.fetch(req as Request<unknown, IncomingRequestCfProperties>, env as never)).status).toBe(415);
  });
});

describe("connexion", () => {
  it("bon code : session ouverte", async () => {
    const { email, code } = await inscrire();
    const r = await appel("/connexion", { email: ` ${email.toUpperCase()} `, code });
    expect(r.status).toBe(200);
    expect((await appel("/moi", undefined, { cookie: cookieDe(r) })).status).toBe(200);
  });

  it("compte inconnu", async () => {
    expect((await appel("/connexion", { email: emailUnique(), code: "1234" })).status).toBe(404);
  });

  it("3 codes faux : 2 tentatives restantes, puis 1, puis blocage 15 minutes, même avec le bon code", async () => {
    const { email, code } = await inscrire();
    const r1 = await appel("/connexion", { email, code: "0000" });
    expect(r1.status).toBe(401);
    expect(await r1.json()).toMatchObject({ error: "code_incorrect", restantes: 2 });
    expect(await (await appel("/connexion", { email, code: "0000" })).json()).toMatchObject({ restantes: 1 });
    const r3 = await appel("/connexion", { email, code: "0000" });
    expect(r3.status).toBe(423);
    const { jusqua } = (await r3.json()) as { jusqua: number };
    expect(jusqua - Date.now()).toBeGreaterThan(BLOCAGE_MS - 5000);
    expect((await appel("/connexion", { email, code })).status).toBe(423);
  });

  it("le blocage se lève après 15 minutes", async () => {
    const { email, code } = await inscrire();
    for (let i = 0; i < 3; i++) await appel("/connexion", { email, code: "0000" });
    await env.DB.prepare("UPDATE users SET locked_until = ? WHERE email = ?").bind(Date.now() - 1, email).run();
    expect((await appel("/connexion", { email, code })).status).toBe(200);
  });

  it("un bon code remet le compteur à zéro", async () => {
    const { email, code } = await inscrire();
    await appel("/connexion", { email, code: "0000" });
    await appel("/connexion", { email, code: "0000" });
    await appel("/connexion", { email, code });
    expect(await (await appel("/connexion", { email, code: "0000" })).json()).toMatchObject({ restantes: 2 });
  });

  it("déconnexion : la session ne marche plus", async () => {
    const { cookie } = await inscrire();
    await appel("/deconnexion", {}, { cookie });
    expect((await appel("/moi", undefined, { cookie })).status).toBe(401);
  });

  it("sans cookie ou cookie inventé : pas connectée", async () => {
    expect((await appel("/moi")).status).toBe(401);
    expect((await appel("/moi", undefined, { cookie: `${COOKIE}=invente` })).status).toBe(401);
  });
});

describe("code oublié", () => {
  it("envoie un lien par MakiSend, qui permet de choisir un nouveau code une seule fois", async () => {
    const { email, cookie: ancienne } = await inscrire();
    expect(await (await appel("/code-oublie", { email })).json()).toEqual({ ok: true });
    expect(emails).toHaveLength(1);
    expect(emails[0].url).toBe(`${env.MAKISEND_URL}/send-email`);
    expect(emails[0].auth).toBe(`Bearer ${env.MAKISEND_API_KEY}`);
    expect(emails[0].corps.to).toBe(email);
    const jeton = /jeton=([\w-]+)/.exec(emails[0].corps.text)![1];
    expect(emails[0].corps.html).toContain(`jeton=${jeton}`);

    const r = await appel("/nouveau-code", { jeton, code: "9753" });
    expect(r.status).toBe(200);
    expect((await appel("/moi", undefined, { cookie: cookieDe(r) })).status).toBe(200);
    expect((await appel("/moi", undefined, { cookie: ancienne })).status).toBe(401); // anciennes sessions fermées
    expect((await appel("/connexion", { email, code: "9753" })).status).toBe(200);
    expect((await appel("/connexion", { email, code: "2580" })).status).toBe(401);
    expect((await appel("/nouveau-code", { jeton, code: "1111" })).status).toBe(400); // une seule fois
  });

  it("débloque le compte", async () => {
    const { email } = await inscrire();
    for (let i = 0; i < 3; i++) await appel("/connexion", { email, code: "0000" });
    await appel("/code-oublie", { email });
    const jeton = /jeton=([\w-]+)/.exec(emails[0].corps.text)![1];
    await appel("/nouveau-code", { jeton, code: "4682" });
    expect((await appel("/connexion", { email, code: "4682" })).status).toBe(200);
  });

  it("lien expiré ou inventé : refusé", async () => {
    const { email } = await inscrire();
    await appel("/code-oublie", { email });
    const jeton = /jeton=([\w-]+)/.exec(emails[0].corps.text)![1];
    await env.DB.prepare("UPDATE auth_verification SET expires_at = ? WHERE identifier LIKE 'reset-password:%'")
      .bind(new Date(Date.now() - 1000).toISOString())
      .run();
    expect((await appel("/nouveau-code", { jeton, code: "1111" })).status).toBe(400);
    expect((await appel("/nouveau-code", { jeton: "invente", code: "1111" })).status).toBe(400);
  });

  it("email inconnu : même réponse, aucun email envoyé", async () => {
    expect(await (await appel("/code-oublie", { email: emailUnique() })).json()).toEqual({ ok: true });
    expect(emails).toHaveLength(0);
  });

  it("3 liens par heure au maximum", async () => {
    const { email } = await inscrire();
    for (let i = 0; i < 5; i++) await appel("/code-oublie", { email });
    expect(emails).toHaveLength(3);
  });

  it("MakiSend en panne : erreur claire, pas de lien fantôme", async () => {
    const { email } = await inscrire();
    makisendRepond = 500;
    expect((await appel("/code-oublie", { email })).status).toBe(503);
    const n = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM auth_verification v JOIN users u ON u.id = v.value WHERE u.email = ?",
    )
      .bind(email)
      .first<{ n: number }>();
    expect(n!.n).toBe(0);
  });
});
