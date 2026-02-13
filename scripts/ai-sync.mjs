#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const src = path.join(root, ".ai", "INSTRUCTIONS.md");
const isCheck = process.argv.includes("--check");

if (!fs.existsSync(src)) {
  console.error(`Missing ${src}`);
  process.exit(1);
}

const content = fs.readFileSync(src, "utf8");
const stamp = "<!-- GENERATED: do not edit. Source: .ai/INSTRUCTIONS.md -->\n\n";

const targets = [
  { file: "CLAUDE.md", addStamp: true },
  { file: "GEMINI.md", addStamp: true },
  { file: "AGENTS.md", addStamp: true },
  { file: path.join(".github", "copilot-instructions.md"), addStamp: true },
];

let dirty = false;

for (const t of targets) {
  const outPath = path.join(root, t.file);
  const desired = (t.addStamp ? stamp : "") + content;

  if (isCheck) {
    if (!fs.existsSync(outPath)) {
      console.error(`Missing generated file: ${t.file}`);
      dirty = true;
      continue;
    }
    const existing = fs.readFileSync(outPath, "utf8");
    if (existing !== desired) {
      console.error(`Out of date: ${t.file}`);
      dirty = true;
    }
    continue;
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, desired, "utf8");
  console.log(`wrote ${t.file}`);
}

if (isCheck) {
  process.exit(dirty ? 1 : 0);
}
