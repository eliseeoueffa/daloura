// Généré depuis design/maquettes/Recap-paiement.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function RecapPaiement() {
  return (
    <div className="scr">
      <div className="top">
        <Link to="/carnet" className="back">
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
          Carnet
        </Link>
      </div>
      <h1 className="h1">Ton récapitulatif</h1>
      <p className="small">L'offre que tu as choisie :</p>
      <div
        style={{
          background: "#E8A93A",
          borderRadius: "12px",
          padding: "18px 14px 14px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          color: "#49332F",
          position: "relative",
          marginTop: "6px",
        }}
      >
        <span
          className="pill"
          style={{
            position: "absolute",
            top: "-13px",
            left: "14px",
            minHeight: "26px",
            padding: "0 10px",
            background: "#702D43",
            color: "#F5EFE6",
          }}
        >
          6 mois
        </span>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <p
            style={{
              margin: "0",
              fontFamily: "'Corben', Georgia, serif",
              fontWeight: "700",
              fontSize: "18px",
              fontVariantLigatures: "none",
            }}
          >
            My Hair Recap
          </p>
          <p className="h2" style={{ whiteSpace: "nowrap" }}>
            2 000 F
          </p>
        </div>
        <p style={{ margin: "0", fontSize: "14px" }}>
          Tes eras de juin à novembre 2026, réunies dans un recap à garder ou à
          partager.
        </p>
        <div className="row" style={{ gap: "6px" }}>
          <div
            className="pola"
            style={{
              width: "46px",
              padding: "3px 3px 0",
              transform: "rotate(-6deg)",
            }}
          >
            <div className="ph bg-cream">
              <img src={IMG.knotless} alt="" />
            </div>
            <div style={{ height: "7px" }}></div>
          </div>
          <div
            className="pola"
            style={{
              width: "46px",
              padding: "3px 3px 0",
              transform: "rotate(3deg)",
            }}
          >
            <div className="ph bg-rose">
              <img src={IMG.fulani} alt="" />
            </div>
            <div style={{ height: "7px" }}></div>
          </div>
          <div
            className="pola"
            style={{
              width: "46px",
              padding: "3px 3px 0",
              transform: "rotate(-2deg)",
            }}
          >
            <div className="ph bg-sun">
              <img src={IMG.knots} alt="" />
            </div>
            <div style={{ height: "7px" }}></div>
          </div>
          <span
            style={{ fontSize: "13px", fontWeight: "650", marginLeft: "6px" }}
          >
            3 eras incluses
          </span>
        </div>
      </div>
      <div className="card" style={{ gap: "10px" }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <p className="h2">Total</p>
          <p className="h2" style={{ color: "#702D43" }}>
            2 000 F
          </p>
        </div>
        <p className="small">Compte : awa.k@gmail.com</p>
      </div>
      <div
        className="card"
        style={{ background: "#F3DDE1", border: "0", gap: "6px" }}
      >
        <p className="label">Paiement sécurisé par Itaja</p>
        <p className="small" style={{ color: "#49332F" }}>
          Mobile Money, carte bancaire ou autre moyen, selon ton pays.
        </p>
      </div>
      <div className="grow"></div>
      <Link to="/paiement-externe" className="btn">
        Payer 2 000 F
      </Link>{" "}
      <Link to="/carnet" className="lnk">
        Choisir une autre période
      </Link>
    </div>
  );
}
