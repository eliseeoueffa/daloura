// Écran fait à la main (retiré de scripts/import_maquettes.py) : maquette design/maquettes/Code-mail-envoye.dc.html.
// Confirme l'envoi du lien ; « Renvoyer le lien » le redemande (3 par heure au maximum).
import { useState } from "react";
import { Link, Navigate } from "react-router";
import { api, brouillon, messageErreur } from "../lib/compte";
import { IMG } from "../assets/images";

export default function CodeMailEnvoye() {
  const [message, setMessage] = useState<string | null>(null);
  const [occupe, setOccupe] = useState(false);
  async function renvoyer() {
    setOccupe(true);
    const r = await api("/code-oublie", { email: brouillon.email });
    setOccupe(false);
    setMessage(
      r.ok
        ? "C'est renvoyé. Regarde aussi dans les spams."
        : messageErreur(r.error),
    );
  }
  if (!brouillon.email) return <Navigate to="/code-oublie" replace />;

  return (
    <div className="scr">
      <div className="top">
        <Link to="/code-oublie" className="back">
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
      <div className="grow"></div>
      <div
        style={{
          position: "relative",
          alignSelf: "center",
          width: "220px",
          height: "150px",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "20px 0 0 0",
            background: "#FFFBF4",
            border: "1.5px solid rgba(73,51,47,.18)",
            borderRadius: "10px",
            boxShadow: "0 12px 24px -14px rgba(73,51,47,.5)",
          }}
        ></div>
        <svg
          viewBox="0 0 220 130"
          style={{
            position: "absolute",
            left: "0",
            top: "20px",
            width: "220px",
            height: "130px",
          }}
          aria-hidden="true"
        >
          <path
            d="M8 8 L110 78 L212 8"
            fill="none"
            stroke="#702D43"
            strokeWidth="3"
            strokeLinejoin="round"
          ></path>
        </svg>
        <div
          className="ico"
          style={{
            position: "absolute",
            right: "-10px",
            top: "0",
            width: "46px",
            height: "46px",
            borderRadius: "50%",
            boxShadow: "0 0 0 4px #F5EFE6",
          }}
        >
          <img src={IMG.logoInv} alt="" />
        </div>
      </div>
      <h1 className="h1" style={{ textAlign: "center" }}>
        Regarde tes mails
      </h1>
      <p className="p" style={{ textAlign: "center" }}>
        On a envoyé un lien à <b>{brouillon.email}</b>. Ouvre-le sur ce
        téléphone pour choisir ton nouveau code.
      </p>
      <p className="small" style={{ textAlign: "center" }}>
        Rien reçu après quelques minutes ? Regarde dans les spams ou les
        promotions.
      </p>
      <div className="grow"></div>
      {message && (
        <p className="small" style={{ textAlign: "center" }} role="status">
          {message}
        </p>
      )}
      <button
        type="button"
        className="btn2"
        onClick={renvoyer}
        disabled={occupe}
      >
        Renvoyer le lien
      </button>
      <Link to="/code-saisie" className="lnk">
        Revenir à la connexion
      </Link>
    </div>
  );
}
