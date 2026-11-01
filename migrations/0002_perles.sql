-- Passage aux perles : 1 génération = 3 perles, sachets achetés via Itaja,
-- Hair Recap payé en perles, 3 perles offertes à la création du compte.
-- Les chiffres (prix, sachets…) ne sont PAS en base : ils vivent dans src/lib/perles.ts.

-- Les tables remplacées sont supprimées sans reprise de données : à l'écriture de cette migration,
-- la base est vide (aucun compte, aucun paiement) et l'appli n'est pas encore ouverte.

-- Ancien système d'essais et d'offres en F.
DROP VIEW user_credits;
DROP TABLE credit_ledger;

-- Solde en cache : toujours mis à jour dans le même batch que perle_ledger.
-- La contrainte >= 0 fait échouer tout le batch si le solde ne suffit pas (débit atomique).
ALTER TABLE users ADD COLUMN perles INTEGER NOT NULL DEFAULT 0 CHECK (perles >= 0);
ALTER TABLE users DROP COLUMN free_trial_used_at;

-- Paiements Itaja : seulement des sachets de perles. La table offers disparaît.
DROP TABLE payments;
DROP TABLE offers;
CREATE TABLE payments (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sachet_id     TEXT NOT NULL,                          -- identifiant dans perles.ts (hair-moment…)
  amount_xof    INTEGER NOT NULL CHECK (amount_xof > 0),
  perles        INTEGER NOT NULL CHECK (perles > 0),    -- figé au moment de l'achat
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
  provider      TEXT NOT NULL DEFAULT 'itaja',
  provider_ref  TEXT UNIQUE,                            -- identifiant du paiement chez Itaja
  created_at    INTEGER NOT NULL,
  paid_at       INTEGER
);
CREATE INDEX payments_user ON payments(user_id, created_at);

-- Recaps : payés en perles.
DROP TABLE recaps;
CREATE TABLE recaps (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  months        INTEGER NOT NULL CHECK (months IN (3, 6, 12)),
  perles        INTEGER NOT NULL CHECK (perles > 0),
  period_start  TEXT NOT NULL,                          -- AAAA-MM-JJ
  period_end    TEXT NOT NULL,
  created_at    INTEGER NOT NULL
);
CREATE INDEX recaps_user ON recaps(user_id);

-- Téléphones : les perles offertes ne servent qu'une fois par téléphone. La clé primaire fait
-- échouer le batch du cadeau si le téléphone l'a déjà reçu (même pour deux comptes en même temps).
DROP TABLE devices;
CREATE TABLE welcome_devices (
  device_id   TEXT PRIMARY KEY,                       -- identifiant aléatoire gardé par l'appli
  user_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at  INTEGER NOT NULL
);

-- Journal des perles : on n'y fait qu'ajouter des lignes. Solde = SUM(delta).
-- ref_id : paiement Itaja (purchase), génération = preview (generation, refund), recap (recap).
CREATE TABLE perle_ledger (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  delta       INTEGER NOT NULL CHECK (delta <> 0),
  reason      TEXT NOT NULL CHECK (reason IN ('welcome', 'purchase', 'generation', 'recap', 'refund', 'admin')),
  ref_id      TEXT,
  created_at  INTEGER NOT NULL,
  CHECK (reason IN ('welcome', 'admin') OR ref_id IS NOT NULL)
);
CREATE INDEX perle_ledger_user ON perle_ledger(user_id, created_at);
-- Cadeau de bienvenue : une seule fois par compte.
CREATE UNIQUE INDEX perle_ledger_welcome ON perle_ledger(user_id) WHERE reason = 'welcome';
-- Un paiement Itaja ne crédite qu'une fois ; une génération n'est débitée et remboursée qu'une fois.
CREATE UNIQUE INDEX perle_ledger_ref ON perle_ledger(reason, ref_id) WHERE reason IN ('purchase', 'generation', 'refund', 'recap');
