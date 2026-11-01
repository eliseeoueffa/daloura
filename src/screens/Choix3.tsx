// Généré depuis design/maquettes/Choix-3.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function Choix3() {
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
        <span className="pill sign">3 essais</span>
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
        <div style={{ minWidth: "0" }}>
          <h1 className="h1" style={{ fontSize: "clamp(1rem, 5vw, 1.375rem)" }}>
            Choisis 3 coiffures
          </h1>
          <p className="small">3 sur 3 choisies. Ton cercle votera ensuite.</p>
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
            <img src={IMG.fulani} alt="" />
          </div>
          <span className="badge">1</span>
          <span className="stk-name">Fulani</span>
        </div>
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
            <img src={IMG.knots} alt="" />
          </div>
          <span className="badge">2</span>
          <span className="stk-name">Bantu knots</span>
        </div>
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
          <span className="badge">3</span>
          <span className="stk-name">Knotless</span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            opacity: ".55",
          }}
        >
          <div className="stk rays" style={{ height: "120px" }}>
            <img src={IMG.perruque} alt="" />
          </div>
          <span className="stk-name">Perruque</span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            opacity: ".55",
          }}
        >
          <div className="stk rays" style={{ height: "120px" }}>
            <img src={IMG.afro} alt="" />
          </div>
          <span className="stk-name">Cheveux naturels</span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            opacity: ".55",
          }}
        >
          <div className="stk rays" style={{ height: "120px" }}>
            <img src={IMG.locs} alt="" />
          </div>
          <span className="stk-name">Locks</span>
        </div>
      </div>
      <span className="hand">touche une coiffure choisie pour la changer</span>
      <div className="grow"></div>
      <Link to="/apercus" className="btn">
        Voir mes 3 aperçus
      </Link>
      <p className="small" style={{ textAlign: "center" }}>
        Utilise 1 essai. Il t'en restera 2.
      </p>
    </div>
  );
}
