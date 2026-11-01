// Généré depuis design/maquettes/Email-existant.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";

export default function EmailExistant() {
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
      <h1 className="h1">Ton aperçu est prêt à être créé</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label className="label" htmlFor="mail">
          Ton adresse email
        </label>{" "}
        <input
          className="input bad"
          id="mail"
          type="email"
          defaultValue="awa.k@gmail.com"
          aria-invalid="true"
          aria-describedby="mail-err"
        />
      </div>
      <div className="alert err" id="mail-err">
        <span className="ic">!</span>
        <div>
          <b>Cet email a déjà un compte Daloura.</b>Connecte-toi avec ton code
          secret. Les perles offertes ont déjà servi sur ce compte.
        </div>
      </div>
      <div className="grow"></div>
      <Link to="/code-saisie" className="btn">
        Me connecter
      </Link>{" "}
      <Link to="/connexion" className="lnk">
        Utiliser un autre email
      </Link>
    </div>
  );
}
