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

## Comptes

- **Better Auth** (`worker/auth.ts`, comme MakiSend), branché directement sur D1 : tables `auth_user`,
  `auth_session`, `auth_account`, `auth_verification` (migration 0003, dates en texte ISO). Notre table `users`
  garde le profil de l'appli (perles, blocage…) sous le même identifiant, créée par un hook à l'inscription.
  Secret `BETTER_AUTH_SECRET` obligatoire (sinon `/api/compte/*` répond 503). Le gestionnaire HTTP de Better Auth
  n'est pas exposé : seules nos routes `/api/compte/*` (`worker/comptes.ts`, tests `worker/test/comptes.test.ts`)
  l'appellent, et `src/lib/compte.ts` côté appli.
- Email + code secret à 4 chiffres = mot de passe Better Auth, haché en PBKDF2-SHA256 natif (`worker/codes.ts`,
  20 000 itérations : c'est le blocage, pas le hachage, qui protège un code de 4 chiffres). 3 codes faux de suite :
  connexion bloquée 15 minutes. Session : cookie de Better Auth (`daloura.session_token`, HttpOnly, Secure en HTTPS,
  SameSite=Lax), 90 jours. Les requêtes POST doivent être en JSON.
- Code oublié : réinitialisation Better Auth, lien envoyé par email via **MakiSend** (`MAKISEND_URL` dans
  `wrangler.jsonc`, clé dans le secret `MAKISEND_API_KEY` du Worker), valable 30 minutes, une seule fois,
  3 envois par heure ; le nouveau code ferme toutes les anciennes sessions.
- À l'inscription : 3 perles offertes (une fois par compte et par téléphone, `offrirBienvenue`).
- Le parcours en cours (email, premier code, jeton du lien) reste en mémoire (`brouillon`), jamais sur le téléphone.
- `useSolde()` renvoie le vrai solde quand elle est connectée.
- Les écrans sont chargés à la demande : dans les tests Playwright, attendre que l'écran suivant soit affiché
  avant de taper (sinon les touches arrivent sur l'écran précédent).

## Légal et référencement

- Pages `/mentions-legales`, `/confidentialite`, `/conditions` (`src/pages/`, mise en page `PageLegale`), éditeur
  **Lixali Studio SAS**, RGPD + Code du numérique béninois (loi n° 2017-20, APDP). Infos de la société dans
  `src/lib/societe.ts` : une valeur `null` s'affiche « à compléter » surlignée. Changer `MAJ_TEXTES_LEGAUX` à chaque
  modification des textes. Toute nouvelle donnée collectée ou nouveau prestataire doit y être ajouté.
- Référencement : balises dans `index.html` (description, Open Graph, JSON-LD), `robots.txt` et `sitemap.xml` générés
  au build (`vite.config.ts`, adresse `VITE_SITE_URL` dans `.env`), image de partage et captures d'installation
  générées par `scripts/generer_visuels.cjs`.
- Mise à jour de l'appli : `registerSW` (src/main.tsx) + `clientsClaim`/`skipWaiting` : la page se recharge seule
  sur la nouvelle version ; `public/_headers` interdit le cache de la page et de `sw.js`.

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

- Selfie, inspirations et coiffures choisies pour l'essai sont gardés **dans le navigateur** (IndexedDB,
  `src/lib/photos.ts`), photos redimensionnées à 1600 px en JPEG, jusqu'à l'envoi vers R2 (étape 3).
  `useSelfie()`, `useInspirations()` (une photo par coiffure : `de(slug)`, `mettre(slug, fichier)`), `useEssai()`.
- Les coiffures sont dans `src/lib/coiffures.ts` (slugs de la table `styles`). `<GrilleCoiffures>` est la grille
  commune à la bibliothèque et aux écrans de choix : toucher une case sans photo ouvre la galerie, la photo va dans
  cette case. `useLooks()` (`src/lib/essai.ts`) donne les coiffures choisies aux écrans d'attente et d'aperçus.
- Tant que l'IA n'est pas branchée, l'« aperçu » affiché est l'illustration de la coiffure.
- Prendre une photo : sur écran tactile, l'appareil photo du système (`<input capture="user">`) ; sur ordinateur,
  la webcam dans la page (`getUserMedia`), avec un message clair si l'accès est refusé.
- `<ChoixFichier>` (`src/components/ChoixFichier.tsx`) ouvre la galerie ou l'appareil photo.
- **Envoi vers R2** (`src/lib/envoi.ts` → `worker/photos.ts`, binding `MEDIA`, bucket privé `daloura-media`) :
  seulement après l'accord sur l'écran Consentement. Le téléphone fait foi : à chaque changement, au démarrage
  et au retour du réseau, on envoie ce qui manque et on efface ce qui a été retiré (réessais espacés si échec).
  En attendant les comptes, un identifiant aléatoire d'appareil (128 bits, `localStorage`) sert de clé :
  photos rangées sous `appareils/<sha256(id)>/selfie.jpg` et `…/inspirations/<coiffure>.jpg`. Le Worker vérifie
  les octets (JPEG, PNG, WebP), la taille (5 Mo max) et la coiffure (table `styles`). Tests : `worker/test/photos.test.ts`.
- La caméra exige HTTPS (ou `localhost`) : en local sur téléphone via l'IP de l'ordinateur, elle ne s'ouvre pas,
  utiliser le lien Cloudflare.
