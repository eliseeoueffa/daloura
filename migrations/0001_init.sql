-- Daloura : schéma initial de la base D1 (binding DB).
-- Conventions :
--   * identifiants TEXT (crypto.randomUUID() côté Worker) ;
--   * dates en INTEGER, millisecondes depuis l'epoch (Date.now()) ;
--   * montants en francs CFA (XOF), entiers ;
--   * les photos vivent dans R2 : la base ne garde que leur clé (…_key) ;
--   * jamais de secret en clair : codes et jetons sont stockés hachés (…_hash).
-- D1 applique les clés étrangères : supprimer un compte efface tout ce qui en dépend.

-- ─── Comptes ────────────────────────────────────────────────────────────────

CREATE TABLE users (
  id                    TEXT PRIMARY KEY,
  email                 TEXT NOT NULL UNIQUE COLLATE NOCASE,
  code_hash             TEXT NOT NULL,                 -- code secret à 4 chiffres, haché (PBKDF2 + sel)
  failed_attempts       INTEGER NOT NULL DEFAULT 0,    -- 3 erreurs => blocage
  locked_until          INTEGER,                       -- connexion bloquée 15 min
  selfie_key            TEXT,                          -- clé R2 du selfie
  selfie_consent_at     INTEGER,                       -- « J'accepte que mon selfie serve à créer mes aperçus »
  notifications_enabled INTEGER NOT NULL DEFAULT 0 CHECK (notifications_enabled IN (0, 1)),
  free_trial_used_at    INTEGER,                       -- essai offert consommé par ce compte
  created_at            INTEGER NOT NULL,
  updated_at            INTEGER NOT NULL
);

-- Sessions de connexion (cookie). Seul le hachage du jeton est stocké.
CREATE TABLE sessions (
  token_hash  TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id   TEXT,
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL,
  last_seen_at INTEGER
);
CREATE INDEX sessions_user ON sessions(user_id);
CREATE INDEX sessions_expires ON sessions(expires_at);

-- Codes envoyés par email (MakiSend) : code oublié / vérification d'adresse.
CREATE TABLE email_codes (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL COLLATE NOCASE,
  purpose     TEXT NOT NULL CHECK (purpose IN ('reset_code', 'verify_email')),
  code_hash   TEXT NOT NULL,
  attempts    INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL,
  used_at     INTEGER
);
CREATE INDEX email_codes_email ON email_codes(email, purpose, created_at);

-- Téléphones : l'essai offert ne sert qu'une fois par téléphone.
CREATE TABLE devices (
  id                  TEXT PRIMARY KEY,               -- identifiant aléatoire gardé par l'appli
  free_trial_used_at  INTEGER,
  free_trial_user_id  TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at          INTEGER NOT NULL
);

-- Abonnements Web Push (notifications « Ton aperçu est prêt », votes du cercle).
CREATE TABLE push_subscriptions (
  endpoint    TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  created_at  INTEGER NOT NULL
);
CREATE INDEX push_subscriptions_user ON push_subscriptions(user_id);

-- ─── Catalogue ──────────────────────────────────────────────────────────────

CREATE TABLE styles (
  slug      TEXT PRIMARY KEY,
  name      TEXT NOT NULL,
  position  INTEGER NOT NULL
);

INSERT INTO styles (slug, name, position) VALUES
  ('knotless',         'Knotless',         1),
  ('fulani',           'Fulani',           2),
  ('bantu-knots',      'Bantu knots',      3),
  ('perruque',         'Perruque',         4),
  ('cheveux-naturels', 'Cheveux naturels', 5),
  ('locks',            'Locks',            6);

-- Offres payantes (prix en F CFA). Pas d'abonnement.
CREATE TABLE offers (
  id           TEXT PRIMARY KEY,
  kind         TEXT NOT NULL CHECK (kind IN ('trials', 'recap')),
  name         TEXT NOT NULL,
  price_xof    INTEGER NOT NULL CHECK (price_xof > 0),
  trials       INTEGER NOT NULL DEFAULT 0,             -- essais crédités (offres 'trials')
  recap_months INTEGER,                                -- durée couverte (offres 'recap')
  active       INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1))
);

INSERT INTO offers (id, kind, name, price_xof, trials, recap_months) VALUES
  ('hair-moment', 'trials', 'My Hair Moment', 1000, 1, NULL),  -- 3 coiffures, 1 essai
  ('hair-era',    'trials', 'My Hair Era',    2500, 3, NULL),  -- 9 coiffures, 3 essais
  ('recap-3',     'recap',  'My Hair Recap 3 mois',  1000, 0, 3),
  ('recap-6',     'recap',  'My Hair Recap 6 mois',  2000, 0, 6),
  ('recap-12',    'recap',  'My Hair Recap 12 mois', 4000, 0, 12);

-- ─── Photos ─────────────────────────────────────────────────────────────────

-- Bibliothèque d'inspirations téléchargées depuis la galerie.
CREATE TABLE inspirations (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  photo_key   TEXT NOT NULL,                           -- clé R2
  style_slug  TEXT REFERENCES styles(slug),
  created_at  INTEGER NOT NULL
);
CREATE INDEX inspirations_user ON inspirations(user_id, created_at);

-- ─── Essais, aperçus, votes ─────────────────────────────────────────────────

-- Un essai = 3 coiffures essayées sur le selfie, puis le vote du cercle.
CREATE TABLE trials (
  id                  TEXT PRIMARY KEY,
  user_id             TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_free             INTEGER NOT NULL DEFAULT 0 CHECK (is_free IN (0, 1)),
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'processing', 'ready', 'failed')),
  vote_slug           TEXT UNIQUE,                     -- lien partagé sur WhatsApp
  vote_closes_at      INTEGER,
  chosen_preview_id   TEXT,                            -- « Et toi, tu choisis lequel ? »
  created_at          INTEGER NOT NULL,
  ready_at            INTEGER
);
CREATE INDEX trials_user ON trials(user_id, created_at);

-- Les aperçus générés (1 par coiffure choisie, 3 par essai).
CREATE TABLE previews (
  id              TEXT PRIMARY KEY,
  trial_id        TEXT NOT NULL REFERENCES trials(id) ON DELETE CASCADE,
  position        INTEGER NOT NULL CHECK (position BETWEEN 1 AND 3),
  style_slug      TEXT REFERENCES styles(slug),
  inspiration_id  TEXT REFERENCES inspirations(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'processing', 'ready', 'failed')),
  photo_key       TEXT,                                -- clé R2 de l'aperçu
  error           TEXT,
  created_at      INTEGER NOT NULL,
  ready_at        INTEGER,
  UNIQUE (trial_id, position)
);

-- Votes du cercle, sans compte. Un vote par votant et par essai.
CREATE TABLE votes (
  id          TEXT PRIMARY KEY,
  trial_id    TEXT NOT NULL REFERENCES trials(id) ON DELETE CASCADE,
  preview_id  TEXT NOT NULL REFERENCES previews(id) ON DELETE CASCADE,
  voter_id    TEXT NOT NULL,                           -- identifiant aléatoire du navigateur du votant
  voter_name  TEXT,                                    -- « Ex. : Mariam »
  message     TEXT,                                    -- les petits mots
  created_at  INTEGER NOT NULL,
  UNIQUE (trial_id, voter_id)
);
CREATE INDEX votes_preview ON votes(preview_id);

-- ─── Carnet ─────────────────────────────────────────────────────────────────

-- Une era = la coiffure retenue, avec la date du salon et la vraie photo.
CREATE TABLE eras (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trial_id        TEXT REFERENCES trials(id) ON DELETE SET NULL,
  preview_id      TEXT REFERENCES previews(id) ON DELETE SET NULL,
  style_slug      TEXT REFERENCES styles(slug),
  salon_date      TEXT,                                -- AAAA-MM-JJ
  worn_weeks      INTEGER,
  real_photo_key  TEXT,                                -- clé R2 de la vraie photo
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);
CREATE INDEX eras_user ON eras(user_id, created_at);

-- ─── Paiements et crédits ───────────────────────────────────────────────────

CREATE TABLE payments (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  offer_id      TEXT NOT NULL REFERENCES offers(id),
  amount_xof    INTEGER NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
  provider      TEXT NOT NULL DEFAULT 'itaja',
  provider_ref  TEXT UNIQUE,                           -- référence de la transaction Itaja
  created_at    INTEGER NOT NULL,
  paid_at       INTEGER
);
CREATE INDEX payments_user ON payments(user_id, created_at);

-- Mouvements d'essais : +N à l'achat, -1 par essai lancé, +1 si la création échoue.
-- Le solde (« 2 essais restants ») est la somme des deltas : voir la vue user_credits.
CREATE TABLE credit_ledger (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  delta       INTEGER NOT NULL CHECK (delta <> 0),
  reason      TEXT NOT NULL CHECK (reason IN ('purchase', 'trial', 'refund', 'gift')),
  payment_id  TEXT UNIQUE REFERENCES payments(id) ON DELETE SET NULL,  -- un paiement ne crédite qu'une fois
  trial_id    TEXT REFERENCES trials(id) ON DELETE SET NULL,
  created_at  INTEGER NOT NULL
);
CREATE INDEX credit_ledger_user ON credit_ledger(user_id);

CREATE VIEW user_credits AS
  SELECT u.id AS user_id, COALESCE(SUM(c.delta), 0) AS trials_left
  FROM users u LEFT JOIN credit_ledger c ON c.user_id = u.id
  GROUP BY u.id;

-- My Hair Recap (Three.js), créé depuis le carnet.
CREATE TABLE recaps (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_id    TEXT REFERENCES payments(id) ON DELETE SET NULL,
  months        INTEGER NOT NULL CHECK (months IN (3, 6, 12)),
  period_start  TEXT NOT NULL,                         -- AAAA-MM-JJ
  period_end    TEXT NOT NULL,
  created_at    INTEGER NOT NULL
);
CREATE INDEX recaps_user ON recaps(user_id);

-- ─── Notifications ──────────────────────────────────────────────────────────

CREATE TABLE notifications (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL CHECK (kind IN ('preview_ready', 'preview_failed', 'new_vote', 'vote_closed', 'payment')),
  trial_id    TEXT REFERENCES trials(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  body        TEXT,
  created_at  INTEGER NOT NULL,
  read_at     INTEGER
);
CREATE INDEX notifications_user ON notifications(user_id, created_at);
