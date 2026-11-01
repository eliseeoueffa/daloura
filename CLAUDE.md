# Daloura

PWA mobile (React + Vite + TypeScript) servie par un Cloudflare Worker (`worker/index.ts`), base D1 `daloura`
(binding `DB`, schéma dans `migrations/`). Tout le texte de l'appli est en français, tutoiement.

## Commandes

- `npm run dev` : appli en local · `npm run build` : types + build
- `npm test` : tests du Worker (Vitest dans le runtime Workers, D1 locale avec les migrations)
- `npm run db:migrate:local` / `npm run db:migrate:remote` : appliquer les migrations
- `npm run screens:import` : régénère `src/screens/` depuis `design/maquettes/` (sauf les écrans de `MANUELS`)

## Règles

- Ne jamais modifier une migration déjà appliquée : ajouter `migrations/000N_….sql`.
- Un écran modifié à la main doit être ajouté à `MANUELS` dans `scripts/import_maquettes.py`, et sa
  maquette (`design/maquettes/*.dc.html`) mise à jour en même temps.
- Les clés (MakiSend, Itaja…) vont dans les secrets du Worker, jamais dans le code.

## Offres

Daloura n'a pas d'abonnement. La monnaie est la **perle** (comme les perles dorées des tresses) :
jamais « pièce ». « Essai » et « essayer » restent pour l'action ; la perle est la monnaie.

**Tous les chiffres vivent dans `src/lib/perles.ts`**, importé par le front et par le Worker.
Aucun prix, coût ou nombre de perles ne doit être écrit en dur ailleurs.

| Règle | Valeur actuelle |
|---|---|
| Valeur de référence d'une perle | 50 F CFA (à revoir après les premiers tests) |
| 1 génération (1 coiffure sur son visage) | 3 perles |
| Essai | 1 à 3 coiffures : 3, 6 ou 9 perles |
| Vote du cercle | gratuit, à partir de 2 coiffures |
| Génération ratée | ses 3 perles sont rendues automatiquement |
| Cadeau de bienvenue | 3 perles, une fois par compte et une fois par téléphone (remplace l'« essai offert ») |
| Expiration | jamais |

Sachets, seul achat via Itaja (toujours des multiples de 3) :

| Sachet | Prix | Perles |
|---|---|---|
| My Hair Moment | 500 F | 9 (1 essai complet) |
| My Hair Era | 1 000 F | 21 (7 coiffures), mis en avant |
| My Hair Year | 2 500 F | 57 (19 coiffures) |

My Hair Recap, payé en perles sans Itaja : 3 mois = 20, 6 mois = 40, 12 mois = 80 perles.

**Logique serveur** (`worker/perles.ts`, testée dans `worker/test/perles.test.ts`) :
- Journal `perle_ledger` qui ne fait que s'allonger (`reason` : `welcome`, `purchase`, `generation`,
  `recap`, `refund`, `admin`). Solde = somme des `delta` ; `users.perles` en est le cache, mis à jour
  dans le **même `db.batch()`** (une seule transaction).
- Débit atomique : `CHECK (perles >= 0)` sur `users` fait échouer tout le batch si le solde ne suffit pas.
- Le front envoie l'action (« essai de ces 2 coiffures »), le serveur calcule le coût.
- Débit au lancement, 3 perles par génération (`ref_id` = id de la génération, c'est-à-dire l'aperçu) ;
  remboursement `refund` de cette génération seulement, une fois.
- Achat : crédit seulement après vérification chez Itaja, une fois par paiement (`ref_id` = id Itaja, unique).
- Bienvenue : index unique `(user_id) WHERE reason = 'welcome'`.

**Affichage** :
- Accord : 0 perle, 1 perle, 2 perles (`formatPerles`).
- `<Perle />` / `<Perles n={…} />` (`src/components/Perle.tsx`) : petite perle dorée devant chaque solde ou coût.
- Le solde affiché vient de `useSolde()` (`src/lib/solde.ts`) : fausses données tant que l'API des comptes
  n'existe pas, seul fichier à changer pour brancher le vrai solde.
- Les écrans publics (Accueil, page de vote, Vote-ferme, Vote-merci) gardent « ton premier essai est offert ».
- Code secret : on parle de « tentatives », pas d'« essais », pour ne pas confondre.

## Photos

- Selfie et inspirations sont gardés **dans le navigateur** (IndexedDB, `src/lib/photos.ts`), redimensionnés
  à 1600 px en JPEG, jusqu'à l'envoi vers R2 (étape 3). `useSelfie()`, `useInspirations()`, `useSelfieAffiche()`.
- Prendre une photo : sur écran tactile, l'appareil photo du système (`<input capture="user">`) ; sur ordinateur,
  la webcam dans la page (`getUserMedia`), avec un message clair si l'accès est refusé.
- `<ChoixFichier>` (`src/components/ChoixFichier.tsx`) ouvre la galerie ou l'appareil photo.
- La caméra exige HTTPS (ou `localhost`) : en local sur téléphone via l'IP de l'ordinateur, elle ne s'ouvre pas,
  utiliser le lien Cloudflare.
