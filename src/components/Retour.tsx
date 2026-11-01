import { Link } from "react-router";

/** Lien « Retour » en haut des écrans, identique aux maquettes. */
export function Retour({
  to,
  children = "Retour",
}: {
  to: string;
  children?: string;
}) {
  return (
    <Link to={to} className="back">
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
      {children}
    </Link>
  );
}
