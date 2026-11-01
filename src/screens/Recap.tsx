// Généré depuis design/maquettes/Recap.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function Recap() {
  return (
    <div className="scr wine">
      <div className="top">
        <Link to="/carnet" className="back" style={{ color: "#F5EFE6" }}>
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
        <span className="logo inv" style={{ fontSize: "18px" }}>
          <img
            src={IMG.logoInv}
            alt=""
            style={{ width: "22px", height: "22px" }}
          />
          daloura
        </span>
      </div>
      <div>
        <h1 className="h1">Mes 6 mois de coiffures</h1>
        <span className="hand">juin à novembre 2026</span>
      </div>
      <div style={{ position: "relative", height: "300px" }}>
        <div
          className="pola"
          style={{
            position: "absolute",
            left: "0",
            top: "40px",
            width: "42%",
            transform: "rotate(-9deg)",
          }}
        >
          <span className="tape"></span>
          <div className="ph bg-cream">
            <img src={IMG.knotless} alt="Knotless" />
          </div>
          <div className="cap">juillet : knotless</div>
        </div>
        <div
          className="pola"
          style={{
            position: "absolute",
            left: "29%",
            top: "0",
            width: "42%",
            transform: "rotate(3deg)",
            zIndex: "2",
          }}
        >
          <span className="tape"></span>
          <div className="ph bg-rose">
            <img src={IMG.fulani} alt="Fulani" />
          </div>
          <div className="cap">sept. : fulani</div>
        </div>
        <div
          className="pola"
          style={{
            position: "absolute",
            right: "0",
            top: "50px",
            width: "42%",
            transform: "rotate(10deg)",
          }}
        >
          <span className="tape"></span>
          <div className="ph bg-sun">
            <img src={IMG.knots} alt="Bantu knots" />
          </div>
          <div className="cap">nov. : bantu knots</div>
        </div>
      </div>
      <div className="g3" style={{ gap: "8px" }}>
        <div
          style={{
            background: "#F5EFE6",
            color: "#49332F",
            borderRadius: "10px",
            padding: "10px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: "0",
              fontFamily: "'Corben', Georgia, serif",
              fontWeight: "700",
              fontSize: "22px",
              color: "#702D43",
            }}
          >
            3
          </p>
          <p style={{ margin: "0", fontSize: "12.5px" }}>eras</p>
        </div>
        <div
          style={{
            background: "#F5EFE6",
            color: "#49332F",
            borderRadius: "10px",
            padding: "10px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: "0",
              fontFamily: "'Corben', Georgia, serif",
              fontWeight: "700",
              fontSize: "22px",
              color: "#702D43",
            }}
          >
            15
          </p>
          <p style={{ margin: "0", fontSize: "12.5px" }}>votes reçus</p>
        </div>
        <div
          style={{
            background: "#E8A93A",
            color: "#49332F",
            borderRadius: "10px",
            padding: "10px",
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0", fontSize: "12.5px" }}>
            la préférée du cercle
          </p>
          <p style={{ margin: "0", fontWeight: "750", fontSize: "14px" }}>
            Fulani
          </p>
        </div>
      </div>
      <div className="grow"></div>
      <Link to="/recap" className="btn cream">
        Partager sur WhatsApp
      </Link>{" "}
      <Link to="/recap" className="lnk">
        Enregistrer l'image
      </Link>
    </div>
  );
}
