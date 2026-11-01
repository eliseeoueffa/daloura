// Généré depuis design/maquettes/Vote.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function Vote() {
  return (
    <div className="scr" style={{ gap: "14px" }}>
      <div className="top">
        <span className="logo">
          <img src={IMG.logo} alt="" />
          daloura
        </span>
        <span className="pill">Sans compte</span>
      </div>
      <h1 className="h1">Awa hésite. Aide-la à choisir.</h1>
      <p className="p">
        Elle va au salon samedi. Touche le look qui lui va le mieux.
      </p>
      <div className="g3" style={{ gap: "10px", marginTop: "6px" }}>
        <div
          className="pola"
          style={{ padding: "5px 5px 0", transform: "rotate(-4deg)" }}
        >
          <div className="ph bg-rose">
            <img src={IMG.fulani} alt="Look 1, fulani" />
          </div>
          <div
            className="cap"
            style={{
              fontSize: "14px",
              textAlign: "center",
              padding: "3px 0 5px",
            }}
          >
            1
          </div>
        </div>
        <div
          className="pola"
          style={{
            padding: "5px 5px 0",
            outline: "3px solid #702D43",
            outlineOffset: "3px",
            zIndex: "2",
          }}
        >
          <span className="badge">
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path
                d="M5 12.5l4.5 4.5L19 7.5"
                fill="none"
                stroke="#F5EFE6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </span>
          <div className="ph bg-sun">
            <img src={IMG.knots} alt="Look 2, bantu knots" />
          </div>
          <div
            className="cap"
            style={{
              fontSize: "14px",
              textAlign: "center",
              padding: "3px 0 5px",
            }}
          >
            2
          </div>
        </div>
        <div
          className="pola"
          style={{ padding: "5px 5px 0", transform: "rotate(4deg)" }}
        >
          <div className="ph bg-cream">
            <img src={IMG.knotless} alt="Look 3, knotless" />
          </div>
          <div
            className="cap"
            style={{
              fontSize: "14px",
              textAlign: "center",
              padding: "3px 0 5px",
            }}
          >
            3
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label className="label" htmlFor="nom">
          Ton prénom (facultatif)
        </label>{" "}
        <input
          className="input"
          id="nom"
          type="text"
          defaultValue="Mariam"
          maxLength={20}
          autoComplete="given-name"
          placeholder="Ex. : Mariam"
          aria-describedby="nom-aide"
        />
        <p className="small" id="nom-aide">
          Juste ton prénom : c'est ce qu'Awa verra.
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label className="label" htmlFor="mot">
          Un petit mot pour Awa (facultatif)
        </label>{" "}
        <input
          className="input"
          id="mot"
          type="text"
          defaultValue="Les bantu knots, sans hésiter !"
          maxLength={80}
          style={{
            fontFamily: "'Gochi Hand', cursive",
            fontSize: "19px",
            color: "#702D43",
          }}
        />
      </div>
      <div className="grow"></div>
      <Link to="/vote-merci" className="btn">
        Voter pour le look 2
      </Link>
      <p className="small" style={{ textAlign: "center" }}>
        Aperçus créés avec Daloura. Un aperçu, pas une promesse.
      </p>
    </div>
  );
}
