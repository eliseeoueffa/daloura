import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // Enregistrement fait dans src/main.tsx (registerSW) : vérifie les nouvelles versions et recharge.
      injectRegister: false,
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "Daloura",
        short_name: "Daloura",
        description: "Vois-toi avant de changer de coiffure.",
        lang: "fr",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#F5EFE6",
        theme_color: "#F5EFE6",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Nouvelle version : prend la main tout de suite sur les pages ouvertes (puis registerSW recharge).
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        // Données mobiles : on ne met en cache que l'alphabet latin des polices
        globIgnores: ["**/*latin-ext*", "**/*vietnamese*", "**/*cyrillic*", "**/*greek*"],
      },
    }),
  ],
});
