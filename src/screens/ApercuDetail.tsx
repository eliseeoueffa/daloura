// Généré depuis design/maquettes/Apercu-detail.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function ApercuDetail() {
  return (
    <div className="scr">
      <div className="top">
        <Link to="/apercus" className="back">
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
          Mes 3 aperçus
        </Link>
        <span>2 sur 3</span>
      </div>
      <div style={{ position: "relative" }}>
        <div className="pola" style={{ padding: "10px 10px 0" }}>
          <div className="ph bg-sun" style={{ aspectRatio: "1 / 1.12" }}>
            <img src={IMG.knots} alt="Aperçu : toi en bantu knots" />
          </div>
          <div className="cap" style={{ fontSize: "19px" }}>
            moi, en bantu knots
          </div>
        </div>
        <span
          className="pill on"
          style={{ position: "absolute", top: "20px", left: "20px" }}
        >
          aperçu
        </span>
      </div>
      <div
        className="card"
        style={{ flexDirection: "row", gap: "14px", alignItems: "center" }}
      >
        <div
          className="stk rays"
          style={{ width: "70px", height: "78px", flex: "none" }}
        >
          <img src={IMG.knots} alt="Ton inspiration" />
        </div>
        <div>
          <p className="label">Ton inspiration</p>
          <p className="small">
            Compare la forme et la taille des nœuds avec ta photo d'origine.
          </p>
        </div>
      </div>
      <div className="dots" aria-label="Aperçu 2 sur 3">
        <i></i>
        <i className="on"></i>
        <i></i>
      </div>
      <div className="grow"></div>
      <Link to="/inviter" className="btn">
        Demander l'avis de ton cercle
      </Link>
    </div>
  );
}
