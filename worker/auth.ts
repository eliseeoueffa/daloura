// Configuration de Better Auth (https://www.better-auth.com), comme dans MakiSend.
// Utilisée seulement côté serveur par worker/comptes.ts : le gestionnaire HTTP de Better Auth
// n'est pas exposé, seules nos routes /api/compte/* existent (code à 4 chiffres, blocage, perles).
import { betterAuth } from "better-auth";
import { hacherCode, verifierCode } from "./codes";

export type EnvAuth = { DB: D1Database; BETTER_AUTH_SECRET?: string };

export const SESSION_JOURS = 90;
export const LIEN_MINUTES = 30;
export const PREFIXE_COOKIE = "daloura";

export function creerAuth(
  env: EnvAuth,
  origine: string,
  envoyerLien: (p: { email: string; jeton: string }) => Promise<void>,
) {
  return betterAuth({
    appName: "Daloura",
    database: env.DB,
    secret: env.BETTER_AUTH_SECRET,
    baseURL: origine,
    user: {
      modelName: "auth_user",
      fields: { emailVerified: "email_verified", createdAt: "created_at", updatedAt: "updated_at" },
    },
    session: {
      modelName: "auth_session",
      fields: {
        expiresAt: "expires_at",
        createdAt: "created_at",
        updatedAt: "updated_at",
        ipAddress: "ip_address",
        userAgent: "user_agent",
        userId: "user_id",
      },
      expiresIn: SESSION_JOURS * 24 * 3600,
    },
    account: {
      modelName: "auth_account",
      fields: {
        accountId: "account_id",
        providerId: "provider_id",
        userId: "user_id",
        accessToken: "access_token",
        refreshToken: "refresh_token",
        idToken: "id_token",
        accessTokenExpiresAt: "access_token_expires_at",
        refreshTokenExpiresAt: "refresh_token_expires_at",
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    },
    verification: {
      modelName: "auth_verification",
      fields: { expiresAt: "expires_at", createdAt: "created_at", updatedAt: "updated_at" },
    },
    emailAndPassword: {
      enabled: true,
      // Le « mot de passe » est le code secret à 4 chiffres (vérifié aussi dans comptes.ts).
      minPasswordLength: 4,
      maxPasswordLength: 4,
      // Hachage natif (Web Crypto) plutôt que le scrypt en JavaScript de Better Auth : bien plus
      // léger en temps de calcul, important avec la limite de CPU des Workers.
      password: { hash: hacherCode, verify: ({ hash, password }) => verifierCode(password, hash) },
      resetPasswordTokenExpiresIn: LIEN_MINUTES * 60,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, token }) => envoyerLien({ email: user.email, jeton: token }),
    },
    advanced: {
      cookiePrefix: PREFIXE_COOKIE,
      ipAddress: { ipAddressHeaders: ["cf-connecting-ip"] },
    },
    databaseHooks: {
      user: {
        create: {
          // Profil de l'appli (perles, blocage…) sous le même identifiant.
          after: async (u) => {
            const now = Date.now();
            await env.DB.prepare("INSERT OR IGNORE INTO users (id, email, created_at, updated_at) VALUES (?, ?, ?, ?)")
              .bind(u.id, u.email.toLowerCase(), now, now)
              .run();
          },
        },
      },
    },
  });
}
