// Écran fait à la main (retiré de scripts/import_maquettes.py) : maquette design/maquettes/Paiement-attente.dc.html.
// Sachets et prix : src/lib/perles.ts. Solde : src/lib/solde.ts.
import { SACHET_CONSEILLE, formatXof, sachet } from "../lib/perles";
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function PaiementAttente() {
  const s = sachet(SACHET_CONSEILLE)!; // provisoire : le paiement en cours viendra de l'API
  return (
    <div className="scr">
      <div className="top">
        <span className="logo">
          <img src={IMG.logo} alt="" />
          daloura
        </span>
        <span>
          {s.nom} · {formatXof(s.prixXof)}
        </span>
      </div>
      <div className="grow"></div>
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          border: "6px solid #E8C3CB",
          borderTopColor: "#702D43",
          alignSelf: "center",
        }}
        aria-hidden="true"
      ></div>
      <h1 className="h1" style={{ textAlign: "center" }}>
        On vérifie ton paiement…
      </h1>
      <p className="p" style={{ textAlign: "center" }}>
        Itaja nous confirme ton paiement en quelques secondes. Si tu paies par
        Mobile Money, valide d'abord la demande sur ton téléphone.
      </p>
      <span className="hand" style={{ alignSelf: "center" }}>
        reste sur cette page
      </span>
      <div className="grow"></div>
      <Link to="/paiement-reussi" className="btn2">
        Paiement réussi (démo)
      </Link>{" "}
      <Link to="/paiement-echec" className="lnk">
        Paiement échoué (démo)
      </Link>
    </div>
  );
}
