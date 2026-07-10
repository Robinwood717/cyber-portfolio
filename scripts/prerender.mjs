// Build-time prerender: renders each known route into dist/ as static HTML
// with route-specific meta, then removes the temporary SSR bundle.
// Runs as the last step of `npm run build` (see package.json).
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ssrEntry = pathToFileURL(resolve(root, "dist-ssr/entry-server.js")).href;
const { render, getRoutes, getMeta } = await import(ssrEntry);

const templatePath = resolve(root, "dist/index.html");
const template = readFileSync(templatePath, "utf8");

const escapeHtml = (s) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Function replacers throughout: a `$` in future title/summary data must
// never be interpreted as a regex replacement pattern.
const replaceMeta = (html, meta) => {
  const title = escapeHtml(meta.title);
  const desc = escapeHtml(meta.description);
  return html
    .replace(/<title>[^<]*<\/title>/, () => `<title>${title}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, (_, a, b) => a + desc + b)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/, (_, a, b) => a + title + b)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/, (_, a, b) => a + desc + b)
    .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/, (_, a, b) => a + title + b)
    .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/, (_, a, b) => a + desc + b);
};

for (const url of getRoutes()) {
  const appHtml = render(url);
  let html = template.replace(
    '<div id="root"></div>',
    () => `<div id="root">${appHtml}</div>`
  );
  const meta = getMeta(url);
  if (meta) html = replaceMeta(html, meta);

  const outFile =
    url === "/" ? templatePath : resolve(root, `dist${url}/index.html`);
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, html);
  console.log(`prerendered ${url}`);
}

rmSync(resolve(root, "dist-ssr"), { recursive: true, force: true });
