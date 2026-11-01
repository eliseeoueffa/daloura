import { IMG } from "../assets/images";

/** L'enveloppe de l'écran « Regarde tes mails » (maquette Code-mail-envoye). */
export function IllustrationMail() {
  return (
    <div
      style={{
        position: "relative",
        alignSelf: "center",
        width: "220px",
        height: "150px",
      }}
      aria-hidden="true"
    >
      <div
        style={{
          position: "absolute",
          inset: "20px 0 0 0",
          background: "#FFFBF4",
          border: "1.5px solid rgba(73,51,47,.18)",
          borderRadius: "10px",
          boxShadow: "0 12px 24px -14px rgba(73,51,47,.5)",
        }}
      ></div>
      <svg
        viewBox="0 0 220 130"
        style={{
          position: "absolute",
          left: "0",
          top: "20px",
          width: "220px",
          height: "130px",
        }}
      >
        <path
          d="M8 8 L110 78 L212 8"
          fill="none"
          stroke="#702D43"
          strokeWidth="3"
          strokeLinejoin="round"
        ></path>
      </svg>
      <div
        className="ico"
        style={{
          position: "absolute",
          right: "-10px",
          top: "0",
          width: "46px",
          height: "46px",
          borderRadius: "50%",
          boxShadow: "0 0 0 4px #F5EFE6",
        }}
      >
        <img src={IMG.logoInv} alt="" />
      </div>
    </div>
  );
}
