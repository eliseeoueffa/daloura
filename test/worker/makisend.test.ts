import { describe, expect, it } from "vitest";
import { MakiSendMailer } from "../../worker/email/mailer";

const config = {
  url: "https://mail.example",
  apiKey: "cle-secrete",
  templates: {
    verification: "tpl-verif",
    reinitialisation: "tpl-reset",
    code_change: "tpl-change",
  },
};

describe("MakiSendMailer", () => {
  it("appelle POST /send-email avec la clé, l'idempotence, le modèle et les variables", async () => {
    let requete: Request | undefined;
    const mailer = new MakiSendMailer(config, async (input, init) => {
      requete = new Request(input, init);
      return new Response(null, { status: 202 });
    });
    await mailer.send({
      to: "awa.k@gmail.com",
      modele: "reinitialisation",
      variables: {
        prenom: "Awa",
        lien: "https://daloura.test/code-nouveau?jeton=x",
      },
      idempotencyKey: "reinitialisation:abc",
    });
    expect(requete!.method).toBe("POST");
    expect(requete!.url).toBe("https://mail.example/send-email");
    expect(requete!.headers.get("authorization")).toBe("Bearer cle-secrete");
    expect(requete!.headers.get("idempotency-key")).toBe(
      "reinitialisation:abc",
    );
    expect(await requete!.json()).toEqual({
      to: "awa.k@gmail.com",
      templateId: "tpl-reset",
      variables: {
        prenom: "Awa",
        lien: "https://daloura.test/code-nouveau?jeton=x",
      },
    });
  });

  it("signale une erreur si MakiSend refuse", async () => {
    const mailer = new MakiSendMailer(
      config,
      async () => new Response("non", { status: 401 }),
    );
    await expect(
      mailer.send({
        to: "a@b.co",
        modele: "code_change",
        variables: {},
        idempotencyKey: "k",
      }),
    ).rejects.toThrow("401");
  });
});
