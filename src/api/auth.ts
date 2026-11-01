// Appels à l'API des comptes. Chaque fonction renvoie un résultat typé : l'écran décide
// quoi afficher, jamais d'exception pour une erreur attendue (code faux, email pris…).

export type Utilisatrice = {
  prenom: string;
  email: string;
  emailVerifie: boolean;
  essaiUtilise: boolean;
};

export type Reponse<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string; data: Record<string, unknown> };

async function appel<T>(
  method: "GET" | "POST",
  path: string,
  body?: unknown,
): Promise<Reponse<T>> {
  let res: Response;
  try {
    res = await fetch(path, {
      method,
      credentials: "same-origin",
      headers: body === undefined ? {} : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    return { ok: false, status: 0, error: "hors_connexion", data: {} };
  }
  const text = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    /* réponse non JSON : on garde le statut */
  }
  if (res.ok) return { ok: true, data: data as T };
  return {
    ok: false,
    status: res.status,
    error: typeof data.error === "string" ? data.error : "erreur_serveur",
    data,
  };
}

type AvecUtilisatrice = { utilisatrice: Utilisatrice };

export const api = {
  session: () => appel<AvecUtilisatrice>("GET", "/api/auth/session"),
  emailDisponible: (email: string) =>
    appel<{ disponible: boolean }>("POST", "/api/auth/email-disponible", {
      email,
    }),
  inscription: (body: {
    prenom: string;
    email: string;
    code: string;
    consentement: boolean;
  }) => appel<AvecUtilisatrice>("POST", "/api/auth/inscription", body),
  connexion: (email: string, code: string) =>
    appel<AvecUtilisatrice>("POST", "/api/auth/connexion", { email, code }),
  deconnexion: () => appel<null>("POST", "/api/auth/deconnexion", {}),
  codeOublie: (email: string) =>
    appel<{ ok: true }>("POST", "/api/auth/code-oublie", { email }),
  nouveauCode: (jeton: string, code: string) =>
    appel<AvecUtilisatrice>("POST", "/api/auth/nouveau-code", { jeton, code }),
  verifierEmail: (jeton: string) =>
    appel<{ ok: true }>("POST", "/api/auth/verifier-email", { jeton }),
  renvoyerVerification: () =>
    appel<{ ok?: true; dejaVerifie?: true }>(
      "POST",
      "/api/auth/renvoyer-verification",
      {},
    ),
};

/** Message commun aux erreurs qui ne dépendent pas de l'écran. */
export function messageGenerique(error: string): string {
  if (error === "hors_connexion")
    return "Pas de connexion internet. Vérifie ton réseau et réessaie.";
  if (error === "trop_de_tentatives")
    return "Trop d'essais depuis ce réseau. Réessaie dans un moment.";
  return "Oups, quelque chose n'a pas marché. Réessaie dans un instant.";
}
