-- Dernière connexion : sert à supprimer les comptes inactifs depuis 2 ans (politique de confidentialité).
ALTER TABLE users ADD COLUMN derniere_connexion INTEGER;
-- Aperçus d'un essai : clé R2 de la photo d'inspiration utilisée (copie figée au lancement).
ALTER TABLE previews ADD COLUMN inspiration_key TEXT;
CREATE INDEX trials_vote_closes ON trials(vote_closes_at);

-- Justificatifs de paiement gardés 10 ans (droit comptable OHADA) même après la suppression d'un compte :
-- copie sans lien avec la personne (ni compte, ni email).
CREATE TABLE paiements_archives (
  id            TEXT PRIMARY KEY,
  sachet_id     TEXT NOT NULL,
  amount_xof    INTEGER NOT NULL,
  perles        INTEGER NOT NULL,
  provider      TEXT NOT NULL,
  provider_ref  TEXT,
  created_at    INTEGER NOT NULL,
  paid_at       INTEGER,
  archive_le    INTEGER NOT NULL
);
