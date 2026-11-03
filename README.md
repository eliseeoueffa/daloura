# Daloura

Web app mobile (PWA) : vois une coiffure sur ton visage avant d'aller au salon, fais voter ton cercle, garde ton carnet d'eras.

## Stack

- **Front** : React + Vite + TypeScript, PWA installable (`vite-plugin-pwa`).
- **API** : Cloudflare Worker (`worker/index.ts`), qui sert aussi les fichiers de l'appli.
- **Base** : Cloudflare D1 `daloura` (binding `DB`), schéma dans `migrations/`.
- **Photos** : Cloudflare R2, bucket privé `daloura-media` (binding `MEDIA`).
- **Emails** : MakiSend (`https://makisend.elisee.workers.dev`), pour le lien « code oublié ».
- **À venir** : IA et Queues (aperçus), Itaja (paiement), Three.js (Hair Recap seulement).

## Lancer en local

```bash
npm install
npm run dev        # http://localhost:5173 (et sur le téléphone via l'IP de l'ordinateur)
npm run build      # vérification des types + build dans dist/
npm test           # tests du Worker (perles) sur une base D1 locale
```

Base locale (à faire une fois, puis après chaque nouvelle migration) :

```bash
npm run db:migrate:local    # crée la base D1 locale dans .wrangler/
npm run db:migrate:remote   # applique les migrations sur la base Cloudflare
```

Pour changer le schéma, ajoute un fichier `migrations/000N_….sql` (ne modifie jamais une migration déjà appliquée).

`/ecrans` liste tous les écrans pour les relire un par un sur téléphone.

## Écrans

Les règles des offres (perles, sachets, coûts) sont dans `CLAUDE.md` et les chiffres dans `src/lib/perles.ts`.

Les écrans de `src/screens/` sont générés depuis les maquettes validées (`design/maquettes/*.dc.html`)
par `npm run screens:import`. Ils sont statiques (fausses données) : chaque étape les rend dynamiques.
Dès qu'un écran est modifié à la main, ajoute-le à `MANUELS` dans `scripts/import_maquettes.py` pour ne pas l'écraser.

Les stickers de `src/assets/` sont la collection validée (générée par `scripts/stickers_gen.py`), provisoire
jusqu'aux stickers peints à la main et aux photos de la séance.

## Déployer sur Cloudflare (une seule fois)

1. Cloudflare → **Workers & Pages** → **Créer** → **Importer un dépôt** → `daloura`.
2. Commande de build : `npm run build` · Commande de déploiement : `npx wrangler deploy`.
3. Chaque push sur `main` redéploie l'appli.
4. Secret Better Auth (une seule fois) : même endroit, type **Secret**, nom `BETTER_AUTH_SECRET`, valeur : une longue
   suite de caractères aléatoires (au moins 32). Sans lui, la création de compte et la connexion répondent une erreur.
5. Clé MakiSend (une seule fois) : Worker `daloura` → **Paramètres** → **Variables et secrets** → **Ajouter**,
   type **Secret**, nom `MAKISEND_API_KEY`. Sans elle, « code oublié » affiche « L'email n'a pas pu partir ».
6. R2 (une seule fois) : Cloudflare → **R2** → activer R2 si demandé → **Créer un bucket** nommé `daloura-media`
   (emplacement : Europe de l'Ouest si proposé, accès public désactivé). `/api/health` doit répondre `"media":"ok"`.

Les clés (MakiSend, Itaja…) se mettent dans les **réglages du Worker** (variables secrètes), jamais dans le code.

## Étapes

1. ✅ Fondations : PWA, design system, tous les écrans navigables.
2. ✅ Comptes : email + code à 4 chiffres, réinitialisation par email (MakiSend), blocage.
3. ✅ Photos : selfie et inspirations vers R2 (liens signés, bucket privé, suppression automatique).
4. Essai : générateur d'aperçus factice (IA branchée plus tard), essai offert, notification.
5. Vote du cercle : lien WhatsApp, vote sans compte, résultats.
6. Paiement Itaja : sachets de perles, retour, crédit (logique des perles déjà prête : `worker/perles.ts`).
7. Carnet, vraie photo, Hair Recap (Three.js, chargé à part).
8. Finitions : notifications, hors connexion, tests sur Android d'entrée de gamme.
