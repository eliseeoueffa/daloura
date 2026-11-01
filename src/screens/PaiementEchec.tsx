// Généré depuis design/maquettes/Paiement-echec.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";

export default function PaiementEchec() {
  return (
    <div className="scr">
      <div className="top">
        <Link to="/paiement" className="back">
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
          Récapitulatif
        </Link>
      </div>
      <div className="grow"></div>
      <div
        style={{
          width: "70px",
          height: "70px",
          borderRadius: "50%",
          background: "#F6DEDF",
          color: "#A1262E",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
          fontWeight: "800",
          alignSelf: "center",
        }}
      >
        !
      </div>
      <h1 className="h1" style={{ textAlign: "center" }}>
        Le paiement n'a pas abouti
      </h1>
      <p className="p" style={{ textAlign: "center" }}>
        Tu n'as pas été débitée. Le paiement a peut-être été annulé, ou la
        demande a expiré.
      </p>
      <div className="grow"></div>
      <Link to="/paiement-externe" className="btn">
        Réessayer le paiement
      </Link>{" "}
      <Link to="/offres" className="btn2">
        Choisir une autre offre
      </Link>
    </div>
  );
}
