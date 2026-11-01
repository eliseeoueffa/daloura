-- Étape 2 : comptes (email + code secret à 4 chiffres).
-- Les dates sont en millisecondes depuis 1970 (Date.now()).

CREATE TABLE users (
  id                 TEXT PRIMARY KEY,
  email              TEXT NOT NULL UNIQUE,         -- normalisé : minuscules, sans espaces
  prenom             TEXT NOT NULL,                -- premier mot, 20 caractères max
  code_hash          TEXT NOT NULL,                -- PBKDF2-SHA256, base64
  code_salt          TEXT NOT NULL,                -- sel aléatoire par utilisatrice, base64
  code_iterations    INTEGER NOT NULL,
  trial_used         INTEGER NOT NULL DEFAULT 0,   -- 1 dès que l'essai offert est consommé
  email_verified_at  INTEGER,                      -- NULL tant que le lien de vérification n'est pas ouvert
  failed_attempts    INTEGER NOT NULL DEFAULT 0,   -- codes faux depuis le dernier succès ou blocage
  lock_count         INTEGER NOT NULL DEFAULT 0,   -- blocages successifs (durée qui double)
  locked_until       INTEGER,
  consent_at         INTEGER NOT NULL,             -- acceptation de l'écran Consentement
  created_at         INTEGER NOT NULL
);

-- Le jeton de session n'est jamais stocké : seulement son empreinte SHA-256.
CREATE TABLE sessions (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    INTEGER NOT NULL,
  last_seen_at  INTEGER NOT NULL,
  expires_at    INTEGER NOT NULL
);
CREATE INDEX sessions_user ON sessions(user_id);

-- Lien « code oublié » : 1 heure, usage unique.
CREATE TABLE reset_tokens (
  token_hash  TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  INTEGER NOT NULL,
  used_at     INTEGER,
  created_at  INTEGER NOT NULL
);
CREATE INDEX reset_tokens_user ON reset_tokens(user_id);

-- Lien de vérification de l'email, à ouvrir avant l'essai offert : 24 heures, usage unique.
CREATE TABLE email_verifications (
  token_hash  TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  INTEGER NOT NULL,
  used_at     INTEGER,
  created_at  INTEGER NOT NULL
);
CREATE INDEX email_verifications_user ON email_verifications(user_id);

-- Limites de tentatives par fenêtre fixe (par IP, par email…).
CREATE TABLE rate_limits (
  key           TEXT PRIMARY KEY,                  -- ex. « connexion:ip:1.2.3.4 »
  window_start  INTEGER NOT NULL,
  count         INTEGER NOT NULL
);
