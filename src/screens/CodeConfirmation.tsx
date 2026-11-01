// Écran fait à la main (retiré de scripts/import_maquettes.py) : maquette design/maquettes/Code-confirmation.dc.html.
// Deuxième saisie : codes identiques → création du compte (ou nouveau code via le lien), sinon Code-different.
import { useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { CasesCode, LONGUEUR_CODE, PaveCode } from "../components/SaisieCode";
import {
  api,
  brouillon,
  connecte,
  messageErreur,
  type Compte,
} from "../lib/compte";

export default function CodeConfirmation() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [occupe, setOccupe] = useState(false);
  // Une fois le compte créé, l'écran reste affiché le temps de charger le suivant : ne pas le renvoyer
  // vers Code-nouveau parce que le code a été effacé de la mémoire.
  const termine = useRef(false);

  async function valider(c: string) {
    if (c !== brouillon.code)
      return navigate("/code-different", { replace: true });
    setOccupe(true);
    setErreur(null);
    const r = brouillon.jeton
      ? await api<Compte>("/nouveau-code", { jeton: brouillon.jeton, code: c })
      : await api<Compte>("/inscription", { email: brouillon.email, code: c });
    setOccupe(false);
    if (r.ok) {
      const reinitialisation = !!brouillon.jeton;
      termine.current = true;
      navigate(reinitialisation ? "/carnet" : "/consentement", {
        replace: true,
      });
      connecte({ email: r.data.email, perles: r.data.perles });
      Object.assign(brouillon, { code: "", jeton: null });
      return;
    }
    if (r.error === "email_existant")
      return navigate("/email-existant", { replace: true });
    setCode("");
    setErreur(messageErreur(r.error));
  }
  const saisir = (c: string) => {
    setCode(c);
    setErreur(null);
    if (c.length === LONGUEUR_CODE) void valider(c);
  };
  if (!brouillon.code && !termine.current)
    return <Navigate to="/code-nouveau" replace />;

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
      <p className="p">
        Pour être sûre que c'est le bon, tape les mêmes 4 chiffres une deuxième
        fois.
      </p>
      <CasesCode valeur={code} libelle="Confirmation du code" />
      <p className="small">
        Si les deux codes sont différents, on te demande de recommencer.
      </p>
      <div className="grow"></div>
      <PaveCode valeur={code} onChange={saisir} desactive={occupe} />
      {erreur && (
        <div className="alert err" role="alert">
          <span className="ic">!</span>
          <div>{erreur}</div>
        </div>
      )}
      {erreur === null && occupe && (
        <p className="small" style={{ textAlign: "center" }}>
          Un instant…
        </p>
      )}
    </div>
  );
}
