// Écran fait à la main (retiré de scripts/import_maquettes.py) : maquette design/maquettes/Code-saisie.dc.html.
// Connexion : email + code. Code faux → alerte avec les tentatives restantes (comme Code-erreur) ; 3 erreurs → Code-bloque.
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { CasesCode, LONGUEUR_CODE, PaveCode } from "../components/SaisieCode";
import {
  api,
  brouillon,
  connecte,
  messageErreur,
  type Compte,
} from "../lib/compte";
import { emailValide, normaliserEmail } from "../lib/emails";
import { IMG } from "../assets/images";

export default function CodeSaisie() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(brouillon.email);
  const [code, setCode] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [restantes, setRestantes] = useState<number | null>(null);
  const [occupe, setOccupe] = useState(false);

  async function connecter(c: string) {
    const e = normaliserEmail(email);
    if (!emailValide(e)) {
      setCode("");
      return setErreur(messageErreur("email_invalide"));
    }
    setOccupe(true);
    setErreur(null);
    setRestantes(null);
    const r = await api<Compte>("/connexion", { email: e, code: c });
    setOccupe(false);
    brouillon.email = e;
    if (r.ok) {
      connecte(r.data);
      return navigate("/carnet", { replace: true });
    }
    setCode("");
    if (r.error === "bloque")
      return navigate(`/code-bloque?jusqua=${Number(r.jusqua) || ""}`);
    if (r.error === "code_incorrect")
      return setRestantes(Number(r.restantes) || 1);
    setErreur(messageErreur(r.error));
  }
  const saisir = (c: string) => {
    setCode(c);
    setErreur(null);
    setRestantes(null);
    if (c.length === LONGUEUR_CODE) void connecter(c);
  };

  return (
    <div className="scr" style={{ gap: "14px" }}>
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
          Accueil
        </Link>
        <span className="logo" style={{ fontSize: "18px" }}>
          <img
            src={IMG.logo}
            alt=""
            style={{ width: "22px", height: "22px" }}
          />
          daloura
        </span>
      </div>
      <h1 className="h1">Contente de te revoir</h1>
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
            setRestantes(null);
          }}
        />
      </div>
      <p className="label">Ton code secret</p>
      <CasesCode
        valeur={code}
        erreur={restantes !== null}
        libelle="Ton code secret"
      />
      {restantes !== null && (
        <div className="alert err" role="alert">
          <span className="ic">!</span>
          <div>
            <b>Ce code n'est pas le bon.</b>
            {restantes > 1
              ? `Il te reste ${restantes} tentatives.`
              : "Il te reste 1 tentative."}{" "}
            Après, la connexion est bloquée 15 minutes.
          </div>
        </div>
      )}
      {erreur && (
        <div className="alert err" role="alert">
          <span className="ic">!</span>
          <div>{erreur}</div>
        </div>
      )}
      <Link
        to="/code-oublie"
        className="lnk"
        style={{ minHeight: "36px" }}
        onClick={() => (brouillon.email = normaliserEmail(email))}
      >
        J'ai oublié mon code
      </Link>
      <div className="grow"></div>
      <PaveCode valeur={code} onChange={saisir} desactive={occupe} />
      <button
        type="button"
        className="btn"
        disabled={occupe || code.length < LONGUEUR_CODE}
        onClick={() => void connecter(code)}
      >
        Me connecter
      </button>
    </div>
  );
}
