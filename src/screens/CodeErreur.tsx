// État « code incorrect » de la connexion. L'écran réel est CodeSaisie ; cette route sert à la
// relecture (/ecrans) avec des valeurs d'exemple. Rendu dynamique à l'étape 2.
import CodeSaisie from "./CodeSaisie";

export default function CodeErreur() {
  return (
    <CodeSaisie
      demo={{ type: "code", essaisRestants: 2, prochainBlocageMinutes: 2 }}
    />
  );
}
