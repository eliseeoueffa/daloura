# Plan de test — Étape 2 : comptes

Objectif : vérifier l'inscription (prénom, email, code à 4 chiffres saisi deux fois), la vérification
de l'email, la connexion, le blocage, le code oublié et la déconnexion.

## 1. Ce que les tests automatiques couvrent déjà

`npm test` lance 134 tests :

| Fichier | Ce qui est testé |
|---|---|
| `test/shared/validation.test.ts` | Email (254 caractères max, normalisation), prénom (premier mot, 20 caractères, accents, emoji), codes trop simples (0000, 1111, 1234, 4321, 2580…) |
| `test/worker/crypto.test.ts` | PBKDF2 (bon/mauvais code, sel différent, pas de code en clair), jetons, durée du blocage (2, 4, 8… 60 min) |
| `test/worker/inscription.test.ts` | Email libre/pris, inscription, cookies (HttpOnly, Secure, SameSite=Lax, 90 jours), rien en clair dans la base, erreurs de saisie, limites par IP, lien de vérification (usage unique, 24 h, renvoi limité) |
| `test/worker/connexion.test.ts` | Bon/mauvais code, essais restants, blocage à la 5e erreur, durée qui double, plafond 1 h, remise à zéro, **100 essais en parallèle ne testent que 5 codes**, session (prolongation, expiration, déconnexion, rejeu d'un cookie) |
| `test/worker/code-oublie.test.ts` | Réponse identique que l'email existe ou non, 3 liens/heure/email, nouveau code (usage unique, 1 h, déblocage, fermeture des autres sessions, annulation des autres liens) |
| `test/worker/securite.test.ts` | Requête d'un autre site refusée (CSRF), formulaire HTML refusé, JSON cassé, 404/405, pas de cache |
| `test/worker/makisend.test.ts` | Appel MakiSend (clé Bearer, Idempotency-Key, templateId, variables), erreur si refus, liens masqués dans les journaux hors local |
| `test/web/*.test.tsx` | Les écrans : navigation entre étapes, messages d'erreur, pavé (Effacer, clavier physique, 4 chiffres max), marqueur d'appareil, hors connexion |

## 2. À tester à la main sur téléphone

Prépare : `npm run db:migrate:local`, `npm run build`, puis `npm run dev:api` (port 8787).
Ouvre `http://<IP de l'ordinateur>:8787` sur le téléphone. Les emails s'affichent dans le terminal de
`dev:api` (lien en clair seulement en local).

Téléphones conseillés : un Android d'entrée de gamme (écran 360×640 environ) et un iPhone.
Pour chaque cas : ✅ / ❌ + capture si ❌.

### A. Inscription

| # | Étapes | Résultat attendu |
|---|---|---|
| A1 | Choix-essai → « Voir mon aperçu » → prénom « Awa Koné », ton email → Continuer | Écran « Choisis ton code secret » |
| A2 | Taper 1234 → Continuer | Cases rouges, « Ce code est trop facile à deviner », saisie vidée |
| A3 | Taper 0000, 1111, 2580 | Même refus |
| A4 | Taper un code correct → Continuer → taper un autre code → Confirmer | Écran « Les deux codes ne correspondent pas » → retour au choix du code |
| A5 | Refaire avec deux fois le même code → Consentement → Créer mon aperçu | Écran « Confirme ton email », avec « Bienvenue Awa » et ton email |
| A6 | Décocher la case du consentement | Bouton « Créer mon aperçu » grisé |
| A7 | Ouvrir le lien reçu (terminal) sur le téléphone | « Ton email est confirmé » → « Voir mon aperçu » mène aux notifications |
| A8 | Rouvrir le même lien | « Ce lien ne marche plus » |
| A9 | « Renvoyer le lien » 4 fois de suite | 3 fois « C'est renvoyé », la 4e : message « Trop d'essais » |
| A10 | Recharger la page au milieu de l'inscription (écran code) | Retour à l'écran prénom + email (rien n'est gardé sur le téléphone) |

### B. Email déjà utilisé et essai offert

| # | Étapes | Résultat attendu |
|---|---|---|
| B1 | Sur un **autre** navigateur, s'inscrire avec le même email (même en MAJUSCULES) | Écran « Cet email a déjà un compte » avec l'email affiché |
| B2 | « Me connecter » | Écran de connexion, email prérempli |
| B3 | Sur le téléphone où un compte a été créé, revenir sur l'inscription | Écran « Essai offert déjà utilisé » |
| B4 | Vider les données du site (localStorage seulement, pas les cookies) puis B3 | Toujours « Essai offert déjà utilisé » (cookie serveur) |

### C. Connexion et blocage

| # | Étapes | Résultat attendu |
|---|---|---|
| C1 | Accueil → « Se connecter » → email + bon code | Carnet |
| C2 | Code faux | Cases rouges, « Il te reste 4 essais. Après, la connexion est bloquée 2 minutes. » |
| C3 | Taper un chiffre après l'erreur | La saisie recommence, l'erreur disparaît |
| C4 | 5 codes faux | Écran « Trop d'essais… bloquée pendant 2 minutes » |
| C5 | Bon code pendant le blocage | Toujours bloquée |
| C6 | Attendre 2 min → bon code | Connectée |
| C7 | 5 erreurs, attendre, 5 erreurs à nouveau | Le 2e blocage dure 4 minutes (le message annonce 4 minutes avant) |
| C8 | Email inconnu + code | « Ce code n'est pas le bon. Vérifie ton adresse email et ton code. » |
| C9 | Couper le réseau (mode avion) → Me connecter | « Pas de connexion internet… » |
| C10 | Clavier ouvert sur l'email : le bouton principal reste-t-il visible ? | Oui |

### D. Code oublié

| # | Étapes | Résultat attendu |
|---|---|---|
| D1 | Depuis l'écran bloqué → « Recevoir un lien par email » | Email prérempli |
| D2 | Recevoir le lien | Écran « Regarde tes mails » avec ton email |
| D3 | Même demande avec un email qui n'existe pas | Exactement le même écran (aucun indice) |
| D4 | Ouvrir le lien → nouveau code deux fois | Connectée, carnet ; email « code changé » dans le terminal |
| D5 | Rouvrir le lien | « Ce lien ne marche plus », lien pour en demander un nouveau |
| D6 | Lien de plus d'une heure | Même message |
| D7 | Après D4, l'ancien code ne marche plus, le nouveau oui ; le compte n'est plus bloqué | ✔ |
| D8 | Connectée sur 2 navigateurs, changer de code sur l'un | L'autre est déconnecté |

### E. Confort mobile (vrai téléphone uniquement)

| # | Vérification | Attendu |
|---|---|---|
| E1 | Taper sur le pavé | Retour visuel immédiat, pas de flash gris, pas de zoom |
| E2 | Appui long sur une touche | Pas de sélection de texte |
| E3 | Champ email | Clavier email, pas de majuscule automatique, suggestion d'email du téléphone |
| E4 | Champ prénom | Majuscule automatique, suggestion du prénom |
| E5 | Petit écran (360×640) avec une erreur | Message d'erreur visible ; bouton principal toujours visible en bas |
| E6 | Réglage « grande police » du téléphone | Rien ne déborde, tout reste lisible |
| E7 | Appli installée (PWA) | Encoche et barre du bas respectées |

## 3. Sécurité (déjà automatisé, à revérifier en production)

- Dans les outils du navigateur → Application → Cookies : `__Host-daloura_session` est HttpOnly,
  Secure, SameSite=Lax.
- Dans D1 (`wrangler d1 execute daloura --remote --command "SELECT * FROM users LIMIT 1"`) : pas de
  code en clair, seulement `code_hash` et `code_salt`.
- Tant que MakiSend n'est pas configuré en ligne, les liens sont masqués dans les journaux.
