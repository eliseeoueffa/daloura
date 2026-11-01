// Généré depuis design/maquettes/Era-detail.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function EraDetail() {
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
        <span className="pill">Era 2</span>
      </div>
      <h1 className="h1">Fulani</h1>
      <div style={{ position: "relative", height: "260px" }}>
        <div
          className="pola"
          style={{
            position: "absolute",
            left: "0",
            top: "18px",
            width: "172px",
            transform: "rotate(-5deg)",
          }}
        >
          <span className="tape"></span>
          <div className="ph bg-rose">
            <img src={IMG.fulani} alt="L'aperçu" />
          </div>
          <div className="cap">l'aperçu</div>
        </div>
        <div
          className="pola"
          style={{
            position: "absolute",
            right: "0",
            top: "0",
            width: "172px",
            transform: "rotate(4deg)",
            zIndex: "2",
          }}
        >
          <span className="tape"></span>
          <div className="ph" style={{ background: "#D9C4B5" }}>
            <img src={IMG.fulani} alt="La vraie photo" />
          </div>
          <div className="cap">la vraie !</div>
        </div>
      </div>
      <div className="card" style={{ gap: "4px" }}>
        <p className="label">Choisie avec 4 votes sur 6</p>
        <p className="small">Salon le 12 septembre 2026, portée 6 semaines</p>
      </div>
      <div className="note" style={{ transform: "rotate(-1.5deg)" }}>
        « Les perles, ça te va trop bien. »<br />
        <span style={{ fontSize: "15px", color: "#7A5E57" }}>Kossi</span>
      </div>
      <div className="grow"></div>
      <Link to="/era-detail" className="btn2">
        Partager mon avant/après
      </Link>{" "}
      <Link to="/era-detail" className="lnk" style={{ color: "#A1262E" }}>
        Supprimer cette era
      </Link>
    </div>
  );
}
