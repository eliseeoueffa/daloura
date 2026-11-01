// Généré depuis design/maquettes/Attente.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function Attente() {
  return (
    <div className="scr wine">
      <div className="top">
        <span className="logo inv">
          <img src={IMG.logoInv} alt="" />
          daloura
        </span>
      </div>
      <div
        className="row"
        style={{ justifyContent: "center", gap: "14px", marginTop: "10px" }}
      >
        <div
          className="face"
          style={{
            width: "88px",
            height: "88px",
            boxShadow: "0 0 0 4px #FFFDF8",
          }}
        >
          <img src={IMG.selfie} alt="Ton selfie" />
        </div>
        <span style={{ fontSize: "24px", color: "#E8A93A" }}>+</span>
        <div className="stk rays" style={{ width: "88px", height: "96px" }}>
          <img src={IMG.knotless} alt="Inspiration knotless" />
        </div>
      </div>
      <div
        className="pola"
        style={{
          width: "210px",
          alignSelf: "center",
          transform: "rotate(-3deg)",
          marginTop: "8px",
        }}
      >
        <span className="tape"></span>
        <div
          className="ph"
          style={{ background: "linear-gradient(160deg, #EADFCF, #D9C4B5)" }}
        >
          <img
            src={IMG.knotless}
            alt=""
            style={{ filter: "blur(10px) saturate(.6)", opacity: ".65" }}
          />
        </div>
        <div className="cap">ça se révèle…</div>
      </div>
      <h1 className="h1" style={{ textAlign: "center" }}>
        On prépare ton aperçu…
      </h1>
      <div
        className="bar"
        role="progressbar"
        aria-label="Création de l'aperçu"
        aria-valuenow={60}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ background: "rgba(245,239,230,.2)" }}
      >
        <i className="win" style={{ width: "60%" }}></i>
      </div>
      <p className="small" style={{ textAlign: "center" }}>
        Environ 30 secondes, parfois jusqu'à 2 minutes. Tu peux fermer l'app, on
        te prévient.
      </p>
      <div className="grow"></div>
      <Link to="/apercu-offert" className="btn cream">
        Voir l'aperçu (démo)
      </Link>{" "}
      <Link to="/echec-creation" className="lnk">
        Voir le cas d'échec (démo)
      </Link>
    </div>
  );
}
