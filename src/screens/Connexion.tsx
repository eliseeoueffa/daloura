// Inscription, étape 1 : prénom et email. Rendu dynamique à l'étape 2 (exclu du script d'import).
// Écart validé par Elisée : le champ « Ton prénom » est ajouté au-dessus de l'email.
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { IMG } from "../assets/images";
import { api, messageGenerique } from "../api/auth";
import { appareilMarque } from "../auth/appareil";
import { useAuth } from "../auth/AuthContext";
import { Retour } from "../components/Retour";
import {
  emailValide,
  EMAIL_MAX,
  normaliserEmail,
  normaliserPrenom,
  PRENOM_MAX,
  prenomValide,
} from "../../shared/validation";

export default function Connexion() {
  const navigate = useNavigate();
  const { brouillon, majBrouillon } = useAuth();
  const [prenom, setPrenom] = useState(brouillon.prenom ?? "");
  const [email, setEmail] = useState(brouillon.email ?? "");
  const [erreur, setErreur] = useState<{
    champ: "prenom" | "email" | "general";
    texte: string;
  } | null>(null);
  const [envoi, setEnvoi] = useState(false);

  // Un compte existe déjà sur ce téléphone : l'essai offert n'est plus disponible.
  useEffect(() => {
    if (appareilMarque()) {
      navigate("/essai-deja-utilise", { replace: true });
      return;
    }
    let actif = true;
    api.session().then((r) => {
      if (!actif) return;
      if (r.ok || r.data.appareilConnu === true)
        navigate("/essai-deja-utilise", { replace: true });
    });
    return () => {
      actif = false;
    };
  }, [navigate]);

  async function continuer(e: FormEvent) {
    e.preventDefault();
    const p = normaliserPrenom(prenom);
    const m = normaliserEmail(email);
    if (!prenomValide(p))
      return setErreur({
        champ: "prenom",
        texte: "Écris ton prénom pour qu'on sache comment t'appeler.",
      });
    if (!emailValide(m))
      return setErreur({
        champ: "email",
        texte: "Cette adresse email ne semble pas complète. Vérifie-la.",
      });
    setErreur(null);
    setEnvoi(true);
    const r = await api.emailDisponible(m);
    setEnvoi(false);
    if (!r.ok)
      return setErreur({ champ: "general", texte: messageGenerique(r.error) });
    majBrouillon({ prenom: p, email: m });
    navigate(r.data.disponible ? "/code-nouveau" : "/email-existant", {
      state: { email: m },
    });
  }

  return (
    <form className="scr" onSubmit={continuer} noValidate>
      <div className="top">
        <Retour to="/choix-essai" />
      </div>
      <div className="row" style={{ gap: "16px", marginTop: "8px" }}>
        <div
          className="face"
          style={{
            width: "64px",
            height: "64px",
            boxShadow: "0 0 0 3px #FFFDF8",
          }}
        >
          <img src={IMG.selfie} alt="" />
        </div>
        <span style={{ fontSize: "22px", color: "#702D43" }} aria-hidden="true">
          +
        </span>
        <div className="stk rays" style={{ width: "64px", height: "70px" }}>
          <img src={IMG.knotless} alt="" />
        </div>
        <span className="hand" style={{ fontSize: "18px" }}>
          presque !
        </span>
      </div>
      <h1 className="h1">Ton aperçu est prêt à être créé</h1>
      <p className="p">Entre ton email pour garder tes essais et ton carnet.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label className="label" htmlFor="prenom">
          Ton prénom
        </label>
        <input
          className={erreur?.champ === "prenom" ? "input bad" : "input"}
          id="prenom"
          type="text"
          autoComplete="given-name"
          autoCapitalize="words"
          enterKeyHint="next"
          maxLength={PRENOM_MAX}
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          aria-invalid={erreur?.champ === "prenom" || undefined}
          aria-describedby={erreur?.champ === "prenom" ? "form-err" : undefined}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label className="label" htmlFor="mail">
          Ton adresse email
        </label>
        <input
          className={erreur?.champ === "email" ? "input bad" : "input"}
          id="mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="next"
          maxLength={EMAIL_MAX}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={erreur?.champ === "email" || undefined}
          aria-describedby={erreur?.champ === "email" ? "form-err" : undefined}
        />
      </div>
      {erreur && (
        <div className="alert err" id="form-err" role="alert">
          <span className="ic" aria-hidden="true">
            !
          </span>
          <div>{erreur.texte}</div>
        </div>
      )}
      <p className="small">
        Pas de mot de passe : tu choisis un code secret à 4 chiffres à l'étape
        suivante.
      </p>
      <div className="grow"></div>
      <button
        type="submit"
        className="btn"
        disabled={envoi}
        aria-busy={envoi || undefined}
      >
        Continuer
      </button>
    </form>
  );
}
