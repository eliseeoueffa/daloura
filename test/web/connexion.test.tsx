import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import CodeBloque, { texteBlocage } from "../../src/screens/CodeBloque";
import CodeMailEnvoye from "../../src/screens/CodeMailEnvoye";
import CodeOublie from "../../src/screens/CodeOublie";
import CodeSaisie, { texteErreurCode } from "../../src/screens/CodeSaisie";
import EmailVerifie from "../../src/screens/EmailVerifie";
import { fausseApi, monter } from "./outils";

const ici = () => screen.getByTestId("ici").textContent;
const UTILISATRICE = {
  prenom: "Awa",
  email: "awa.k@gmail.com",
  emailVerifie: true,
  essaiUtilise: true,
};

async function seConnecter(
  user: ReturnType<typeof userEvent.setup>,
  code = "2468",
) {
  await user.type(
    screen.getByLabelText("Ton adresse email"),
    "awa.k@gmail.com",
  );
  for (const c of code)
    await user.click(screen.getByRole("button", { name: c }));
  await user.click(screen.getByRole("button", { name: "Me connecter" }));
}

describe("CodeSaisie (connexion)", () => {
  it("connecte et ouvre le carnet", async () => {
    const appels = fausseApi({
      "/api/auth/connexion": () => [200, { utilisatrice: UTILISATRICE }],
    });
    const user = userEvent.setup();
    monter({ "/code-saisie": <CodeSaisie /> }, { url: "/code-saisie" });
    await seConnecter(user);
    await waitFor(() => expect(ici()).toBe("/carnet"));
    expect(appels[0].body).toEqual({ email: "awa.k@gmail.com", code: "2468" });
    expect(localStorage.getItem("daloura:appareil")).toBe("1");
  });

  it("code faux : cases rouges, essais restants, bouton Réessayer", async () => {
    fausseApi({
      "/api/auth/connexion": () => [
        401,
        {
          error: "code_incorrect",
          essaisRestants: 1,
          prochainBlocageMinutes: 4,
        },
      ],
    });
    const user = userEvent.setup();
    monter({ "/code-saisie": <CodeSaisie /> }, { url: "/code-saisie" });
    await seConnecter(user, "1357");
    const alerte = await screen.findByRole("alert");
    expect(alerte.querySelector("div")!.textContent).toBe(
      "Ce code n'est pas le bon.Il te reste 1 essai. Après, la connexion est bloquée 4 minutes.",
    );
    expect(screen.getByRole("img").className).toBe("pin bad");

    await user.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("img").getAttribute("aria-label")).toMatch(
      /0 chiffre/,
    );
    expect(screen.getByRole("img").className).toBe("pin");
  });

  it("taper un chiffre après une erreur recommence la saisie", async () => {
    fausseApi({
      "/api/auth/connexion": () => [
        401,
        { error: "code_incorrect", essaisRestants: 3 },
      ],
    });
    const user = userEvent.setup();
    monter({ "/code-saisie": <CodeSaisie /> }, { url: "/code-saisie" });
    await seConnecter(user, "1357");
    await screen.findByRole("alert");
    await user.click(screen.getByRole("button", { name: "8" }));
    expect(screen.getByRole("img").getAttribute("aria-label")).toMatch(
      /1 chiffre sur 4/,
    );
  });

  it("compte bloqué → écran CodeBloque avec la fin du blocage", async () => {
    fausseApi({
      "/api/auth/connexion": () => [423, { error: "bloquee", jusqua: 123 }],
    });
    const user = userEvent.setup();
    monter(
      { "/code-saisie": <CodeSaisie />, "/code-bloque": <CodeBloque /> },
      { url: "/code-saisie" },
    );
    await seConnecter(user, "1357");
    await waitFor(() => expect(ici()).toBe("/code-bloque"));
  });

  it("préremplit l'email transmis par l'écran précédent", () => {
    monter(
      { "/code-saisie": <CodeSaisie /> },
      { url: "/code-saisie", state: { email: "awa.k@gmail.com" } },
    );
    expect(
      (screen.getByLabelText("Ton adresse email") as HTMLInputElement).value,
    ).toBe("awa.k@gmail.com");
  });

  it("textes au singulier et au pluriel", () => {
    expect(
      texteErreurCode({ essaisRestants: 2, prochainBlocageMinutes: 2 }),
    ).toBe("Il te reste 2 essais. Après, la connexion est bloquée 2 minutes.");
    expect(
      texteErreurCode({ essaisRestants: 1, prochainBlocageMinutes: 1 }),
    ).toBe("Il te reste 1 essai. Après, la connexion est bloquée 1 minute.");
    expect(texteErreurCode({})).toBe("Vérifie ton adresse email et ton code.");
  });
});

describe("CodeBloque", () => {
  it("arrondit la durée restante à la minute supérieure", () => {
    const now = 1_000_000;
    expect(texteBlocage(now + 90_000, now)).toBe("pendant 2 minutes");
    expect(texteBlocage(now + 30_000, now)).toBe("pendant 1 minute");
    expect(texteBlocage(now - 1, now)).toBe("pendant quelques minutes");
    expect(texteBlocage(undefined, now)).toBe("pendant quelques minutes");
  });

  it("transmet l'email à l'écran Code oublié", async () => {
    const user = userEvent.setup();
    monter(
      { "/code-bloque": <CodeBloque />, "/code-oublie": <CodeOublie /> },
      {
        url: "/code-bloque",
        state: { email: "awa.k@gmail.com", jusqua: Date.now() + 120_000 },
      },
    );
    expect(screen.getByText(/bloquée pendant 2 minutes/)).toBeTruthy();
    await user.click(
      screen.getByRole("link", { name: "Recevoir un lien par email" }),
    );
    expect(
      (screen.getByLabelText("Ton adresse email") as HTMLInputElement).value,
    ).toBe("awa.k@gmail.com");
  });
});

describe("Code oublié", () => {
  it("demande le lien puis affiche l'email sur l'écran suivant", async () => {
    const appels = fausseApi({
      "/api/auth/code-oublie": () => [202, { ok: true }],
    });
    const user = userEvent.setup();
    monter(
      {
        "/code-oublie": <CodeOublie />,
        "/code-mail-envoye": <CodeMailEnvoye />,
      },
      { url: "/code-oublie" },
    );
    await user.type(
      screen.getByLabelText("Ton adresse email"),
      "Awa.K@gmail.com",
    );
    await user.click(screen.getByRole("button", { name: "Recevoir le lien" }));
    expect(await screen.findByText("awa.k@gmail.com")).toBeTruthy();
    expect(appels[0].body).toEqual({ email: "awa.k@gmail.com" });

    await user.click(screen.getByRole("button", { name: "Renvoyer le lien" }));
    expect(await screen.findByText(/C'est renvoyé/)).toBeTruthy();
    expect(appels).toHaveLength(2);
  });

  it("le lien « démo » de la maquette n'existe plus", () => {
    monter(
      { "/code-mail-envoye": <CodeMailEnvoye /> },
      { url: "/code-mail-envoye", state: { email: "a@b.co" } },
    );
    expect(screen.queryByText(/démo/)).toBeNull();
  });
});

describe("EmailVerifie", () => {
  it("confirme l'email et propose de voir l'aperçu", async () => {
    const appels = fausseApi({
      "/api/auth/verifier-email": () => [200, { ok: true }],
    });
    monter(
      { "/email-verifie": <EmailVerifie /> },
      { url: "/email-verifie?jeton=j1" },
    );
    expect(await screen.findByText("Ton email est confirmé")).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "Voir mon aperçu" })
        .getAttribute("href"),
    ).toBe("/notifications");
    expect(appels).toHaveLength(1);
  });

  it("lien invalide : propose un nouveau lien", async () => {
    fausseApi({
      "/api/auth/verifier-email": () => [400, { error: "lien_invalide" }],
    });
    monter(
      { "/email-verifie": <EmailVerifie /> },
      { url: "/email-verifie?jeton=j2" },
    );
    expect(await screen.findByText("Ce lien ne marche plus")).toBeTruthy();
  });
});
