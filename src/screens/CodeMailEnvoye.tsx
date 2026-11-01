// Lien de réinitialisation envoyé. Rendu dynamique à l'étape 2 (exclu du script d'import).
// Le lien « J'ai ouvert le lien (démo) » de la maquette est retiré : le vrai lien arrive par email.
import { useState } from "react";
import { Navigate } from "react-router";
import { api, messageGenerique } from "../api/auth";
import { useEmailTransmis } from "../auth/navigation";
import { IllustrationMail } from "../components/IllustrationMail";
import { Retour } from "../components/Retour";

export default function CodeMailEnvoye() {
  const email = useEmailTransmis();
  const [etat, setEtat] = useState<{
    envoi?: boolean;
    ok?: boolean;
    erreur?: string;
  }>({});
  if (!email) return <Navigate to="/code-oublie" replace />;

  async function renvoyer() {
    setEtat({ envoi: true });
    const r = await api.codeOublie(email);
    setEtat(r.ok ? { ok: true } : { erreur: messageGenerique(r.error) });
  }

  return (
    <div className="scr">
      <div className="top">
        <Retour to="/code-oublie" />
      </div>
      <div className="grow"></div>
      <IllustrationMail />
      <h1 className="h1" style={{ textAlign: "center" }}>
        Regarde tes mails
      </h1>
      <p className="p" style={{ textAlign: "center" }}>
        On a envoyé un lien à <b>{email}</b>. Ouvre-le sur ce téléphone pour
        choisir ton nouveau code.
      </p>
      <p className="small" style={{ textAlign: "center" }}>
        Rien reçu après quelques minutes ? Regarde dans les spams ou les
        promotions.
      </p>
      <div className="grow"></div>
      <div aria-live="polite">
        {etat.ok && (
          <p className="ok-msg">C'est renvoyé. Le lien est valable 1 heure.</p>
        )}
        {etat.erreur && (
          <div className="alert err" role="alert">
            <span className="ic" aria-hidden="true">
              !
            </span>
            <div>{etat.erreur}</div>
          </div>
        )}
      </div>
      <button
        type="button"
        className="btn2"
        onClick={renvoyer}
        disabled={etat.envoi}
        aria-busy={etat.envoi || undefined}
      >
        Renvoyer le lien
      </button>
    </div>
  );
}
