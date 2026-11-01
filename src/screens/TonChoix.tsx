// Généré depuis design/maquettes/Ton-choix.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function TonChoix() {
  return (
    <div className="scr">
      <div className="top">
        <Link to="/suivi-votes" className="back">
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
          Votes
        </Link>
      </div>
      <h1 className="h1">Et toi, tu choisis lequel ?</h1>
      <p className="p">
        Ton cercle préfère les bantu knots. Le dernier mot est à toi.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div
          className="card win"
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: "12px",
            position: "relative",
          }}
        >
          <div
            className="pola"
            style={{
              width: "70px",
              padding: "4px 4px 0",
              flex: "none",
              transform: "rotate(-3deg)",
            }}
          >
            <div className="ph bg-sun">
              <img src={IMG.knots} alt="" />
            </div>
            <div style={{ height: "10px" }}></div>
          </div>
          <div style={{ flex: "1" }}>
            <p className="label">Bantu knots</p>
            <p className="small">Le choix du cercle, 3 votes</p>
          </div>
          <span className="badge" style={{ position: "static" }}>
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path
                d="M5 12.5l4.5 4.5L19 7.5"
                fill="none"
                stroke="#F5EFE6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </span>
        </div>
        <div
          className="card"
          style={{ flexDirection: "row", alignItems: "center", gap: "12px" }}
        >
          <div
            className="pola"
            style={{
              width: "70px",
              padding: "4px 4px 0",
              flex: "none",
              transform: "rotate(2deg)",
            }}
          >
            <div className="ph bg-rose">
              <img src={IMG.fulani} alt="" />
            </div>
            <div style={{ height: "10px" }}></div>
          </div>
          <div style={{ flex: "1" }}>
            <p className="label">Fulani</p>
            <p className="small">2 votes</p>
          </div>
        </div>
        <div
          className="card"
          style={{ flexDirection: "row", alignItems: "center", gap: "12px" }}
        >
          <div
            className="pola"
            style={{
              width: "70px",
              padding: "4px 4px 0",
              flex: "none",
              transform: "rotate(-2deg)",
            }}
          >
            <div className="ph bg-cream">
              <img src={IMG.knotless} alt="" />
            </div>
            <div style={{ height: "10px" }}></div>
          </div>
          <div style={{ flex: "1" }}>
            <p className="label">Knotless</p>
            <p className="small">0 vote</p>
          </div>
        </div>
      </div>
      <span className="hand">c'est toi qui le portes</span>
      <div className="grow"></div>
      <Link to="/era-enregistree" className="btn">
        C'est mon prochain look
      </Link>
      <p className="small" style={{ textAlign: "center" }}>
        Ton cercle verra ton choix sur la page de vote.
      </p>
    </div>
  );
}
