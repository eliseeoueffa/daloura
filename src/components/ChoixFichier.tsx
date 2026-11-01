import { useRef, type ReactNode } from "react";

/**
 * Bouton qui ouvre le sélecteur de photos du système.
 * - galerie : la photothèque (ou l'explorateur de fichiers sur ordinateur) ;
 * - camera : l'appareil photo du téléphone (capture), sur ordinateur le sélecteur de fichiers.
 */
export function ChoixFichier({
  className,
  multiple = false,
  camera,
  onFichiers,
  children,
}: {
  className?: string;
  multiple?: boolean;
  camera?: "user" | "environment";
  onFichiers: (f: File[]) => void;
  children: ReactNode;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => input.current?.click()}
      >
        {children}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple={multiple}
        capture={camera}
        hidden
        onChange={(e) => {
          const f = Array.from(e.currentTarget.files ?? []);
          e.currentTarget.value = ""; // permet de choisir deux fois la même photo
          if (f.length) onFichiers(f);
        }}
      />
    </>
  );
}
