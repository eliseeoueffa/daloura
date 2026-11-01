// Écran fait à la main (retiré de scripts/import_maquettes.py) : maquette design/maquettes/Apercu-detail.dc.html.
// Montre les coiffures choisies et ses vraies photos d'inspiration ; l'aperçu reste
// l'illustration de la coiffure tant que l'IA n'est pas branchée.
import { Link, useSearchParams } from "react-router";
import { PhotoInspiration } from "../components/PhotoInspiration";
import { useLooks } from "../lib/essai";
import { voteAutorise } from "../lib/perles";

export default function ApercuDetail() {
  const looks = useLooks();
  const [params] = useSearchParams();
  const i = Math.min(Math.max(Number(params.get("i")) || 1, 1), looks.length);
  const look = looks[i - 1];
  const n = looks.length;
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
          {n > 1 ? `Mes ${n} aperçus` : "Mon aperçu"}
        </Link>
        <span>
          {i} sur {n}
        </span>
      </div>
      <div style={{ position: "relative" }}>
        <div className="pola" style={{ padding: "10px 10px 0" }}>
          <div className="ph bg-sun" style={{ aspectRatio: "1 / 1.12" }}>
            <img
              src={look.img}
              alt={`Aperçu : toi en ${look.nom.toLowerCase()}`}
            />
          </div>
          <div className="cap" style={{ fontSize: "19px" }}>
            moi, en {look.nom.toLowerCase()}
          </div>
        </div>
        <span
          className="pill on"
          style={{ position: "absolute", top: "20px", left: "20px" }}
        >
          aperçu
        </span>
      </div>
      <div
        className="card"
        style={{ flexDirection: "row", gap: "14px", alignItems: "center" }}
      >
        <div
          className="stk rays"
          style={{ width: "70px", height: "78px", flex: "none" }}
        >
          <PhotoInspiration slug={look.slug} alt="Ton inspiration" />
        </div>
        <div>
          <p className="label">Ton inspiration</p>
          <p className="small">
            Compare la forme et la taille avec ta photo d'origine.
          </p>
        </div>
      </div>
      {n > 1 && (
        <div className="dots" aria-label={`Aperçu ${i} sur ${n}`}>
          {looks.map((l, k) => (
            <Link
              key={l.slug}
              to={`/apercu-detail?i=${k + 1}`}
              replace
              aria-label={`Aperçu ${k + 1}`}
              style={{ flex: 1, padding: "10px 0", display: "flex" }}
            >
              <i className={k + 1 === i ? "on" : undefined} />
            </Link>
          ))}
        </div>
      )}
      <div className="grow"></div>
      {voteAutorise(n) ? (
        <Link to="/inviter" className="btn">
          Demander l'avis de ton cercle
        </Link>
      ) : (
        <Link to="/era-enregistree" className="btn">
          Garder dans mon carnet
        </Link>
      )}
    </div>
  );
}
