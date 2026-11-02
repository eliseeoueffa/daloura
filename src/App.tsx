import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import { SCREENS } from "./screens/registry";
import Ecrans from "./Ecrans";

// Pages légales (Lixali Studio SAS, RGPD et Code du numérique béninois).
const MentionsLegales = lazy(() => import("./pages/MentionsLegales"));
const Confidentialite = lazy(() => import("./pages/Confidentialite"));
const Conditions = lazy(() => import("./pages/Conditions"));

// Chaque écran est chargé à la demande : le premier affichage ne télécharge que l'écran ouvert.
export default function App() {
  return (
    <Suspense fallback={<div className="scr" aria-busy="true" />}>
      <Routes>
        {SCREENS.map(({ path, Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        <Route path="/ecrans" element={<Ecrans />} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/confidentialite" element={<Confidentialite />} />
        <Route path="/conditions" element={<Conditions />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
