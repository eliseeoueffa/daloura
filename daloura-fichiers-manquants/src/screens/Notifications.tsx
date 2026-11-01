// Généré depuis design/maquettes/Notifications.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function Notifications() {
  return (
    <div className="scr">
      <div className="top">
        <span className="logo">
          <img src={IMG.logo} alt="" />
          daloura
        </span>
      </div>
      <div className="grow"></div>
      <div style={{ position: "relative", height: "230px" }}>
        <div
          className="pola"
          style={{
            position: "absolute",
            left: "110px",
            top: "0",
            width: "150px",
            transform: "rotate(5deg)",
            filter: "blur(3px)",
            opacity: ".7",
          }}
        >
          <div className="ph bg-cream">
            <img src={IMG.knotless} alt="" />
          </div>
          <div className="cap">bientôt…</div>
        </div>
        <div
          className="card"
          style={{
            position: "absolute",
            left: "0",
            right: "0",
            bottom: "0",
            flexDirection: "row",
            gap: "12px",
            alignItems: "center",
            boxShadow: "0 14px 28px -14px rgba(73,51,47,.55)",
            zIndex: "2",
          }}
        >
          <div
            className="ico"
            style={{ width: "42px", height: "42px", borderRadius: "10px" }}
          >
            <img src={IMG.logoInv} alt="" />
          </div>
          <div>
            <p className="label">Ton aperçu est prêt</p>
            <p className="small">Viens voir ta coiffure knotless sur toi.</p>
          </div>
        </div>
      </div>
      <h1 className="h1">On te prévient quand ton aperçu est prêt ?</h1>
      <p className="p">
        La création prend entre 30 secondes et 2 minutes. Tu peux fermer l'app
        en attendant.
      </p>
      <div className="grow"></div>
      <Link to="/attente" className="btn">
        Oui, préviens-moi
      </Link>{" "}
      <Link to="/attente" className="lnk">
        Pas maintenant
      </Link>
    </div>
  );
}
