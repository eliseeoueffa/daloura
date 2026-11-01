// Routeur de l'API, séparé de index.ts pour que les tests puissent injecter
// un faux expéditeur d'emails et une fausse horloge.
import { AUTH_ROUTES, type Deps } from "./auth/routes";
import { erreur, HttpError, json, origineAutorisee } from "./lib/http";

export type { Deps };

export async function handleApi(request: Request, deps: Deps): Promise<Response> {
  const { pathname } = new URL(request.url);

  if (pathname === "/api/health") {
    return json({ ok: true, service: "daloura", version: "0.2.0" });
  }

  const route = AUTH_ROUTES[pathname];
  if (!route) return erreur("not_found", 404);
  const handler = route[request.method as "GET" | "POST"];
  if (!handler) return erreur("methode_non_autorisee", 405, {}, { allow: Object.keys(route).join(", ") });
  if (request.method !== "GET" && !origineAutorisee(request)) return erreur("origine_refusee", 403);

  try {
    return await handler({ request, deps });
  } catch (e) {
    if (e instanceof HttpError) return erreur(e.code, e.status);
    console.error(e);
    return erreur("erreur_serveur", 500);
  }
}
