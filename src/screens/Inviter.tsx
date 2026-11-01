// Généré depuis design/maquettes/Inviter.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function Inviter() {
  return (
    <div className="scr">
      <div className="top">
        <Link to="/apercus" className="back">
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
      </div>
      <h1 className="h1">Demande l'avis de ton cercle</h1>
      <p className="small">Ce que tes proches vont recevoir :</p>
      <div
        className="card"
        style={{
          background: "#FFFDF8",
          gap: "10px",
          transform: "rotate(-1deg)",
          boxShadow: "0 14px 26px -16px rgba(73,51,47,.55)",
        }}
      >
        <div className="row" style={{ gap: "8px" }}>
          <div
            className="ico"
            style={{ width: "26px", height: "26px", borderRadius: "7px" }}
          >
            <img src={IMG.logoInv} alt="" />
          </div>
          <span className="small">daloura</span>
        </div>
        <p
          className="label"
          style={{
            fontFamily: "'Corben', Georgia, serif",
            color: "#702D43",
            fontSize: "18px",
            fontVariantLigatures: "none",
          }}
        >
          Awa hésite entre 3 looks. Lequel lui va le mieux ?
        </p>
        <div className="g3" style={{ gap: "8px" }}>
          <div
            className="pola"
            style={{ padding: "5px 5px 0", transform: "rotate(-4deg)" }}
          >
            <div className="ph bg-rose">
              <img src={IMG.fulani} alt="" />
            </div>
            <div
              className="cap"
              style={{
                fontSize: "13px",
                textAlign: "center",
                padding: "2px 0 4px",
              }}
            >
              1
            </div>
          </div>
          <div className="pola" style={{ padding: "5px 5px 0" }}>
            <div className="ph bg-sun">
              <img src={IMG.knots} alt="" />
            </div>
            <div
              className="cap"
              style={{
                fontSize: "13px",
                textAlign: "center",
                padding: "2px 0 4px",
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
              <img src={IMG.knotless} alt="" />
            </div>
            <div
              className="cap"
              style={{
                fontSize: "13px",
                textAlign: "center",
                padding: "2px 0 4px",
              }}
            >
              3
            </div>
          </div>
        </div>
        <p className="small">Vote en 10 secondes, sans compte.</p>
      </div>
      <div className="g2">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            minWidth: "0",
          }}
        >
          <label className="label" htmlFor="prenom">
            Ton prénom
          </label>{" "}
          <input
            className="input"
            id="prenom"
            type="text"
            defaultValue="Awa"
            maxLength={20}
            autoComplete="given-name"
            placeholder="Ex. : Awa"
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            minWidth: "0",
          }}
        >
          <label className="label" htmlFor="rdv">
            Rendez-vous (facultatif)
          </label>{" "}
          <input
            className="input"
            id="rdv"
            type="date"
            defaultValue="2026-11-07"
            style={{ padding: "0 10px", fontSize: ".9375rem" }}
          />
        </div>
      </div>
      <p className="small">
        Le vote reste ouvert jusqu'à ton rendez-vous, ou 48 heures si tu n'en
        indiques pas.
      </p>
      <div className="grow"></div>
      <div className="foot">
        <Link to="/suivi-votes" className="btn">
          Envoyer sur WhatsApp
        </Link>{" "}
        <Link
          to="/suivi-votes"
          className="btn2"
          style={{ background: "#F5EFE6" }}
        >
          Copier le lien
        </Link>
      </div>
    </div>
  );
}
