// Généré depuis design/maquettes/Installer-iphone.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function InstallerIphone() {
  return (
    <div className="scr">
      <div className="top">
        <Link to="/era-enregistree" className="back">
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
          Retour
        </Link>
      </div>
      <div
        className="ico"
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "18px",
          alignSelf: "center",
          boxShadow: "0 12px 22px -12px rgba(73,51,47,.6)",
        }}
      >
        <img src={IMG.logoInv} alt="Icône Daloura" />
      </div>
      <h1 className="h1" style={{ textAlign: "center" }}>
        Ajoute Daloura à ton écran d'accueil
      </h1>
      <p className="p" style={{ textAlign: "center" }}>
        Sur iPhone, c'est aussi ce qui te permet de recevoir les notifications
        de ton cercle.
      </p>
      <ol
        style={{
          margin: "0",
          padding: "0",
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <li
          className="card"
          style={{ flexDirection: "row", alignItems: "center", gap: "12px" }}
        >
          <span
            className="badge sign"
            style={{
              position: "static",
              flex: "none",
              width: "28px",
              height: "28px",
            }}
          >
            1
          </span>
          <div>
            <p className="label">Touche le bouton Partager</p>
            <p className="small">En bas de Safari, le carré avec une flèche.</p>
          </div>
        </li>
        <li
          className="card"
          style={{ flexDirection: "row", alignItems: "center", gap: "12px" }}
        >
          <span
            className="badge sign"
            style={{
              position: "static",
              flex: "none",
              width: "28px",
              height: "28px",
            }}
          >
            2
          </span>
          <div>
            <p className="label">Choisis « Sur l'écran d'accueil »</p>
            <p className="small">Fais défiler la liste si tu ne le vois pas.</p>
          </div>
        </li>
        <li
          className="card"
          style={{ flexDirection: "row", alignItems: "center", gap: "12px" }}
        >
          <span
            className="badge sign"
            style={{
              position: "static",
              flex: "none",
              width: "28px",
              height: "28px",
            }}
          >
            3
          </span>
          <div>
            <p className="label">Touche « Ajouter »</p>
            <p className="small">L'icône Daloura apparaît sur ton écran.</p>
          </div>
        </li>
      </ol>
      <div className="grow"></div>
      <Link to="/era-enregistree" className="btn2">
        C'est fait
      </Link>
    </div>
  );
}
