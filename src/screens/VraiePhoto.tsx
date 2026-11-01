// Généré depuis design/maquettes/Vraie-photo.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function VraiePhoto() {
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
        <span className="pill">Era 3</span>
      </div>
      <h1 className="h1">Ta coiffure est faite ?</h1>
      <p className="p">
        Ajoute la photo de tes bantu knots, à côté de ton aperçu.
      </p>
      <div style={{ position: "relative", height: "250px" }}>
        <div
          className="pola"
          style={{
            position: "absolute",
            left: "0",
            top: "16px",
            width: "165px",
            transform: "rotate(-5deg)",
          }}
        >
          <span className="tape"></span>
          <div className="ph bg-sun">
            <img src={IMG.knots} alt="Ton aperçu" />
          </div>
          <div className="cap">l'aperçu</div>
        </div>
        <Link
          to="/era-detail"
          className="pola"
          style={{
            position: "absolute",
            right: "0",
            top: "0",
            width: "165px",
            transform: "rotate(4deg)",
            textDecoration: "none",
            display: "block",
          }}
        >
          <div
            className="ph"
            style={{
              background: "#FFFBF4",
              border: "2px dashed rgba(112,45,67,.35)",
              boxSizing: "border-box",
              alignItems: "center",
              color: "#702D43",
              fontSize: "36px",
            }}
          >
            +
          </div>
          <div className="cap">la vraie ?</div>
        </Link>
      </div>
      <span className="hand">ton avant / après</span>
      <p className="small">
        La photo reste privée dans ton carnet. Tu choisis si tu la partages.
      </p>
      <div className="grow"></div>
      <Link to="/era-detail" className="btn">
        Prendre la photo
      </Link>{" "}
      <Link to="/era-detail" className="btn2">
        Choisir dans ma galerie
      </Link>
    </div>
  );
}
