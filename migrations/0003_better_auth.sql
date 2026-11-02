-- Comptes gérés par Better Auth (https://www.better-auth.com), comme dans MakiSend.
-- Better Auth a ses propres tables (auth_*), dates en texte ISO ; notre table users garde le profil
-- de l'appli (perles, blocage, selfie…) sous le MÊME identifiant que auth_user.
-- Les comptes n'avaient pas encore été mis en ligne : rien à reprendre.

DROP TABLE sessions;
DROP TABLE email_codes;
ALTER TABLE users DROP COLUMN code_hash; -- le code (haché) est dans auth_account.password

CREATE TABLE auth_user (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL DEFAULT '',
  email           TEXT NOT NULL UNIQUE,
  email_verified  INTEGER NOT NULL DEFAULT 0,
  image           TEXT,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);

CREATE TABLE auth_session (
  id          TEXT PRIMARY KEY,
  expires_at  TEXT NOT NULL,
  token       TEXT NOT NULL UNIQUE,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL,
  ip_address  TEXT,
  user_agent  TEXT,
  user_id     TEXT NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE
);
CREATE INDEX auth_session_user ON auth_session(user_id);

CREATE TABLE auth_account (
  id                        TEXT PRIMARY KEY,
  account_id                TEXT NOT NULL,
  provider_id               TEXT NOT NULL,
  user_id                   TEXT NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  access_token              TEXT,
  refresh_token             TEXT,
  id_token                  TEXT,
  access_token_expires_at   TEXT,
  refresh_token_expires_at  TEXT,
  scope                     TEXT,
  password                  TEXT,
  created_at                TEXT NOT NULL,
  updated_at                TEXT NOT NULL
);
CREATE INDEX auth_account_user ON auth_account(user_id);

CREATE TABLE auth_verification (
  id          TEXT PRIMARY KEY,
  identifier  TEXT NOT NULL,
  value       TEXT NOT NULL,
  expires_at  TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
CREATE INDEX auth_verification_identifier ON auth_verification(identifier);
