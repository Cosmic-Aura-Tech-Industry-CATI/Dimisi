#!/usr/bin/env node
/**
 * vercel-build.mjs
 * Converts TanStack Start dist/ output into Vercel Build Output API format.
 * Vercel docs: https://vercel.com/docs/build-output-api/v3
 */
import { cpSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const out = join(root, ".vercel", "output");

// 1. Create output directories
mkdirSync(join(out, "static", "assets"), { recursive: true });
mkdirSync(join(out, "functions", "index.func"), { recursive: true });

// 2. Copy static client assets
cpSync(join(root, "dist", "client", "assets"), join(out, "static", "assets"), { recursive: true });
cpSync(join(root, "dist", "client", "favicon.png"), join(out, "static", "favicon.png"));
cpSync(join(root, "dist", "client", "robots.txt"), join(out, "static", "robots.txt"));

// 3. Copy the server bundle into the function directory
cpSync(join(root, "dist", "server"), join(out, "functions", "index.func", "server"), { recursive: true });

// 4. Create the Node.js function handler (bridges Web Fetch API ? Node.js req/res)
writeFileSync(
  join(out, "functions", "index.func", "index.js"),
  `
const path = require("path");
const serverPath = path.join(__dirname, "server", "server.js");

let _handler;
async function getHandler() {
  if (!_handler) {
    const mod = require(serverPath);
    _handler = mod.default ?? mod;
  }
  return _handler;
}

module.exports = async (req, res) => {
  const handler = await getHandler();
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers["host"];
  const url = new URL(req.url, protocol + "://" + host);

  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (v) headers.set(k, Array.isArray(v) ? v.join(", ") : v);
  }

  const body =
    req.method === "GET" || req.method === "HEAD"
      ? undefined
      : await new Promise((resolve) => {
          const chunks = [];
          req.on("data", (c) => chunks.push(c));
          req.on("end", () => resolve(Buffer.concat(chunks)));
        });

  const request = new Request(url.toString(), {
    method: req.method,
    headers,
    body,
    duplex: "half",
  });

  const response = await handler.fetch(request, {}, {});

  res.statusCode = response.status;
  response.headers.forEach((v, k) => res.setHeader(k, v));

  const buf = Buffer.from(await response.arrayBuffer());
  res.end(buf);
};
`.trim()
);

// 5. Vercel function config
writeFileSync(
  join(out, "functions", "index.func", ".vc-config.json"),
  JSON.stringify({
    runtime: "nodejs20.x",
    handler: "index.js",
    launcherType: "Nodejs",
    shouldAddHelpers: true,
  }, null, 2)
);

// 6. Vercel routing config
writeFileSync(
  join(out, "config.json"),
  JSON.stringify({
    version: 3,
    routes: [
      { src: "/favicon\\.png", dest: "/favicon.png" },
      { src: "/robots\\.txt", dest: "/robots.txt" },
      { src: "/assets/(.*)", dest: "/assets/$1" },
      { handle: "filesystem" },
      { src: "/(.*)", dest: "/index.func" },
    ],
  }, null, 2)
);

console.log("[vercel-build] .vercel/output generated successfully");
