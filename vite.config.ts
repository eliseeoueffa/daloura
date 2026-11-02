import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Pages publiques à référencer (les écrans de l'appli, eux, demandent un parcours ou un compte).
const PAGES_PUBLIQUES = [
  "/",
  "/mentions-legales",
  "/confidentialite",
  "/conditions",
];

/** Écrit robots.txt et sitemap.xml au build, avec l'adresse publique (VITE_SITE_URL). */
function referencement(site: string): Plugin {
  return {
    name: "daloura-referencement",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /ecrans\n\nSitemap: ${site}/sitemap.xml\n`,
      });
      const jour = new Date().toISOString().slice(0, 10);
      const urls = PAGES_PUBLIQUES.map(
        (p) => `  <url><loc>${site}${p}</loc><lastmod>${jour}</lastmod></url>`,
      ).join("\n");
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    referencement(loadEnv(mode, process.cwd(), "VITE_").VITE_SITE_URL ?? ""),
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
          {
            src: "/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        // Captures montrées dans la fenêtre d'installation (Android) : scripts/generer_visuels.cjs
        screenshots: [
          {
            src: "/screenshots/accueil.png",
            sizes: "780x1688",
            type: "image/png",
            form_factor: "narrow",
            label: "Vois-toi avant de changer",
          },
          {
            src: "/screenshots/choix.png",
            sizes: "780x1688",
            type: "image/png",
            form_factor: "narrow",
            label: "Choisis jusqu'à 3 coiffures",
          },
          {
            src: "/screenshots/apercus.png",
            sizes: "780x1688",
            type: "image/png",
            form_factor: "narrow",
            label: "Tes aperçus, ton cercle vote",
          },
          {
            src: "/screenshots/carnet.png",
            sizes: "780x1688",
            type: "image/png",
            form_factor: "narrow",
            label: "Le carnet de tes coiffures",
          },
        ],
      },
      workbox: {
        // Nouvelle version : prend la main tout de suite sur les pages ouvertes (puis registerSW recharge).
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        // Les grosses images de partage et d'installation ne servent pas hors connexion.
        globIgnores: [
          "**/og-image.png",
          "**/screenshots/**",
          "**/*latin-ext*",
          "**/*vietnamese*",
          "**/*cyrillic*",
          "**/*greek*",
        ],
        // (et données mobiles : on ne met en cache que l'alphabet latin des polices)
      },
    }),
  ],
}));
