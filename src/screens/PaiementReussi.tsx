// Généré depuis design/maquettes/Paiement-reussi.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function PaiementReussi() {
  return (
    <div className="scr wine">
      <div className="top">
        <span className="logo inv">
          <img src={IMG.logoInv} alt="" />
          daloura
        </span>
      </div>
      <div className="grow"></div>
      <div
        style={{
          position: "relative",
          alignSelf: "center",
          width: "280px",
          height: "220px",
        }}
      >
        <div
          className="stk rays round"
          style={{
            position: "absolute",
            left: "0",
            top: "40px",
            width: "110px",
            height: "110px",
            transform: "rotate(-10deg)",
          }}
        >
          <img src={IMG.fulani} alt="" />
        </div>
        <div
          className="stk rays round"
          style={{
            position: "absolute",
            left: "85px",
            top: "0",
            width: "120px",
            height: "120px",
            zIndex: "2",
          }}
        >
          <img src={IMG.knots} alt="" />
        </div>
        <div
          className="stk rays round"
          style={{
            position: "absolute",
            left: "170px",
            top: "50px",
            width: "110px",
            height: "110px",
            transform: "rotate(10deg)",
          }}
        >
          <img src={IMG.knotless} alt="" />
        </div>
      </div>
      <h1 className="h1" style={{ textAlign: "center" }}>
        C'est payé : tu as 3 essais
      </h1>
      <p className="p" style={{ textAlign: "center" }}>
        Choisis 3 coiffures dans ta bibliothèque. Ton cercle pourra voter juste
        après.
      </p>
      <div className="grow"></div>
      <Link to="/choix-3" className="btn cream">
        Choisir mes 3 coiffures
      </Link>
      <p className="small" style={{ textAlign: "center" }}>
        Un reçu t'a été envoyé à awa.k@gmail.com.
      </p>
    </div>
  );
}
