// Généré depuis design/maquettes/Connexion.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function Connexion() {
  return (
    <div className="scr">
      <div className="top">
        <Link to="/choix-essai" className="back">
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
      <div className="row" style={{ gap: "16px", marginTop: "8px" }}>
        <div
          className="face"
          style={{
            width: "64px",
            height: "64px",
            boxShadow: "0 0 0 3px #FFFDF8",
          }}
        >
          <img src={IMG.selfie} alt="" />
        </div>
        <span style={{ fontSize: "22px", color: "#702D43" }}>+</span>
        <div className="stk rays" style={{ width: "64px", height: "70px" }}>
          <img src={IMG.knotless} alt="" />
        </div>
        <span className="hand" style={{ fontSize: "18px" }}>
          presque !
        </span>
      </div>
      <h1 className="h1">Ton aperçu est prêt à être créé</h1>
      <p className="p">Entre ton email pour garder tes essais et ton carnet.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label className="label" htmlFor="mail">
          Ton adresse email
        </label>{" "}
        <input
          className="input"
          id="mail"
          type="email"
          defaultValue="awa.k@gmail.com"
        />
      </div>
      <p className="small">
        Pas de mot de passe : tu choisis un code secret à 4 chiffres à l'étape
        suivante.
      </p>
      <div className="grow"></div>
      <Link to="/code-nouveau" className="btn">
        Continuer
      </Link>
    </div>
  );
}
