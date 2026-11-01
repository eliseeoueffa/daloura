export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  /** Adresse publique de l'appli pour les liens des emails (ex. https://daloura.app). */
  APP_URL?: string;
  // MakiSend : sans MAKISEND_URL ou sans clé, les emails sont écrits dans la console.
  MAKISEND_URL?: string;
  MAKISEND_API_KEY?: string; // secret : wrangler secret put MAKISEND_API_KEY
  MAKISEND_TEMPLATE_VERIFICATION?: string;
  MAKISEND_TEMPLATE_REINITIALISATION?: string;
  MAKISEND_TEMPLATE_CODE_CHANGE?: string;
}
