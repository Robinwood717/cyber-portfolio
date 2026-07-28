// Generates the static poster fallback for each 3D set piece by compositing
// a TRUE render of the model onto the site's framed poster background (void,
// faded grid, neon corner brackets, codename captions).
//
// The renders come from the real WebGL pipeline, not a stylized stand-in:
//   1. node scripts/poster-save-server.mjs        (receiver on :5190)
//   2. npx vite --port 5183                       (dev server at repo root)
//   3. open http://localhost:5183/scripts/poster-capture.html in a browser
//      - renders each public/models/*.glb with Scene3D's exact lights,
//        materials, and auto-framing camera, then POSTs the PNGs to the
//        receiver, which writes them to its ./renders directory
//   4. copy the captured PNGs to assets-src/renders/<slug>.png
//   5. node scripts/generate-model-posters.mjs    (this file)
//
// Output contract: public/models/posters/<slug>.webp, 960x720.

import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const rendersDir = join(here, "..", "assets-src", "renders");
const outDir = join(here, "..", "public", "models", "posters");
mkdirSync(outDir, { recursive: true });

const W = 960;
const H = 720;
const NEON = "#10b981";
const VOID = "#050505";
const GRIDLINE = "#1a1a1a";

const gridLines = (() => {
  let d = "";
  for (let x = 48; x < W; x += 48) d += `M${x} 0V${H}`;
  for (let y = 48; y < H; y += 48) d += `M0 ${y}H${W}`;
  return d;
})();

const bracket = (x, y, dx, dy) =>
  `<path d="M${x + dx * 26} ${y}H${x}V${y + dy * 26}" fill="none" stroke="${NEON}" stroke-opacity="0.55" stroke-width="2.5"/>`;

const frame = ({ codename, node }) => `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="0.5" cy="0.46" r="0.62">
      <stop offset="0" stop-color="${NEON}" stop-opacity="0.14"/>
      <stop offset="0.6" stop-color="${NEON}" stop-opacity="0.04"/>
      <stop offset="1" stop-color="${NEON}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="gridfade" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0" stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <mask id="gridmask"><rect width="${W}" height="${H}" fill="url(#gridfade)"/></mask>
  </defs>

  <rect width="${W}" height="${H}" fill="${VOID}"/>
  <path d="${gridLines}" stroke="${GRIDLINE}" stroke-width="1" mask="url(#gridmask)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  ${bracket(32, 32, 1, 1)}
  ${bracket(W - 32, 32, -1, 1)}
  ${bracket(32, H - 32, 1, -1)}
  ${bracket(W - 32, H - 32, -1, -1)}

  <text x="32" y="${H - 40}" font-family="JetBrains Mono" font-size="15" letter-spacing="3" fill="${NEON}" fill-opacity="0.85">${codename}</text>
  <text x="${W - 32}" y="${H - 40}" text-anchor="end" font-family="JetBrains Mono" font-size="13" letter-spacing="2" fill="#ffffff" fill-opacity="0.35">${node}</text>
</svg>`;

const MODELS = [
  { slug: "cipher-gate", codename: "CIPHER-GATE", node: "NODE.01 // ACCESS" },
  { slug: "data-core", codename: "DATA-CORE", node: "NODE.02 // TELEMETRY" },
  { slug: "quantum-lock", codename: "QUANTUM-LOCK", node: "NODE.03 // CRYPTO" },
];

const fontFiles = [
  join(here, "fonts", "SpaceGrotesk-700.ttf"),
  join(here, "fonts", "JetBrainsMono-400.ttf"),
  join(here, "fonts", "JetBrainsMono-500.ttf"),
];

for (const model of MODELS) {
  const renderPath = join(rendersDir, `${model.slug}.png`);
  if (!existsSync(renderPath)) {
    console.error(`missing ${renderPath} — run the capture harness first (see header)`);
    process.exitCode = 1;
    continue;
  }

  const resvg = new Resvg(frame(model), {
    fitTo: { mode: "width", value: W },
    font: { loadSystemFonts: false, fontFiles },
  });
  const background = resvg.render().asPng();

  // The capture is already 960x720 with a transparent background and the
  // model centered by the same camera math as the live scene, so it
  // composites 1:1 over the frame.
  const webp = await sharp(background)
    .composite([{ input: renderPath }])
    .webp({ quality: 82 })
    .toBuffer();

  const webpPath = join(outDir, `${model.slug}.webp`);
  writeFileSync(webpPath, webp);
  console.log(`${model.slug}.webp written: ${webp.length} bytes (${W}x${H})`);
}
