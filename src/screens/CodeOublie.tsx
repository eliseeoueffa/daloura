// Écran fait à la main (retiré de scripts/import_maquettes.py) : maquette design/maquettes/Code-oublie.dc.html.
// Envoie le lien « nouveau code » par email (MakiSend, via /api/compte/code-oublie).
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { api, brouillon, messageErreur } from "../lib/compte";
import { emailValide, normaliserEmail } from "../lib/emails";

export default function CodeOublie() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(brouillon.email);
  const [erreur, setErreur] = useState<string | null>(null);
  const [occupe, setOccupe] = useState(false);

  async function envoyer() {
    const e = normaliserEmail(email);
    if (!emailValide(e)) return setErreur(messageErreur("email_invalide"));
    setOccupe(true);
    const r = await api("/code-oublie", { email: e });
    setOccupe(false);
    if (!r.ok) return setErreur(messageErreur(r.error));
    brouillon.email = e;
    navigate("/code-mail-envoye");
  }

  return (
    <div className="scr">
      <div className="top">
        <Link to="/code-saisie" className="back">
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
      <h1 className="h1">Tu as oublié ton code</h1>
      <p className="p">
        Entre l'email de ton compte. On t'envoie un lien pour choisir un nouveau
        code.
      </p>
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
        />
      </div>
      <div className="alert">
        <span className="ic">i</span>
        <div>
          Tes selfies, tes aperçus et ton carnet restent protégés pendant ce
          temps.
        </div>
      </div>
      {erreur && (
        <div className="alert err" role="alert">
          <span className="ic">!</span>
          <div>{erreur}</div>
        </div>
      )}
      <div className="grow"></div>
      <button type="button" className="btn" onClick={envoyer} disabled={occupe}>
        Recevoir le lien
      </button>{" "}
      <Link to="/code-saisie" className="lnk">
        Je me souviens de mon code
      </Link>
    </div>
  );
}
