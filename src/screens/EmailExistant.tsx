// Écran fait à la main (retiré de scripts/import_maquettes.py) : maquette design/maquettes/Email-existant.dc.html.
// Affiché quand l'email saisi sur Connexion a déjà un compte.
import { Link, Navigate } from "react-router";
import { brouillon } from "../lib/compte";

export default function EmailExistant() {
  if (!brouillon.email) return <Navigate to="/connexion" replace />;
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
          value={brouillon.email}
          readOnly
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
