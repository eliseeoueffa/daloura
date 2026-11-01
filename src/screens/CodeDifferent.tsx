// Généré depuis design/maquettes/Code-different.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";

export default function CodeDifferent() {
  return (
    <div className="scr">
      <div className="top">
        <Link to="/code-nouveau" className="back">
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
      <h1 className="h1">Retape ton code secret</h1>
      <div className="pin" aria-label="Les codes ne correspondent pas">
        <span style={{ border: "2px solid #A1262E", color: "#A1262E" }}>•</span>
        <span style={{ border: "2px solid #A1262E", color: "#A1262E" }}>•</span>
        <span style={{ border: "2px solid #A1262E", color: "#A1262E" }}>•</span>
        <span style={{ border: "2px solid #A1262E", color: "#A1262E" }}>•</span>
      </div>
      <div className="alert err">
        <span className="ic">!</span>
        <div>
          <b>Les deux codes ne correspondent pas.</b>Choisis ton code à nouveau,
          puis retape-le.
        </div>
      </div>
      <div className="grow"></div>
      <Link to="/code-nouveau" className="btn">
        Choisir mon code à nouveau
      </Link>
    </div>
  );
}
