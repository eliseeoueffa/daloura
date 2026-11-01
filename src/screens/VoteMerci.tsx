// Généré depuis design/maquettes/Vote-merci.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function VoteMerci() {
  return (
    <div className="scr">
      <div className="top">
        <span className="logo">
          <img src={IMG.logo} alt="" />
          daloura
        </span>
      </div>
      <h1 className="h1">Merci pour ton vote !</h1>
      <p className="p" style={{ marginTop: "-8px" }}>
        Awa l'a bien reçu.
      </p>
      <div className="card" style={{ gap: "8px" }}>
        <p className="label">Pour l'instant</p>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="small">Bantu knots, ton vote</span>
          <span className="label" style={{ color: "#8A5A00" }}>
            3
          </span>
        </div>
        <div className="bar">
          <i className="win" style={{ width: "60%" }}></i>
        </div>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="small">Fulani</span>
          <span className="label">2</span>
        </div>
        <div className="bar">
          <i style={{ width: "40%" }}></i>
        </div>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="small">Knotless</span>
          <span className="label">0</span>
        </div>
        <div className="bar">
          <i style={{ width: "0%" }}></i>
        </div>
      </div>
      <div className="grow"></div>
      <div
        className="bg-raies"
        style={{ borderRadius: "16px", padding: "22px 18px" }}
      >
        <div
          style={{
            background: "#F5EFE6",
            borderRadius: "10px",
            padding: "18px 16px",
            display: "flex",
            gap: "14px",
            alignItems: "center",
            position: "relative",
            boxShadow: "0 12px 22px -12px rgba(0,0,0,.5)",
          }}
        >
          <span className="tape" style={{ left: "40%" }}></span>
          <div
            className="stk rays round"
            style={{ width: "76px", height: "76px", flex: "none" }}
          >
            <img src={IMG.locs} alt="" />
          </div>
          <div>
            <p
              className="h2"
              style={{
                fontFamily: "'Corben', Georgia, serif",
                color: "#702D43",
                fontVariantLigatures: "none",
              }}
            >
              Et toi, ton prochain look ?
            </p>
            <p className="small">
              Vois-le sur ton visage avant d'aller au salon. Ton premier essai
              est offert.
            </p>
          </div>
        </div>
      </div>
      <div className="foot">
        <Link to="/" className="btn">
          Essayer sur mon visage
        </Link>
      </div>
    </div>
  );
}
