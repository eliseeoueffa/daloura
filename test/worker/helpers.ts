// Appelle l'API comme le ferait l'appli, avec une horloge et une boîte mail factices.
import { env } from "cloudflare:test";
import { handleApi } from "../../worker/app";
import type { Email, Mailer } from "../../worker/email/mailer";

export const BASE = "https://daloura.test";

export class FakeMailer implements Mailer {
  envoyes: Email[] = [];
  async send(email: Email) {
    this.envoyes.push(email);
  }
  dernier(modele?: Email["modele"]) {
    return [...this.envoyes].reverse().find((e) => !modele || e.modele === modele);
  }
  /** Le jeton contenu dans le lien du dernier email de ce modèle. */
  jeton(modele: Email["modele"]): string {
    const lien = this.dernier(modele)?.variables.lien;
    if (!lien) throw new Error(`Aucun email ${modele}`);
    return new URL(lien).searchParams.get("jeton")!;
  }
}

export function creerClient() {
  const mailer = new FakeMailer();
  const horloge = { now: Date.UTC(2026, 10, 1, 9, 0, 0) };
  let cookies: Record<string, string> = {};

  async function appeler(
    method: "GET" | "POST",
    path: string,
    body?: unknown,
    opts: { ip?: string; origin?: string | null; sansCookie?: boolean; headers?: Record<string, string> } = {},
  ) {
    const headers = new Headers(opts.headers);
    if (body !== undefined) headers.set("content-type", "application/json");
    headers.set("cf-connecting-ip", opts.ip ?? "10.0.0.1");
    if (opts.origin !== null) headers.set("origin", opts.origin ?? BASE);
    const cookieHeader = Object.entries(cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
    if (cookieHeader && !opts.sansCookie && !headers.has("cookie")) headers.set("cookie", cookieHeader);

    const attente: Promise<unknown>[] = [];
    const res = await handleApi(
      new Request(BASE + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) }),
      { db: env.DB, mailer, now: () => horloge.now, appUrl: BASE, waitUntil: (p) => attente.push(p) },
    );
    await Promise.all(attente); // les envois d'emails sont faits après la réponse

    for (const sc of res.headers.getSetCookie()) {
      const [paire] = sc.split(";");
      const i = paire.indexOf("=");
      const nom = paire.slice(0, i);
      const valeur = paire.slice(i + 1);
      if (/Max-Age=0\b/.test(sc)) delete cookies[nom];
      else cookies[nom] = valeur;
    }
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : null, headers: res.headers };
  }

  return {
    appeler,
    mailer,
    horloge,
    avancer: (ms: number) => (horloge.now += ms),
    get cookies() {
      return cookies;
    },
    oublierCookies: () => (cookies = {}),
  };
}

export const INSCRIPTION = {
  prenom: "Awa Koné",
  email: "Awa.K@Gmail.com",
  code: "2468",
  consentement: true,
};

export const MINUTE = 60_000;
