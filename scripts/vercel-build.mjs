#!/usr/bin/env node
/**
 * vercel-build.mjs
 * Converts TanStack Start dist/ output into Vercel Build Output API format,
 * downloads all referenced assets locally, and sets up routes.
 */
import { cpSync, mkdirSync, writeFileSync, readdirSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const out = join(root, ".vercel", "output");

// 1. Create output directories
mkdirSync(join(out, "static"), { recursive: true });
mkdirSync(join(out, "functions", "index.func"), { recursive: true });

// 2. Download all assets from Lovable storage if not present locally
const assetsDir = join(root, "src", "assets");
if (existsSync(assetsDir)) {
  const files = readdirSync(assetsDir).filter((f) => f.endsWith(".asset.json"));
  console.log(`[vercel-build] Checking ${files.length} remote assets...`);

  for (const f of files) {
    try {
      const data = JSON.parse(readFileSync(join(assetsDir, f), "utf-8"));
      if (data.url && data.asset_id && data.original_filename) {
        const localRelDir = join("static", "__l5e", "assets-v1", data.asset_id);
        const localFullDir = join(out, localRelDir);
        const localFilePath = join(localFullDir, data.original_filename);

        if (!existsSync(localFilePath)) {
          mkdirSync(localFullDir, { recursive: true });
          const remoteUrl = `https://${data.project_id}.lovableproject.com/__l5e/assets-v1/${data.asset_id}/${encodeURIComponent(data.original_filename)}`;
          const res = await fetch(remoteUrl);
          if (res.ok) {
            const buf = Buffer.from(await res.arrayBuffer());
            writeFileSync(localFilePath, buf);
            console.log(`[vercel-build] Downloaded ${data.original_filename} (${buf.length} bytes)`);
          } else {
            console.warn(`[vercel-build] Failed to download ${data.original_filename}: status ${res.status}`);
          }
        }
      }
    } catch (err) {
      console.warn(`[vercel-build] Error processing ${f}:`, err.message);
    }
  }
}

// 3. Copy full dist/client static folder
if (existsSync(join(root, "dist", "client"))) {
  cpSync(join(root, "dist", "client"), join(out, "static"), { recursive: true });
}

// 4. Copy full public folder
if (existsSync(join(root, "public"))) {
  cpSync(join(root, "public"), join(out, "static"), { recursive: true });
}

// 5. Copy server bundle into function directory
if (existsSync(join(root, "dist", "server"))) {
  cpSync(join(root, "dist", "server"), join(out, "functions", "index.func", "server"), { recursive: true });
}

// 6. ESM function handler
writeFileSync(
  join(out, "functions", "index.func", "index.js"),
  `
let _handler;
async function getHandler() {
  if (!_handler) {
    const mod = await import("./server/server.js");
    _handler = mod.default ?? mod;
  }
  return _handler;
}

export default async function handler(req, res) {
  try {
    const h = await getHandler();

    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers["host"] || "localhost";
    const url = new URL(req.url, protocol + "://" + host);

    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (v) headers.set(k, Array.isArray(v) ? v.join(", ") : v);
    }

    let body = undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      body = await new Promise((resolve) => {
        const chunks = [];
        req.on("data", (c) => chunks.push(c));
        req.on("end", () => resolve(Buffer.concat(chunks)));
      });
    }

    const request = new Request(url.toString(), {
      method: req.method,
      headers,
      ...(body && body.length > 0 ? { body, duplex: "half" } : {}),
    });

    const response = await h.fetch(request, process.env, {});

    res.statusCode = response.status;
    response.headers.forEach((v, k) => res.setHeader(k, v));
    const buf = Buffer.from(await response.arrayBuffer());
    res.end(buf);
  } catch (err) {
    console.error("[SSR CRASH]", err?.stack ?? err);
    res.statusCode = 500;
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.end("<h1>Server Error</h1><pre>" + String(err?.stack ?? err) + "</pre>");
  }
}
`.trim()
);

writeFileSync(
  join(out, "functions", "index.func", ".vc-config.json"),
  JSON.stringify({ runtime: "nodejs20.x", handler: "index.js", launcherType: "Nodejs", shouldAddHelpers: true }, null, 2)
);

writeFileSync(join(out, "functions", "index.func", "package.json"), JSON.stringify({ type: "module" }, null, 2));

// 7. Vercel routing configuration
writeFileSync(
  join(out, "config.json"),
  JSON.stringify({
    version: 3,
    routes: [
      { handle: "filesystem" },
      {
        src: "/__l5e/(.*)",
        dest: "https://533095ec-7c76-42ea-b5ff-1c99863cfe28.lovableproject.com/__l5e/$1",
      },
      { src: "/(.*)", dest: "/index.func" },
    ],
  }, null, 2)
);

console.log("[vercel-build] .vercel/output built successfully with all assets!");
