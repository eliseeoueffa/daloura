# Daloura

Web app mobile (PWA) : vois une coiffure sur ton visage avant d'aller au salon, fais voter ton cercle, garde ton carnet d'eras.

## Stack

- **Front** : React + Vite + TypeScript, PWA installable (`vite-plugin-pwa`).
- **API** : Cloudflare Worker (`worker/index.ts`), qui sert aussi les fichiers de l'appli.
- **À venir** : D1 (base), R2 (photos), Queues (aperçus), MakiSend (emails), Itaja (paiement), Three.js (Hair Recap seulement).

## Lancer en local

```bash
npm install
npm run dev        # http://localhost:5173 (et sur le téléphone via l'IP de l'ordinateur)
npm run build      # vérification des types + build dans dist/
```

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

## Étapes

1. ✅ Fondations : PWA, design system, tous les écrans navigables.
2. Comptes : email + code à 4 chiffres, réinitialisation par email (MakiSend), blocage.
3. Photos : selfie et inspirations vers R2 (liens signés, bucket privé, suppression automatique).
4. Essai : générateur d'aperçus factice (IA branchée plus tard), essai offert, notification.
5. Vote du cercle : lien WhatsApp, vote sans compte, résultats.
6. Paiement Itaja : offres, retour, crédits.
7. Carnet, vraie photo, Hair Recap (Three.js, chargé à part).
8. Finitions : notifications, hors connexion, tests sur Android d'entrée de gamme.
