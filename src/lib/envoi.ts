// Envoi des photos vers R2 (routes /api/photos du Worker).
//
// Principe : le téléphone fait foi. Après chaque changement (et au démarrage, et quand le réseau
// revient), on compare ce qu'il y a sur le téléphone avec ce qu'il y a sur le serveur, puis on
// envoie ce qui manque et on efface ce qui a été retiré. Si le réseau coupe, on réessaie plus tard :
// rien n'est perdu, les photos restent sur le téléphone.
//
// Rien ne part tant qu'elle n'est pas connectée ET n'a pas donné son accord sur l'écran Consentement :
// les photos vont alors dans le dossier de son compte.
import { appareil } from "./appareil";
import { etatCompte, surChangementCompte } from "./compte";
import { chargerPhotos, etatPhotos, surChangement } from "./photos";

const entetes = () => ({ "x-daloura-appareil": appareil() });

/** Empreinte du contenu : sert d'identifiant pour savoir si le serveur a déjà la bonne version. */
async function empreinte(b: Blob): Promise<string> {
  const h = await crypto.subtle.digest("SHA-256", await b.arrayBuffer());
  return [...new Uint8Array(h).slice(0, 16)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

async function envoyer(chemin: string, b: Blob, id: string) {
  const r = await fetch(`/api/photos${chemin}`, {
    method: "PUT",
    body: b,
    headers: {
      ...entetes(),
      "content-type": b.type || "image/jpeg",
      "x-photo-id": id,
    },
  });
  if (!r.ok) throw new Error(`envoi ${chemin} : ${r.status}`);
}

async function effacer(chemin: string) {
  const r = await fetch(`/api/photos${chemin}`, {
    method: "DELETE",
    headers: entetes(),
  });
  if (!r.ok && r.status !== 404)
    throw new Error(`suppression ${chemin} : ${r.status}`);
}

type Serveur = {
  selfie: { id: string } | null;
  inspirations: { style: string; id: string }[];
};

async function synchroniser(): Promise<void> {
  await chargerPhotos();
  const { selfie, inspirations, consentement } = etatPhotos();
  if (!consentement || !etatCompte().compte) return;
  const r = await fetch("/api/photos", { headers: entetes() });
  if (!r.ok) throw new Error(`liste : ${r.status}`);
  const serveur = (await r.json()) as Serveur;

  if (selfie) {
    const id = await empreinte(selfie);
    if (serveur.selfie?.id !== id) await envoyer("/selfie", selfie, id);
  } else if (serveur.selfie) await effacer("/selfie");

  for (const i of inspirations) {
    const id = await empreinte(i.blob);
    if (serveur.inspirations.find((s) => s.style === i.style)?.id !== id)
      await envoyer(`/inspirations/${i.style}`, i.blob, id);
  }
  for (const s of serveur.inspirations) {
    if (!inspirations.some((i) => i.style === s.style))
      await effacer(`/inspirations/${s.style}`);
  }
}

// Une seule synchronisation à la fois ; un changement pendant qu'elle tourne en relance une.
let enCours: Promise<void> | null = null;
let aRefaire = false;
let minuterie: ReturnType<typeof setTimeout> | undefined;
let essaisRates = 0;

export function planifier(delai = 1500) {
  clearTimeout(minuterie);
  minuterie = setTimeout(lancer, delai);
}

function lancer() {
  if (enCours) {
    aRefaire = true;
    return;
  }
  enCours = synchroniser()
    .then(() => {
      essaisRates = 0;
    })
    .catch(() => {
      // Réseau coupé ou serveur indisponible : on réessaie de plus en plus tard (max 5 min).
      essaisRates++;
      planifier(Math.min(5 * 60_000, 5_000 * 2 ** essaisRates));
    })
    .finally(() => {
      enCours = null;
      if (aRefaire) {
        aRefaire = false;
        planifier(0);
      }
    });
}

/** Synchronise tout de suite et attend la fin (avant de lancer un essai). Lève une erreur si échec. */
export async function synchroniserMaintenant(): Promise<void> {
  clearTimeout(minuterie);
  while (enCours) await enCours;
  enCours = synchroniser().finally(() => {
    enCours = null;
  });
  await enCours;
}

/** Efface toutes ses photos du serveur (Profil), même sans consentement enregistré. */
export async function effacerDuServeur(): Promise<void> {
  try {
    await effacer("");
  } catch {
    planifier(); // la synchronisation suivante effacera ce qui reste
  }
}

/** À appeler une fois au démarrage de l'appli. */
export function demarrerEnvoi() {
  let precedent = etatPhotos();
  surChangement(() => {
    const e = etatPhotos();
    const change =
      e.selfie !== precedent.selfie ||
      e.inspirations !== precedent.inspirations ||
      e.consentement !== precedent.consentement;
    precedent = e;
    if (change && e.charge) planifier();
  });
  // Connexion (ou changement de compte) : on envoie ses photos dans le dossier du compte.
  let compteAvant = etatCompte().compte?.email;
  surChangementCompte(() => {
    const c = etatCompte().compte?.email;
    if (c && c !== compteAvant) planifier(0);
    compteAvant = c;
  });
  addEventListener("online", () => planifier(0));
  planifier(3000);
}
