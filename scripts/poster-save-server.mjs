// Tiny receiver: the poster harness page POSTs raw PNG bytes here so the
// captures land on disk without round-tripping through the agent context.
import http from "node:http";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "renders");
mkdirSync(outDir, { recursive: true });

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }
  const m = /^\/save\/([a-z0-9-]+)$/.exec(req.url || "");
  if (req.method !== "POST" || !m) { res.writeHead(404); res.end("nope"); return; }
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
    const buf = Buffer.concat(chunks);
    const file = join(outDir, `${m[1]}.png`);
    writeFileSync(file, buf);
    console.log(`saved ${file} (${buf.length} bytes)`);
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("ok");
  });
});

server.listen(5190, () => console.log("save-server on :5190"));
