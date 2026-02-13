import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(new URL("../scripts/ai-sync.mjs", import.meta.url));
const sourceContent = "# Project Instructions\n\nKeep files in sync.\n";
const stamp = "<!-- GENERATED: do not edit. Source: .ai/INSTRUCTIONS.md -->\n\n";
const targets = [
  "CLAUDE.md",
  "GEMINI.md",
  "AGENTS.md",
  path.join(".github", "copilot-instructions.md"),
];

function makeTempProject() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ai-sync-test-"));
  fs.mkdirSync(path.join(dir, ".ai"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".ai", "INSTRUCTIONS.md"), sourceContent, "utf8");
  return dir;
}

function runSync(cwd, args = []) {
  return spawnSync(process.execPath, [scriptPath, ...args], {
    cwd,
    encoding: "utf8",
  });
}

test("sync mode writes all generated targets with stamp", () => {
  const cwd = makeTempProject();
  const result = runSync(cwd);

  assert.equal(result.status, 0, result.stderr);

  for (const file of targets) {
    const output = fs.readFileSync(path.join(cwd, file), "utf8");
    assert.equal(output, stamp + sourceContent);
  }
});

test("check mode succeeds when files are in sync", () => {
  const cwd = makeTempProject();
  const syncResult = runSync(cwd);
  assert.equal(syncResult.status, 0, syncResult.stderr);

  const checkResult = runSync(cwd, ["--check"]);
  assert.equal(checkResult.status, 0, checkResult.stderr);
});

test("check mode fails when generated files are missing", () => {
  const cwd = makeTempProject();
  const result = runSync(cwd, ["--check"]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Missing generated file:/);
});

test("check mode fails when generated content is stale and does not rewrite files", () => {
  const cwd = makeTempProject();
  const syncResult = runSync(cwd);
  assert.equal(syncResult.status, 0, syncResult.stderr);

  const stalePath = path.join(cwd, "CLAUDE.md");
  fs.writeFileSync(stalePath, "stale content\n", "utf8");

  const checkResult = runSync(cwd, ["--check"]);
  assert.equal(checkResult.status, 1);
  assert.match(checkResult.stderr, /Out of date: CLAUDE\.md/);
  assert.equal(fs.readFileSync(stalePath, "utf8"), "stale content\n");
});
