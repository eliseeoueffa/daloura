// Écran fait à la main (retiré de scripts/import_maquettes.py) : maquette design/maquettes/Consentement.dc.html.
// La case n'est pas cochée d'avance : l'accord doit être un vrai choix. Une fois donné, les photos
// (selfie, inspirations) peuvent partir vers le serveur (src/lib/envoi.ts).
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useConsentement, useSelfieAffiche } from "../lib/photos";

export default function Consentement() {
  const navigate = useNavigate();
  const { selfie, selfieStyle } = useSelfieAffiche();
  const { consentement, donner } = useConsentement();
  const [accepte, setAccepte] = useState(false);
  const coche = accepte || consentement !== null;
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
      <div className="row" style={{ gap: "14px" }}>
        <div
          className="pola"
          style={{ width: "84px", transform: "rotate(-5deg)", flex: "none" }}
        >
          <div className="ph bg-rose">
            <img src={selfie} alt="" style={selfieStyle} />
          </div>
          <div className="cap" style={{ fontSize: "13px" }}>
            mon selfie
          </div>
        </div>
        <h1 className="h1" style={{ fontSize: "27px" }}>
          Ce qu'on fait de ton selfie
        </h1>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div className="card">
          <p className="label">Il sert seulement à créer tes aperçus</p>
          <p className="small">Jamais pour de la publicité, jamais revendu.</p>
        </div>
        <div className="card">
          <p className="label">Personne ne le voit sans toi</p>
          <p className="small">
            Ton cercle voit tes aperçus seulement si tu partages le lien.
          </p>
        </div>
        <div className="card">
          <p className="label">Tu peux le supprimer à tout moment</p>
          <p className="small">Depuis ton profil, avec tes aperçus.</p>
        </div>
        <div className="card" style={{ background: "#F3DDE1", border: "0" }}>
          <p className="label">Un aperçu, pas une promesse</p>
          <p className="small" style={{ color: "#49332F" }}>
            Le rendu final dépend de tes cheveux et de ta coiffeuse.
          </p>
        </div>
      </div>
      <div className="grow"></div>
      <label
        className="row"
        htmlFor="ok"
        style={{
          alignItems: "flex-start",
          fontSize: "15px",
          minHeight: "44px",
          gap: "10px",
        }}
      >
        {" "}
        <input
          id="ok"
          type="checkbox"
          checked={coche}
          onChange={(e) => setAccepte(e.currentTarget.checked)}
          style={{
            width: "22px",
            height: "22px",
            margin: "0",
            flex: "none",
            accentColor: "#702D43",
          }}
        />{" "}
        <span>J'accepte que mon selfie serve à créer mes aperçus.</span>{" "}
      </label>{" "}
      <button
        type="button"
        className="btn"
        disabled={!coche}
        onClick={async () => {
          if (consentement === null) await donner();
          navigate("/notifications");
        }}
      >
        Créer mon aperçu
      </button>{" "}
      <Link to="/confidentialite" className="lnk">
        Lire la politique de confidentialité
      </Link>
    </div>
  );
}
