// Généré depuis design/maquettes/Suivi-votes.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function SuiviVotes() {
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
      <h1 className="h1">Ton cercle a voté 5 fois</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div className="row">
          <div
            className="stk rays round"
            style={{ width: "52px", height: "52px", flex: "none" }}
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
              <span className="label" style={{ color: "#8A5A00" }}>
                3
              </span>
            </div>
            <div className="bar">
              <i className="win" style={{ width: "60%" }}></i>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="face" style={{ width: "52px", height: "52px" }}>
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
              <span className="label">2</span>
            </div>
            <div className="bar">
              <i style={{ width: "40%" }}></i>
            </div>
          </div>
        </div>
        <div className="row">
          <div
            className="face"
            style={{ width: "52px", height: "52px", background: "#EADFCF" }}
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
      <p className="label">Les petits mots</p>
      <div className="note" style={{ transform: "rotate(-1.5deg)" }}>
        « Les bantu knots, sans hésiter ! »<br />
        <span style={{ fontSize: "15px", color: "#7A5E57" }}>Mariam</span>
      </div>
      <div
        className="note"
        style={{ transform: "rotate(1.2deg)", background: "#F3DDE1" }}
      >
        « Les perles, ça te va trop bien. »<br />
        <span style={{ fontSize: "15px", color: "#7A5E57" }}>Kossi</span>
      </div>
      <div className="grow"></div>
      <Link to="/ton-choix" className="btn">
        Faire mon choix
      </Link>{" "}
      <Link to="/inviter" className="lnk">
        Relancer mon cercle
      </Link>
    </div>
  );
}
