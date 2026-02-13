#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, ".ai", "INSTRUCTIONS.md");
const syncScript = path.join(root, "scripts", "ai-sync.mjs");

let isSyncRunning = false;
let queued = false;

function runSync(reason = "change") {
  if (isSyncRunning) {
    queued = true;
    return;
  }

  isSyncRunning = true;
  console.log(`[ai:watch] Sync triggered (${reason})`);

  const child = spawn(process.execPath, [syncScript], {
    cwd: root,
    stdio: "inherit",
  });

  child.on("exit", (code) => {
    isSyncRunning = false;
    if (code !== 0) {
      console.error(`[ai:watch] Sync failed (exit ${code ?? "null"})`);
    }
    if (queued) {
      queued = false;
      runSync("queued");
    }
  });
}

if (!fs.existsSync(sourcePath)) {
  console.error(`Missing source file: ${sourcePath}`);
  process.exit(1);
}

console.log(`[ai:watch] Watching ${sourcePath}`);
runSync("startup");

fs.watch(sourcePath, { persistent: true }, () => {
  runSync();
});
