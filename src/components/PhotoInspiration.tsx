import { coiffure } from "../lib/coiffures";
import { useInspirations, useUrl } from "../lib/photos";

/** Sa photo d'inspiration pour cette coiffure, ou l'illustration si elle n'en a pas mis. */
export function PhotoInspiration({ slug, alt }: { slug: string; alt: string }) {
  const { de } = useInspirations();
  const url = useUrl(de(slug)?.blob);
  if (url)
    return (
      <img
        className="vraie-photo"
        src={url}
        alt={alt}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  return <img src={coiffure(slug)?.img} alt={alt} />;
}
