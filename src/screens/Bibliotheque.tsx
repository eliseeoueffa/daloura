// Écran fait à la main (retiré de scripts/import_maquettes.py) : maquette design/maquettes/Bibliotheque.dc.html.
// Une case par coiffure : la toucher ouvre la galerie, la photo choisie va dans CETTE case.
// Les photos sont gardées dans le navigateur (src/lib/photos.ts) jusqu'à l'envoi vers R2 (étape 3).
import { Link } from "react-router";
import { GrilleCoiffures } from "../components/GrilleCoiffures";
import { useInspirations } from "../lib/photos";

export default function Bibliotheque() {
  const { inspirations } = useInspirations();
  const n = inspirations.length;
  return (
    <div className="scr">
      <div className="top">
        <Link to="/" className="back">
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
        <span className="pill">{n > 1 ? `${n} photos` : `${n} photo`}</span>
      </div>
      <h1 className="h1">Tes inspirations</h1>
      <GrilleCoiffures mode="bibliotheque" />
      <div className="alert">
        <span className="ic">+</span>
        <div>
          Touche une coiffure pour y mettre ta photo d'inspiration : capture
          Instagram, Pinterest, TikTok ou photo de ta galerie.
        </div>
      </div>
      <div className="grow"></div>
      {n > 0 ? (
        <Link to="/selfie" className="btn">
          Continuer avec ton selfie
        </Link>
      ) : (
        <button type="button" className="btn" disabled>
          Ajoute au moins une photo
        </button>
      )}
    </div>
  );
}
