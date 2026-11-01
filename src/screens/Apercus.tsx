// Généré depuis design/maquettes/Apercus.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function Apercus() {
  return (
    <div className="scr">
      <div className="top">
        <span className="logo">
          <img src={IMG.logo} alt="" />
          daloura
        </span>
        <span className="pill">2 essais restants</span>
      </div>
      <h1 className="h1">Te voilà, en trois looks</h1>
      <p className="small">Touche un aperçu pour le voir en grand.</p>
      <div style={{ position: "relative", height: "330px" }}>
        <Link
          to="/apercu-detail"
          className="pola"
          style={{
            position: "absolute",
            left: "0",
            top: "34px",
            width: "172px",
            transform: "rotate(-8deg)",
            textDecoration: "none",
            display: "block",
          }}
        >
          <span className="tape"></span>
          <div className="ph bg-rose">
            <img src={IMG.fulani} alt="Aperçu fulani" />
          </div>
          <div className="cap">fulani</div>
        </Link>{" "}
        <Link
          to="/apercu-detail"
          className="pola"
          style={{
            position: "absolute",
            left: "92px",
            top: "0",
            width: "172px",
            transform: "rotate(2deg)",
            textDecoration: "none",
            display: "block",
            zIndex: "2",
          }}
        >
          <span className="tape"></span>
          <div className="ph bg-sun">
            <img src={IMG.knots} alt="Aperçu bantu knots" />
          </div>
          <div className="cap">bantu knots</div>
        </Link>{" "}
        <Link
          to="/apercu-detail"
          className="pola"
          style={{
            position: "absolute",
            left: "178px",
            top: "44px",
            width: "172px",
            transform: "rotate(9deg)",
            textDecoration: "none",
            display: "block",
          }}
        >
          <span className="tape"></span>
          <div className="ph bg-cream">
            <img src={IMG.knotless} alt="Aperçu knotless" />
          </div>
          <div className="cap">knotless</div>
        </Link>
      </div>
      <div className="alert">
        <span className="ic">i</span>
        <div>
          <b>Un aperçu, pas une promesse.</b>Le rendu final dépend de tes
          cheveux et de ta coiffeuse.
        </div>
      </div>
      <div className="grow"></div>
      <Link to="/inviter" className="btn">
        Demander l'avis de ton cercle
      </Link>{" "}
      <Link to="/choix-essai" className="lnk">
        Refaire un essai
      </Link>
    </div>
  );
}
