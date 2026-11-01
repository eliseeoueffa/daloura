// Écran fait à la main (retiré de scripts/import_maquettes.py) : maquette design/maquettes/Offres.dc.html.
// Sachets et prix : src/lib/perles.ts. Solde : src/lib/solde.ts.
import { useState } from "react";
import { Link } from "react-router";
import { Perles } from "../components/Perle";
import { PrixRecaps, RappelCout, Sachets } from "../components/Sachets";
import {
  SACHET_CONSEILLE,
  dureesRecap,
  sachet,
  type SachetId,
} from "../lib/perles";
import { useSolde } from "../lib/solde";
import { IMG } from "../assets/images";

export default function Offres() {
  const [choisi, setChoisi] = useState<SachetId>(SACHET_CONSEILLE);
  return (
    <div className="scr" style={{ gap: "14px" }}>
      <div className="top">
        <Link to="/apercu-offert" className="back">
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
          Retour
        </Link>
        <span className="pill">
          <Perles n={useSolde("vide")} />
        </span>
      </div>
      <div style={{ position: "relative", height: "104px" }}>
        <div
          className="stk rays"
          style={{
            position: "absolute",
            left: "10px",
            top: "12px",
            width: "76px",
            height: "84px",
            transform: "rotate(-9deg)",
          }}
        >
          <img src={IMG.fulani} alt="" />
        </div>
        <div
          className="stk rays"
          style={{
            position: "absolute",
            left: "74px",
            top: "0",
            width: "76px",
            height: "84px",
            transform: "rotate(2deg)",
            zIndex: "2",
          }}
        >
          <img src={IMG.knots} alt="" />
        </div>
        <div
          className="stk rays"
          style={{
            position: "absolute",
            left: "138px",
            top: "14px",
            width: "76px",
            height: "84px",
            transform: "rotate(10deg)",
          }}
        >
          <img src={IMG.knotless} alt="" />
        </div>
        <span
          className="hand"
          style={{
            position: "absolute",
            right: "0",
            top: "26px",
            width: "110px",
          }}
        >
          3 looks, ton cercle choisit
        </span>
      </div>
      <h1 className="h1">Ton rendez-vous approche ?</h1>
      <Sachets choisi={choisi} onChoix={setChoisi} />
      <RappelCout />
      <div
        style={{
          background: "#E8A93A",
          borderRadius: "12px",
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          color: "#49332F",
        }}
      >
        <div className="row" style={{ justifyContent: "space-between" }}>
          <p
            style={{
              margin: "0",
              fontFamily: "'Corben', Georgia, serif",
              fontWeight: "700",
              fontSize: "18px",
              fontVariantLigatures: "none",
            }}
          >
            Bonus : My Hair Recap
          </p>
          <span className="pill" style={{ background: "#F5EFE6" }}>
            en plus
          </span>
        </div>
        <p style={{ margin: "0", fontSize: "14px" }}>
          Ton récap de coiffures sur {dureesRecap()} mois, à créer depuis ton
          carnet.
        </p>
        <PrixRecaps />
      </div>
      <div className="grow"></div>
      <Link to={`/paiement?sachet=${choisi}`} className="btn">
        Continuer avec {sachet(choisi)!.nom}
      </Link>
      <p className="small" style={{ textAlign: "center" }}>
        Pas d'abonnement. Tu paies seulement quand tu en as besoin.
      </p>
    </div>
  );
}
