// Généré depuis design/maquettes/Paiement-attente.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function PaiementAttente() {
  return (
    <div className="scr">
      <div className="top">
        <span className="logo">
          <img src={IMG.logo} alt="" />
          daloura
        </span>
        <span>2 500 F</span>
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
