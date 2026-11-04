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
- Les clés (MakiSend, Itaja…) vont dans les secrets du Worker, jamais dans le code. Dans le tableau de bord, toujours
  en type **Secret** (une variable « Texte » est effacée par `wrangler deploy` ; `keep_vars: true` limite le risque).
  `/api/health` indique si chaque secret est présent (jamais sa valeur).

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

## Stickers (visuels de coiffure)

- `src/assets/portrait-*.svg` (fulani, knots, knotless, locs, perruque, afro, selfie) sont la **collection validée**,
  provisoire jusqu'aux stickers peints à la main et aux photos de la séance. Cadre commun : viewBox `0 0 100 110`
  (les mises en page en dépendent). `src/assets/images.ts` les référence ; `src/lib/coiffures.ts` les associe aux coiffures.
- Générateur : `python3 scripts/stickers_gen.py` écrit les SVG dans `scripts/out/` (ignoré par git), à copier dans
  `src/assets/` après validation. Il reproduit exactement les fichiers actuels.
- Règles pour en ajouter : même trait (aplats, contour #2B1D19, reflets crème, ombre en aplat sur un côté du visage),
  la coiffure fait au moins la moitié du dessin, carnations variées, sourires, bijoux dorés, rien de sexualisé
  (public dès 14 ans).
- Liseré crème façon autocollant (`.stk img` dans `app.css`) : sur les stickers seulement. Ses vraies photos dans une
  case `.stk` portent la classe `vraie-photo` pour en être exclues ; les polaroids n'en ont pas.
- Après un changement de stickers : relancer `scripts/generer_visuels.cjs` (image de partage, captures d'installation).
- Les maquettes (`design/maquettes/*.dc.html`) pointent vers ces mêmes fichiers (`../../src/assets/…`) : elles
  montrent toujours les dessins de l'appli. Ne pas y remettre d'images `/_blob/…` de l'outil de design.

## Photos

- Selfie, inspirations et coiffures choisies pour l'essai sont gardés **dans le navigateur** (IndexedDB,
  `src/lib/photos.ts`), photos redimensionnées à 1600 px en JPEG, jusqu'à l'envoi vers R2 (étape 3).
  `useSelfie()`, `useInspirations()` (une photo par coiffure : `de(slug)`, `mettre(slug, fichier)`), `useEssai()`.
- Les coiffures sont dans `src/lib/coiffures.ts` (slugs de la table `styles`). `<GrilleCoiffures>` est la grille
  commune à la bibliothèque et aux écrans de choix : toucher une case sans photo ouvre la galerie, la photo va dans
  cette case. `useLooks()` (`src/lib/essai.ts`) donne les coiffures choisies aux écrans d'attente et d'aperçus.
- Tant que l'IA n'est pas branchée, l'« aperçu » affiché est l'illustration de la coiffure.
- Prendre le selfie : partout la caméra AVANT dans la page (`getUserMedia`, `facingMode: { exact: "user" }` sur
  téléphone) ; `capture="user"` n'est qu'un souhait que beaucoup d'applis photo Android ignorent (elles ouvraient la
  caméra arrière). En cas d'échec : message clair, et sur téléphone l'appareil photo du système en secours.
- Photos illisibles (souvent HEIC) : `preparer()` essaie deux méthodes de lecture puis **refuse** la photo avec
  `MESSAGE_PHOTO_ILLISIBLE` ; ne jamais garder un original non décodé (image cassée, refusée par le serveur).
  Au chargement, les photos d'un autre type que JPEG/PNG/WebP sont écartées.
- Grille des coiffures : stickers sans texte (ni nom, ni « + ta photo ») ; le nom est dans l'`aria-label`.
- `<ChoixFichier>` (`src/components/ChoixFichier.tsx`) ouvre la galerie ou l'appareil photo.
- **Envoi vers R2** (`src/lib/envoi.ts` → `worker/photos.ts`, binding `MEDIA`, bucket privé `daloura-media`) :
  seulement quand elle est **connectée** et a donné son accord (écran Consentement, enregistré aussi sur le
  serveur : `users.selfie_consent_at`). Le téléphone fait foi : à chaque changement, au démarrage, à la connexion
  et au retour du réseau, on envoie ce qui manque et on efface ce qui a été retiré (réessais espacés si échec).
  Photos rangées sous `comptes/<userId>/selfie.jpg`, `…/inspirations/<coiffure>.jpg`, `…/essais/<essai>/…`
  (copie figée au lancement) et `…/apercus/<aperçu>.jpg`. L'ancien dossier par téléphone (`appareils/…`) est vidé
  à la connexion et purgé après 30 jours. Le Worker vérifie les octets (JPEG, PNG, WebP), la taille (5 Mo max)
  et la coiffure (table `styles`). Tests : `worker/test/photos.test.ts`.

## Essais et aperçus

- `worker/essais.ts` : `POST /api/essais { coiffures }` (connectée, consentement, photos déjà envoyées) débite les
  perles (`lancerEssai`), fige une copie des photos, puis génère les aperçus en arrière-plan (`ctx.waitUntil`) ;
  `GET /api/essais/<id>` (statut, aperçus) et `GET /api/essais/<id>/apercus/<aperçu>` (l'image). Tests :
  `worker/test/essais.test.ts`.
- `worker/generation.ts` : générateur **interchangeable**. Aujourd'hui `provisoire` (sans IA : l'aperçu est la photo
  d'inspiration, l'appli affiche « Aperçu provisoire »). Brancher l'IA = ajouter un générateur et le choisir dans
  `choisirGenerateur()` ; pour des générations longues, passer par Cloudflare Queues. Échec d'un aperçu =
  `failed` + perles rendues (`rembourserGeneration`).
- Appli : l'écran Attente envoie les photos (`synchroniserMaintenant`), lance l'essai (`src/lib/essaiServeur.ts`,
  identifiant gardé dans `localStorage`), suit l'avancement puis ouvre Aperçu offert / Aperçus / Échec-création.
  Aperçus, Aperçu offert et Aperçu en grand montrent les vrais aperçus (`useApercusReels`).

## Suppressions automatiques

- `worker/purge.ts`, chaque nuit (cron dans `wrangler.jsonc`) : sessions et liens expirés, votes 12 mois après la
  fermeture, comptes sans connexion depuis 2 ans (`users.derniere_connexion`, avec leurs photos ; paiements
  archivés sans lien dans `paiements_archives`), photos `appareils/…` de plus de 30 jours. **Garder ces durées
  alignées avec la politique de confidentialité.**
- La caméra exige HTTPS (ou `localhost`) : en local sur téléphone via l'IP de l'ordinateur, elle ne s'ouvre pas,
  utiliser le lien Cloudflare.
