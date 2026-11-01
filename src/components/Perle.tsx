import { formatPerles } from "../lib/perles";

/** Petite perle dorée (#E8A93A, reflet crème), décorative. */
export function Perle() {
  return <span className="perle" aria-hidden="true" />;
}

/** Une perle suivie du nombre accordé : « 0 perle », « 21 perles ». */
export function Perles({ n, signe = false }: { n: number; signe?: boolean }) {
  const texte = formatPerles(n);
  return (
    <span className="perles">
      <Perle />
      {signe && n > 0 ? `+${texte}` : texte}
    </span>
  );
}
