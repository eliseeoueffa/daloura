// Écran fait à la main (retiré de scripts/import_maquettes.py) : maquette design/maquettes/Recharger.dc.html.
// Sachets et prix : src/lib/perles.ts. Solde : src/lib/solde.ts.
import { useState } from "react";
import { Link } from "react-router";
import { Perles } from "../components/Perle";
import { RappelCout, Sachets } from "../components/Sachets";
import {
  SACHET_CONSEILLE,
  dureesRecap,
  sachet,
  type SachetId,
} from "../lib/perles";
import { useSolde } from "../lib/solde";
import { IMG } from "../assets/images";

export default function Recharger() {
  const [choisi, setChoisi] = useState<SachetId>(SACHET_CONSEILLE);
  return (
    <div className="scr" style={{ gap: "14px" }}>
      <div className="top">
        <Link to="/profil" className="back">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M15 5l-7 7 7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
          Profil
        </Link>
        <span className="pill">
          <Perles n={useSolde("apresEssai")} />
        </span>
      </div>
      <h1 className="h1">Recharge tes perles</h1>
      <p className="p">
        Choisis ton sachet. Tes perles s'ajoutent à celles qu'il te reste.
      </p>
      <div style={{ position: "relative", height: "96px" }}>
        <div
          className="stk rays"
          style={{
            position: "absolute",
            left: "6px",
            top: "10px",
            width: "70px",
            height: "78px",
            transform: "rotate(-9deg)",
          }}
        >
          <img src={IMG.afro} alt="" />
        </div>
        <div
          className="stk rays"
          style={{
            position: "absolute",
            left: "64px",
            top: "0",
            width: "70px",
            height: "78px",
            transform: "rotate(2deg)",
            zIndex: "2",
          }}
        >
          <img src={IMG.locs} alt="" />
        </div>
        <div
          className="stk rays"
          style={{
            position: "absolute",
            left: "122px",
            top: "12px",
            width: "70px",
            height: "78px",
            transform: "rotate(10deg)",
          }}
        >
          <img src={IMG.perruque} alt="" />
        </div>
        <span
          className="hand"
          style={{
            position: "absolute",
            right: "0",
            top: "24px",
            width: "120px",
          }}
        >
          ta prochaine era t'attend
        </span>
      </div>
      <Sachets choisi={choisi} onChoix={setChoisi} />
      <RappelCout />
      <p className="small">
        Ton hair recap sur {dureesRecap()} mois se crée depuis ton{" "}
        <Link to="/carnet" style={{ color: "#702D43", fontWeight: "650" }}>
          carnet
        </Link>
        .
      </p>
      <div className="grow"></div>
      <Link to={`/paiement?sachet=${choisi}`} className="btn">
        Continuer avec {sachet(choisi)!.nom}
      </Link>
      <p className="small" style={{ textAlign: "center" }}>
        Paiement sécurisé par Itaja. Pas d'abonnement.
      </p>
    </div>
  );
}
