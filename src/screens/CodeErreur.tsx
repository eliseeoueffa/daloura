// Généré depuis design/maquettes/Code-erreur.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";

export default function CodeErreur() {
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
      <div className="pin" aria-label="Code incorrect">
        <span style={{ border: "2px solid #A1262E", color: "#A1262E" }}>•</span>
        <span style={{ border: "2px solid #A1262E", color: "#A1262E" }}>•</span>
        <span style={{ border: "2px solid #A1262E", color: "#A1262E" }}>•</span>
        <span style={{ border: "2px solid #A1262E", color: "#A1262E" }}>•</span>
      </div>
      <div className="alert err">
        <span className="ic">!</span>
        <div>
          <b>Ce code n'est pas le bon.</b>Il te reste 2 essais. Après, la
          connexion est bloquée 15 minutes.
        </div>
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
      <Link to="/code-bloque" className="btn">
        Réessayer
      </Link>
    </div>
  );
}
