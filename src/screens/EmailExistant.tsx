// Inscription avec un email qui a déjà un compte. Rendu dynamique à l'étape 2.
import { Link } from "react-router";
import { useEmailTransmis } from "../auth/navigation";
import { Retour } from "../components/Retour";

export default function EmailExistant() {
  const email = useEmailTransmis() || "awa.k@gmail.com"; // valeur d'exemple pour la relecture
  return (
    <div className="scr">
      <div className="top">
        <Retour to="/choix-essai" />
      </div>
      <h1 className="h1">Ton aperçu est prêt à être créé</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label className="label" htmlFor="mail">
          Ton adresse email
        </label>
        <input
          className="input bad"
          id="mail"
          type="email"
          value={email}
          readOnly
          aria-invalid="true"
          aria-describedby="mail-err"
        />
      </div>
      <div className="alert err" id="mail-err" role="alert">
        <span className="ic" aria-hidden="true">
          !
        </span>
        <div>
          <b>Cet email a déjà un compte Daloura.</b>Connecte-toi avec ton code
          secret. L'essai offert a déjà été utilisé sur ce compte.
        </div>
      </div>
      <div className="grow"></div>
      <Link to="/code-saisie" state={{ email }} className="btn">
        Me connecter
      </Link>
      <Link to="/connexion" className="lnk">
        Utiliser un autre email
      </Link>
    </div>
  );
}
