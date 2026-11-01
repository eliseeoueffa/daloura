// Généré depuis design/maquettes/Paiement.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";

export default function Paiement() {
  return (
    <div className="scr">
      <div className="top">
        <Link to="/offres" className="back">
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
          Offres
        </Link>
      </div>
      <h1 className="h1">Ton récapitulatif</h1>
      <p className="small">L'offre que tu as choisie :</p>
      <div
        className="card on"
        style={{ position: "relative", marginTop: "6px", paddingTop: "18px" }}
      >
        <span
          className="pill sign"
          style={{
            position: "absolute",
            top: "-13px",
            left: "14px",
            minHeight: "26px",
            padding: "0 10px",
          }}
        >
          9 coiffures
        </span>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <p className="h2">My Hair Era</p>
          <p className="h2" style={{ color: "#702D43", whiteSpace: "nowrap" }}>
            2 500 F
          </p>
        </div>
        <p className="small">
          3 essais de 3 coiffures, à utiliser quand tu veux.
        </p>
      </div>
      <div className="card" style={{ gap: "10px" }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <p className="h2">Total</p>
          <p className="h2" style={{ color: "#702D43" }}>
            2 500 F
          </p>
        </div>
        <p className="small">Compte : awa.k@gmail.com</p>
      </div>
      <div
        className="card"
        style={{ background: "#F3DDE1", border: "0", gap: "8px" }}
      >
        <div className="row" style={{ gap: "10px" }}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
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
          <p className="label">Paiement sécurisé par Itaja</p>
        </div>
        <p className="small" style={{ color: "#49332F" }}>
          Tu vas être redirigée vers la page de paiement Itaja. Mobile Money,
          carte bancaire ou autre moyen, selon ton pays.
        </p>
      </div>
      <span className="hand">tu reviens ici juste après</span>
      <div className="grow"></div>
      <Link to="/paiement-externe" className="btn">
        Payer 2 500 F
      </Link>
      <p className="small" style={{ textAlign: "center" }}>
        Daloura ne voit jamais tes informations de paiement.
      </p>
    </div>
  );
}
