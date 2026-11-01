// Écran fait à la main (retiré de scripts/import_maquettes.py) : maquette design/maquettes/Apercu-offert.dc.html.
// Montre les coiffures choisies et ses vraies photos (selfie, inspirations) ; l'aperçu reste
// l'illustration de la coiffure tant que l'IA n'est pas branchée.
import { Link } from "react-router";
import { IMG } from "../assets/images";
import { PhotoInspiration } from "../components/PhotoInspiration";
import { useLooks } from "../lib/essai";

export default function ApercuOffert() {
  const look = useLooks()[0];
  return (
    <div className="scr">
      <div className="top">
        <span className="logo">
          <img src={IMG.logo} alt="" />
          daloura
        </span>
        <span className="pill">Perles offertes utilisées</span>
      </div>
      <h1 className="h1">Te voilà en {look.nom.toLowerCase()}</h1>
      <div
        style={{ position: "relative", alignSelf: "center", width: "290px" }}
      >
        <div className="pola" style={{ transform: "rotate(-2deg)" }}>
          <span className="tape"></span>
          <div className="ph bg-cream">
            <img
              src={look.img}
              alt={`Aperçu : toi en ${look.nom.toLowerCase()}`}
            />
          </div>
          <div className="cap" style={{ fontSize: "18px" }}>
            moi, en {look.nom.toLowerCase()} ?
          </div>
        </div>
        <span
          className="pill on"
          style={{
            position: "absolute",
            top: "20px",
            left: "18px",
            zIndex: "3",
          }}
        >
          aperçu
        </span>
        <div
          className="stk rays round"
          style={{
            position: "absolute",
            right: "-14px",
            bottom: "34px",
            width: "74px",
            height: "74px",
            zIndex: "3",
            transform: "rotate(8deg)",
          }}
        >
          <PhotoInspiration slug={look.slug} alt="Ton inspiration" />
        </div>
      </div>
      <div className="alert">
        <span className="ic">i</span>
        <div>
          <b>Un aperçu, pas une promesse.</b>Le rendu final dépend de tes
          cheveux et de ta coiffeuse.
        </div>
      </div>
      <div className="grow"></div>
      <Link to="/offres" className="btn">
        Essayer 3 looks et faire voter
      </Link>{" "}
      <Link to="/era-enregistree" className="btn2">
        Garder dans mon carnet
      </Link>
    </div>
  );
}
