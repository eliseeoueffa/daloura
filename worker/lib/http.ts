// Petits outils HTTP communs aux routes de l'API.

export const json = (data: unknown, status = 200, headers: HeadersInit = {}) => {
  const h = new Headers(headers);
  h.set("cache-control", "no-store");
  return Response.json(data, { status, headers: h });
};

export const erreur = (code: string, status: number, extra: Record<string, unknown> = {}, headers: HeadersInit = {}) =>
  json({ error: code, ...extra }, status, headers);

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
  }
}

/** Lit un corps JSON objet ; refuse tout autre type de contenu (protège aussi contre le CSRF). */
export async function lireJson(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new HttpError(415, "json_attendu");
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new HttpError(400, "json_invalide");
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new HttpError(400, "json_invalide");
  }
  return body as Record<string, unknown>;
}

export const texte = (v: unknown): string => (typeof v === "string" ? v : "");

/** Les requêtes qui modifient quelque chose doivent venir de l'appli elle-même. */
export function origineAutorisee(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (origin === null) return true; // pas d'en-tête Origin : pas un navigateur tiers
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export function ipDe(request: Request): string {
  return request.headers.get("cf-connecting-ip") ?? "inconnue";
}

export function lireCookie(request: Request, nom: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === nom) return part.slice(i + 1).trim();
  }
  return null;
}
