// Écran fait à la main (retiré de scripts/import_maquettes.py) : maquette design/maquettes/Choix-3.dc.html.
// Ses photos d'inspiration s'affichent dans les cases ; une case sans photo ouvre la galerie.
// Le coût suit le nombre de coiffures choisies (src/lib/perles.ts). Solde : src/lib/solde.ts.
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { GrilleCoiffures } from "../components/GrilleCoiffures";
import { useEssai, useInspirations, useSelfieAffiche } from "../lib/photos";
import { Perle, Perles } from "../components/Perle";
import {
  COUT_GENERATION,
  MAX_COIFFURES,
  MIN_COIFFURES_VOTE,
  coutEssai,
  voteAutorise,
} from "../lib/perles";
import { useSolde } from "../lib/solde";

export default function Choix3() {
  const { selfie, selfieStyle } = useSelfieAffiche();
  const solde = useSolde("avantEssai");
  const navigate = useNavigate();
  const { de } = useInspirations();
  const { essai, charge, choisir } = useEssai();
  const [choix, setChoix] = useState<string[]>([]);
  // Reprend le choix précédent (seulement les coiffures qui ont encore leur photo).
  useEffect(() => {
    if (charge) setChoix(essai.filter((s) => de(s)).slice(0, MAX_COIFFURES));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charge]);
  const n = choix.length;
  const cout = n > 0 ? coutEssai(n) : 0;
  const assez = cout <= solde;

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
      <GrilleCoiffures
        mode="choix"
        choisis={choix}
        max={MAX_COIFFURES}
        onChoix={setChoix}
      />
      <span className="hand">
        {n >= MAX_COIFFURES
          ? "touche une coiffure choisie pour la retirer"
          : "touche une coiffure ; sans photo, ta galerie s'ouvre"}
      </span>
      {n > 0 && !voteAutorise(n) && (
        <p className="small" style={{ textAlign: "center" }}>
          Ton cercle pourra voter à partir de {MIN_COIFFURES_VOTE} coiffures.
        </p>
      )}
      <div className="grow"></div>
      {assez ? (
        <button
          type="button"
          className="btn"
          disabled={n === 0}
          onClick={async () => {
            await choisir(choix);
            navigate("/attente");
          }}
        >
          {n > 1 ? `Voir mes ${n} aperçus` : "Voir mon aperçu"}
        </button>
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
