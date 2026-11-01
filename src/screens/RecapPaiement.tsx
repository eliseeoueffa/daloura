// Écran fait à la main (retiré de scripts/import_maquettes.py) : maquette design/maquettes/Recap-paiement.dc.html.
// Prix des recaps : src/lib/perles.ts. Solde : src/lib/solde.ts.
import { Link, useSearchParams } from "react-router";
import { Perle, Perles } from "../components/Perle";
import { RECAPS, coutRecap } from "../lib/perles";
import { useSolde } from "../lib/solde";
import { IMG } from "../assets/images";

export default function RecapPaiement() {
  const [params] = useSearchParams();
  const mois =
    RECAPS.find((r) => r.mois === Number(params.get("mois")))?.mois ?? 6;
  const cout = coutRecap(mois)!;
  // Provisoire : ?solde=bas montre l'état « solde insuffisant » dans /ecrans.
  const solde = useSolde(
    params.get("solde") === "bas" ? "recapInsuffisant" : "recapSuffisant",
  );
  const assez = solde >= cout;
  return (
    <div className="scr">
      <div className="top">
        <Link to="/carnet" className="back">
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
          Carnet
        </Link>
        <span className="pill">
          <Perles n={solde} />
        </span>
      </div>
      <h1 className="h1">Ton récapitulatif</h1>
      <p className="small">L'offre que tu as choisie :</p>
      <div
        style={{
          background: "#E8A93A",
          borderRadius: "12px",
          padding: "18px 14px 14px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          color: "#49332F",
          position: "relative",
          marginTop: "6px",
        }}
      >
        <span
          className="pill"
          style={{
            position: "absolute",
            top: "-13px",
            left: "14px",
            minHeight: "26px",
            padding: "0 10px",
            background: "#702D43",
            color: "#F5EFE6",
          }}
        >
          {mois} mois
        </span>
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
            My Hair Recap
          </p>
          <p className="h2" style={{ whiteSpace: "nowrap" }}>
            <Perles n={cout} />
          </p>
        </div>
        <p style={{ margin: "0", fontSize: "14px" }}>
          Tes eras de juin à novembre 2026, réunies dans un recap à garder ou à
          partager.
        </p>
        <div className="row" style={{ gap: "6px" }}>
          <div
            className="pola"
            style={{
              width: "46px",
              padding: "3px 3px 0",
              transform: "rotate(-6deg)",
            }}
          >
            <div className="ph bg-cream">
              <img src={IMG.knotless} alt="" />
            </div>
            <div style={{ height: "7px" }}></div>
          </div>
          <div
            className="pola"
            style={{
              width: "46px",
              padding: "3px 3px 0",
              transform: "rotate(3deg)",
            }}
          >
            <div className="ph bg-rose">
              <img src={IMG.fulani} alt="" />
            </div>
            <div style={{ height: "7px" }}></div>
          </div>
          <div
            className="pola"
            style={{
              width: "46px",
              padding: "3px 3px 0",
              transform: "rotate(-2deg)",
            }}
          >
            <div className="ph bg-sun">
              <img src={IMG.knots} alt="" />
            </div>
            <div style={{ height: "7px" }}></div>
          </div>
          <span
            style={{ fontSize: "13px", fontWeight: "650", marginLeft: "6px" }}
          >
            3 eras incluses
          </span>
        </div>
      </div>
      {assez ? (
        <>
          <div className="card" style={{ gap: "6px" }}>
            <p className="p">
              Ton recap de {mois} mois : <Perles n={cout} />. Il t'en restera{" "}
              <Perle />
              {solde - cout}.
            </p>
            <p className="small">
              Payé avec tes perles, sans nouveau paiement.
            </p>
          </div>
          <div className="grow"></div>
          <Link to="/recap" className="btn">
            Créer mon recap
          </Link>
        </>
      ) : (
        <>
          <div className="alert err">
            <span className="ic">!</span>
            <div>
              <b>
                Il te manque <Perles n={cout - solde} />
              </b>
              Ton recap de {mois} mois coûte <Perles n={cout} />. Recharge pour
              le créer.
            </div>
          </div>
          <div className="grow"></div>
          <Link to="/recharger" className="btn">
            Recharger mes perles
          </Link>
        </>
      )}
      <Link to="/carnet" className="lnk">
        Choisir une autre période
      </Link>
    </div>
  );
}
