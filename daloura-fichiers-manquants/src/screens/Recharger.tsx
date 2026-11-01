// Généré depuis design/maquettes/Recharger.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function Recharger() {
  return (
    <div className="scr" style={{ gap: "14px" }}>
      <div className="top">
        <Link to="/profil" className="back">
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
          Profil
        </Link>
        <span className="pill">2 essais restants</span>
      </div>
      <h1 className="h1">Recharge tes essais</h1>
      <p className="p">
        Choisis l'offre qui te va. Tes essais s'ajoutent à ceux qu'il te reste.
      </p>
      <div style={{ position: "relative", height: "96px" }}>
        <div
          className="stk rays"
          style={{
            position: "absolute",
            left: "6px",
            top: "10px",
            width: "70px",
            height: "78px",
            transform: "rotate(-9deg)",
          }}
        >
          <img src={IMG.afro} alt="" />
        </div>
        <div
          className="stk rays"
          style={{
            position: "absolute",
            left: "64px",
            top: "0",
            width: "70px",
            height: "78px",
            transform: "rotate(2deg)",
            zIndex: "2",
          }}
        >
          <img src={IMG.locs} alt="" />
        </div>
        <div
          className="stk rays"
          style={{
            position: "absolute",
            left: "122px",
            top: "12px",
            width: "70px",
            height: "78px",
            transform: "rotate(10deg)",
          }}
        >
          <img src={IMG.perruque} alt="" />
        </div>
        <span
          className="hand"
          style={{
            position: "absolute",
            right: "0",
            top: "24px",
            width: "120px",
          }}
        >
          ta prochaine era t'attend
        </span>
      </div>
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
      <p className="small">
        Ton hair recap sur 3, 6 ou 12 mois se crée depuis ton{" "}
        <Link to="/carnet" style={{ color: "#702D43", fontWeight: "650" }}>
          carnet
        </Link>
        .
      </p>
      <div className="grow"></div>
      <Link to="/paiement" className="btn">
        Continuer avec My Hair Era
      </Link>
      <p className="small" style={{ textAlign: "center" }}>
        Paiement sécurisé par Itaja. Pas d'abonnement.
      </p>
    </div>
  );
}
