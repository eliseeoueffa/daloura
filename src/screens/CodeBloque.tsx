// Généré depuis design/maquettes/Code-bloque.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";

export default function CodeBloque() {
  return (
    <div className="scr">
      <div className="top">
        <Link to="/" className="back">
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
          Accueil
        </Link>
      </div>
      <div className="grow"></div>
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "#F3DDE1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "center",
        }}
      >
        <svg viewBox="0 0 24 24" width="38" height="38" aria-hidden="true">
          <rect
            x="5"
            y="10.5"
            width="14"
            height="10"
            rx="2"
            fill="none"
            stroke="#702D43"
            strokeWidth="1.8"
          ></rect>
          <path
            d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"
            fill="none"
            stroke="#702D43"
            strokeWidth="1.8"
            strokeLinecap="round"
          ></path>
        </svg>
      </div>
      <h1 className="h1" style={{ textAlign: "center" }}>
        Trop d'essais
      </h1>
      <p className="p" style={{ textAlign: "center" }}>
        Pour protéger tes selfies et ton carnet, la connexion est bloquée
        pendant 15 minutes.
      </p>
      <p className="small" style={{ textAlign: "center" }}>
        Tu ne te souviens plus de ton code ? Reçois un lien pour en choisir un
        nouveau.
      </p>
      <div className="grow"></div>
      <Link to="/code-oublie" className="btn">
        Recevoir un lien par email
      </Link>{" "}
      <Link to="/" className="lnk">
        Revenir plus tard
      </Link>
    </div>
  );
}
