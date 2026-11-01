// Connexion : email + code secret. Affiche aussi l'état « code incorrect » (maquette Code-erreur).
// Rendu dynamique à l'étape 2 (exclu du script d'import).
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { IMG } from "../assets/images";
import { api, messageGenerique } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import { pluriel, useEmailTransmis } from "../auth/navigation";
import { CodeCases, CodePad } from "../components/CodePin";
import { Retour } from "../components/Retour";
import {
  emailValide,
  EMAIL_MAX,
  normaliserEmail,
} from "../../shared/validation";

export type ErreurConnexion =
  | { type: "code"; essaisRestants?: number; prochainBlocageMinutes?: number }
  | { type: "email" }
  | { type: "autre"; texte: string };

export function texteErreurCode(e: {
  essaisRestants?: number;
  prochainBlocageMinutes?: number;
}): string {
  if (e.essaisRestants === undefined)
    return "Vérifie ton adresse email et ton code.";
  const minutes = e.prochainBlocageMinutes ?? 2;
  return `Il te reste ${pluriel(e.essaisRestants, "essai")}. Après, la connexion est bloquée ${pluriel(minutes, "minute")}.`;
}

export default function CodeSaisie({ demo }: { demo?: ErreurConnexion }) {
  const navigate = useNavigate();
  const { connectee } = useAuth();
  const [email, setEmail] = useState(
    useEmailTransmis() || (demo ? "awa.k@gmail.com" : ""),
  );
  const [code, setCode] = useState("");
  const [erreur, setErreur] = useState<ErreurConnexion | null>(demo ?? null);
  const [envoi, setEnvoi] = useState(false);

  function changerCode(v: string) {
    if (erreur?.type === "code") setErreur(null); // nouvelle saisie après une erreur
    setCode(v);
  }

  async function seConnecter(e?: FormEvent) {
    e?.preventDefault();
    const m = normaliserEmail(email);
    if (!emailValide(m)) return setErreur({ type: "email" });
    if (code.length < 4) return;
    setEnvoi(true);
    const r = await api.connexion(m, code);
    setEnvoi(false);
    if (r.ok) {
      connectee(r.data.utilisatrice);
      navigate("/carnet", { replace: true });
      return;
    }
    if (r.error === "bloquee") {
      navigate("/code-bloque", { state: { email: m, jusqua: r.data.jusqua } });
      return;
    }
    if (r.error === "code_incorrect") {
      setCode("");
      setErreur({
        type: "code",
        essaisRestants:
          typeof r.data.essaisRestants === "number"
            ? r.data.essaisRestants
            : undefined,
        prochainBlocageMinutes:
          typeof r.data.prochainBlocageMinutes === "number"
            ? r.data.prochainBlocageMinutes
            : undefined,
      });
      return;
    }
    setErreur({ type: "autre", texte: messageGenerique(r.error) });
  }

  return (
    <form
      className="scr"
      style={{ gap: "14px" }}
      onSubmit={seConnecter}
      noValidate
    >
      <div className="top">
        <Retour to="/">Accueil</Retour>
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
        </label>
        <input
          className={erreur?.type === "email" ? "input bad" : "input"}
          id="mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          maxLength={EMAIL_MAX}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (erreur?.type === "email") setErreur(null);
          }}
          aria-invalid={erreur?.type === "email" || undefined}
          aria-describedby={erreur?.type === "email" ? "form-err" : undefined}
        />
      </div>
      <p className="label" id="code-label">
        Ton code secret
      </p>
      <CodeCases
        value={code}
        erreur={erreur?.type === "code"}
        label="Code à 4 chiffres"
      />
      {erreur && (
        <div className="alert err" id="form-err" role="alert">
          <span className="ic" aria-hidden="true">
            !
          </span>
          <div>
            {erreur.type === "code" && (
              <>
                <b>Ce code n'est pas le bon.</b>
                {texteErreurCode(erreur)}
              </>
            )}
            {erreur.type === "email" &&
              "Cette adresse email ne semble pas complète. Vérifie-la."}
            {erreur.type === "autre" && erreur.texte}
          </div>
        </div>
      )}
      <Link
        to="/code-oublie"
        state={{ email: normaliserEmail(email) }}
        className="lnk"
        style={{ minHeight: "36px" }}
      >
        J'ai oublié mon code
      </Link>
      <div className="grow"></div>
      <CodePad value={code} onChange={changerCode} disabled={envoi} />
      <div className="foot">
        {erreur?.type === "code" ? (
          <button
            type="button"
            className="btn"
            onClick={() => {
              setErreur(null);
              setCode("");
            }}
          >
            Réessayer
          </button>
        ) : (
          <button
            type="submit"
            className="btn"
            disabled={envoi || code.length < 4}
            aria-busy={envoi || undefined}
          >
            Me connecter
          </button>
        )}
      </div>
    </form>
  );
}
