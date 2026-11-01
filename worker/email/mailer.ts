// Envoi des emails. Le reste du code ne connaît que l'interface Mailer : MakiSend en
// production, et un expéditeur qui écrit dans la console en local ou sans configuration.

export type ModeleEmail = "verification" | "reinitialisation" | "code_change";

export type Email = {
  to: string;
  modele: ModeleEmail;
  variables: Record<string, string>;
  /** Même clé = même email : MakiSend ne l'enverra qu'une fois. */
  idempotencyKey: string;
};

export interface Mailer {
  send(email: Email): Promise<void>;
}

export class ConsoleMailer implements Mailer {
  /**
   * @param masquerLiens true hors de localhost : les liens (jetons de connexion) ne doivent pas
   * finir dans les journaux Cloudflare si MakiSend n'est pas encore configuré en ligne.
   */
  constructor(private readonly masquerLiens = true) {}

  async send(email: Email): Promise<void> {
    const variables =
      this.masquerLiens && email.variables.lien
        ? { ...email.variables, lien: "[masqué]" }
        : email.variables;
    console.log(`[email ${email.modele}] à ${email.to}`, variables);
  }
}

export type MakiSendConfig = {
  url: string; // adresse de l'instance, sans / final
  apiKey: string;
  templates: Record<ModeleEmail, string>;
};

// À vérifier sur /openapi.json de l'instance d'Elisée dès qu'on a son adresse :
// le format du corps (to, templateId, variables) suit le brief.
export class MakiSendMailer implements Mailer {
  constructor(
    private readonly config: MakiSendConfig,
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  async send(email: Email): Promise<void> {
    const res = await this.fetcher(`${this.config.url}/send-email`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.config.apiKey}`,
        "content-type": "application/json",
        "idempotency-key": email.idempotencyKey,
      },
      body: JSON.stringify({
        to: email.to,
        templateId: this.config.templates[email.modele],
        variables: email.variables,
      }),
    });
    // MakiSend répond 202 (envoi asynchrone, pas de webhook de rebond).
    if (res.status !== 202 && !res.ok) {
      throw new Error(`MakiSend a répondu ${res.status}`);
    }
  }
}
