// Builds the site, then sanity-checks the output for missing files,
// unreplaced template tokens and leftover template-owner content.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
execFileSync(process.execPath, [path.join(root, "scripts/build.mjs")], { stdio: "inherit" });

const problems = [];
for (const file of ["dist/index.html", "dist/favicon.svg", "dist/assets/app.js", "dist/assets/app.css"]) {
  if (!existsSync(path.join(root, file))) problems.push(`missing ${file}`);
}

const html = readFileSync(path.join(root, "dist/index.html"), "utf8");
const token = html.match(/%[A-Z_]+%/);
if (token) problems.push(`unreplaced token ${token[0]} in index.html`);
if ((html.match(/<h1/g) || []).length > 1) problems.push("index.html has more than one <h1>");

const banned = [/touquir/i, /\[YOUR /, /xyz@gmail/i];
function scan(dir) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) scan(full);
    else if (/\.(jsx?|css|html|svg)$/.test(name)) {
      const text = readFileSync(full, "utf8");
      for (const re of banned) if (re.test(text)) problems.push(`${path.relative(root, full)} contains ${re}`);
    }
  }
}
scan(path.join(root, "src"));
scan(path.join(root, "dist"));

if (problems.length) {
  console.error("\nCheck failed:\n - " + problems.join("\n - "));
  process.exit(1);
}
console.log("\nCheck passed: build output complete, no template leftovers.");
