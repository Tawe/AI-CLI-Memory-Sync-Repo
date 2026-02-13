# AI CLI Memory Sync Repo

Maintain one canonical instruction file and sync it into the filenames various AI CLIs expect.

## Source of truth

- **Edit:** `.ai/INSTRUCTIONS.md`
- **Generate:** `npm run ai:sync`

## Generated files

| Tool | File |
|------|------|
| Claude | `CLAUDE.md` |
| Gemini | `GEMINI.md` |
| Codex/Agents | `AGENTS.md` |
| GitHub Copilot | `.github/copilot-instructions.md` |

## Why

Avoid multiple slightly-different "memory" files scattered across repos. Keep a single source of truth and automatically fan out to tool-specific locations.

## Usage

### Manual sync

```bash
npm run ai:sync
```

### Check mode (CI-friendly)

```bash
npm run ai:sync -- --check
```

Exits non-zero if generated files are missing or out of date.

Shortcut:

```bash
npm run ai:check
```

## Automation options

### Pre-commit hook (recommended)

Use [Husky](https://typicode.github.io/husky/) to ensure sync happens on every commit:

```bash
npm i -D husky
npx husky init
```

Edit `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run ai:sync
git add CLAUDE.md GEMINI.md AGENTS.md .github/copilot-instructions.md
```

### CI safety net

In your CI pipeline:

```bash
npm run ai:check
```

This will fail the build if generated files are out of sync.

This repo also includes a GitHub Actions workflow at `.github/workflows/ai-sync-check.yml` that runs on pull requests.

## Testing

Run the test suite for the sync script:

```bash
npm test
```

## Goals

- Keep a single canonical file (`.ai/INSTRUCTIONS.md`)
- Generate tool-specific instruction files on demand
- Optionally run sync automatically on commit
- Work cleanly on macOS/Linux; remain usable for teams with Windows machines

## Non-goals

- Tool-specific deep integrations or calling CLIs
- Attempting to discover every AI tool's conventions
