// Généré depuis design/maquettes/Echec-creation.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function EchecCreation() {
  return (
    <div className="scr">
      <div className="top">
        <span className="logo">
          <img src={IMG.logo} alt="" />
          daloura
        </span>
      </div>
      <div className="grow"></div>
      <div
        style={{ position: "relative", alignSelf: "center", width: "230px" }}
      >
        <div className="pola" style={{ transform: "rotate(-3deg)" }}>
          <span className="tape"></span>
          <div
            className="ph"
            style={{
              background: "#EADFCF",
              border: "2px dashed rgba(112,45,67,.3)",
              boxSizing: "border-box",
              alignItems: "center",
            }}
          >
            <span className="hand" style={{ fontSize: "22px" }}>
              oups…
            </span>
          </div>
          <div className="cap">pas cette fois</div>
        </div>
        <div
          className="stk"
          style={{
            position: "absolute",
            right: "-24px",
            top: "30px",
            width: "70px",
            height: "78px",
            background: "#D8CFC4",
            filter: "blur(1.2px) grayscale(.5)",
            transform: "rotate(9deg)",
          }}
        >
          <img src={IMG.afro} alt="" />
        </div>
      </div>
      <h1 className="h1" style={{ textAlign: "center" }}>
        Ton aperçu n'a pas pu être créé
      </h1>
      <p className="p" style={{ textAlign: "center" }}>
        La coiffure de ta photo d'inspiration n'est pas assez visible. Ton essai
        n'a pas été utilisé.
      </p>
      <div className="grow"></div>
      <Link to="/choix-essai" className="btn">
        Choisir une autre inspiration
      </Link>{" "}
      <Link to="/attente" className="btn2">
        Réessayer avec la même photo
      </Link>
    </div>
  );
}
