import * as esbuild from "esbuild";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { site } from "../src/config/site.js";

const serve = process.argv.includes("--serve");
const root = fileURLToPath(new URL("..", import.meta.url));
const dist = path.join(root, "dist");

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function renderHtml(template) {
  const { identity: id, contact, websiteUrl } = site;
  const title = `${id.fullName} | ${id.profession}`;
  const description = id.intro;
  const sameAs = [contact.linkedin, contact.github, contact.leetcode].filter(Boolean);
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: id.fullName,
    jobTitle: id.profession,
    email: `mailto:${contact.email}`,
    address: { "@type": "PostalAddress", addressLocality: id.location },
    sameAs,
    ...(websiteUrl ? { url: websiteUrl } : {}),
  };
  const canonical = websiteUrl
    ? `<link rel="canonical" href="${esc(websiteUrl)}" />\n    <meta property="og:url" content="${esc(websiteUrl)}" />`
    : "";
  const dev = serve
    ? `<script>new EventSource("/esbuild").addEventListener("change", () => location.reload());</script>`
    : "";

  // Link-preview image (public/og.png, regenerate with `npm run og`). Social sites
  // need an absolute URL, so it is only fully effective once websiteUrl is set.
  const ogUrl = websiteUrl ? `${websiteUrl.replace(/\/$/, "")}/og.png` : "og.png";
  const ogImage = existsSync(path.join(root, "public", "og.png"))
    ? [
        `<meta property="og:image" content="${esc(ogUrl)}" />`,
        `<meta property="og:image:width" content="1200" />`,
        `<meta property="og:image:height" content="630" />`,
        `<meta property="og:image:alt" content="${esc(`${id.fullName} — ${id.profession}`)}" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:image" content="${esc(ogUrl)}" />`,
      ].join("\n    ")
    : `<meta name="twitter:card" content="summary" />`;

  // Visitor stats: production builds only, so local development isn't counted.
  const { goatcounter, vercel } = site.analytics ?? {};
  const analytics = serve
    ? ""
    : [
        goatcounter && /^[a-z0-9-]+$/i.test(goatcounter)
          ? `<script data-goatcounter="https://${goatcounter}.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>`
          : "",
        vercel
          ? `<script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};</script>\n    <script defer src="/_vercel/insights/script.js"></script>`
          : "",
      ]
        .filter(Boolean)
        .join("\n    ");
  return template
    .replaceAll("%LANG%", esc(site.lang))
    .replaceAll("%TITLE%", esc(title))
    .replaceAll("%DESCRIPTION%", esc(description))
    .replaceAll("%NAME%", esc(id.fullName))
    .replaceAll("%EMAIL%", esc(contact.email))
    .replaceAll("%BG%", esc(site.appearance.background))
    .replace("%THEME_KEY%", JSON.stringify(site.themeStorageKey))
    .replace("%OG_IMAGE%", ogImage)
    .replace("%ANALYTICS%", analytics)
    .replace("%CANONICAL%", canonical)
    .replace("%JSONLD%", `<script type="application/ld+json">${JSON.stringify(person).replace(/</g, "\\u003c")}</script>`)
    .replace("%DEV%", dev);
}

function favicon() {
  const { background, accent } = site.appearance;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${background}"/><text x="32" y="44" text-anchor="middle" font-family="Impact, Anton, sans-serif" font-size="32" fill="${accent}">${esc(site.identity.initials)}</text></svg>`;
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
if (existsSync(path.join(root, "public"))) await cp(path.join(root, "public"), dist, { recursive: true });
await writeFile(path.join(dist, "index.html"), renderHtml(await readFile(path.join(root, "index.html"), "utf8")));
await writeFile(path.join(dist, "favicon.svg"), favicon());

const options = {
  absWorkingDir: root,
  entryPoints: { app: "src/main.jsx" },
  bundle: true,
  outdir: path.join(dist, "assets"),
  // A classic (non-module) script so dist/index.html also works opened straight from disk.
  format: "iife",
  target: ["es2020"],
  jsx: "automatic",
  minify: !serve,
  sourcemap: serve,
  legalComments: "none",
  define: { "process.env.NODE_ENV": JSON.stringify(serve ? "development" : "production") },
  logLevel: "info",
};

if (serve) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  const { port } = await ctx.serve({ servedir: dist, port: 5173 });
  console.log(`\n  Portfolio running at http://localhost:${port}\n`);
} else {
  await esbuild.build(options);
  console.log(`Built to ${path.relative(process.cwd(), dist) || "dist"}/`);
}
