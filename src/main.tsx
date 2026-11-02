import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "@fontsource/corben/latin-700.css";
import "@fontsource/gochi-hand/latin-400.css";
import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "./styles/app.css";
import App from "./App";
import { registerSW } from "virtual:pwa-register";
import { demarrerEnvoi } from "./lib/envoi";

// Nouvelle version en ligne : le service worker la télécharge et la page se recharge toute seule
// (registerType "autoUpdate"). On vérifie au démarrage, quand l'appli revient au premier plan et
// toutes les 30 minutes, pour que personne ne reste bloqué sur une ancienne version.
registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (!registration) return;
    const verifier = () => void registration.update().catch(() => {});
    setInterval(verifier, 30 * 60_000);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") verifier();
    });
  },
});

// Envoi des photos vers R2 en arrière-plan (seulement après le consentement).
demarrerEnvoi();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
