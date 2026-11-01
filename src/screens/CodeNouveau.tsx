// Généré depuis design/maquettes/Code-nouveau.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";

export default function CodeNouveau() {
  return (
    <div className="scr">
      <div className="top">
        <Link to="/connexion" className="back">
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
      <h1 className="h1">Choisis ton code secret</h1>
      <p className="p">
        4 chiffres. Tu le taperas à chaque connexion. Il protège tes selfies et
        ton carnet.
      </p>
      <div className="pin" aria-label="Code à 4 chiffres, 2 saisis">
        <span className="on">•</span>
        <span className="on">•</span>
        <span></span>
        <span></span>
      </div>
      <span className="hand" style={{ fontSize: "18px" }}>
        évite 0000, 1234 ou ta date de naissance
      </span>
      <div className="grow"></div>
      <div className="pad" aria-hidden="true">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
        <span>6</span>
        <span>7</span>
        <span>8</span>
        <span>9</span>
        <span style={{ background: "transparent", border: "0" }}></span>
        <span>0</span>
        <span style={{ fontSize: "14px" }}>Effacer</span>
      </div>
      <Link to="/code-confirmation" className="btn">
        Continuer
      </Link>
    </div>
  );
}
