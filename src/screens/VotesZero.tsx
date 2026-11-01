// Généré depuis design/maquettes/Votes-zero.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function VotesZero() {
  return (
    <div className="scr">
      <div className="top">
        <Link to="/apercus" className="back">
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
          Mes aperçus
        </Link>
        <span className="pill">Ouvert jusqu'à samedi</span>
      </div>
      <h1 className="h1">Pas encore de vote</h1>
      <p className="p">
        Ton lien est bien parti. Tes votes s'afficheront ici dès qu'une personne
        de ton cercle aura voté.
      </p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          opacity: ".6",
        }}
      >
        <div className="row">
          <div className="face" style={{ width: "48px", height: "48px" }}>
            <img src={IMG.fulani} alt="" />
          </div>
          <div
            style={{
              flex: "1",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="label">Fulani</span>
              <span className="label">0</span>
            </div>
            <div className="bar">
              <i style={{ width: "0%" }}></i>
            </div>
          </div>
        </div>
        <div className="row">
          <div
            className="face"
            style={{ width: "48px", height: "48px", background: "#EDC57E" }}
          >
            <img src={IMG.knots} alt="" />
          </div>
          <div
            style={{
              flex: "1",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="label">Bantu knots</span>
              <span className="label">0</span>
            </div>
            <div className="bar">
              <i style={{ width: "0%" }}></i>
            </div>
          </div>
        </div>
        <div className="row">
          <div
            className="face"
            style={{ width: "48px", height: "48px", background: "#EADFCF" }}
          >
            <img src={IMG.knotless} alt="" />
          </div>
          <div
            style={{
              flex: "1",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="label">Knotless</span>
              <span className="label">0</span>
            </div>
            <div className="bar">
              <i style={{ width: "0%" }}></i>
            </div>
          </div>
        </div>
      </div>
      <span className="hand">astuce : mets le lien dans ton statut</span>
      <div className="grow"></div>
      <Link to="/inviter" className="btn">
        Relancer mon cercle
      </Link>{" "}
      <Link to="/ton-choix" className="lnk">
        Choisir sans attendre
      </Link>
    </div>
  );
}
