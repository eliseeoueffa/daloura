// Génère les visuels de partage et de fiche d'installation (à relancer si l'identité visuelle change) :
//   public/og-image.png (1200×630, aperçu des liens partagés)
//   public/screenshots/*.png (captures pour la fiche d'installation de l'appli)
// Usage : npm run build && npx vite preview --port 4173 & node scripts/generer_visuels.cjs
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const racine = path.resolve(__dirname, "..");
const lire = (p) => fs.readFileSync(path.join(racine, p)).toString("base64");
const svg = (n) => `data:image/svg+xml;base64,${lire(`src/assets/${n}.svg`)}`;
const police = (p) => `url(data:font/woff2;base64,${lire(p)}) format("woff2")`;

const og = `<!doctype html><html><head><style>
@font-face{font-family:Corben;font-weight:700;src:${police("node_modules/@fontsource/corben/files/corben-latin-700-normal.woff2")}}
@font-face{font-family:Bricolage;src:${police("node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2")}}
body{margin:0;width:1200px;height:630px;background:#F5EFE6;font-family:Bricolage,sans-serif;color:#49332F;display:flex;align-items:center;overflow:hidden}
.txt{padding:0 0 0 80px;width:560px}
.logo{display:flex;align-items:center;gap:14px;font-family:Corben;font-size:44px;color:#702D43}
.logo img{width:52px}
h1{font-family:Corben;font-size:74px;line-height:1.02;color:#702D43;margin:34px 0 22px}
p{font-size:30px;line-height:1.35;margin:0}
.pola{position:absolute;background:#FFFDF8;padding:14px 14px 54px;border-radius:6px;box-shadow:0 22px 40px -22px rgba(73,51,47,.6)}
.pola div{width:230px;height:250px;border-radius:4px;display:flex;align-items:flex-end;justify-content:center;overflow:hidden}
.pola img{width:92%}
</style></head><body>
<div class="txt"><div class="logo"><img src="${svg("d-miroir")}">daloura</div>
<h1>Vois-toi avant de changer.</h1><p>Essaie une coiffure sur ton visage avant d'aller au salon, et laisse ton cercle t'aider à choisir.</p></div>
<div class="pola" style="left:690px;top:120px;transform:rotate(-8deg)"><div style="background:#E8C3CB"><img src="${svg("portrait-fulani")}"></div></div>
<div class="pola" style="left:870px;top:70px;transform:rotate(6deg);z-index:2"><div style="background:#E8A93A"><img src="${svg("portrait-knots")}"></div></div>
<div class="pola" style="left:800px;top:330px;transform:rotate(-2deg);z-index:3"><div style="background:#EADFCF"><img src="${svg("portrait-knotless")}"></div></div>
</body></html>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.setContent(og);
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(racine, "public/og-image.png") });

  fs.mkdirSync(path.join(racine, "public/screenshots"), { recursive: true });
  const m = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  for (const [route, nom] of [["/", "accueil"], ["/choix-3", "choix"], ["/apercus", "apercus"], ["/carnet", "carnet"]]) {
    await m.goto(`http://localhost:4173${route}`, { waitUntil: "networkidle" });
    await m.waitForTimeout(300);
    await m.screenshot({ path: path.join(racine, `public/screenshots/${nom}.png`) });
  }
  await b.close();
})();
