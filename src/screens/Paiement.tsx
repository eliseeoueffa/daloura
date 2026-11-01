// Écran fait à la main (retiré de scripts/import_maquettes.py) : maquette design/maquettes/Paiement.dc.html.
// Sachets et prix : src/lib/perles.ts. Solde : src/lib/solde.ts.
import { Link, useSearchParams } from "react-router";
import { Perles } from "../components/Perle";
import {
  formatCoiffures,
  SACHET_CONSEILLE,
  formatXof,
  generationsDe,
  sachet,
} from "../lib/perles";

export default function Paiement() {
  const [params] = useSearchParams();
  const s = sachet(params.get("sachet") ?? "") ?? sachet(SACHET_CONSEILLE)!;
  return (
    <div className="scr">
      <div className="top">
        <Link to="/offres" className="back">
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
          Offres
        </Link>
      </div>
      <h1 className="h1">Ton récapitulatif</h1>
      <p className="small">L'offre que tu as choisie :</p>
      <div className="card on">
        <p className="h2">
          {s.nom} · <Perles n={s.perles} /> · {formatXof(s.prixXof)}
        </p>
        <p className="small">
          {formatCoiffures(generationsDe(s.perles))} à générer quand tu veux.
        </p>
      </div>
      <div className="card" style={{ gap: "10px" }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <p className="h2">Total</p>
          <p className="h2" style={{ color: "#702D43" }}>
            {formatXof(s.prixXof)}
          </p>
        </div>
        <p className="small">Compte : awa.k@gmail.com</p>
      </div>
      <div
        className="card"
        style={{ background: "#F3DDE1", border: "0", gap: "8px" }}
      >
        <div className="row" style={{ gap: "10px" }}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
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
          <p className="label">Paiement sécurisé par Itaja</p>
        </div>
        <p className="small" style={{ color: "#49332F" }}>
          Tu vas être redirigée vers la page de paiement Itaja. Mobile Money,
          carte bancaire ou autre moyen, selon ton pays.
        </p>
      </div>
      <span className="hand">tu reviens ici juste après</span>
      <div className="grow"></div>
      <Link to="/paiement-externe" className="btn">
        Payer {formatXof(s.prixXof)}
      </Link>
      <p className="small" style={{ textAlign: "center" }}>
        Daloura ne voit jamais tes informations de paiement.
      </p>
    </div>
  );
}
