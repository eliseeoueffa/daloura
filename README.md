# Daloura

Web app mobile (PWA) : vois une coiffure sur ton visage avant d'aller au salon, fais voter ton cercle, garde ton carnet d'eras.

## Stack

- **Front** : React + Vite + TypeScript, PWA installable (`vite-plugin-pwa`).
- **API** : Cloudflare Worker (`worker/index.ts`), qui sert aussi les fichiers de l'appli.
- **À venir** : D1 (base), R2 (photos), Queues (aperçus), MakiSend (emails), Itaja (paiement), Three.js (Hair Recap seulement).

## Lancer en local

```bash
npm install
cp .dev.vars.example .dev.vars   # réglages locaux (jamais commités)
npm run db:migrate:local         # crée la base D1 locale
npm run dev:api                  # API (Worker) sur http://localhost:8787
npm run dev                      # appli sur http://localhost:5173 (et sur le téléphone via l'IP)
npm run build                    # vérification des types + build dans dist/
npm test                         # tests (logique, API du Worker, écrans)
```

Sans MakiSend configuré, les emails (liens de vérification et de code oublié) s'affichent dans le
terminal de `npm run dev:api`.

`/ecrans` liste tous les écrans pour les relire un par un sur téléphone.

## Écrans

Les écrans de `src/screens/` sont générés depuis les maquettes validées (`design/maquettes/*.dc.html`)
par `npm run screens:import`. Ils sont statiques (fausses données) : chaque étape les rend dynamiques.
Dès qu'un écran est modifié à la main, retire-le de la génération pour ne pas l'écraser.

Les visages et stickers sont des illustrations provisoires (`src/assets/`), à remplacer par les photos
de la séance et les stickers peints.

## Déployer sur Cloudflare (une seule fois)

1. Cloudflare → **Workers & Pages** → **Créer** → **Importer un dépôt** → `daloura`.
2. Commande de build : `npm run build` · Commande de déploiement : `npx wrangler deploy`.
3. Chaque push sur `main` redéploie l'appli.

Les clés (MakiSend, Itaja…) se mettent dans les **réglages du Worker** (variables secrètes), jamais dans le code.

Avant le premier déploiement des comptes :

1. `npx wrangler d1 create daloura`, puis mettre l'identifiant dans `wrangler.jsonc` (`database_id`).
2. `npm run db:migrate:remote`.
3. Variables du Worker : `APP_URL`, `MAKISEND_URL`, `MAKISEND_TEMPLATE_VERIFICATION`,
   `MAKISEND_TEMPLATE_REINITIALISATION`, `MAKISEND_TEMPLATE_CODE_CHANGE`.
4. Secret : `npx wrangler secret put MAKISEND_API_KEY`.

## Étapes

1. ✅ Fondations : PWA, design system, tous les écrans navigables.
2. ✅ Comptes : email + code à 4 chiffres, vérification de l'email, réinitialisation par email (MakiSend), blocage. Plan de test : `docs/tests/etape-2-comptes.md`.
3. Photos : selfie et inspirations vers R2 (liens signés, bucket privé, suppression automatique).
4. Essai : générateur d'aperçus factice (IA branchée plus tard), essai offert, notification.
5. Vote du cercle : lien WhatsApp, vote sans compte, résultats.
6. Paiement Itaja : offres, retour, crédits.
7. Carnet, vraie photo, Hair Recap (Three.js, chargé à part).
8. Finitions : notifications, hors connexion, tests sur Android d'entrée de gamme.
