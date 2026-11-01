// Écran fait à la main (retiré de scripts/import_maquettes.py) : maquette design/maquettes/Connexion.dc.html.
// Vérifie si l'email a déjà un compte : oui → Email-existant, non → choix du code (Code-nouveau).
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { PhotoInspiration } from "../components/PhotoInspiration";
import { api, brouillon, messageErreur } from "../lib/compte";
import { emailValide, normaliserEmail } from "../lib/emails";
import { useLooks } from "../lib/essai";
import { useSelfieAffiche } from "../lib/photos";

export default function Connexion() {
  const navigate = useNavigate();
  const { selfie, selfieStyle } = useSelfieAffiche();
  const look = useLooks()[0];
  const [email, setEmail] = useState(brouillon.email);
  const [erreur, setErreur] = useState<string | null>(null);
  const [occupe, setOccupe] = useState(false);

  async function continuer() {
    const e = normaliserEmail(email);
    if (!emailValide(e)) return setErreur(messageErreur("email_invalide"));
    setOccupe(true);
    const r = await api<{ existe: boolean }>("/verifier-email", { email: e });
    setOccupe(false);
    if (!r.ok) return setErreur(messageErreur(r.error));
    brouillon.email = e;
    brouillon.jeton = null;
    navigate(r.data.existe ? "/email-existant" : "/code-nouveau");
  }

  return (
    <div className="scr">
      <div className="top">
        <Link to="/choix-essai" className="back">
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
      <div className="row" style={{ gap: "16px", marginTop: "8px" }}>
        <div
          className="face"
          style={{
            width: "64px",
            height: "64px",
            boxShadow: "0 0 0 3px #FFFDF8",
          }}
        >
          <img src={selfie} alt="" style={selfieStyle} />
        </div>
        <span style={{ fontSize: "22px", color: "#702D43" }}>+</span>
        <div className="stk rays" style={{ width: "64px", height: "70px" }}>
          <PhotoInspiration slug={look.slug} alt="" />
        </div>
        <span className="hand" style={{ fontSize: "18px" }}>
          presque !
        </span>
      </div>
      <h1 className="h1">Ton aperçu est prêt à être créé</h1>
      <p className="p">Entre ton email pour garder tes essais et ton carnet.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label className="label" htmlFor="mail">
          Ton adresse email
        </label>{" "}
        <input
          className={erreur ? "input bad" : "input"}
          id="mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          placeholder="ton.email@exemple.com"
          value={email}
          onChange={(e) => {
            setEmail(e.currentTarget.value);
            setErreur(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && void continuer()}
        />
      </div>
      <p className="small">
        Pas de mot de passe : tu choisis un code secret à 4 chiffres à l'étape
        suivante.
      </p>
      {erreur && (
        <div className="alert err" role="alert">
          <span className="ic">!</span>
          <div>{erreur}</div>
        </div>
      )}
      <div className="grow"></div>
      <button
        type="button"
        className="btn"
        onClick={continuer}
        disabled={occupe}
      >
        Continuer
      </button>
    </div>
  );
}
