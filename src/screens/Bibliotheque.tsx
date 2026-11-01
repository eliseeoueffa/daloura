// Écran fait à la main (retiré de scripts/import_maquettes.py) : maquette design/maquettes/Bibliotheque.dc.html.
// Les inspirations sont gardées dans le navigateur (src/lib/photos.ts) jusqu'à l'envoi vers R2 (étape 3).
// Sans photo, l'écran montre les stickers d'exemple de la maquette.
import { useState } from "react";
import { Link } from "react-router";
import { IMG } from "../assets/images";
import { ChoixFichier } from "../components/ChoixFichier";
import { useInspirations, useUrl, type Inspiration } from "../lib/photos";

const EXEMPLES = [
  { nom: "Knotless", img: IMG.knotless },
  { nom: "Fulani", img: IMG.fulani },
  { nom: "Bantu knots", img: IMG.knots },
  { nom: "Perruque", img: IMG.perruque },
  { nom: "Cheveux naturels", img: IMG.afro },
  { nom: "Locks", img: IMG.locs },
];

function Photo({
  inspiration,
  rang,
  onRetirer,
}: {
  inspiration: Inspiration;
  rang: number;
  onRetirer: () => void;
}) {
  const url = useUrl(inspiration.blob);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        position: "relative",
      }}
    >
      <div className="stk" style={{ height: "120px", background: "#EADFCF" }}>
        {url && (
          <img
            src={url}
            alt={`Inspiration ${rang}`}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
      </div>
      <button
        type="button"
        className="badge"
        onClick={onRetirer}
        aria-label={`Retirer l'inspiration ${rang}`}
        style={{ border: "0", cursor: "pointer", fontSize: "1rem" }}
      >
        ×
      </button>
      <span className="stk-name">Photo {rang}</span>
    </div>
  );
}

export default function Bibliotheque() {
  const { inspirations, ajouter, retirer } = useInspirations();
  const [message, setMessage] = useState<string | null>(null);
  const n = inspirations.length;

  async function ajouterPhotos(f: File[]) {
    const ok = await ajouter(f);
    setMessage(
      ok < f.length
        ? "Certains fichiers n'étaient pas des photos lisibles : ils n'ont pas été ajoutés."
        : null,
    );
  }

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
        {n > 0 && (
          <span className="pill">{n > 1 ? `${n} photos` : "1 photo"}</span>
        )}
      </div>
      <h1 className="h1">Tes inspirations</h1>
      <div className="g3" style={{ rowGap: "14px" }}>
        {n > 0
          ? inspirations.map((i, k) => (
              <Photo
                key={i.id}
                inspiration={i}
                rang={k + 1}
                onRetirer={() => retirer(i.id)}
              />
            ))
          : EXEMPLES.map((e) => (
              <div
                key={e.nom}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  opacity: ".55",
                }}
              >
                <div className="stk rays" style={{ height: "120px" }}>
                  <img src={e.img} alt="" />
                </div>
                <span className="stk-name">{e.nom}</span>
              </div>
            ))}
        {n > 0 && (
          <ChoixFichier
            className="stk-ajout"
            multiple
            onFichiers={ajouterPhotos}
          >
            <span
              aria-hidden="true"
              style={{ fontSize: "28px", lineHeight: "1" }}
            >
              +
            </span>
            Ajouter
          </ChoixFichier>
        )}
      </div>
      {message && (
        <div className="alert err" role="alert">
          <span className="ic">!</span>
          <div>{message}</div>
        </div>
      )}
      {n === 0 && (
        <div className="alert">
          <span className="ic">+</span>
          <div>Télécharge tes inspirations depuis ta galerie.</div>
        </div>
      )}
      <ChoixFichier className="btn2" multiple onFichiers={ajouterPhotos}>
        Ajouter des photos
      </ChoixFichier>
      <div className="grow"></div>
      <Link to="/selfie" className="btn">
        Continuer avec ton selfie
      </Link>
    </div>
  );
}
