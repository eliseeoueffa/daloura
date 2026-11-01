// Généré depuis design/maquettes/Era-enregistree.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function EraEnregistree() {
  return (
    <div className="scr" style={{ paddingBottom: "0" }}>
      <div className="top">
        <span className="logo">
          <img src={IMG.logo} alt="" />
          daloura
        </span>
        <span className="pill">Mon carnet</span>
      </div>
      <h1 className="h1">Ton prochain look est dans ton carnet</h1>
      <div
        className="card"
        style={{
          flexDirection: "row",
          gap: "16px",
          alignItems: "center",
          padding: "16px",
        }}
      >
        <div
          className="pola"
          style={{ width: "110px", flex: "none", transform: "rotate(-4deg)" }}
        >
          <span className="tape"></span>
          <div className="ph bg-sun">
            <img src={IMG.knots} alt="" />
          </div>
          <div className="cap" style={{ fontSize: "13px" }}>
            era 1
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <p
            className="h2"
            style={{
              fontFamily: "'Corben', Georgia, serif",
              color: "#702D43",
              fontVariantLigatures: "none",
            }}
          >
            Bantu knots
          </p>
          <p className="small">Salon samedi 7 novembre</p>
          <p className="small">Choisi avec 5 votes</p>
          <span className="hand" style={{ fontSize: "17px" }}>
            ma prochaine era !
          </span>
        </div>
      </div>
      <div
        className="card"
        style={{
          flexDirection: "row",
          gap: "12px",
          alignItems: "center",
          borderStyle: "dashed",
          background: "transparent",
        }}
      >
        <Link
          to="/vraie-photo"
          aria-label="Ajouter la vraie photo"
          style={{
            width: "52px",
            height: "62px",
            border: "2px dashed rgba(112,45,67,.35)",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#702D43",
            fontSize: "24px",
            flex: "none",
            textDecoration: "none",
          }}
        >
          +
        </Link>
        <p className="small">
          Après le salon, on te rappelle d'ajouter la photo de ta vraie coiffure
          pour compléter ton era.
        </p>
      </div>
      <div className="grow"></div>
      <Link to="/installer-android" className="btn">
        Installer Daloura sur mon téléphone
      </Link>{" "}
      <Link to="/installer-iphone" className="lnk">
        Sur iPhone
      </Link>
      <nav className="tabbar" aria-label="Navigation">
        <Link to="/carnet" className="on">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="3.5" width="14" height="17" rx="2"></rect>
              <path d="M9 3.5v17M12.5 8h3.5M12.5 11.5h3.5"></path>
            </g>
          </svg>
          Carnet
        </Link>{" "}
        <Link to="/choix-essai">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <ellipse cx="12" cy="9.5" rx="5.5" ry="6.5"></ellipse>
              <path d="M12 16v5M9.5 21h5M10 8l2.2-2"></path>
            </g>
          </svg>
          Essayer
        </Link>{" "}
        <Link to="/profil">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8.5" r="3.5"></circle>
              <path d="M5 20c1-3.8 3.8-5.5 7-5.5s6 1.7 7 5.5"></path>
            </g>
          </svg>
          Profil
        </Link>
      </nav>
    </div>
  );
}
