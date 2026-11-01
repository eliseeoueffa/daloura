// Monte un écran dans un routeur en mémoire, avec une fausse API (fetch simulé).
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { vi } from "vitest";
import type { Utilisatrice } from "../../src/api/auth";
import { AuthProvider, type Brouillon } from "../../src/auth/AuthContext";

export type Appel = { method: string; path: string; body: unknown };

/** Simule l'API : chaque route renvoie [statut, corps]. Les appels sont enregistrés. */
export function fausseApi(
  routes: Record<string, (body: any) => [number, unknown]>,
) {
  const appels: Appel[] = [];
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const path = String(input);
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    appels.push({ method: init?.method ?? "GET", path, body });
    const handler = routes[path];
    const [status, data] = handler
      ? handler(body)
      : [404, { error: "not_found" }];
    return new Response(JSON.stringify(data), {
      status,
      headers: { "content-type": "application/json" },
    });
  });
  return appels;
}

/** Affiche la route courante pour vérifier les redirections. */
function Ici() {
  const l = useLocation();
  return <div data-testid="ici">{l.pathname + l.search}</div>;
}

export function monter(
  ecrans: Record<string, ReactNode>,
  {
    url,
    brouillon,
    utilisatrice,
    state,
  }: {
    url: string;
    brouillon?: Brouillon;
    utilisatrice?: Utilisatrice;
    state?: unknown;
  },
) {
  return render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: url.split("?")[0],
          search: url.includes("?") ? "?" + url.split("?")[1] : "",
          state,
        },
      ]}
    >
      <AuthProvider initial={{ brouillon, utilisatrice }}>
        <Ici />
        <Routes>
          {Object.entries(ecrans).map(([path, el]) => (
            <Route key={path} path={path} element={el} />
          ))}
          <Route path="*" element={<div>autre écran</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}
