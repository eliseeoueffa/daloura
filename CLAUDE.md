# CLAUDE.md — Daloura

Mémoire du projet pour les sessions Claude Code. À lire en entier avant de toucher au code,
puis lire `README.md` et `design/maquettes/` (les maquettes validées font foi pour le design).

## Le produit

Daloura est une web app mobile (PWA) pour les jeunes femmes de Cotonou, Abidjan, Dakar et Lomé :

- elle voit une coiffure sur son visage (aperçus générés par IA) avant d'aller au salon ;
- son cercle vote via un lien, sans compte ;
- elle garde un carnet de ses « eras » (coiffures) et peut créer un Hair Recap.

Signature : « Vois-toi avant de changer. »

Parcours d'une era :

1. selfie et inspirations (ses propres photos) ;
2. aperçus ;
3. vote du cercle (essais payants seulement) ;
4. vraie photo de la coiffure réalisée ;
5. carnet.

## Façon de travailler avec Elisée (à respecter)

- **Avant d'utiliser une skill, proposer laquelle et attendre son accord.** Skills utiles :
  `mobile-native`, `vercel-react-best-practices`, `break-ui`, `web-design-guidelines`.
- Elle est ingénieure QA de formation : **des tests à chaque étape** (Vitest pour la logique et
  pour l'API du Worker) et **un petit plan de test par étape** (dans `docs/tests/`).
- Petits commits clairs, en français.
- **Jamais de secret dans le code** : les clés vont dans les secrets du Worker
  (`wrangler secret put` ou le tableau de bord), et dans `.dev.vars` en local (ignoré par git).
- **Demander avant toute décision produit** ou tout changement visible par rapport aux maquettes.
- Textes de l'appli en français, tutoiement, ton chaleureux et simple.

## Stack

- React 19 + Vite + TypeScript, PWA (`vite-plugin-pwa`), React Router.
- Cloudflare partout, sur le compte d'Elisée :
  - Workers (API, `worker/index.ts`, qui sert aussi l'appli via le binding `ASSETS`) ;
  - D1 (base, binding `DB`, nom `daloura`) ;
  - R2 (photos, bucket privé `daloura-media`, binding `MEDIA`) ;
  - Queues (génération des aperçus).
- Déploiement par Workers Builds relié au dépôt : build `npm run build`, déploiement `npx wrangler deploy`.
- Emails via **MakiSend**, auto-hébergé sur Cloudflare :
  - `POST /send-email`, authentification `Bearer` par clé API ;
  - en-tête `Idempotency-Key` ;
  - modèles appelés par `templateId` avec des `{{variables}}` ;
  - réponse 202, envoi asynchrone, pas de webhook de rebond ;
  - doc de l'instance : `/docs` et `/openapi.json`.
- Paiement : page hébergée **Itaja**, puis vérification côté serveur.
- IA : **pas encore choisie**. Interface `PreviewGenerator` avec un générateur factice (image de
  démo après quelques secondes), remplaçable sans toucher au reste.
- Three.js : **uniquement** pour le Hair Recap, chargé à la demande (jamais au démarrage).

## Règles produit (ne pas changer sans demander)

- **Inscription par email uniquement**, puis un code secret à 4 chiffres choisi par
  l'utilisatrice et saisi deux fois.
- **Connexion** : email + code.
- **Code oublié** : lien de réinitialisation par email.
- **Pas de SMS, pas de WhatsApp pour le support.**
- **Blocage après plusieurs codes faux** (écran `CodeBloque`), limite de tentatives par email et
  par IP, sessions longues (cookie HttpOnly, Secure, SameSite=Lax). Code haché en PBKDF2
  (WebCrypto, sel par utilisatrice) : avec 10 000 combinaisons, le blocage est indispensable.
  Valeur sur les maquettes : 5 erreurs max, puis 15 minutes de blocage (à faire valider par
  Elisée). Le lien « code oublié » débloque aussi.
- **Un compte existant n'a plus droit à l'essai offert.** Pas de lien « J'ai déjà un compte »
  sur l'inscription.
- **Essai offert** : 1 aperçu, sans vote.
- **Offres** :

  | Offre | Contenu | Prix |
  |---|---|---|
  | My Hair Moment | 1 essai de 3 coiffures + vote | 1 000 F |
  | My Hair Era | 3 essais de 3 coiffures | 2 500 F |
  | My Hair Recap | récap sur 3, 6 ou 12 mois | 1 000, 2 000 ou 4 000 F |

- **Données affichées et longueurs maximales** :
  - prénoms seulement à l'écran, 20 caractères max (« Awa Koné » s'affiche « Awa ») ;
  - noms de coiffure en 2 mots max ;
  - petit mot du vote : 80 caractères ;
  - email : 254 caractères.
- **La page de vote ne montre jamais la photo d'inspiration**, seulement les aperçus. La votante
  ne crée pas de compte.
- **Confidentialité** : selfies privés (R2 non public, liens signés courts), suppression
  automatique des selfies d'essais abandonnés.
- Le bloc 1 (accueil, inspirations, selfie, choix) se fait **sans compte**. Les photos restent
  sur le téléphone (IndexedDB) jusqu'à l'inscription, puis partent vers R2 (étape 3).

## Notes de développement laissées sur les maquettes

- Tous les écrans défilent ; le bouton principal et la barre du bas restent fixés en bas.
- Singulier et pluriel gérés : 1 essai, 2 essais.
- Tailles de texte en rem, pour suivre le réglage « grande police ».
- Emails et mots longs coupés si besoin.
- Date du rendez-vous choisie avec un sélecteur de date.
- Notifications : la permission est demandée juste après le lancement de l'essai.
- Itaja : récapitulatif de l'offre, redirection vers la page Itaja, puis vérification au retour
  et crédit des essais.
- Carnet : il regroupe les eras (aperçu + vraie photo), et c'est de là qu'on crée le Hair Recap.

## Organisation du code

- `src/screens/*.tsx` : les 51 écrans, **générés** depuis `design/maquettes/*.dc.html` par
  `scripts/import_maquettes.py` (`npm run screens:import`). Statiques, fausses données.
  **Quand un écran devient dynamique, l'ajouter à la liste d'exclusion du script** pour qu'il ne
  soit plus écrasé.
- `src/screens/registry.ts` : routes des écrans. `/ecrans` liste tous les écrans pour la relecture.
- `src/assets/` : vraies images. Les maquettes pointent vers `/_blob/…` (liens morts d'un ancien
  canevas) ; la correspondance est dans `BLOBS` du script d'import.
- `src/styles/app.css` (tirée de `design/maquettes/daloura.css`) : design system (couleurs,
  polices, polaroids, stickers, boutons, barre du bas) + réglages mobiles (100dvh, zones sûres,
  champs à 16px, tactile). Polices Fontsource : Corben 700, Bricolage Grotesque, Gochi Hand.
- Les visages et stickers sont des illustrations provisoires (à remplacer par des photos et des
  stickers peints).

### Parcours (ordre du canevas de maquettes)

1. **Entrer et choisir, sans compte** : Main (accueil), Bibliotheque-vide, Bibliotheque, Selfie,
   Selfie-refuse, Choix-essai.
2. **Inscription par email, puis code secret à chaque connexion** : Connexion, Code-nouveau,
   Code-confirmation, Consentement, Code-saisie, Code-oublie, Code-mail-envoye.
3. **L'essai offert, 1 aperçu sans vote** : Notifications, Attente, Apercu-offert, Echec-creation.
4. **Payer avec Itaja** : Offres, Paiement, Paiement-externe, Paiement-attente, Paiement-reussi,
   Paiement-echec.
5. **Essai payant et vote du cercle** : Apercus, Apercu-detail, Inviter, Suivi-votes, Ton-choix.
6. **Page de vote, côté votante** : Vote, Vote-merci, Vote-ferme.
7. **Fin de l'era, carnet et profil** : Era-enregistree, Carnet, Profil, Recharger,
   Installer-android, Installer-iphone.
8. **Essai payant, era, vraie photo et recap** : Choix-3, Era-detail, Vraie-photo,
   Recap-paiement, Recap.
9. **Erreurs et écrans vides** : Code-erreur, Code-bloque, Code-different, Email-existant,
   Essai-deja-utilise, Sans-essai, Carnet-vide, Votes-zero, Hors-connexion.

## Commandes

```bash
npm install
npm run dev             # http://localhost:5173, puis /ecrans
npm run build           # vérification des types + build dans dist/
npm run screens:import  # régénère les écrans depuis les maquettes (hors exclusions)
```

## Étapes

1. ✅ Fondations : PWA, design system, 51 écrans navigables, Worker avec `/api/health`.
2. **Comptes** (en cours) :
   - migrations D1 : `users` (id, email unique, hash et sel du code, `trial_used`,
     `failed_attempts`, `locked_until`, `created_at`), `sessions`, `reset_tokens` (jeton haché,
     expiration, usage unique) ;
   - API : inscription, connexion, déconnexion, session courante, demande de réinitialisation
     (réponse identique que l'email existe ou non), nouveau code ;
   - MakiSend : modèles « lien de réinitialisation » et « confirmation de nouveau code » ;
   - écrans : Connexion, CodeNouveau, CodeConfirmation, Consentement, CodeSaisie, CodeOublie,
     CodeMailEnvoye, et erreurs CodeErreur, CodeBloque, CodeDifferent, EmailExistant,
     EssaiDejaUtilise ;
   - tests et plan de test.
   - À obtenir d'Elisée : identifiant de la base D1, adresse de l'instance MakiSend et sa clé (en
     secret), domaine d'envoi (SPF, DKIM, DMARC).
3. Photos vers R2.
4. Essai avec le générateur factice et la notification.
5. Vote du cercle.
6. Paiement Itaja.
7. Carnet, vraie photo et Hair Recap (Three.js).
8. Finitions : push, hors connexion, tests sur Android d'entrée de gamme.
