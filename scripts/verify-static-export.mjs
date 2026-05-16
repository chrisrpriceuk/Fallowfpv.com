/**
 * Ensures static export output is complete (Tailwind CSS bundle + GitHub Pages helper).
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const outDir = join(root, "out");

function fail(message) {
  console.error(`verify-static-export: ${message}`);
  process.exit(1);
}

if (!existsSync(outDir)) {
  fail("missing ./out (run npm run build first)");
}

const indexPath = join(outDir, "index.html");
if (!existsSync(indexPath)) {
  fail("missing out/index.html");
}

const html = readFileSync(indexPath, "utf8");

const tailwindCssDir = join(outDir, "_next", "static", "css");
if (!existsSync(tailwindCssDir)) {
  fail("missing out/_next/static/css");
}
const tailwindCss = readdirSync(tailwindCssDir).filter((f) => f.endsWith(".css"));
if (tailwindCss.length === 0) {
  fail("no .css files under out/_next/static/css");
}

let bundledCssBytes = 0;
for (const f of tailwindCss) {
  bundledCssBytes += readFileSync(join(tailwindCssDir, f)).length;
}
if (bundledCssBytes < 8000) {
  fail(
    `bundled CSS under out/_next/static/css looks too small (${bundledCssBytes} bytes) — Tailwind may not have run`,
  );
}

if (!/rel="stylesheet"[^>]*href="[^"]*_next\/static\/css\//.test(html)) {
  fail("out/index.html must include <link rel=\"stylesheet\" … /_next/static/css/");
}

const noJekyll = join(outDir, ".nojekyll");
if (!existsSync(noJekyll)) {
  fail("missing out/.nojekyll — add public/.nojekyll and rebuild");
}

console.log(
  `verify-static-export: ok (${bundledCssBytes} bytes CSS under _next/static/css + .nojekyll)`,
);
