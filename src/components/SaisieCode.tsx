// Saisie du code secret à 4 chiffres : les cases (CasesCode) et le pavé (PaveCode), placés séparément
// comme sur les maquettes. Le pavé écoute aussi le clavier de l'ordinateur (chiffres, retour arrière).
import { useEffect } from "react";

export const LONGUEUR_CODE = 4;

type Saisie = {
  valeur: string;
  onChange: (v: string) => void;
  desactive?: boolean;
};

export function CasesCode({
  valeur,
  erreur = false,
  libelle,
}: {
  valeur: string;
  erreur?: boolean;
  libelle: string;
}) {
  return (
    <div
      className={erreur ? "pin err" : "pin"}
      role="status"
      aria-label={`${libelle} : ${valeur.length} chiffre${valeur.length > 1 ? "s" : ""} sur ${LONGUEUR_CODE}`}
    >
      {Array.from({ length: LONGUEUR_CODE }, (_, i) => (
        <span key={i} className={i < valeur.length ? "on" : undefined}>
          {i < valeur.length ? "•" : ""}
        </span>
      ))}
    </div>
  );
}

export function PaveCode({ valeur, onChange, desactive = false }: Saisie) {
  const taper = (c: string) => {
    if (!desactive && valeur.length < LONGUEUR_CODE) onChange(valeur + c);
  };
  const effacer = () => {
    if (!desactive) onChange(valeur.slice(0, -1));
  };

  useEffect(() => {
    const touche = (e: KeyboardEvent) => {
      const cible = e.target as HTMLElement | null;
      if (cible && (cible.tagName === "INPUT" || cible.tagName === "TEXTAREA"))
        return;
      if (/^\d$/.test(e.key)) taper(e.key);
      else if (e.key === "Backspace") effacer();
    };
    addEventListener("keydown", touche);
    return () => removeEventListener("keydown", touche);
  });

  return (
    <div className="pad">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => taper(c)}
          disabled={desactive}
        >
          {c}
        </button>
      ))}
      <span style={{ background: "transparent", border: "0" }}></span>
      <button type="button" onClick={() => taper("0")} disabled={desactive}>
        0
      </button>
      <button
        type="button"
        onClick={effacer}
        disabled={desactive}
        style={{ fontSize: "14px" }}
        aria-label="Effacer le dernier chiffre"
      >
        Effacer
      </button>
    </div>
  );
}
