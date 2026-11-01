// Généré depuis design/maquettes/Carnet-vide.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function CarnetVide() {
  return (
    <div className="scr" style={{ paddingBottom: "0" }}>
      <div className="top">
        <span className="logo">
          <img src={IMG.logo} alt="" />
          daloura
        </span>
        <span className="pill">0 era</span>
      </div>
      <h1 className="h1">Mon carnet</h1>
      <div className="grow"></div>
      <div
        style={{
          position: "relative",
          alignSelf: "center",
          width: "220px",
          height: "170px",
        }}
      >
        <div
          className="pola"
          style={{
            position: "absolute",
            left: "0",
            top: "20px",
            width: "110px",
            transform: "rotate(-8deg)",
          }}
        >
          <div
            className="ph"
            style={{
              background: "#FFFBF4",
              border: "2px dashed rgba(112,45,67,.3)",
              boxSizing: "border-box",
            }}
          ></div>
          <div className="cap">era 1 ?</div>
        </div>
        <div
          className="pola"
          style={{
            position: "absolute",
            left: "100px",
            top: "0",
            width: "110px",
            transform: "rotate(6deg)",
          }}
        >
          <div
            className="ph"
            style={{
              background: "#FFFBF4",
              border: "2px dashed rgba(112,45,67,.3)",
              boxSizing: "border-box",
            }}
          ></div>
          <div className="cap">era 2 ?</div>
        </div>
      </div>
      <h2 className="h2" style={{ textAlign: "center" }}>
        Ton carnet attend sa première era
      </h2>
      <p className="p" style={{ textAlign: "center" }}>
        Chaque coiffure que tu choisis y garde son aperçu, la vraie photo et
        l'avis de ton cercle.
      </p>
      <p className="small" style={{ textAlign: "center" }}>
        Le hair recap se débloque dès ta première era.
      </p>
      <div className="grow"></div>
      <Link to="/choix-essai" className="btn">
        Essayer un look
      </Link>
      <nav
        className="tabbar"
        aria-label="Navigation"
        style={{ marginTop: "16px" }}
      >
        <Link to="/carnet-vide" className="on">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="3.5" width="14" height="17" rx="2"></rect>
              <path d="M9 3.5v17M12.5 8h3.5M12.5 11.5h3.5"></path>
            </g>
          </svg>
          Carnet
        </Link>{" "}
        <Link to="/choix-essai">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <ellipse cx="12" cy="9.5" rx="5.5" ry="6.5"></ellipse>
              <path d="M12 16v5M9.5 21h5M10 8l2.2-2"></path>
            </g>
          </svg>
          Essayer
        </Link>{" "}
        <Link to="/profil">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8.5" r="3.5"></circle>
              <path d="M5 20c1-3.8 3.8-5.5 7-5.5s6 1.7 7 5.5"></path>
            </g>
          </svg>
          Profil
        </Link>
      </nav>
    </div>
  );
}
