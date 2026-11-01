// Écran fait à la main (retiré de scripts/import_maquettes.py) : maquette design/maquettes/Choix-essai.dc.html.
// Ses photos d'inspiration s'affichent dans les cases ; une case sans photo ouvre la galerie.
// Chiffres : src/lib/perles.ts.
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { GrilleCoiffures } from "../components/GrilleCoiffures";
import { Perles } from "../components/Perle";
import {
  PERLES_BIENVENUE,
  formatCoiffures,
  generationsDe,
} from "../lib/perles";
import { useEssai, useInspirations, useSelfieAffiche } from "../lib/photos";

const MAX = generationsDe(PERLES_BIENVENUE); // 3 perles offertes = 1 coiffure

export default function ChoixEssai() {
  const navigate = useNavigate();
  const { selfie, selfieStyle } = useSelfieAffiche();
  const { de } = useInspirations();
  const { essai, charge, choisir } = useEssai();
  const [choix, setChoix] = useState<string[]>([]);

  // Reprend le choix précédent (seulement les coiffures qui ont encore leur photo).
  useEffect(() => {
    if (charge) setChoix(essai.filter((s) => de(s)).slice(0, MAX));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charge]);

  const pret = choix.length > 0 && choix.every((s) => de(s));

  return (
    <div className="scr">
      <div className="top">
        <Link to="/selfie" className="back">
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
          Retour
        </Link>
        <span className="pill sign">
          <Perles n={PERLES_BIENVENUE} />
          &nbsp;offertes
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
        <div>
          <h1
            className="h1"
            style={{ fontSize: "clamp(1rem, 5.2vw, 1.375rem)" }}
          >
            Choisis {formatCoiffures(MAX)}
          </h1>
          <p className="small">
            Tes <Perles n={PERLES_BIENVENUE} /> offertes montrent{" "}
            {formatCoiffures(MAX)} sur ton visage.
          </p>
        </div>
      </div>
      <GrilleCoiffures
        mode="choix"
        choisis={choix}
        max={MAX}
        onChoix={setChoix}
      />
      <span className="hand">
        ensuite : 3 looks d'un coup, et ton cercle vote
      </span>
      <div className="grow"></div>
      <button
        type="button"
        className="btn"
        disabled={!pret}
        onClick={async () => {
          await choisir(choix);
          navigate("/connexion");
        }}
      >
        Voir mon aperçu
      </button>
      {!pret && (
        <p className="small" style={{ textAlign: "center" }}>
          Touche une coiffure. Sans photo, ta galerie s'ouvre pour l'ajouter.
        </p>
      )}
    </div>
  );
}
