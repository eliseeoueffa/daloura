// Généré depuis design/maquettes/Bibliotheque.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function Bibliotheque() {
  return (
    <div className="scr">
      <div className="top">
        <Link to="/bibliotheque-vide" className="back">
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
        <span className="pill">6 photos</span>
      </div>
      <h1 className="h1">Tes inspirations</h1>
      <div className="g3" style={{ rowGap: "14px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div className="stk rays" style={{ height: "120px" }}>
            <img src={IMG.knotless} alt="" />
          </div>
          <span className="stk-name">Knotless</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div className="stk rays" style={{ height: "120px" }}>
            <img src={IMG.fulani} alt="" />
          </div>
          <span className="stk-name">Fulani</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div className="stk rays" style={{ height: "120px" }}>
            <img src={IMG.knots} alt="" />
          </div>
          <span className="stk-name">Bantu knots</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div className="stk rays" style={{ height: "120px" }}>
            <img src={IMG.perruque} alt="" />
          </div>
          <span className="stk-name">Perruque</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div className="stk rays" style={{ height: "120px" }}>
            <img src={IMG.afro} alt="" />
          </div>
          <span className="stk-name">Cheveux naturels</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div className="stk rays" style={{ height: "120px" }}>
            <img src={IMG.locs} alt="" />
          </div>
          <span className="stk-name">Locks</span>
        </div>
      </div>
      <div className="alert">
        <span className="ic">+</span>
        <div>Télécharge tes inspirations depuis ta galerie.</div>
      </div>
      <Link to="/bibliotheque" className="btn2">
        Ajouter des photos
      </Link>
      <div className="grow"></div>
      <Link to="/selfie" className="btn">
        Continuer avec ton selfie
      </Link>
    </div>
  );
}
