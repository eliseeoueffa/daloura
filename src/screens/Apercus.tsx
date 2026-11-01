// Écran fait à la main (retiré de scripts/import_maquettes.py) : maquette design/maquettes/Apercus.dc.html.
// Montre les coiffures choisies ; l'aperçu reste l'illustration de la coiffure tant que l'IA
// n'est pas branchée. Chiffres : src/lib/perles.ts. Solde : src/lib/solde.ts.
import { Link } from "react-router";
import { IMG } from "../assets/images";
import { Perles } from "../components/Perle";
import { enLettres, useLooks } from "../lib/essai";
import { voteAutorise } from "../lib/perles";
import { useSolde } from "../lib/solde";

// Place des polaroïds selon le nombre d'aperçus (comme sur la maquette pour 3).
type Pos = { left: string; top: string; rot: number; z: number };
const POSITIONS: Record<number, Pos[]> = {
  1: [{ left: "calc(50% - 86px)", top: "10px", rot: -2, z: 1 }],
  2: [
    { left: "10px", top: "24px", rot: -6, z: 1 },
    { left: "calc(100% - 182px)", top: "0", rot: 5, z: 2 },
  ],
  3: [
    { left: "0", top: "34px", rot: -8, z: 1 },
    { left: "92px", top: "0", rot: 2, z: 2 },
    { left: "178px", top: "44px", rot: 9, z: 1 },
  ],
};
const FONDS = ["bg-rose", "bg-sun", "bg-cream"];

export default function Apercus() {
  const looks = useLooks();
  return (
    <div className="scr">
      <div className="top">
        <span className="logo">
          <img src={IMG.logo} alt="" />
          daloura
        </span>
        <span className="pill">
          <Perles n={useSolde("apresEssai")} />
        </span>
      </div>
      <h1 className="h1">
        Te voilà, en {enLettres(looks.length)} look{looks.length > 1 ? "s" : ""}
      </h1>
      <p className="small">Touche un aperçu pour le voir en grand.</p>
      <div style={{ position: "relative", height: "330px" }}>
        {looks.map((l, k) => {
          const p = POSITIONS[looks.length]?.[k] ?? POSITIONS[3][k % 3];
          return (
            <Link
              key={l.slug}
              to={`/apercu-detail?i=${k + 1}`}
              className="pola"
              style={{
                position: "absolute",
                left: p.left,
                top: p.top,
                width: "172px",
                transform: `rotate(${p.rot}deg)`,
                textDecoration: "none",
                display: "block",
                zIndex: p.z,
              }}
            >
              <span className="tape"></span>
              <div className={`ph ${FONDS[k % 3]}`}>
                <img src={l.img} alt={`Aperçu ${l.nom.toLowerCase()}`} />
              </div>
              <div className="cap">{l.nom.toLowerCase()}</div>
            </Link>
          );
        })}
      </div>
      <div className="alert">
        <span className="ic">i</span>
        <div>
          <b>Un aperçu, pas une promesse.</b>Le rendu final dépend de tes
          cheveux et de ta coiffeuse.
        </div>
      </div>
      <div className="grow"></div>
      {voteAutorise(looks.length) ? (
        <Link to="/inviter" className="btn">
          Demander l'avis de ton cercle
        </Link>
      ) : (
        <Link to="/era-enregistree" className="btn">
          Garder dans mon carnet
        </Link>
      )}
      <Link to="/choix-essai" className="lnk">
        Refaire un essai
      </Link>
    </div>
  );
}
