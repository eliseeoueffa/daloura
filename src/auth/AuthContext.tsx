// État des comptes partagé entre les écrans :
// - l'utilisatrice connectée (ou null) ;
// - le brouillon d'inscription (prénom, email, code), gardé en mémoire seulement : jamais
//   écrit sur le téléphone. Un rechargement de page ramène à l'écran Connexion.
import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, type Utilisatrice } from "../api/auth";
import { marquerAppareil } from "./appareil";

export type Brouillon = { prenom?: string; email?: string; code?: string };

type Auth = {
  utilisatrice: Utilisatrice | null;
  brouillon: Brouillon;
  majBrouillon: (b: Partial<Brouillon>) => void;
  viderBrouillon: () => void;
  /** À appeler après une inscription ou une connexion réussie. */
  connectee: (u: Utilisatrice) => void;
  deconnecter: () => Promise<void>;
};

const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({
  children,
  initial,
}: {
  children: ReactNode;
  /** Pour les tests : état de départ. */
  initial?: { utilisatrice?: Utilisatrice; brouillon?: Brouillon };
}) {
  const [utilisatrice, setUtilisatrice] = useState<Utilisatrice | null>(
    initial?.utilisatrice ?? null,
  );
  const [brouillon, setBrouillon] = useState<Brouillon>(
    initial?.brouillon ?? {},
  );

  const majBrouillon = useCallback(
    (b: Partial<Brouillon>) => setBrouillon((prev) => ({ ...prev, ...b })),
    [],
  );
  const viderBrouillon = useCallback(() => setBrouillon({}), []);
  const connectee = useCallback((u: Utilisatrice) => {
    marquerAppareil();
    setUtilisatrice(u);
    setBrouillon({});
  }, []);
  const deconnecter = useCallback(async () => {
    await api.deconnexion();
    setUtilisatrice(null);
  }, []);

  const value = useMemo(
    () => ({
      utilisatrice,
      brouillon,
      majBrouillon,
      viderBrouillon,
      connectee,
      deconnecter,
    }),
    [
      utilisatrice,
      brouillon,
      majBrouillon,
      viderBrouillon,
      connectee,
      deconnecter,
    ],
  );
  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): Auth {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}
