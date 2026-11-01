// Confirmation du code secret (saisi une deuxième fois).
// Inscription : on passe au consentement. Lien « code oublié » : on enregistre le nouveau code.
// Rendu dynamique à l'étape 2 (exclu du script d'import).
import { useRef, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { api, messageGenerique } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import { CodeCases, CodePad } from "../components/CodePin";
import { Retour } from "../components/Retour";

export default function CodeConfirmation() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const jeton = params.get("jeton");
  const suite = jeton ? `?jeton=${encodeURIComponent(jeton)}` : "";
  const { brouillon, majBrouillon, connectee } = useAuth();
  const [code, setCode] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<"lien" | string | null>(null);

  // Le brouillon change (connexion, codes différents) avant que la navigation ne s'applique :
  // on n'affiche plus rien plutôt que de rediriger vers le début de l'inscription.
  const termine = useRef(false);
  if (termine.current) return null;
  if (!brouillon.code) return <Navigate to={`/code-nouveau${suite}`} replace />;

  async function confirmer() {
    if (code !== brouillon.code) {
      termine.current = true;
      majBrouillon({ code: undefined });
      navigate(`/code-different${suite}`, { replace: true });
      return;
    }
    if (!jeton) {
      navigate("/consentement");
      return;
    }
    setEnvoi(true);
    const r = await api.nouveauCode(jeton, code);
    setEnvoi(false);
    if (r.ok) {
      termine.current = true;
      connectee(r.data.utilisatrice);
      navigate("/carnet", { replace: true });
    } else {
      setErreur(
        r.error === "lien_invalide" ? "lien" : messageGenerique(r.error),
      );
    }
  }

  return (
    <div className="scr">
      <div className="top">
        <Retour to={`/code-nouveau${suite}`} />
      </div>
      <h1 className="h1">Retape ton code secret</h1>
      <p className="p">
        Pour être sûre que c'est le bon, tape les mêmes 4 chiffres une deuxième
        fois.
      </p>
      <CodeCases value={code} label="Confirmation du code" />
      {erreur === "lien" ? (
        <div className="alert err" role="alert">
          <span className="ic" aria-hidden="true">
            !
          </span>
          <div>
            <b>Ce lien ne marche plus.</b>Il a déjà servi ou il date de plus
            d'une heure. <Link to="/code-oublie">Demande un nouveau lien</Link>.
          </div>
        </div>
      ) : erreur ? (
        <div className="alert err" role="alert">
          <span className="ic" aria-hidden="true">
            !
          </span>
          <div>{erreur}</div>
        </div>
      ) : (
        <p className="small">
          Si les deux codes sont différents, on te demande de recommencer.
        </p>
      )}
      <div className="grow"></div>
      <CodePad value={code} onChange={setCode} disabled={envoi} />
      <div className="foot">
        <button
          type="button"
          className="btn"
          disabled={code.length < 4 || envoi}
          aria-busy={envoi || undefined}
          onClick={confirmer}
        >
          Confirmer mon code
        </button>
      </div>
    </div>
  );
}
