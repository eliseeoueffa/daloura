// Écran fait à la main (retiré de scripts/import_maquettes.py) : maquette design/maquettes/Code-nouveau.dc.html.
// Choix du code : à l'inscription (après Connexion) ou depuis le lien « code oublié » (?jeton=…).
import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { CasesCode, LONGUEUR_CODE, PaveCode } from "../components/SaisieCode";
import { brouillon } from "../lib/compte";

export default function CodeNouveau() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const jeton = params.get("jeton");
  if (jeton) brouillon.jeton = jeton;
  const [code, setCode] = useState("");
  useEffect(() => {
    brouillon.code = "";
  }, []);
  const valider = (c: string) => {
    brouillon.code = c;
    navigate("/code-confirmation");
  };
  const saisir = (c: string) => {
    setCode(c);
    if (c.length === LONGUEUR_CODE) valider(c);
  };
  // Arrivée directe sans email ni lien (page rechargée) : on repart de l'email.
  if (!brouillon.email && !brouillon.jeton)
    return <Navigate to="/connexion" replace />;

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
      <CasesCode valeur={code} libelle="Ton nouveau code" />
      <span className="hand" style={{ fontSize: "18px" }}>
        évite 0000, 1234 ou ta date de naissance
      </span>
      <div className="grow"></div>
      <PaveCode valeur={code} onChange={saisir} />
      <button
        type="button"
        className="btn"
        disabled={code.length < LONGUEUR_CODE}
        onClick={() => valider(code)}
      >
        Continuer
      </button>
    </div>
  );
}
