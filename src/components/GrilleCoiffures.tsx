// Grille des 6 coiffures, partagée par la bibliothèque d'inspirations et les écrans de choix.
// Chaque case montre SA photo d'inspiration si elle en a mis une, sinon l'illustration (pâle).
// Toucher une case sans photo ouvre la galerie : la photo choisie va dans CETTE case.
import { useRef, useState } from "react";
import { COIFFURES, type Coiffure } from "../lib/coiffures";
import { useInspirations, useUrl, type Inspiration } from "../lib/photos";

type Props =
  | { mode: "bibliotheque" }
  | {
      mode: "choix";
      choisis: string[];
      max: number;
      onChoix: (styles: string[]) => void;
    };

const coche = (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
    <path
      d="M5 12.5l4.5 4.5L19 7.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

function Case({
  c,
  photo,
  rang,
  coche: avecCoche,
  pale,
  onTouche,
  onRetirer,
}: {
  c: Coiffure;
  photo: Inspiration | undefined;
  rang: number; // 0 = pas choisie
  coche: boolean;
  pale: boolean;
  onTouche: () => void;
  onRetirer?: () => void;
}) {
  const url = useUrl(photo?.blob);
  const choisie = rang > 0;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        position: "relative",
        minWidth: 0,
      }}
    >
      <button
        type="button"
        onClick={onTouche}
        aria-pressed={onRetirer ? undefined : choisie}
        aria-label={
          photo
            ? `${c.nom} : ta photo${onRetirer ? ", toucher pour la changer" : choisie ? ", choisie" : ""}`
            : `${c.nom} : ajouter ta photo`
        }
        className={photo ? "stk" : "stk rays"}
        style={{
          height: "120px",
          width: "100%",
          padding: 0,
          border: 0,
          cursor: "pointer",
          background: photo ? "#EADFCF" : undefined,
          opacity: pale ? 0.55 : 1,
          boxShadow: choisie
            ? "0 0 0 4px #FFFDF8, 0 0 0 7px #702D43"
            : undefined,
        }}
      >
        {photo ? (
          url && (
            <img
              className="vraie-photo"
              src={url}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )
        ) : (
          <>
            <img src={c.img} alt="" />
            <span className="ajout-photo" aria-hidden="true">
              + ta photo
            </span>
          </>
        )}
      </button>
      {choisie && <span className="badge">{avecCoche ? coche : rang}</span>}
      {onRetirer && photo && (
        <button
          type="button"
          className="badge"
          onClick={onRetirer}
          aria-label={`Retirer ta photo ${c.nom}`}
          style={{ border: 0, cursor: "pointer", fontSize: "1rem" }}
        >
          ×
        </button>
      )}
      <span className="stk-name">{c.nom}</span>
    </div>
  );
}

export function GrilleCoiffures(props: Props) {
  const { de, mettre, retirer } = useInspirations();
  const input = useRef<HTMLInputElement>(null);
  const cible = useRef<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const ouvrirGalerie = (slug: string) => {
    cible.current = slug;
    input.current?.click();
  };

  const basculer = (slug: string) => {
    if (props.mode !== "choix") return;
    const { choisis, max, onChoix } = props;
    if (choisis.includes(slug)) onChoix(choisis.filter((s) => s !== slug));
    else if (max === 1) onChoix([slug]);
    else if (choisis.length < max) onChoix([...choisis, slug]);
  };

  async function recu(f: File) {
    const slug = cible.current;
    if (!slug) return;
    setErreur(null);
    try {
      await mettre(slug, f);
      // Sur un écran de choix, la coiffure dont elle vient d'ajouter la photo est choisie.
      if (props.mode === "choix" && !props.choisis.includes(slug))
        basculer(slug);
    } catch {
      setErreur("Cette photo n'a pas pu être lue. Essaie avec une autre.");
    }
  }

  return (
    <>
      <div className="g3" style={{ rowGap: "14px" }}>
        {COIFFURES.map((c) => {
          const photo = de(c.slug);
          if (props.mode === "bibliotheque") {
            return (
              <Case
                key={c.slug}
                c={c}
                photo={photo}
                rang={0}
                coche={false}
                pale={!photo}
                onTouche={() => ouvrirGalerie(c.slug)}
                onRetirer={() => retirer(c.slug)}
              />
            );
          }
          const rang = props.choisis.indexOf(c.slug) + 1;
          return (
            <Case
              key={c.slug}
              c={c}
              photo={photo}
              rang={rang}
              coche={props.max === 1}
              pale={rang === 0}
              onTouche={() =>
                photo ? basculer(c.slug) : ouvrirGalerie(c.slug)
              }
            />
          );
        })}
      </div>
      {erreur && (
        <div className="alert err" role="alert">
          <span className="ic">!</span>
          <div>{erreur}</div>
        </div>
      )}
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.currentTarget.files?.[0];
          e.currentTarget.value = "";
          if (f) void recu(f);
        }}
      />
    </>
  );
}
