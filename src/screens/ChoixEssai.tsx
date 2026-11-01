// Écran fait à la main (retiré de scripts/import_maquettes.py) : maquette design/maquettes/Choix-essai.dc.html.
// Chiffres : src/lib/perles.ts. Solde : src/lib/solde.ts.
import { Link } from "react-router";
import { IMG } from "../assets/images";
import { Perles } from "../components/Perle";
import {
  PERLES_BIENVENUE,
  formatCoiffures,
  generationsDe,
} from "../lib/perles";

export default function ChoixEssai() {
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
          <Perles n={PERLES_BIENVENUE} /> offertes
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
          <img src={IMG.selfie} alt="Ton selfie" />
        </div>
        <div>
          <h1
            className="h1"
            style={{ fontSize: "clamp(1rem, 5.2vw, 1.375rem)" }}
          >
            Choisis 1 coiffure
          </h1>
          <p className="small">
            Tes <Perles n={PERLES_BIENVENUE} /> offertes montrent{" "}
            {formatCoiffures(generationsDe(PERLES_BIENVENUE))} sur ton visage.
          </p>
        </div>
      </div>
      <div className="g3" style={{ rowGap: "14px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            position: "relative",
          }}
        >
          <div
            className="stk rays"
            style={{
              height: "120px",
              boxShadow: "0 0 0 4px #FFFDF8, 0 0 0 7px #702D43",
            }}
          >
            <img src={IMG.knotless} alt="" />
          </div>
          <span className="badge">
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path
                d="M5 12.5l4.5 4.5L19 7.5"
                fill="none"
                stroke="#F5EFE6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </span>
          <span className="stk-name">Knotless</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div className="stk rays" style={{ height: "120px" }}>
            <img src={IMG.fulani} alt="" />
          </div>
          <span className="stk-name">Fulani</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div className="stk rays" style={{ height: "120px" }}>
            <img src={IMG.knots} alt="" />
          </div>
          <span className="stk-name">Bantu knots</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div className="stk rays" style={{ height: "120px" }}>
            <img src={IMG.perruque} alt="" />
          </div>
          <span className="stk-name">Perruque</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div className="stk rays" style={{ height: "120px" }}>
            <img src={IMG.locs} alt="" />
          </div>
          <span className="stk-name">Locks</span>
        </div>
        <Link
          to="/bibliotheque"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              height: "120px",
              borderRadius: "16px",
              border: "2px dashed rgba(112,45,67,.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#702D43",
              fontSize: "30px",
              fontWeight: "400",
            }}
          >
            +
          </div>
          <span className="stk-name">Ajouter</span>
        </Link>
      </div>
      <span className="hand">
        ensuite : 3 looks d'un coup, et ton cercle vote
      </span>
      <div className="grow"></div>
      <Link to="/connexion" className="btn">
        Voir mon aperçu
      </Link>
    </div>
  );
}
