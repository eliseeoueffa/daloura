// Ouverture du lien de vérification (/email-verifie?jeton=…). Écran sans maquette.
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { api } from "../api/auth";
import { IMG } from "../assets/images";

// Le jeton ne sert qu'une fois : on garde la promesse pour ne pas le consommer deux fois
// (React lance les effets deux fois en développement).
const verifications = new Map<string, Promise<boolean>>();
function verifier(jeton: string): Promise<boolean> {
  let p = verifications.get(jeton);
  if (!p) {
    p = api.verifierEmail(jeton).then((r) => r.ok);
    verifications.set(jeton, p);
  }
  return p;
}

export default function EmailVerifie() {
  const [params] = useSearchParams();
  const jeton = params.get("jeton") ?? "";
  const [etat, setEtat] = useState<"attente" | "ok" | "invalide">(
    jeton ? "attente" : "invalide",
  );

  useEffect(() => {
    if (!jeton) return;
    let actif = true;
    verifier(jeton).then((ok) => actif && setEtat(ok ? "ok" : "invalide"));
    return () => {
      actif = false;
    };
  }, [jeton]);

  return (
    <div className="scr" aria-busy={etat === "attente" || undefined}>
      <div className="top">
        <span className="logo" style={{ fontSize: "18px" }}>
          <img
            src={IMG.logo}
            alt=""
            style={{ width: "22px", height: "22px" }}
          />
          daloura
        </span>
      </div>
      <div className="grow"></div>
      {etat === "attente" && (
        <p className="p" style={{ textAlign: "center" }} role="status">
          On vérifie ton lien…
        </p>
      )}
      {etat === "ok" && (
        <>
          <span className="hand" style={{ alignSelf: "center" }}>
            c'est bon !
          </span>
          <h1 className="h1" style={{ textAlign: "center" }}>
            Ton email est confirmé
          </h1>
          <p className="p" style={{ textAlign: "center" }}>
            Ton aperçu offert t'attend.
          </p>
        </>
      )}
      {etat === "invalide" && (
        <>
          <h1 className="h1" style={{ textAlign: "center" }}>
            Ce lien ne marche plus
          </h1>
          <p className="p" style={{ textAlign: "center" }}>
            Il a déjà servi ou il date de plus de 24 heures. Demande un nouveau
            lien.
          </p>
        </>
      )}
      <div className="grow"></div>
      {etat === "ok" && (
        <Link to="/notifications" className="btn" replace>
          Voir mon aperçu
        </Link>
      )}
      {etat === "invalide" && (
        <Link to="/email-a-verifier" className="btn" replace>
          Recevoir un nouveau lien
        </Link>
      )}
    </div>
  );
}
