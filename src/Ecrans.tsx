import { Link } from "react-router";
import { SCREENS } from "./screens/registry";

// Variantes d'un même écran (fausses données), pour les relire aussi.
const VARIANTES = [
  {
    path: "/recap-paiement?solde=bas",
    title: "Récapitulatif du recap (solde insuffisant)",
  },
];

// Index de relecture : tous les écrans de l'appli, pour les tester un par un sur téléphone.
export default function Ecrans() {
  return (
    <div className="scr">
      <div className="top">
        <span className="small">
          Relecture · {SCREENS.length + VARIANTES.length} écrans
        </span>
        <Link className="back" to="/">
          Accueil
        </Link>
      </div>
      <h1 className="h1">Tous les écrans</h1>
      <ol className="ecrans">
        {[...SCREENS, ...VARIANTES].map((s) => (
          <li key={s.path}>
            <Link className="lnk" to={s.path}>
              {s.title}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
