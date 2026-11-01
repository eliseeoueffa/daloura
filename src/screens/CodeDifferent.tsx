// Les deux codes saisis ne correspondent pas. Rendu dynamique à l'étape 2 (exclu du script d'import).
import { useSearchParams } from "react-router";
import { Link } from "react-router";
import { CodeCases } from "../components/CodePin";
import { Retour } from "../components/Retour";

export default function CodeDifferent() {
  const [params] = useSearchParams();
  const jeton = params.get("jeton");
  const retour = jeton
    ? `/code-nouveau?jeton=${encodeURIComponent(jeton)}`
    : "/code-nouveau";
  return (
    <div className="scr">
      <div className="top">
        <Retour to={retour} />
      </div>
      <h1 className="h1">Retape ton code secret</h1>
      <CodeCases value="" erreur label="Les codes ne correspondent pas" />
      <div className="alert err" role="alert">
        <span className="ic" aria-hidden="true">
          !
        </span>
        <div>
          <b>Les deux codes ne correspondent pas.</b>Choisis ton code à nouveau,
          puis retape-le.
        </div>
      </div>
      <div className="grow"></div>
      <Link to={retour} className="btn" replace>
        Choisir mon code à nouveau
      </Link>
    </div>
  );
}
