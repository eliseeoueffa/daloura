import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import CodeConfirmation from "../../src/screens/CodeConfirmation";
import CodeNouveau from "../../src/screens/CodeNouveau";
import Connexion from "../../src/screens/Connexion";
import Consentement from "../../src/screens/Consentement";
import { fausseApi, monter } from "./outils";

const ici = () => screen.getByTestId("ici").textContent;
const UTILISATRICE = {
  prenom: "Awa",
  email: "awa.k@gmail.com",
  emailVerifie: false,
  essaiUtilise: false,
};

async function taperCode(
  user: ReturnType<typeof userEvent.setup>,
  code: string,
) {
  for (const c of code)
    await user.click(screen.getByRole("button", { name: c }));
}

describe("Connexion (inscription : prénom + email)", () => {
  it("vérifie l'email puis passe au choix du code", async () => {
    const appels = fausseApi({
      "/api/auth/session": () => [
        401,
        { error: "non_connectee", appareilConnu: false },
      ],
      "/api/auth/email-disponible": () => [200, { disponible: true }],
    });
    const user = userEvent.setup();
    monter({ "/connexion": <Connexion /> }, { url: "/connexion" });

    await user.type(screen.getByLabelText("Ton prénom"), "Awa Koné");
    await user.type(
      screen.getByLabelText("Ton adresse email"),
      " Awa.K@Gmail.com ",
    );
    await user.click(screen.getByRole("button", { name: "Continuer" }));

    await waitFor(() => expect(ici()).toBe("/code-nouveau"));
    expect(
      appels.find((a) => a.path === "/api/auth/email-disponible")?.body,
    ).toEqual({ email: "awa.k@gmail.com" });
  });

  it("envoie vers EmailExistant si l'email a déjà un compte", async () => {
    fausseApi({
      "/api/auth/session": () => [
        401,
        { error: "non_connectee", appareilConnu: false },
      ],
      "/api/auth/email-disponible": () => [200, { disponible: false }],
    });
    const user = userEvent.setup();
    monter({ "/connexion": <Connexion /> }, { url: "/connexion" });
    await user.type(screen.getByLabelText("Ton prénom"), "Awa");
    await user.type(
      screen.getByLabelText("Ton adresse email"),
      "awa.k@gmail.com",
    );
    await user.click(screen.getByRole("button", { name: "Continuer" }));
    await waitFor(() => expect(ici()).toBe("/email-existant"));
  });

  it("refuse un prénom vide ou un email incomplet sans appeler l'API", async () => {
    const appels = fausseApi({
      "/api/auth/session": () => [401, { appareilConnu: false }],
    });
    const user = userEvent.setup();
    monter({ "/connexion": <Connexion /> }, { url: "/connexion" });
    await user.click(screen.getByRole("button", { name: "Continuer" }));
    expect(screen.getByRole("alert").textContent).toMatch(/prénom/);
    await user.type(screen.getByLabelText("Ton prénom"), "Awa");
    await user.type(screen.getByLabelText("Ton adresse email"), "awa@gmail");
    await user.click(screen.getByRole("button", { name: "Continuer" }));
    expect(screen.getByRole("alert").textContent).toMatch(/email/);
    expect(
      screen.getByLabelText("Ton adresse email").getAttribute("aria-invalid"),
    ).toBe("true");
    expect(
      appels.filter((a) => a.path === "/api/auth/email-disponible"),
    ).toHaveLength(0);
  });

  it("limite le prénom à 20 caractères et l'email à 254", () => {
    fausseApi({ "/api/auth/session": () => [401, { appareilConnu: false }] });
    monter({ "/connexion": <Connexion /> }, { url: "/connexion" });
    expect(screen.getByLabelText("Ton prénom").getAttribute("maxlength")).toBe(
      "20",
    );
    expect(
      screen.getByLabelText("Ton adresse email").getAttribute("maxlength"),
    ).toBe("254");
  });

  it("redirige vers EssaiDejaUtilise si un compte a déjà été ouvert sur ce téléphone", async () => {
    localStorage.setItem("daloura:appareil", "1");
    fausseApi({});
    monter({ "/connexion": <Connexion /> }, { url: "/connexion" });
    await waitFor(() => expect(ici()).toBe("/essai-deja-utilise"));
  });

  it("… ou si le serveur reconnaît le téléphone (stockage vidé)", async () => {
    fausseApi({
      "/api/auth/session": () => [
        401,
        { error: "non_connectee", appareilConnu: true },
      ],
    });
    monter({ "/connexion": <Connexion /> }, { url: "/connexion" });
    await waitFor(() => expect(ici()).toBe("/essai-deja-utilise"));
  });
});

describe("CodeNouveau", () => {
  it("refuse 1234 avec un message, puis accepte un vrai code", async () => {
    const user = userEvent.setup();
    monter(
      { "/code-nouveau": <CodeNouveau /> },
      { url: "/code-nouveau", brouillon: { prenom: "Awa", email: "a@b.co" } },
    );
    const continuer = screen.getByRole("button", { name: "Continuer" });
    expect(continuer).toHaveProperty("disabled", true);

    await taperCode(user, "1234");
    await user.click(continuer);
    expect(screen.getByRole("alert").textContent).toMatch(/trop facile/);
    expect(screen.getByRole("img").getAttribute("aria-label")).toMatch(
      /0 chiffre sur 4/,
    );

    await taperCode(user, "2468");
    await user.click(continuer);
    expect(ici()).toBe("/code-confirmation");
  });

  it("le bouton Effacer retire le dernier chiffre, et le clavier physique marche", async () => {
    const user = userEvent.setup();
    monter(
      { "/code-nouveau": <CodeNouveau /> },
      { url: "/code-nouveau", brouillon: { email: "a@b.co" } },
    );
    await taperCode(user, "24");
    await user.click(
      screen.getByRole("button", { name: "Effacer le dernier chiffre" }),
    );
    expect(screen.getByRole("img").getAttribute("aria-label")).toMatch(
      /1 chiffre sur 4/,
    );
    await user.keyboard("68{Backspace}9");
    expect(screen.getByRole("img").getAttribute("aria-label")).toMatch(
      /3 chiffres sur 4/,
    );
  });

  it("ne prend pas plus de 4 chiffres", async () => {
    const user = userEvent.setup();
    monter(
      { "/code-nouveau": <CodeNouveau /> },
      { url: "/code-nouveau", brouillon: { email: "a@b.co" } },
    );
    await taperCode(user, "246813");
    expect(screen.getByRole("img").getAttribute("aria-label")).toMatch(
      /4 chiffres sur 4/,
    );
  });

  it("sans inscription en cours, renvoie à l'écran Connexion", () => {
    monter({ "/code-nouveau": <CodeNouveau /> }, { url: "/code-nouveau" });
    expect(ici()).toBe("/connexion");
  });
});

describe("CodeConfirmation", () => {
  it("deux codes différents → CodeDifferent", async () => {
    const user = userEvent.setup();
    monter(
      { "/code-confirmation": <CodeConfirmation /> },
      {
        url: "/code-confirmation",
        brouillon: { email: "a@b.co", code: "2468" },
      },
    );
    await taperCode(user, "2469");
    await user.click(
      screen.getByRole("button", { name: "Confirmer mon code" }),
    );
    expect(ici()).toBe("/code-different");
  });

  it("même code → Consentement", async () => {
    const user = userEvent.setup();
    monter(
      { "/code-confirmation": <CodeConfirmation /> },
      {
        url: "/code-confirmation",
        brouillon: { email: "a@b.co", code: "2468" },
      },
    );
    await taperCode(user, "2468");
    await user.click(
      screen.getByRole("button", { name: "Confirmer mon code" }),
    );
    expect(ici()).toBe("/consentement");
  });

  it("avec un lien « code oublié » : enregistre le nouveau code et connecte", async () => {
    const appels = fausseApi({
      "/api/auth/nouveau-code": () => [200, { utilisatrice: UTILISATRICE }],
    });
    const user = userEvent.setup();
    monter(
      { "/code-confirmation": <CodeConfirmation /> },
      { url: "/code-confirmation?jeton=abc", brouillon: { code: "2468" } },
    );
    await taperCode(user, "2468");
    await user.click(
      screen.getByRole("button", { name: "Confirmer mon code" }),
    );
    await waitFor(() => expect(ici()).toBe("/carnet"));
    expect(appels[0].body).toEqual({ jeton: "abc", code: "2468" });
    expect(localStorage.getItem("daloura:appareil")).toBe("1");
  });

  it("lien expiré : explique et propose un nouveau lien", async () => {
    fausseApi({
      "/api/auth/nouveau-code": () => [400, { error: "lien_invalide" }],
    });
    const user = userEvent.setup();
    monter(
      { "/code-confirmation": <CodeConfirmation /> },
      { url: "/code-confirmation?jeton=abc", brouillon: { code: "2468" } },
    );
    await taperCode(user, "2468");
    await user.click(
      screen.getByRole("button", { name: "Confirmer mon code" }),
    );
    expect((await screen.findByRole("alert")).textContent).toMatch(
      /ne marche plus/,
    );
    expect(
      screen.getByRole("link", { name: "Demande un nouveau lien" }),
    ).toBeTruthy();
  });
});

describe("Consentement", () => {
  const brouillon = { prenom: "Awa", email: "awa.k@gmail.com", code: "2468" };

  it("crée le compte puis demande de confirmer l'email", async () => {
    const appels = fausseApi({
      "/api/auth/inscription": () => [201, { utilisatrice: UTILISATRICE }],
    });
    const user = userEvent.setup();
    monter(
      { "/consentement": <Consentement /> },
      { url: "/consentement", brouillon },
    );
    await user.click(screen.getByRole("button", { name: "Créer mon aperçu" }));
    await waitFor(() => expect(ici()).toBe("/email-a-verifier"));
    expect(appels[0].body).toEqual({ ...brouillon, consentement: true });
    expect(localStorage.getItem("daloura:appareil")).toBe("1");
  });

  it("sans la case cochée, le bouton est désactivé", async () => {
    const user = userEvent.setup();
    monter(
      { "/consentement": <Consentement /> },
      { url: "/consentement", brouillon },
    );
    await user.click(screen.getByRole("checkbox"));
    expect(
      screen.getByRole("button", { name: "Créer mon aperçu" }),
    ).toHaveProperty("disabled", true);
  });

  it("email pris entre-temps → EmailExistant", async () => {
    fausseApi({
      "/api/auth/inscription": () => [409, { error: "email_existant" }],
    });
    const user = userEvent.setup();
    monter(
      { "/consentement": <Consentement /> },
      { url: "/consentement", brouillon },
    );
    await user.click(screen.getByRole("button", { name: "Créer mon aperçu" }));
    await waitFor(() => expect(ici()).toBe("/email-existant"));
  });

  it("hors connexion : message clair, on reste sur l'écran", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new TypeError("Failed to fetch"),
    );
    const user = userEvent.setup();
    monter(
      { "/consentement": <Consentement /> },
      { url: "/consentement", brouillon },
    );
    await user.click(screen.getByRole("button", { name: "Créer mon aperçu" }));
    expect((await screen.findByRole("alert")).textContent).toMatch(
      /Pas de connexion internet/,
    );
    expect(ici()).toBe("/consentement");
  });
});
