// Généré depuis design/maquettes/Vote-ferme.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function VoteFerme() {
  return (
    <div className="scr">
      <div className="top">
        <span className="logo">
          <img src={IMG.logo} alt="" />
          daloura
        </span>
      </div>
      <h1 className="h1">Le vote est terminé</h1>
      <p className="p">Awa a fait son choix. Merci d'être passée.</p>
      <div
        style={{ position: "relative", alignSelf: "center", width: "250px" }}
      >
        <div className="pola" style={{ transform: "rotate(-3deg)" }}>
          <span className="tape"></span>
          <div className="ph bg-sun">
            <img src={IMG.knots} alt="Le look choisi par Awa" />
          </div>
          <div className="cap" style={{ fontSize: "18px" }}>
            son choix : bantu knots
          </div>
        </div>
        <span
          className="pill sign"
          style={{
            position: "absolute",
            top: "18px",
            right: "-8px",
            transform: "rotate(8deg)",
          }}
        >
          choisi
        </span>
      </div>
      <div className="grow"></div>
      <p
        className="h2"
        style={{
          fontFamily: "'Corben', Georgia, serif",
          color: "#702D43",
          fontVariantLigatures: "none",
        }}
      >
        À ton tour de te voir avant de changer
      </p>
      <Link to="/" className="btn">
        Essayer sur mon visage
      </Link>
      <p className="small" style={{ textAlign: "center" }}>
        Ton premier essai est offert.
      </p>
    </div>
  );
}
