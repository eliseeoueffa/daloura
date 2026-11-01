import { useLocation } from "react-router";

/** Email transmis d'un écran à l'autre (state de la navigation), jamais dans l'URL. */
export function useEmailTransmis(): string {
  const state = useLocation().state as { email?: unknown } | null;
  return typeof state?.email === "string" ? state.email : "";
}

export const pluriel = (n: number, mot: string) =>
  `${n} ${mot}${n > 1 ? "s" : ""}`;
