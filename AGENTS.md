<!-- GENERATED: do not edit. Source: .ai/INSTRUCTIONS.md -->

# AI Instructions

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands
- Install: `npm install`
- Sync AI files: `npm run ai:sync`
- Check sync status (CI): `npm run ai:sync -- --check`

## Repo conventions
- Branch naming: `feature/`, `fix/`, `docs/`
- Commit message style: Conventional Commits

## Architecture
This project maintains a single source of truth for AI tool instructions and syncs them to tool-specific files.

**Source:** `.ai/INSTRUCTIONS.md`

**Sync script:** `scripts/ai-sync.mjs` — ES module that:
- Reads the canonical source file
- Prepends a "GENERATED" comment header
- Writes to each target file (creating directories if needed)
- With `--check` flag: verifies files are in sync without writing (exits non-zero if out of date)

**Generated targets:** `CLAUDE.md`, `GEMINI.md`, `AGENTS.md`, `.github/copilot-instructions.md`

## Critical workflow
- **Never edit generated files directly** — changes will be overwritten
- Edit only `.ai/INSTRUCTIONS.md`, then run `npm run ai:sync`
- Before committing, ensure AI files are in sync (`npm run ai:sync -- --check`)
