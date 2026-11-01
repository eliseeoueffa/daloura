// Écran fait à la main (retiré de scripts/import_maquettes.py) : maquette design/maquettes/Choix-3.dc.html.
// Le coût suit le nombre de coiffures choisies (src/lib/perles.ts). Solde : src/lib/solde.ts.
import { useState } from "react";
import { Link } from "react-router";
import { IMG } from "../assets/images";
import { useSelfieAffiche } from "../lib/photos";
import { Perle, Perles } from "../components/Perle";
import {
  COUT_GENERATION,
  MAX_COIFFURES,
  MIN_COIFFURES_VOTE,
  coutEssai,
  voteAutorise,
} from "../lib/perles";
import { useSolde } from "../lib/solde";

const COIFFURES = [
  { slug: "fulani", nom: "Fulani", img: IMG.fulani },
  { slug: "bantu-knots", nom: "Bantu knots", img: IMG.knots },
  { slug: "knotless", nom: "Knotless", img: IMG.knotless },
  { slug: "perruque", nom: "Perruque", img: IMG.perruque },
  { slug: "cheveux-naturels", nom: "Cheveux naturels", img: IMG.afro },
  { slug: "locks", nom: "Locks", img: IMG.locs },
];

export default function Choix3() {
  const { selfie, selfieStyle } = useSelfieAffiche();
  const solde = useSolde("avantEssai");
  const [choix, setChoix] = useState<string[]>(
    COIFFURES.slice(0, MAX_COIFFURES).map((c) => c.slug),
  );
  const n = choix.length;
  const cout = n > 0 ? coutEssai(n) : 0;
  const assez = cout <= solde;

  const basculer = (slug: string) =>
    setChoix((c) =>
      c.includes(slug)
        ? c.filter((s) => s !== slug)
        : c.length < MAX_COIFFURES
          ? [...c, slug]
          : c,
    );

  return (
    <div className="scr">
      <div className="top">
        <Link to="/carnet" className="back">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M15 5l-7 7 7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
          Carnet
        </Link>
        <span className="pill sign">
          <Perles n={solde} />
        </span>
      </div>
      <div className="row">
        <div
          className="face"
          style={{
            width: "68px",
            height: "68px",
            boxShadow: "0 0 0 3px #FFFDF8",
          }}
        >
          <img src={selfie} alt="Ton selfie" style={selfieStyle} />
        </div>
        <div style={{ minWidth: "0" }}>
          <h1 className="h1" style={{ fontSize: "clamp(1rem, 5vw, 1.375rem)" }}>
            Choisis jusqu'à {MAX_COIFFURES} coiffures
          </h1>
          <p className="small" aria-live="polite">
            {n} sur {MAX_COIFFURES} choisie{n > 1 ? "s" : ""} · <Perle />
            {COUT_GENERATION} perles par coiffure
          </p>
        </div>
      </div>
      <div className="g3" style={{ rowGap: "14px" }}>
        {COIFFURES.map((c) => {
          const rang = choix.indexOf(c.slug);
          const choisie = rang >= 0;
          const bloquee = !choisie && n >= MAX_COIFFURES;
          return (
            <button
              key={c.slug}
              type="button"
              aria-pressed={choisie}
              onClick={() => basculer(c.slug)}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                position: "relative",
                opacity: choisie ? 1 : 0.55,
                background: "none",
                border: "0",
                padding: "0",
                font: "inherit",
                color: "inherit",
                cursor: bloquee ? "default" : "pointer",
              }}
            >
              <div
                className="stk rays"
                style={{
                  height: "120px",
                  boxShadow: choisie
                    ? "0 0 0 4px #FFFDF8, 0 0 0 7px #702D43"
                    : undefined,
                }}
              >
                <img src={c.img} alt="" />
              </div>
              {choisie && <span className="badge">{rang + 1}</span>}
              <span className="stk-name">{c.nom}</span>
            </button>
          );
        })}
      </div>
      <span className="hand">
        {n >= MAX_COIFFURES
          ? "touche une coiffure choisie pour la changer"
          : "touche une coiffure pour l'ajouter"}
      </span>
      {n > 0 && !voteAutorise(n) && (
        <p className="small" style={{ textAlign: "center" }}>
          Ton cercle pourra voter à partir de {MIN_COIFFURES_VOTE} coiffures.
        </p>
      )}
      <div className="grow"></div>
      {assez ? (
        <Link
          to="/apercus"
          className="btn"
          aria-disabled={n === 0}
          onClick={(e) => n === 0 && e.preventDefault()}
          style={n === 0 ? { opacity: 0.5 } : undefined}
        >
          {n > 1 ? `Voir mes ${n} aperçus` : "Voir mon aperçu"}
        </Link>
      ) : (
        <Link to="/recharger" className="btn">
          Recharger mes perles
        </Link>
      )}
      <p className="small" style={{ textAlign: "center" }} aria-live="polite">
        {n === 0 ? (
          "Choisis au moins une coiffure."
        ) : assez ? (
          <>
            Utilise <Perle />
            {cout} perles. Il t'en restera <Perle />
            {solde - cout}.
          </>
        ) : (
          <>
            Il te manque <Perles n={cout - solde} />.
          </>
        )}
      </p>
    </div>
  );
}
