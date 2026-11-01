// Choix du code secret : à l'inscription, ou depuis le lien « code oublié » (?jeton=…).
// Rendu dynamique à l'étape 2 (exclu du script d'import).
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../auth/AuthContext";
import { CodeCases, CodePad } from "../components/CodePin";
import { Retour } from "../components/Retour";
import { verifierCode } from "../../shared/validation";

export default function CodeNouveau() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const jeton = params.get("jeton");
  const { brouillon, majBrouillon } = useAuth();
  const [code, setCode] = useState("");
  const [tropSimple, setTropSimple] = useState(false);

  useEffect(() => {
    if (code.length > 0) setTropSimple(false);
  }, [code]);

  // Inscription sans email (page rechargée, accès direct) : on repart de l'écran Connexion.
  if (!jeton && !brouillon.email) return <Navigate to="/connexion" replace />;

  function continuer() {
    if (verifierCode(code) === "trop_simple") {
      setTropSimple(true);
      setCode("");
      return;
    }
    majBrouillon({ code });
    navigate(
      jeton
        ? `/code-confirmation?jeton=${encodeURIComponent(jeton)}`
        : "/code-confirmation",
    );
  }

  return (
    <div className="scr">
      <div className="top">
        <Retour to={jeton ? "/code-saisie" : "/connexion"} />
      </div>
      <h1 className="h1">
        {jeton ? "Choisis ton nouveau code" : "Choisis ton code secret"}
      </h1>
      <p className="p">
        4 chiffres. Tu le taperas à chaque connexion. Il protège tes selfies et
        ton carnet.
      </p>
      <CodeCases value={code} erreur={tropSimple} label="Code à 4 chiffres" />
      {tropSimple ? (
        <div className="alert err" role="alert">
          <span className="ic" aria-hidden="true">
            !
          </span>
          <div>
            <b>Ce code est trop facile à deviner.</b>Choisis 4 chiffres moins
            évidents.
          </div>
        </div>
      ) : (
        <span className="hand" style={{ fontSize: "18px" }}>
          évite 0000, 1234 ou ta date de naissance
        </span>
      )}
      <div className="grow"></div>
      <CodePad value={code} onChange={setCode} />
      <div className="foot">
        <button
          type="button"
          className="btn"
          disabled={code.length < 4}
          onClick={continuer}
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
