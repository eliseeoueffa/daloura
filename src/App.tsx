import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import { SCREENS } from "./screens/registry";
import Ecrans from "./Ecrans";

// Chaque écran est chargé à la demande : le premier affichage ne télécharge que l'écran ouvert.
export default function App() {
  return (
    <Suspense fallback={<div className="scr" aria-busy="true" />}>
      <Routes>
        {SCREENS.map(({ path, Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        <Route path="/ecrans" element={<Ecrans />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
