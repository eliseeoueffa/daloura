// Généré depuis design/maquettes/Paiement-externe.dc.html par scripts/import_maquettes.py.
// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.
import { Link } from "react-router";
import { IMG } from "../assets/images";

export default function PaiementExterne() {
  return (
    <div
      className="scr"
      style={{
        background: "#ECECEC",
        color: "#333333",
        fontFamily: "Arial, Helvetica, sans-serif",
        gap: "12px",
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "10px",
          padding: "10px 12px",
          fontSize: "12px",
          color: "#666666",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <rect
            x="5"
            y="10.5"
            width="14"
            height="10"
            rx="2"
            fill="none"
            stroke="#666666"
            strokeWidth="2"
          ></rect>
          <path
            d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"
            fill="none"
            stroke="#666666"
            strokeWidth="2"
          ></path>
        </svg>{" "}
        Itaja, paiement sécurisé{" "}
      </div>
      <div
        style={{
          border: "2px dashed #9A9A9A",
          borderRadius: "12px",
          padding: "10px 12px",
          background: "#F7F7F7",
        }}
      >
        <p style={{ margin: "0", fontSize: "13px", color: "#555555" }}>
          Page de paiement Itaja, en version neutre. Daloura lui transmet le
          montant, le logo et l'adresse de retour.
        </p>
      </div>
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "12px",
          padding: "18px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          flexGrow: "1",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            className="ico"
            style={{ width: "36px", height: "36px", borderRadius: "8px" }}
          >
            <img src={IMG.logoInv} alt="Logo Daloura" />
          </div>
          <div>
            <p style={{ margin: "0", fontWeight: "700", fontSize: "15px" }}>
              Daloura
            </p>
            <p style={{ margin: "0", fontSize: "13px", color: "#666666" }}>
              My Hair Era
            </p>
          </div>
        </div>
        <p style={{ margin: "0", fontSize: "26px", fontWeight: "700" }}>
          2 500 XOF
        </p>
        <p style={{ margin: "0", fontSize: "14px", fontWeight: "700" }}>
          Moyen de paiement
        </p>
        <div
          style={{
            border: "2px solid #333333",
            borderRadius: "8px",
            padding: "14px",
            fontSize: "15px",
          }}
        >
          Mobile Money
        </div>
        <div
          style={{
            border: "1px solid #CCCCCC",
            borderRadius: "8px",
            padding: "14px",
            fontSize: "15px",
          }}
        >
          Carte bancaire
        </div>
        <div
          style={{
            border: "1px solid #CCCCCC",
            borderRadius: "8px",
            padding: "14px",
            fontSize: "15px",
            color: "#888888",
          }}
        >
          [Autres moyens selon le pays]
        </div>
        <div style={{ flexGrow: "1" }}></div>
        <Link
          to="/paiement-attente"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50px",
            borderRadius: "8px",
            background: "#333333",
            color: "#FFFFFF",
            fontWeight: "700",
            textDecoration: "none",
          }}
        >
          Payer 2 500 XOF
        </Link>{" "}
        <Link
          to="/paiement-echec"
          style={{
            textAlign: "center",
            fontSize: "14px",
            color: "#555555",
            minHeight: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Annuler et revenir à Daloura
        </Link>
        <p
          style={{
            margin: "0",
            textAlign: "center",
            fontSize: "12px",
            color: "#888888",
          }}
        >
          Paiement sécurisé par Itaja
        </p>
      </div>
    </div>
  );
}
