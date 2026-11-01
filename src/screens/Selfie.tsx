// Généré depuis design/maquettes/Selfie.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function Selfie() {
  return (
    <div className="scr">
      <div className="top">
        <Link to="/bibliotheque" className="back">
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
      </div>
      <h1 className="h1">Ton selfie</h1>
      <div className="viewfinder" style={{ height: "380px" }}>
        <img
          src={IMG.selfie}
          alt=""
          style={{
            position: "absolute",
            bottom: "0",
            width: "300px",
            opacity: ".55",
          }}
        />
        <div
          style={{
            width: "196px",
            height: "256px",
            border: "3px dashed #E8A93A",
            borderRadius: "50%",
            position: "relative",
            zIndex: "2",
            marginTop: "-40px",
          }}
        ></div>
        <span
          className="hand"
          style={{
            position: "absolute",
            top: "14px",
            right: "16px",
            color: "#E8A93A",
            zIndex: "2",
          }}
        >
          visage dans l'ovale
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div className="row" style={{ gap: "10px" }}>
          <span className="pill sign">1</span>
          <p className="p">Face à une fenêtre, à la lumière du jour</p>
        </div>
        <div className="row" style={{ gap: "10px" }}>
          <span className="pill sign">2</span>
          <p className="p">Cheveux dégagés du visage</p>
        </div>
        <div className="row" style={{ gap: "10px" }}>
          <span className="pill sign">3</span>
          <p className="p">Sans lunettes ni filtre</p>
        </div>
      </div>
      <div className="grow"></div>
      <Link to="/choix-essai" className="btn">
        Prendre la photo
      </Link>{" "}
      <Link to="/selfie-refuse" className="lnk">
        Choisir dans ma galerie
      </Link>
    </div>
  );
}
