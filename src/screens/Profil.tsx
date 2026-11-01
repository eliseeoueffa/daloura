// Écran fait à la main (retiré de scripts/import_maquettes.py) : maquette design/maquettes/Profil.dc.html.
// Chiffres : src/lib/perles.ts. Solde : src/lib/solde.ts.
import { useState } from "react";
import { Link } from "react-router";
import { IMG } from "../assets/images";
import { Perle } from "../components/Perle";
import { effacerDuServeur } from "../lib/envoi";
import { effacerPhotos, useSelfieAffiche } from "../lib/photos";
import { useSolde } from "../lib/solde";

export default function Profil() {
  const { selfie, selfieStyle } = useSelfieAffiche();
  const [efface, setEfface] = useState(false);
  return (
    <div className="scr" style={{ paddingBottom: "0", gap: "14px" }}>
      <div className="top">
        <span className="logo">
          <img src={IMG.logo} alt="" />
          daloura
        </span>
      </div>
      <div className="row" style={{ gap: "14px" }}>
        <div
          className="face"
          style={{
            width: "72px",
            height: "72px",
            boxShadow: "0 0 0 4px #FFFDF8, 0 0 0 6px #E8A93A",
          }}
        >
          <img src={selfie} alt="Ton selfie" style={selfieStyle} />
        </div>
        <div style={{ minWidth: "0" }}>
          <h1 className="h1" style={{ fontSize: "26px" }}>
            Awa
          </h1>
          <p className="small">awa.k@gmail.com</p>
        </div>
      </div>
      <Link
        to="/recharger"
        className="card"
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          background: "#F3DDE1",
          border: "0",
          textDecoration: "none",
          minHeight: "52px",
        }}
      >
        <p
          style={{
            margin: "0",
            fontFamily: "'Corben', Georgia, serif",
            fontWeight: "700",
            fontSize: "22px",
            color: "#702D43",
            fontVariantLigatures: "none",
          }}
        >
          Mes perles · <Perle />
          {useSolde("apresEssai")}
        </p>
        <span
          style={{
            color: "#702D43",
            fontWeight: "700",
            fontSize: "15px",
            whiteSpace: "nowrap",
          }}
        >
          Recharger ›
        </span>{" "}
      </Link>
      <div className="card" style={{ padding: "0", gap: "0" }}>
        <Link
          to="/selfie"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px",
            minHeight: "52px",
            boxSizing: "border-box",
            textDecoration: "none",
            color: "#49332F",
            borderBottom: "1px solid rgba(73,51,47,.1)",
          }}
        >
          <span>
            <b style={{ fontSize: "15px" }}>Mon selfie</b>
            <br />
            <span className="small">Le changer ou le supprimer</span>
          </span>
          <span style={{ color: "#702D43" }}>›</span>
        </Link>{" "}
        <Link
          to="/code-nouveau"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px",
            minHeight: "52px",
            boxSizing: "border-box",
            textDecoration: "none",
            color: "#49332F",
            borderBottom: "1px solid rgba(73,51,47,.1)",
          }}
        >
          <span>
            <b style={{ fontSize: "15px" }}>Code secret</b>
            <br />
            <span className="small">Changer mon code à 4 chiffres</span>
          </span>
          <span style={{ color: "#702D43" }}>›</span>
        </Link>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px",
            minHeight: "52px",
            boxSizing: "border-box",
            borderBottom: "1px solid rgba(73,51,47,.1)",
          }}
        >
          <span>
            <b style={{ fontSize: "15px" }}>Notifications</b>
            <br />
            <span className="small">Aperçus prêts, votes du cercle</span>
          </span>
          <span
            role="img"
            aria-label="Activées"
            style={{
              width: "46px",
              height: "28px",
              borderRadius: "999px",
              background: "#702D43",
              position: "relative",
              flex: "none",
            }}
          >
            <span
              style={{
                position: "absolute",
                right: "3px",
                top: "3px",
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                background: "#F5EFE6",
              }}
            ></span>
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px",
            minHeight: "52px",
            boxSizing: "border-box",
            borderBottom: "1px solid rgba(73,51,47,.1)",
          }}
        >
          <span>
            <b style={{ fontSize: "15px" }}>Mes reçus</b>
            <br />
            <span className="small">
              Envoyés par email après chaque paiement
            </span>
          </span>
        </div>
        <button
          type="button"
          onClick={async () => {
            if (
              window.confirm(
                "Supprimer ton selfie, tes inspirations et tes aperçus, sur ce téléphone et sur nos serveurs ? C'est définitif.",
              )
            ) {
              await Promise.all([effacerPhotos(), effacerDuServeur()]);
              setEfface(true);
            }
          }}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px",
            minHeight: "52px",
            boxSizing: "border-box",
            textDecoration: "none",
            color: "#A1262E",
            background: "none",
            border: 0,
            font: "inherit",
            textAlign: "left",
            width: "100%",
            cursor: "pointer",
          }}
        >
          <span>
            <b style={{ fontSize: "15px" }}>
              {efface ? "Photos supprimées" : "Supprimer mes photos et aperçus"}
            </b>
            <br />
            <span className="small">
              Selfie, inspirations et aperçus, définitivement
            </span>
          </span>
          <span>›</span>
        </button>
      </div>
      <Link to="/" className="lnk">
        Me déconnecter
      </Link>
      <div className="grow"></div>
      <nav className="tabbar" aria-label="Navigation">
        <Link to="/carnet">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="3.5" width="14" height="17" rx="2"></rect>
              <path d="M9 3.5v17M12.5 8h3.5M12.5 11.5h3.5"></path>
            </g>
          </svg>
          Carnet
        </Link>{" "}
        <Link to="/choix-essai">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <ellipse cx="12" cy="9.5" rx="5.5" ry="6.5"></ellipse>
              <path d="M12 16v5M9.5 21h5M10 8l2.2-2"></path>
            </g>
          </svg>
          Essayer
        </Link>{" "}
        <Link to="/profil" className="on">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8.5" r="3.5"></circle>
              <path d="M5 20c1-3.8 3.8-5.5 7-5.5s6 1.7 7 5.5"></path>
            </g>
          </svg>
          Profil
        </Link>
      </nav>
    </div>
  );
}
