// Généré depuis design/maquettes/Carnet.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function Carnet() {
  return (
    <div className="scr" style={{ paddingBottom: "0", gap: "14px" }}>
      <div className="top">
        <span className="logo">
          <img src={IMG.logo} alt="" />
          daloura
        </span>
        <span className="pill">3 eras</span>
      </div>
      <h1 className="h1">Mon carnet</h1>
      <div
        style={{
          background: "#E8A93A",
          borderRadius: "14px",
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          color: "#49332F",
        }}
      >
        <div className="row" style={{ gap: "10px" }}>
          <div
            style={{
              position: "relative",
              width: "62px",
              height: "52px",
              flex: "none",
            }}
          >
            <div
              className="pola"
              style={{
                position: "absolute",
                left: "0",
                top: "4px",
                width: "34px",
                padding: "3px 3px 0",
                transform: "rotate(-10deg)",
              }}
            >
              <div className="ph bg-cream">
                <img src={IMG.knotless} alt="" />
              </div>
              <div style={{ height: "6px" }}></div>
            </div>
            <div
              className="pola"
              style={{
                position: "absolute",
                left: "24px",
                top: "0",
                width: "34px",
                padding: "3px 3px 0",
                transform: "rotate(8deg)",
              }}
            >
              <div className="ph bg-rose">
                <img src={IMG.fulani} alt="" />
              </div>
              <div style={{ height: "6px" }}></div>
            </div>
          </div>
          <div>
            <p
              style={{
                margin: "0",
                fontFamily: "'Corben', Georgia, serif",
                fontWeight: "700",
                fontSize: "18px",
                fontVariantLigatures: "none",
              }}
            >
              Crée ton hair recap
            </p>
            <p style={{ margin: "0", fontSize: "13.5px" }}>
              Toutes tes coiffures réunies, à garder ou à partager.
            </p>
          </div>
        </div>
        <div className="g3" style={{ gap: "6px" }}>
          <span
            style={{
              background: "#F5EFE6",
              borderRadius: "8px",
              padding: "7px 4px",
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
              background: "#702D43",
              color: "#F5EFE6",
              borderRadius: "8px",
              padding: "7px 4px",
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
              padding: "7px 4px",
              textAlign: "center",
              fontSize: "13px",
              fontWeight: "650",
            }}
          >
            12 mois
            <br />4 000 F
          </span>
        </div>
        <Link
          to="/recap-paiement"
          className="btn"
          style={{ minHeight: "46px" }}
        >
          Créer mon recap de 6 mois
        </Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div
          className="card"
          style={{
            flexDirection: "row",
            gap: "12px",
            alignItems: "center",
            padding: "12px",
          }}
        >
          <div
            className="pola"
            style={{
              width: "66px",
              padding: "4px 4px 0",
              flex: "none",
              transform: "rotate(-3deg)",
            }}
          >
            <div className="ph bg-sun">
              <img src={IMG.knots} alt="" />
            </div>
            <div style={{ height: "9px" }}></div>
          </div>
          <Link
            to="/vraie-photo"
            style={{
              width: "54px",
              height: "66px",
              border: "2px dashed rgba(112,45,67,.35)",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#702D43",
              fontSize: "22px",
              flex: "none",
              textDecoration: "none",
            }}
            aria-label="Ajouter la vraie photo"
          >
            +
          </Link>
          <div style={{ minWidth: "0" }}>
            <p className="small" style={{ margin: "0" }}>
              Era 3, en cours
            </p>
            <p className="label">Bantu knots</p>
            <p className="small">Salon le 7 novembre</p>
          </div>
        </div>
        <div
          className="card"
          style={{
            flexDirection: "row",
            gap: "12px",
            alignItems: "center",
            padding: "12px",
          }}
        >
          <div
            className="pola"
            style={{
              width: "66px",
              padding: "4px 4px 0",
              flex: "none",
              transform: "rotate(2deg)",
            }}
          >
            <div className="ph bg-rose">
              <img src={IMG.fulani} alt="" />
            </div>
            <div style={{ height: "9px" }}></div>
          </div>
          <div
            className="pola"
            style={{
              width: "54px",
              padding: "4px 4px 0",
              flex: "none",
              transform: "rotate(-4deg)",
            }}
          >
            <div className="ph" style={{ background: "#D9C4B5" }}>
              <img src={IMG.fulani} alt="" />
            </div>
            <div style={{ height: "9px" }}></div>
          </div>
          <div style={{ minWidth: "0" }}>
            <p className="small" style={{ margin: "0" }}>
              Era 2
            </p>
            <Link
              to="/era-detail"
              className="label"
              style={{ color: "#702D43", display: "block" }}
            >
              Fulani
            </Link>
            <p className="hand" style={{ fontSize: "15px", margin: "0" }}>
              aperçu + vraie photo
            </p>
          </div>
        </div>
        <div
          className="card"
          style={{
            flexDirection: "row",
            gap: "12px",
            alignItems: "center",
            padding: "12px",
          }}
        >
          <div
            className="pola"
            style={{
              width: "66px",
              padding: "4px 4px 0",
              flex: "none",
              transform: "rotate(-2deg)",
            }}
          >
            <div className="ph bg-cream">
              <img src={IMG.knotless} alt="" />
            </div>
            <div style={{ height: "9px" }}></div>
          </div>
          <div
            className="pola"
            style={{
              width: "54px",
              padding: "4px 4px 0",
              flex: "none",
              transform: "rotate(3deg)",
            }}
          >
            <div className="ph" style={{ background: "#D9C4B5" }}>
              <img src={IMG.knotless} alt="" />
            </div>
            <div style={{ height: "9px" }}></div>
          </div>
          <div style={{ minWidth: "0" }}>
            <p className="small" style={{ margin: "0" }}>
              Era 1
            </p>
            <p className="label">Knotless</p>
            <p className="small">Juillet 2026</p>
          </div>
        </div>
      </div>
      <div className="grow"></div>
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
