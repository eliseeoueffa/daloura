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
  async send(email: Email): Promise<void> {
    console.log(`[email ${email.modele}] à ${email.to}`, email.variables);
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
