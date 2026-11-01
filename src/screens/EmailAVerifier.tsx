// Après l'inscription : confirmer l'email avant l'essai offert (décision d'Elisée).
// Écran sans maquette, construit sur le modèle de Code-mail-envoye.
import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { api, messageGenerique, type Utilisatrice } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import { IllustrationMail } from "../components/IllustrationMail";

export default function EmailAVerifier() {
  const { utilisatrice, connectee } = useAuth();
  const [session, setSession] = useState<Utilisatrice | null | "absente">(
    utilisatrice,
  );
  const [etat, setEtat] = useState<{
    envoi?: boolean;
    ok?: boolean;
    erreur?: string;
  }>({});

  // Page rechargée : on retrouve la session auprès du serveur.
  useEffect(() => {
    if (utilisatrice) return;
    let actif = true;
    api.session().then((r) => {
      if (!actif) return;
      if (r.ok) {
        connectee(r.data.utilisatrice);
        setSession(r.data.utilisatrice);
      } else setSession("absente");
    });
    return () => {
      actif = false;
    };
  }, [utilisatrice, connectee]);

  if (session === "absente") return <Navigate to="/code-saisie" replace />;
  if (session?.emailVerifie) return <Navigate to="/notifications" replace />;

  async function renvoyer() {
    setEtat({ envoi: true });
    const r = await api.renvoyerVerification();
    setEtat(r.ok ? { ok: true } : { erreur: messageGenerique(r.error) });
  }

  return (
    <div className="scr">
      <div className="grow"></div>
      <IllustrationMail />
      <h1 className="h1" style={{ textAlign: "center" }}>
        Confirme ton email
      </h1>
      <p className="p" style={{ textAlign: "center" }}>
        {session ? (
          <>
            Bienvenue {session.prenom} ! On a envoyé un lien à{" "}
            <b>{session.email}</b>.
          </>
        ) : (
          "On t'a envoyé un lien par email."
        )}{" "}
        Ouvre-le sur ce téléphone pour lancer ton aperçu offert.
      </p>
      <p className="small" style={{ textAlign: "center" }}>
        Rien reçu après quelques minutes ? Regarde dans les spams ou les
        promotions.
      </p>
      <div className="grow"></div>
      <div aria-live="polite">
        {etat.ok && (
          <p className="ok-msg">
            C'est renvoyé. Le lien est valable 24 heures.
          </p>
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
        disabled={etat.envoi || !session}
        aria-busy={etat.envoi || undefined}
      >
        Renvoyer le lien
      </button>
    </div>
  );
}
