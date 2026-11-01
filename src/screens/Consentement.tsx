// Consentement selfie, dernière étape de l'inscription : crée le compte.
// Rendu dynamique à l'étape 2 (exclu du script d'import).
import { useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { IMG } from "../assets/images";
import { api, messageGenerique } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import { Retour } from "../components/Retour";

export default function Consentement() {
  const navigate = useNavigate();
  const { brouillon, connectee } = useAuth();
  // Case cochée par défaut comme sur la maquette (question posée à Elisée).
  const [accepte, setAccepte] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  // Une fois connectée, le brouillon est vidé avant que la navigation ne s'applique :
  // on n'affiche plus rien plutôt que de rediriger vers le début de l'inscription.
  const termine = useRef(false);
  if (termine.current) return null;
  const { prenom, email, code } = brouillon;
  if (!prenom || !email) return <Navigate to="/connexion" replace />;
  if (!code) return <Navigate to="/code-nouveau" replace />;

  async function creer() {
    if (!prenom || !email || !code) return;
    setErreur(null);
    setEnvoi(true);
    const r = await api.inscription({
      prenom,
      email,
      code,
      consentement: accepte,
    });
    setEnvoi(false);
    if (r.ok) {
      termine.current = true;
      connectee(r.data.utilisatrice);
      navigate("/email-a-verifier", { replace: true });
    } else if (r.error === "email_existant") {
      navigate("/email-existant", { state: { email }, replace: true });
    } else {
      setErreur(messageGenerique(r.error));
    }
  }

  return (
    <div className="scr">
      <div className="top">
        <Retour to="/code-confirmation" />
      </div>
      <div className="row" style={{ gap: "14px" }}>
        <div
          className="pola"
          style={{ width: "84px", transform: "rotate(-5deg)", flex: "none" }}
        >
          <div className="ph bg-rose">
            <img src={IMG.selfie} alt="" />
          </div>
          <div className="cap" style={{ fontSize: "13px" }}>
            mon selfie
          </div>
        </div>
        <h1 className="h1" style={{ fontSize: "27px" }}>
          Ce qu'on fait de ton selfie
        </h1>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div className="card">
          <p className="label">Il sert seulement à créer tes aperçus</p>
          <p className="small">Jamais pour de la publicité, jamais revendu.</p>
        </div>
        <div className="card">
          <p className="label">Personne ne le voit sans toi</p>
          <p className="small">
            Ton cercle voit tes aperçus seulement si tu partages le lien.
          </p>
        </div>
        <div className="card">
          <p className="label">Tu peux le supprimer à tout moment</p>
          <p className="small">Depuis ton profil, avec tes aperçus.</p>
        </div>
        <div className="card" style={{ background: "#F3DDE1", border: "0" }}>
          <p className="label">Un aperçu, pas une promesse</p>
          <p className="small" style={{ color: "#49332F" }}>
            Le rendu final dépend de tes cheveux et de ta coiffeuse.
          </p>
        </div>
      </div>
      <div className="grow"></div>
      <div className="foot">
        <label
          className="row"
          htmlFor="ok"
          style={{
            alignItems: "flex-start",
            fontSize: "15px",
            minHeight: "44px",
            gap: "10px",
          }}
        >
          <input
            id="ok"
            type="checkbox"
            checked={accepte}
            onChange={(e) => setAccepte(e.target.checked)}
            style={{
              width: "22px",
              height: "22px",
              margin: "0",
              flex: "none",
              accentColor: "#702D43",
            }}
          />
          <span>J'accepte que mon selfie serve à créer mes aperçus.</span>
        </label>
        {erreur && (
          <div className="alert err" role="alert">
            <span className="ic" aria-hidden="true">
              !
            </span>
            <div>{erreur}</div>
          </div>
        )}
        <button
          type="button"
          className="btn"
          disabled={!accepte || envoi}
          aria-busy={envoi || undefined}
          onClick={creer}
        >
          Créer mon aperçu
        </button>
        <Link to="/consentement" className="lnk">
          Lire la politique de confidentialité
        </Link>
      </div>
    </div>
  );
}
