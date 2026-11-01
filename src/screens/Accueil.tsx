// Généré depuis design/maquettes/Main.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function Accueil() {
  return (
    <div className="scr">
      <div className="band" style={{ paddingBottom: "28px" }}>
        <div className="top">
          <span className="logo inv">
            <img src={IMG.logoInv} alt="" />
            daloura
          </span>
          <Link to="/code-saisie" className="back" style={{ color: "#F5EFE6" }}>
            Se connecter
          </Link>
        </div>
        <div style={{ position: "relative", height: "300px" }}>
          <div
            className="pola"
            style={{
              position: "absolute",
              left: "4px",
              top: "40px",
              width: "150px",
              transform: "rotate(-9deg)",
            }}
          >
            <span className="tape"></span>
            <div className="ph bg-rose">
              <img src={IMG.fulani} alt="Aperçu fulani" />
            </div>
            <div className="cap">fulani ?</div>
          </div>
          <div
            className="pola"
            style={{
              position: "absolute",
              left: "104px",
              top: "0",
              width: "150px",
              transform: "rotate(3deg)",
              zIndex: "2",
            }}
          >
            <span className="tape"></span>
            <div className="ph bg-sun">
              <img src={IMG.knots} alt="Aperçu bantu knots" />
            </div>
            <div className="cap">bantu knots ?</div>
          </div>
          <div
            className="pola"
            style={{
              position: "absolute",
              left: "196px",
              top: "52px",
              width: "150px",
              transform: "rotate(10deg)",
            }}
          >
            <span className="tape"></span>
            <div className="ph bg-cream">
              <img src={IMG.knotless} alt="Aperçu knotless" />
            </div>
            <div className="cap">knotless ?</div>
          </div>
        </div>
      </div>
      <h1 className="h1">Vois-toi avant de changer.</h1>
      <p className="p">
        Ajoute la coiffure qui te fait envie, prends un selfie : tu vois le look
        sur ton visage avant d'aller au salon.
      </p>
      <span className="hand">ton premier essai est offert</span>
      <div className="grow"></div>
      <Link to="/bibliotheque-vide" className="btn">
        Essayer un look
      </Link>
      <p className="small" style={{ textAlign: "center" }}>
        Pas besoin de compte pour commencer.
      </p>
    </div>
  );
}
