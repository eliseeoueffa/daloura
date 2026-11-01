// Généré depuis design/maquettes/Code-oublie.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";

export default function CodeOublie() {
  return (
    <div className="scr">
      <div className="top">
        <Link to="/code-saisie" className="back">
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
      <h1 className="h1">Tu as oublié ton code</h1>
      <p className="p">
        Entre l'email de ton compte. On t'envoie un lien pour choisir un nouveau
        code.
      </p>
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
      <div className="alert">
        <span className="ic">i</span>
        <div>
          Tes selfies, tes aperçus et ton carnet restent protégés pendant ce
          temps.
        </div>
      </div>
      <div className="grow"></div>
      <Link to="/code-mail-envoye" className="btn">
        Recevoir le lien
      </Link>{" "}
      <Link to="/code-saisie" className="lnk">
        Je me souviens de mon code
      </Link>
    </div>
  );
}
