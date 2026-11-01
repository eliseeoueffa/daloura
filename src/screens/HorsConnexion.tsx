// Généré depuis design/maquettes/Hors-connexion.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function HorsConnexion() {
  return (
    <div className="scr">
      <div className="top">
        <span className="logo">
          <img src={IMG.logo} alt="" />
          daloura
        </span>
      </div>
      <div
        className="alert"
        style={{ background: "#49332F", color: "#F5EFE6" }}
      >
        <span
          className="ic"
          style={{ background: "#E8A93A", color: "#49332F" }}
        >
          !
        </span>
        <div>
          <b>Pas de connexion internet</b>On réessaie tout seul dès que le
          réseau revient.
        </div>
      </div>
      <div className="grow"></div>
      <svg
        viewBox="0 0 64 64"
        width="72"
        height="72"
        style={{ alignSelf: "center" }}
        aria-hidden="true"
      >
        <g fill="none" stroke="#702D43" strokeWidth="3.5" strokeLinecap="round">
          <path d="M8 26 Q32 6 56 26"></path>
          <path d="M16 35 Q32 21 48 35"></path>
          <path d="M24 44 Q32 37 40 44"></path>
          <path d="M12 12 L52 56"></path>
        </g>
        <circle cx="32" cy="52" r="3.5" fill="#702D43"></circle>
      </svg>
      <h1 className="h1" style={{ textAlign: "center" }}>
        Le réseau a lâché
      </h1>
      <p className="p" style={{ textAlign: "center" }}>
        Ton carnet reste consultable. Les essais, les votes et les paiements
        reprennent quand la connexion revient.
      </p>
      <p className="small" style={{ textAlign: "center" }}>
        Un essai en cours n'est pas perdu : on te prévient quand il est prêt.
      </p>
      <div className="grow"></div>
      <Link to="/hors-connexion" className="btn">
        Réessayer
      </Link>{" "}
      <Link to="/carnet" className="lnk">
        Voir mon carnet
      </Link>
    </div>
  );
}
