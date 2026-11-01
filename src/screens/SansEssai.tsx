// Généré depuis design/maquettes/Sans-essai.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function SansEssai() {
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
        <span className="pill">0 essai</span>
      </div>
      <div className="grow"></div>
      <div
        style={{
          position: "relative",
          alignSelf: "center",
          width: "230px",
          height: "150px",
        }}
      >
        <div
          className="stk rays"
          style={{
            position: "absolute",
            left: "0",
            top: "20px",
            width: "90px",
            height: "100px",
            transform: "rotate(-9deg)",
            opacity: ".6",
          }}
        >
          <img src={IMG.afro} alt="" />
        </div>
        <div
          className="stk rays"
          style={{
            position: "absolute",
            left: "70px",
            top: "0",
            width: "90px",
            height: "100px",
            transform: "rotate(2deg)",
            zIndex: "2",
          }}
        >
          <img src={IMG.perruque} alt="" />
        </div>
        <div
          className="stk rays"
          style={{
            position: "absolute",
            left: "140px",
            top: "24px",
            width: "90px",
            height: "100px",
            transform: "rotate(10deg)",
            opacity: ".6",
          }}
        >
          <img src={IMG.locs} alt="" />
        </div>
      </div>
      <h1 className="h1" style={{ textAlign: "center" }}>
        Tu as utilisé tous tes essais
      </h1>
      <p className="p" style={{ textAlign: "center" }}>
        Recharge pour essayer tes prochaines coiffures et faire voter ton
        cercle.
      </p>
      <div className="grow"></div>
      <Link to="/recharger" className="btn">
        Recharger
      </Link>{" "}
      <Link to="/carnet" className="lnk">
        Revoir mon carnet
      </Link>
    </div>
  );
}
