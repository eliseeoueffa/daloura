import { useEffect, type ReactNode } from "react";
import { Link } from "react-router";
import { MAJ_TEXTES_LEGAUX } from "../lib/societe";

/** Mise en page commune des pages légales. */
export function PageLegale({
  titre,
  children,
}: {
  titre: string;
  children: ReactNode;
}) {
  useEffect(() => {
    document.title = `${titre} · Daloura`;
    return () => {
      document.title = "Daloura · Essaie une coiffure sur ton visage avant le salon";
    };
  }, [titre]);
  return (
    <div className="scr legal">
      <div className="top">
        <Link
          to="/"
          className="back"
          onClick={(e) =>
            history.length > 1 && (e.preventDefault(), history.back())
          }
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M15 5l-7 7 7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Retour
        </Link>
      </div>
      <h1 className="h1">{titre}</h1>
      <p className="small">Dernière mise à jour : {MAJ_TEXTES_LEGAUX}</p>
      {children}
      <nav className="legal-liens" aria-label="Informations légales">
        <Link to="/mentions-legales">Mentions légales</Link>
        <Link to="/confidentialite">Confidentialité</Link>
        <Link to="/conditions">Conditions d'utilisation</Link>
      </nav>
    </div>
  );
}

/** Valeur d'une info légale, ou « à compléter » surligné si elle manque encore. */
export function Info({ v }: { v: string | null }) {
  return v ? <>{v}</> : <mark className="a-completer">à compléter</mark>;
}

/** Liens vers les textes légaux, pour les bas de page. */
export function LiensLegaux({ style }: { style?: React.CSSProperties }) {
  return (
    <nav
      className="legal-liens"
      aria-label="Informations légales"
      style={style}
    >
      <Link to="/mentions-legales">Mentions légales</Link>
      <Link to="/confidentialite">Confidentialité</Link>
      <Link to="/conditions">Conditions</Link>
    </nav>
  );
}
