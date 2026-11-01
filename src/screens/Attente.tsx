// Écran fait à la main (retiré de scripts/import_maquettes.py) : maquette design/maquettes/Attente.dc.html.
// Montre les coiffures choisies et ses vraies photos (selfie, inspirations) ; l'aperçu reste
// l'illustration de la coiffure tant que l'IA n'est pas branchée.
import { Link } from "react-router";
import { IMG } from "../assets/images";
import { PhotoInspiration } from "../components/PhotoInspiration";
import { useLooks } from "../lib/essai";
import { useSelfieAffiche } from "../lib/photos";

export default function Attente() {
  const looks = useLooks();
  const look = looks[0];
  const { selfie, selfieStyle } = useSelfieAffiche();
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
          <img src={selfie} alt="Ton selfie" style={selfieStyle} />
        </div>
        <span style={{ fontSize: "24px", color: "#E8A93A" }}>+</span>
        <div className="stk rays" style={{ width: "88px", height: "96px" }}>
          <PhotoInspiration slug={look.slug} alt={`Inspiration ${look.nom}`} />
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
            src={look.img}
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
      <Link
        to={looks.length > 1 ? "/apercus" : "/apercu-offert"}
        className="btn cream"
      >
        Voir l'aperçu (démo)
      </Link>{" "}
      <Link to="/echec-creation" className="lnk">
        Voir le cas d'échec (démo)
      </Link>
    </div>
  );
}
