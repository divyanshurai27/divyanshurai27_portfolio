// Renders the 1200×630 link-preview card (public/og.png) from site config
// using a local headless Chrome/Edge. Run with `npm run og` after changing
// your name, role or colours. Set CHROME_PATH if your browser isn't found.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { site } from "../src/config/site.js";

const root = fileURLToPath(new URL("..", import.meta.url));
const out = path.join(root, "public", "og.png");
const PORT = 9555;

const candidates = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);
const browser = candidates.find((p) => existsSync(p));
if (!browser) {
  console.error("No Chrome/Edge found. Set CHROME_PATH to your browser executable and retry.");
  process.exit(1);
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const { identity: id, contact, appearance: a } = site;
const handle = contact.github ? contact.github.replace(/^https?:\/\//, "") : contact.email;

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Manrope:wght@500;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden; background: ${a.background}; color: ${a.text};
    font-family: Manrope, sans-serif; position: relative; padding: 64px 72px;
    display: flex; flex-direction: column; justify-content: space-between; }
  body::before { content: ""; position: absolute; inset: 0;
    background: linear-gradient(rgba(242,239,235,.05) 1px, transparent 1px) 0 0 / 40px 40px,
      linear-gradient(90deg, rgba(242,239,235,.05) 1px, transparent 1px) 0 0 / 40px 40px; }
  body::after { content: ""; position: absolute; top: -260px; right: -200px; width: 760px; height: 760px;
    background: radial-gradient(circle, ${a.accent}40, transparent 65%); }
  .row { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; }
  .mark { display: flex; align-items: center; gap: 16px; font-family: Anton, sans-serif; font-size: 26px;
    letter-spacing: .04em; text-transform: uppercase; }
  .mark b { display: grid; place-items: center; width: 56px; height: 56px; border-radius: 16px;
    background: ${a.accent}; color: #fff; font-weight: 400; font-size: 24px; }
  .status { display: flex; align-items: center; gap: 12px; font-size: 20px; font-weight: 700;
    letter-spacing: .12em; text-transform: uppercase; color: ${a.muted}; }
  .status i { width: 12px; height: 12px; border-radius: 50%; background: ${a.accent}; }
  .name { position: relative; z-index: 1; font-family: Anton, sans-serif; text-transform: uppercase;
    font-size: 168px; line-height: .88; }
  .name span { display: block; color: transparent; -webkit-text-stroke: 2px ${a.text}; }
  .name em { font-style: normal; color: ${a.accent}; -webkit-text-stroke: 0; }
  .role { font-size: 30px; font-weight: 700; }
  .role small { display: block; margin-top: 6px; font-size: 22px; font-weight: 500; color: ${a.muted}; }
  .handle { font-size: 22px; font-weight: 500; color: ${a.muted}; }
</style></head><body>
  <div class="row">
    <div class="mark"><b>${esc(id.initials)}</b>${esc(id.fullName)}</div>
    <div class="status"><i></i>${esc(id.status)}</div>
  </div>
  <div class="name">${esc(id.firstName)}<span>${esc(id.lastName)}<em>.</em></span></div>
  <div class="row">
    <div class="role">${esc(id.profession)}<small>${esc(id.roleLine2)}</small></div>
    <div class="handle">${esc(handle)}</div>
  </div>
</body></html>`;

const profile = await mkdtemp(path.join(tmpdir(), "og-chrome-"));
const chrome = spawn(browser, ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "about:blank"]);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  let target;
  for (let i = 0; i < 60 && !target; i++) {
    await wait(250);
    try {
      target = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find((t) => t.type === "page");
    } catch {}
  }
  if (!target) throw new Error("Browser did not start");

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pending = new Map();
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) pending.get(d.id)(d), pending.delete(d.id);
  };
  const send = (method, params = {}) =>
    new Promise((r) => {
      const n = ++id;
      pending.set(n, r);
      ws.send(JSON.stringify({ id: n, method, params }));
    });

  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
  const { result } = await send("Page.getFrameTree");
  await send("Page.setDocumentContent", { frameId: result.frameTree.frame.id, html });
  // Wait for the font stylesheet, then for each face actually used on the card.
  const loaded = await send("Runtime.evaluate", {
    expression: `new Promise((resolve) => {
        const link = document.querySelector("link[rel=stylesheet]");
        if (link.sheet) resolve(); else { link.onload = resolve; link.onerror = resolve; }
      }).then(() => Promise.all([
        document.fonts.load("168px Anton"),
        document.fonts.load("500 22px Manrope"),
        document.fonts.load("700 30px Manrope"),
      ])).then(() => document.fonts.check("168px Anton"))`,
    awaitPromise: true,
    returnByValue: true,
  });
  if (!loaded.result?.result?.value) console.warn("Warning: web fonts didn't load (offline?); using fallbacks.");
  await wait(300);
  const shot = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 1200, height: 630, scale: 1 } });
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, Buffer.from(shot.result.data, "base64"));
  ws.close();
  console.log(`Saved ${path.relative(root, out)} (1200×630)`);
} finally {
  chrome.kill();
  await wait(300);
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}
