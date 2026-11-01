// Généré depuis design/maquettes/Selfie-refuse.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function SelfieRefuse() {
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
      </div>
      <h1 className="h1">On voit mal ton visage</h1>
      <div
        className="viewfinder"
        style={{ height: "340px", background: "#1A1210" }}
      >
        <img
          src={IMG.selfie}
          alt=""
          style={{
            position: "absolute",
            bottom: "0",
            width: "290px",
            filter: "brightness(.35) blur(2px)",
          }}
        />{" "}
        <span
          className="badge err"
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            width: "32px",
            height: "32px",
            fontSize: "16px",
          }}
        >
          !
        </span>
      </div>
      <div className="alert err">
        <span className="ic">!</span>
        <div>
          <b>La photo est trop sombre</b>L'aperçu serait flou et peu fidèle.
          Reprends-la face à une fenêtre.
        </div>
      </div>
      <div className="grow"></div>
      <Link to="/selfie" className="btn">
        Reprendre la photo
      </Link>{" "}
      <Link to="/selfie" className="btn2">
        Choisir une autre photo
      </Link>
    </div>
  );
}
