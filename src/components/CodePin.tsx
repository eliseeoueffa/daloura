// Saisie du code secret : les 4 cases et le pavé de chiffres des maquettes, en vrais boutons.
// Le clavier physique marche aussi (chiffres et retour arrière), sauf quand un champ texte a
// le focus, pour ne pas voler la saisie de l'email.
import { useEffect, useRef } from "react";
import { CODE_LONGUEUR } from "../../shared/validation";

type Props = {
  value: string;
  onChange: (v: string) => void;
  /** Bordures rouges (code faux, codes différents). */
  erreur?: boolean;
  /** Ce que lit un lecteur d'écran avant le nombre de chiffres. */
  label: string;
  disabled?: boolean;
};

export function CodeCases({
  value,
  erreur,
  label,
}: Pick<Props, "value" | "erreur" | "label">) {
  const n = value.length;
  // Après une erreur, la saisie est vidée mais les 4 cases restent pleines et rouges
  // (comme sur les maquettes) jusqu'au premier chiffre tapé.
  const pleines = erreur && n === 0 ? CODE_LONGUEUR : n;
  return (
    <div
      className={erreur ? "pin bad" : "pin"}
      role="img"
      aria-label={`${label}, ${n} chiffre${n > 1 ? "s" : ""} sur 4`}
    >
      {Array.from({ length: CODE_LONGUEUR }, (_, i) => (
        <span key={i} className={i < pleines ? "on" : undefined}>
          {i < pleines ? "•" : ""}
        </span>
      ))}
    </div>
  );
}

export function CodePad({
  value,
  onChange,
  disabled,
}: Pick<Props, "value" | "onChange" | "disabled">) {
  const ref = useRef({ value, onChange, disabled });
  ref.current = { value, onChange, disabled };

  const taper = (chiffre: string) => {
    if (!disabled && value.length < CODE_LONGUEUR) onChange(value + chiffre);
  };
  const effacer = () => {
    if (!disabled) onChange(value.slice(0, -1));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const cible = e.target as HTMLElement | null;
      if (cible?.closest("input, textarea, select, [contenteditable]")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const { value: v, onChange: set, disabled: off } = ref.current;
      if (off) return;
      if (/^\d$/.test(e.key) && v.length < CODE_LONGUEUR) {
        e.preventDefault();
        set(v + e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        set(v.slice(0, -1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="pad">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => taper(c)}
          disabled={disabled}
        >
          {c}
        </button>
      ))}
      <span className="vide" aria-hidden="true"></span>
      <button type="button" onClick={() => taper("0")} disabled={disabled}>
        0
      </button>
      <button
        type="button"
        className="effacer"
        onClick={effacer}
        disabled={disabled}
        aria-label="Effacer le dernier chiffre"
      >
        Effacer
      </button>
    </div>
  );
}
