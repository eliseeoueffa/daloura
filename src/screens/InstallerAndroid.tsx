// Généré depuis design/maquettes/Installer-android.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function InstallerAndroid() {
  return (
    <div className="scr">
      <div className="top">
        <span className="logo">
          <img src={IMG.logo} alt="" />
          daloura
        </span>
      </div>
      <div style={{ position: "relative", height: "330px", opacity: ".45" }}>
        <div
          className="pola"
          style={{
            position: "absolute",
            left: "30px",
            top: "30px",
            width: "150px",
            transform: "rotate(-7deg)",
          }}
        >
          <div className="ph bg-sun">
            <img src={IMG.knots} alt="" />
          </div>
          <div className="cap">era 1</div>
        </div>
        <div
          className="pola"
          style={{
            position: "absolute",
            left: "170px",
            top: "10px",
            width: "150px",
            transform: "rotate(6deg)",
          }}
        >
          <div className="ph bg-rose">
            <img src={IMG.fulani} alt="" />
          </div>
          <div className="cap">à essayer</div>
        </div>
      </div>
      <div className="grow"></div>
      <div className="sheet">
        <div className="row">
          <div
            className="ico"
            style={{ width: "60px", height: "60px", borderRadius: "15px" }}
          >
            <img src={IMG.logoInv} alt="Icône Daloura" />
          </div>
          <div>
            <p className="h2">Garde Daloura sur ton écran</p>
            <p className="small">
              Comme une app, sans passer par le Play Store. Elle prend peu de
              place.
            </p>
          </div>
        </div>
        <p className="p">
          Tu retrouves ton carnet en un geste et tu reçois les notifications de
          ton cercle.
        </p>
        <Link to="/era-enregistree" className="btn">
          Installer
        </Link>{" "}
        <Link to="/era-enregistree" className="lnk">
          Plus tard
        </Link>
      </div>
    </div>
  );
}
