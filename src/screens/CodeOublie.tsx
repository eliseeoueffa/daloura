// Code oublié : demande du lien de réinitialisation. Rendu dynamique à l'étape 2.
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { api, messageGenerique } from "../api/auth";
import { useEmailTransmis } from "../auth/navigation";
import { Retour } from "../components/Retour";
import {
  emailValide,
  EMAIL_MAX,
  normaliserEmail,
} from "../../shared/validation";

export default function CodeOublie() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(useEmailTransmis());
  const [erreur, setErreur] = useState<{
    champ: boolean;
    texte: string;
  } | null>(null);
  const [envoi, setEnvoi] = useState(false);

  async function envoyer(e: FormEvent) {
    e.preventDefault();
    const m = normaliserEmail(email);
    if (!emailValide(m))
      return setErreur({
        champ: true,
        texte: "Cette adresse email ne semble pas complète. Vérifie-la.",
      });
    setErreur(null);
    setEnvoi(true);
    const r = await api.codeOublie(m);
    setEnvoi(false);
    if (r.ok) navigate("/code-mail-envoye", { state: { email: m } });
    else setErreur({ champ: false, texte: messageGenerique(r.error) });
  }

  return (
    <form className="scr" onSubmit={envoyer} noValidate>
      <div className="top">
        <Retour to="/code-saisie" />
      </div>
      <h1 className="h1">Tu as oublié ton code</h1>
      <p className="p">
        Entre l'email de ton compte. On t'envoie un lien pour choisir un nouveau
        code.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label className="label" htmlFor="mail">
          Ton adresse email
        </label>
        <input
          className={erreur?.champ ? "input bad" : "input"}
          id="mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="send"
          maxLength={EMAIL_MAX}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={erreur?.champ || undefined}
          aria-describedby={erreur ? "form-err" : undefined}
        />
      </div>
      {erreur ? (
        <div className="alert err" id="form-err" role="alert">
          <span className="ic" aria-hidden="true">
            !
          </span>
          <div>{erreur.texte}</div>
        </div>
      ) : (
        <div className="alert">
          <span className="ic" aria-hidden="true">
            i
          </span>
          <div>
            Tes selfies, tes aperçus et ton carnet restent protégés pendant ce
            temps.
          </div>
        </div>
      )}
      <div className="grow"></div>
      <button
        type="submit"
        className="btn"
        disabled={envoi}
        aria-busy={envoi || undefined}
      >
        Recevoir le lien
      </button>
      <Link
        to="/code-saisie"
        state={{ email: normaliserEmail(email) }}
        className="lnk"
      >
        Je me souviens de mon code
      </Link>
    </form>
  );
}
