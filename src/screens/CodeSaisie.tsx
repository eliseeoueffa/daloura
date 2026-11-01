// Généré depuis design/maquettes/Code-saisie.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function CodeSaisie() {
  return (
    <div className="scr" style={{ gap: "14px" }}>
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
        <span className="logo" style={{ fontSize: "18px" }}>
          <img
            src={IMG.logo}
            alt=""
            style={{ width: "22px", height: "22px" }}
          />
          daloura
        </span>
      </div>
      <h1 className="h1">Contente de te revoir</h1>
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
      <p className="label">Ton code secret</p>
      <div className="pin" aria-label="Code à 4 chiffres, 3 saisis">
        <span className="on">•</span>
        <span className="on">•</span>
        <span className="on">•</span>
        <span></span>
      </div>
      <Link to="/code-oublie" className="lnk" style={{ minHeight: "36px" }}>
        J'ai oublié mon code
      </Link>
      <div className="grow"></div>
      <div className="pad" aria-hidden="true">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
        <span>6</span>
        <span>7</span>
        <span>8</span>
        <span>9</span>
        <span style={{ background: "transparent", border: "0" }}></span>
        <span>0</span>
        <span style={{ fontSize: "14px" }}>Effacer</span>
      </div>
      <Link to="/carnet" className="btn">
        Me connecter
      </Link>
    </div>
  );
}
