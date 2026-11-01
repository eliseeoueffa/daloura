// Sachets de perles (Offres, Recharger) et prix des recaps : tout vient de src/lib/perles.ts.
import {
  COUT_GENERATION,
  MAX_COIFFURES,
  RECAPS,
  SACHETS,
  formatCoiffures,
  formatXof,
  generationsDe,
  type SachetId,
} from "../lib/perles";
import { Perles } from "./Perle";

const gros = {
  margin: "0",
  fontFamily: "'Corben', Georgia, serif",
  fontWeight: "700",
  fontSize: "22px",
  lineHeight: "1.1",
  color: "#702D43",
  fontVariantLigatures: "none",
  whiteSpace: "nowrap",
} as const;

/** « = 1 essai complet » si le sachet fait exactement un essai de MAX_COIFFURES, sinon « = 7 coiffures ». */
export function ceQueCaPermet(perles: number): string {
  const n = generationsDe(perles);
  return n === MAX_COIFFURES ? "= 1 essai complet" : `= ${formatCoiffures(n)}`;
}

export function Sachets({
  choisi,
  onChoix,
}: {
  choisi: SachetId;
  onChoix: (id: SachetId) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Sachets de perles"
      style={{ display: "flex", flexDirection: "column", gap: "10px" }}
    >
      {SACHETS.map((s) => (
        <button
          key={s.id}
          type="button"
          role="radio"
          aria-checked={choisi === s.id}
          onClick={() => onChoix(s.id)}
          className={choisi === s.id ? "card on" : "card"}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            textAlign: "left",
            font: "inherit",
            color: "inherit",
            cursor: "pointer",
          }}
        >
          <div style={{ minWidth: "0" }}>
            <p className="h2">{s.nom}</p>
            <p className="small">{ceQueCaPermet(s.perles)}</p>
          </div>
          <div style={{ textAlign: "right", flexShrink: "0" }}>
            <p style={gros}>
              <Perles n={s.perles} />
            </p>
            <p className="small" style={{ fontWeight: "650" }}>
              {formatXof(s.prixXof)}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

export function RappelCout() {
  return (
    <p className="small" style={{ textAlign: "center" }}>
      1 coiffure = <Perles n={COUT_GENERATION} /> · le vote de ton cercle est
      gratuit
    </p>
  );
}

/** Les 3 durées de recap avec leur prix en perles (encarts d'Offres et du Carnet). */
export function PrixRecaps({ choisi }: { choisi?: number }) {
  return (
    <div className="g3" style={{ gap: "6px" }}>
      {RECAPS.map((r) => (
        <span
          key={r.mois}
          style={{
            background: "#F5EFE6",
            borderRadius: "8px",
            padding: "6px 4px",
            textAlign: "center",
            fontSize: "13px",
            fontWeight: "650",
            boxShadow: choisi === r.mois ? "0 0 0 2px #702D43" : undefined,
          }}
        >
          {r.mois} mois
          <br />
          <Perles n={r.perles} />
        </span>
      ))}
    </div>
  );
}
