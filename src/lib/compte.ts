// Compte de l'utilisatrice côté appli : appels à /api/compte (worker/comptes.ts) et état partagé.
// La session est un cookie HttpOnly posé par le serveur : l'appli ne voit jamais le jeton.
import { useEffect, useSyncExternalStore } from "react";
import { appareil } from "./envoi";

export type Compte = { email: string; perles: number };
export type ReponseApi<T> = { ok: true; data: T } | { ok: false; status: number; error: string; [k: string]: unknown };

export async function api<T>(chemin: string, corps?: unknown): Promise<ReponseApi<T>> {
  try {
    const r = await fetch(`/api/compte${chemin}`, {
      method: corps === undefined ? "GET" : "POST",
      headers: { "content-type": "application/json", "x-daloura-appareil": appareil() },
      body: corps === undefined ? undefined : JSON.stringify(corps),
      credentials: "same-origin",
    });
    const data = await r.json().catch(() => ({}));
    if (r.ok) return { ok: true, data: data as T };
    return { ok: false, status: r.status, error: "error" in data ? String(data.error) : "erreur", ...data };
  } catch {
    return { ok: false, status: 0, error: "hors_ligne" };
  }
}

// ─── État partagé ───────────────────────────────────────────────────────────

type Etat = { charge: boolean; compte: Compte | null };
let etat: Etat = { charge: false, compte: null };
const abonnes = new Set<() => void>();
function publier(e: Partial<Etat>) {
  etat = { ...etat, ...e };
  abonnes.forEach((f) => f());
}

let chargement: Promise<void> | null = null;
export function rafraichirCompte() {
  chargement = api<Compte>("/moi").then((r) => publier({ charge: true, compte: r.ok ? r.data : null }));
  return chargement;
}

export function useCompte() {
  const e = useSyncExternalStore(
    (f) => {
      abonnes.add(f);
      return () => abonnes.delete(f);
    },
    () => etat,
  );
  useEffect(() => {
    if (!chargement) void rafraichirCompte();
  }, []);
  return e;
}

export function connecte(compte: Compte) {
  publier({ charge: true, compte });
}

export async function deconnecter() {
  await api("/deconnexion", {});
  publier({ charge: true, compte: null });
}

// ─── Parcours en cours (inscription ou nouveau code) ────────────────────────
// Gardé en mémoire seulement : le code n'est jamais écrit sur le téléphone.

type Brouillon = { email: string; code: string; jeton: string | null };
export const brouillon: Brouillon = { email: "", code: "", jeton: null };

/** Message clair pour chaque erreur renvoyée par le serveur. */
export function messageErreur(error: string): string {
  switch (error) {
    case "email_invalide":
      return "Cette adresse email n'a pas l'air complète. Vérifie-la.";
    case "hors_ligne":
      return "Pas de connexion internet. Réessaie quand le réseau revient.";
    case "email_indisponible":
      return "L'email n'a pas pu partir. Réessaie dans quelques minutes.";
    case "lien_invalide":
      return "Ce lien n'est plus valable (il dure 30 minutes et ne sert qu'une fois). Demande-en un nouveau.";
    case "compte_inconnu":
      return "Aucun compte Daloura avec cet email.";
    default:
      return "Un souci est survenu. Réessaie.";
  }
}
