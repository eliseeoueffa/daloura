// Écran fait à la main (retiré de scripts/import_maquettes.py) : maquette design/maquettes/Paiement-reussi.dc.html.
// Sachets et prix : src/lib/perles.ts. Solde : src/lib/solde.ts.
import { Perles } from "../components/Perle";
import { SACHET_CONSEILLE, sachet } from "../lib/perles";
import { useSolde } from "../lib/solde";
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function PaiementReussi() {
  const achat = sachet(SACHET_CONSEILLE)!.perles; // provisoire : le sachet payé viendra de l'API
  return (
    <div className="scr wine">
      <div className="top">
        <span className="logo inv">
          <img src={IMG.logoInv} alt="" />
          daloura
        </span>
      </div>
      <div className="grow"></div>
      <div
        style={{
          position: "relative",
          alignSelf: "center",
          width: "280px",
          height: "220px",
        }}
      >
        <div
          className="stk rays round"
          style={{
            position: "absolute",
            left: "0",
            top: "40px",
            width: "110px",
            height: "110px",
            transform: "rotate(-10deg)",
          }}
        >
          <img src={IMG.fulani} alt="" />
        </div>
        <div
          className="stk rays round"
          style={{
            position: "absolute",
            left: "85px",
            top: "0",
            width: "120px",
            height: "120px",
            zIndex: "2",
          }}
        >
          <img src={IMG.knots} alt="" />
        </div>
        <div
          className="stk rays round"
          style={{
            position: "absolute",
            left: "170px",
            top: "50px",
            width: "110px",
            height: "110px",
            transform: "rotate(10deg)",
          }}
        >
          <img src={IMG.knotless} alt="" />
        </div>
      </div>
      <h1 className="h1" style={{ textAlign: "center" }}>
        C'est payé : <Perles n={achat} signe />
      </h1>
      <p className="p" style={{ textAlign: "center" }}>
        Tu as maintenant <Perles n={useSolde("apresAchat")} />.
      </p>
      <div className="grow"></div>
      <Link to="/choix-3" className="btn cream">
        Choisir mes coiffures
      </Link>
      <p className="small" style={{ textAlign: "center" }}>
        Un reçu t'a été envoyé à awa.k@gmail.com.
      </p>
    </div>
  );
}
