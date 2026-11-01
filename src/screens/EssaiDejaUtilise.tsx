// Généré depuis design/maquettes/Essai-deja-utilise.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function EssaiDejaUtilise() {
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
      <div className="grow"></div>
      <div
        style={{ position: "relative", alignSelf: "center", width: "200px" }}
      >
        <div className="pola" style={{ transform: "rotate(-4deg)" }}>
          <div className="ph bg-cream">
            <img src={IMG.knotless} alt="" />
          </div>
          <div className="cap">déjà essayé</div>
        </div>
        <span
          className="pill sign"
          style={{
            position: "absolute",
            top: "16px",
            right: "-16px",
            transform: "rotate(10deg)",
          }}
        >
          offert : utilisé
        </span>
      </div>
      <h1 className="h1" style={{ textAlign: "center" }}>
        Les perles offertes ont déjà servi sur ce téléphone
      </h1>
      <p className="p" style={{ textAlign: "center" }}>
        Pour essayer d'autres coiffures, choisis une offre. Tu as déjà un compte
        ? Connecte-toi pour retrouver ton carnet.
      </p>
      <div className="grow"></div>
      <Link to="/offres" className="btn">
        Voir les offres
      </Link>{" "}
      <Link to="/code-saisie" className="lnk">
        Me connecter
      </Link>
    </div>
  );
}
