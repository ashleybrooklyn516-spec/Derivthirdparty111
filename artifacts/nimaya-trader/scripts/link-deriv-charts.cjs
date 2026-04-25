#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

function findDistDir() {
  try {
    const pkg = require.resolve("@deriv/deriv-charts/package.json", {
      paths: [path.resolve(__dirname, "..")],
    });
    return path.join(path.dirname(pkg), "dist");
  } catch (e) {
    return null;
  }
}

const distDir = findDistDir();
if (!distDir || !fs.existsSync(distDir)) {
  console.warn("[link-deriv-charts] @deriv/deriv-charts dist not found, skipping.");
  process.exit(0);
}

const publicDir = path.resolve(__dirname, "..", "public");
fs.mkdirSync(publicDir, { recursive: true });

const SKIP_TOP = new Set(["smartcharts.css", "smartcharts.css.map", "chart"]);

function safeRm(p) {
  try {
    if (fs.existsSync(p) || fs.lstatSync(p, { throwIfNoEntry: false })) {
      fs.rmSync(p, { recursive: true, force: true });
    }
  } catch {}
}

function symlink(src, dst) {
  safeRm(dst);
  fs.symlinkSync(src, dst, fs.statSync(src).isDirectory() ? "dir" : "file");
}

// Top-level dist files (smartcharts chunks, sprites, etc.)
for (const name of fs.readdirSync(distDir)) {
  if (SKIP_TOP.has(name)) continue;
  if (name.endsWith(".LICENSE.txt")) continue;
  const src = path.join(distDir, name);
  const dst = path.join(publicDir, name);
  try {
    symlink(src, dst);
  } catch (err) {
    console.warn(`[link-deriv-charts] failed for ${name}:`, err.message);
  }
}

// Build a real public/chart/ dir with per-file symlinks so we can override
// flutter_bootstrap.js with a custom entryPointBaseUrl/canvasKitBaseUrl.
const chartSrc = path.join(distDir, "chart");
const chartDst = path.join(publicDir, "chart");
if (fs.existsSync(chartSrc)) {
  safeRm(chartDst);
  fs.mkdirSync(chartDst, { recursive: true });
  for (const name of fs.readdirSync(chartSrc)) {
    if (name === "flutter_bootstrap.js") continue;
    const src = path.join(chartSrc, name);
    const dst = path.join(chartDst, name);
    try {
      symlink(src, dst);
    } catch (err) {
      console.warn(`[link-deriv-charts] failed for chart/${name}:`, err.message);
    }
  }

  // Custom flutter_bootstrap.js with absolute base URLs so flutter loads
  // assets from /chart/ regardless of document.baseURI (the host SPA route).
  const originalBootstrap = fs.readFileSync(
    path.join(chartSrc, "flutter_bootstrap.js"),
    "utf8",
  );
  // Extract engineRevision and serviceWorkerVersion from the original
  const engineRev = (originalBootstrap.match(/engineRevision:"([^"]+)"/) || [])[1] || "";
  const swVersion = (originalBootstrap.match(/serviceWorkerVersion:"([^"]+)"/) || [])[1] || "";
  // Replace the trailing _flutter.loader.load(...) call with one that passes
  // an explicit config including entryPointBaseUrl pointing at /chart/.
  const patched = originalBootstrap.replace(
    /_flutter\.loader\.load\([^;]*\);?\s*$/,
    `_flutter.loader.load({serviceWorkerSettings:{serviceWorkerVersion:"${swVersion}",serviceWorkerUrl:"/chart/flutter_service_worker.js?v="},config:{entryPointBaseUrl:"/chart/",canvasKitBaseUrl:"https://www.gstatic.com/flutter-canvaskit/${engineRev}/"}});`,
  );
  fs.writeFileSync(path.join(chartDst, "flutter_bootstrap.js"), patched);
}

console.log("[link-deriv-charts] linked deriv-charts assets into public/");
