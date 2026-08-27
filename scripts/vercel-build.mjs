#!/usr/bin/env node
import { cpSync, mkdirSync, writeFileSync, readdirSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const out = join(root, ".vercel", "output");

// 1. Create output directories
mkdirSync(join(out, "static"), { recursive: true });
mkdirSync(join(out, "functions", "index.func"), { recursive: true });
mkdirSync(join(out, "functions", "[...all].func"), { recursive: true });

// 2. Copy static files
if (existsSync(join(root, "dist", "client"))) {
  cpSync(join(root, "dist", "client"), join(out, "static"), { recursive: true });
}
if (existsSync(join(root, "public"))) {
  cpSync(join(root, "public"), join(out, "static"), { recursive: true });
}

// 3. Copy server bundle into function directories
if (existsSync(join(root, "dist", "server"))) {
  cpSync(join(root, "dist", "server"), join(out, "functions", "index.func", "server"), { recursive: true });
  cpSync(join(root, "dist", "server"), join(out, "functions", "[...all].func", "server"), { recursive: true });
}

// 4. Function handler code
const handlerCode = `
import { WebSocket as WsWebSocket } from "ws";

if (typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = WsWebSocket;
}

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
`.trim();

const vcConfig = JSON.stringify({
  runtime: "nodejs22.x",
  handler: "index.js",
  launcherType: "Nodejs",
  shouldAddHelpers: true,
}, null, 2);

const pkgJson = JSON.stringify({ type: "module" }, null, 2);

// Write to index.func
writeFileSync(join(out, "functions", "index.func", "index.js"), handlerCode);
writeFileSync(join(out, "functions", "index.func", ".vc-config.json"), vcConfig);
writeFileSync(join(out, "functions", "index.func", "package.json"), pkgJson);

// Write to [...all].func
writeFileSync(join(out, "functions", "[...all].func", "index.js"), handlerCode);
writeFileSync(join(out, "functions", "[...all].func", ".vc-config.json"), vcConfig);
writeFileSync(join(out, "functions", "[...all].func", "package.json"), pkgJson);

// 5. Vercel routing configuration
writeFileSync(
  join(out, "config.json"),
  JSON.stringify({
    version: 3,
    routes: [
      { handle: "filesystem" },
      { src: "/_serverFn/(.*)", dest: "/index" },
      { src: "/_server/(.*)", dest: "/index" },
      { src: "/(.*)", dest: "/index" },
    ],
  }, null, 2)
);

console.log("[vercel-build] .vercel/output ready for nodejs22.x with WebSocket polyfill!");
