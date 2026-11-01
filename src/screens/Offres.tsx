// Généré depuis design/maquettes/Offres.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function Offres() {
  return (
    <div className="scr" style={{ gap: "14px" }}>
      <div className="top">
        <Link to="/apercu-offert" className="back">
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
        <span className="pill">0 essai</span>
      </div>
      <div style={{ position: "relative", height: "104px" }}>
        <div
          className="stk rays"
          style={{
            position: "absolute",
            left: "10px",
            top: "12px",
            width: "76px",
            height: "84px",
            transform: "rotate(-9deg)",
          }}
        >
          <img src={IMG.fulani} alt="" />
        </div>
        <div
          className="stk rays"
          style={{
            position: "absolute",
            left: "74px",
            top: "0",
            width: "76px",
            height: "84px",
            transform: "rotate(2deg)",
            zIndex: "2",
          }}
        >
          <img src={IMG.knots} alt="" />
        </div>
        <div
          className="stk rays"
          style={{
            position: "absolute",
            left: "138px",
            top: "14px",
            width: "76px",
            height: "84px",
            transform: "rotate(10deg)",
          }}
        >
          <img src={IMG.knotless} alt="" />
        </div>
        <span
          className="hand"
          style={{
            position: "absolute",
            right: "0",
            top: "26px",
            width: "110px",
          }}
        >
          3 looks, ton cercle choisit
        </span>
      </div>
      <h1 className="h1">Ton rendez-vous approche ?</h1>
      <div
        className="card"
        style={{ position: "relative", marginTop: "10px", paddingTop: "18px" }}
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
          3 coiffures
        </span>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <p className="h2">My Hair Moment</p>
          <p className="h2" style={{ color: "#702D43", whiteSpace: "nowrap" }}>
            1 000 F
          </p>
        </div>
        <p className="small">
          1 essai : tu télécharges 3 inspirations et ton cercle choisit.
        </p>
      </div>
      <div
        className="card on"
        style={{ position: "relative", marginTop: "10px", paddingTop: "18px" }}
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
      <div
        style={{
          background: "#E8A93A",
          borderRadius: "12px",
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          color: "#49332F",
        }}
      >
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
            Bonus : My Hair Recap
          </p>
          <span className="pill" style={{ background: "#F5EFE6" }}>
            en plus
          </span>
        </div>
        <p style={{ margin: "0", fontSize: "14px" }}>
          Ton récap de coiffures sur 3, 6 ou 12 mois, à créer depuis ton carnet.
        </p>
        <div className="g3" style={{ gap: "6px" }}>
          <span
            style={{
              background: "#F5EFE6",
              borderRadius: "8px",
              padding: "6px 4px",
              textAlign: "center",
              fontSize: "13px",
              fontWeight: "650",
            }}
          >
            3 mois
            <br />1 000 F
          </span>{" "}
          <span
            style={{
              background: "#F5EFE6",
              borderRadius: "8px",
              padding: "6px 4px",
              textAlign: "center",
              fontSize: "13px",
              fontWeight: "650",
            }}
          >
            6 mois
            <br />2 000 F
          </span>{" "}
          <span
            style={{
              background: "#F5EFE6",
              borderRadius: "8px",
              padding: "6px 4px",
              textAlign: "center",
              fontSize: "13px",
              fontWeight: "650",
            }}
          >
            12 mois
            <br />4 000 F
          </span>
        </div>
      </div>
      <div className="grow"></div>
      <Link to="/paiement" className="btn">
        Continuer avec My Hair Era
      </Link>
      <p className="small" style={{ textAlign: "center" }}>
        Pas d'abonnement. Tu paies seulement quand tu en as besoin.
      </p>
    </div>
  );
}
