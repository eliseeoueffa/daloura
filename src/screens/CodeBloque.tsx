// Connexion bloquée après 5 codes faux. Rendu dynamique à l'étape 2 (exclu du script d'import).
import { Link, useLocation } from "react-router";
import { pluriel } from "../auth/navigation";
import { Retour } from "../components/Retour";

export function texteBlocage(jusqua: unknown, now = Date.now()): string {
  if (typeof jusqua !== "number" || jusqua <= now)
    return "pendant quelques minutes";
  return `pendant ${pluriel(Math.max(1, Math.ceil((jusqua - now) / 60_000)), "minute")}`;
}

export default function CodeBloque() {
  const state = useLocation().state as {
    email?: string;
    jusqua?: number;
  } | null;
  // Sans état (relecture depuis /ecrans), on montre la durée du premier blocage.
  const duree = state ? texteBlocage(state.jusqua) : "pendant 2 minutes";
  return (
    <div className="scr">
      <div className="top">
        <Retour to="/">Accueil</Retour>
      </div>
      <div className="grow"></div>
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "#F3DDE1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "center",
        }}
      >
        <svg viewBox="0 0 24 24" width="38" height="38" aria-hidden="true">
          <rect
            x="5"
            y="10.5"
            width="14"
            height="10"
            rx="2"
            fill="none"
            stroke="#702D43"
            strokeWidth="1.8"
          ></rect>
          <path
            d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"
            fill="none"
            stroke="#702D43"
            strokeWidth="1.8"
            strokeLinecap="round"
          ></path>
        </svg>
      </div>
      <h1 className="h1" style={{ textAlign: "center" }}>
        Trop d'essais
      </h1>
      <p className="p" style={{ textAlign: "center" }}>
        Pour protéger tes selfies et ton carnet, la connexion est bloquée{" "}
        {duree}.
      </p>
      <p className="small" style={{ textAlign: "center" }}>
        Tu ne te souviens plus de ton code ? Reçois un lien pour en choisir un
        nouveau.
      </p>
      <div className="grow"></div>
      <Link to="/code-oublie" state={{ email: state?.email }} className="btn">
        Recevoir un lien par email
      </Link>
      <Link to="/" className="lnk">
        Revenir plus tard
      </Link>
    </div>
  );
}
