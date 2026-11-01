import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "@fontsource/corben/latin-700.css";
import "@fontsource/gochi-hand/latin-400.css";
import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "./styles/app.css";
import App from "./App";
import { demarrerEnvoi } from "./lib/envoi";

// Envoi des photos vers R2 en arrière-plan (seulement après le consentement).
demarrerEnvoi();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
