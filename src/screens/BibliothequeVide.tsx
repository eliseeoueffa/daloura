// Écran fait à la main (retiré de scripts/import_maquettes.py) : maquette design/maquettes/Bibliotheque-vide.dc.html.
// « Ajouter des photos » ouvre la galerie ; les photos sont gardées dans le navigateur (src/lib/photos.ts).
import { Link, Navigate, useNavigate } from "react-router";
import { IMG } from "../assets/images";
import { ChoixFichier } from "../components/ChoixFichier";
import { useInspirations } from "../lib/photos";

export default function BibliothequeVide() {
  const navigate = useNavigate();
  const { inspirations, charge, ajouter } = useInspirations();
  // Elle a déjà des inspirations : on va directement à sa bibliothèque.
  if (charge && inspirations.length > 0)
    return <Navigate to="/bibliotheque" replace />;
  return (
    <div className="scr">
      <div className="top">
        <Link to="/" className="back">
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
      <h1 className="h1">Tes inspirations</h1>
      <p className="p">
        Ajoute les coiffures qui te font envie : captures Instagram, Pinterest,
        TikTok, WhatsApp ou photos de ta galerie.
      </p>
      <div
        style={{
          border: "2px dashed rgba(112,45,67,.3)",
          borderRadius: "18px",
          padding: "30px 20px 26px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "14px",
          textAlign: "center",
          background: "#FFFBF4",
        }}
      >
        <div style={{ position: "relative", width: "210px", height: "120px" }}>
          <div
            className="stk rays"
            style={{
              position: "absolute",
              left: "0",
              top: "18px",
              width: "86px",
              height: "96px",
              transform: "rotate(-10deg)",
              opacity: ".55",
            }}
          >
            <img src={IMG.locs} alt="" />
          </div>
          <div
            className="stk rays"
            style={{
              position: "absolute",
              left: "62px",
              top: "0",
              width: "86px",
              height: "96px",
              transform: "rotate(3deg)",
              zIndex: "2",
            }}
          >
            <img src={IMG.perruque} alt="" />
          </div>
          <div
            className="stk rays"
            style={{
              position: "absolute",
              left: "124px",
              top: "22px",
              width: "86px",
              height: "96px",
              transform: "rotate(11deg)",
              opacity: ".55",
            }}
          >
            <img src={IMG.afro} alt="" />
          </div>
        </div>
        <p className="h2">Ta bibliothèque t'attend</p>
        <p className="small">
          Tes photos prendront la place de ces stickers. Une coiffure bien
          visible par photo, de face si possible.
        </p>
      </div>
      <div className="grow"></div>
      <ChoixFichier
        className="btn"
        multiple
        onFichiers={async (f) => {
          await ajouter(f);
          navigate("/bibliotheque");
        }}
      >
        Ajouter des photos
      </ChoixFichier>
      <p className="small" style={{ textAlign: "center" }}>
        Tes photos restent sur ton téléphone jusqu'à ton premier essai.
      </p>
    </div>
  );
}
