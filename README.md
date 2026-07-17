# ArenaIQ — GenAI Stadium Operations (FIFA 2026)

[Live demo](https://cloudcostaii.onrender.com) · [Repository](https://github.com/paladuguganeshnaidu/promptwars4)

Compact, practical README aligned with the repository code (monorepo: `client` + `server`). Focus: developer setup, common workflows, and where to look in the code.

## Quick summary

- Purpose: a bilingual/multilingual fan assistant and operations dashboard for stadium staff.
- Tech: TypeScript, React (Vite) frontend and Node/Express backend. AI: Gemini integration in server.
- Monorepo layout:
  - `client/` — React + Vite app (TypeScript, Ant Design, Vitest)
  - `server/` — Express API (TypeScript, Firestore, Gemini SDK)
  - `scripts/`, `e2e/`, `docs/`

## Live / Source

- Live demo: https://cloudcostaii.onrender.com
- Source: https://github.com/paladuguganeshnaidu/promptwars4

## Prerequisites

- Node.js >= 22 (root `package.json` shows workspace engines; client/server require Node 22+)
- npm
- Optional: Google Cloud credentials (Firestore) and Gemini API key for full runtime behavior

## Quickstart (local development)

1. Install dependencies:

```bash
npm install
```

2. Copy environment example and edit `.env` values (Gemini key, ports, Firestore project):

```bash
cp .env.example .env
# edit values in .env
```

3. Start backend and frontend in separate terminals:

```bash
npm run dev -w @arenaiq/server
npm run dev -w @arenaiq/client
```

Frontend typically runs on port 5173; backend on 8080 (see `.env`).

## Build (production)

From the repo root:

```bash
npm run build
```

This runs the `client` build (TypeScript build + Vite build) and `server` TypeScript compilation.

## Tests and quality

- Run unit tests for both packages:

```bash
npm test
```

- Client tests use `vitest`.
- Server tests use `vitest` and include some integration-style checks (mocking Firestore/Gemini in tests).
- Linting and formatting: `eslint`, `prettier`, and `husky` pre-commit hooks are configured at the repo root.

## Important scripts (root)

- `npm run build` — Build client and server
- `npm run start` — Start server package (workspace start)
- `npm run test` — Run tests for both packages
- `npm run type-check` — Run TypeScript checks across workspaces

## Where to look in code (quick pointers)

- Client:
  - `client/src/App.tsx` — top-level route wiring
  - `client/src/features/assistant/` — assistant UI components (assistant page, chat list, language selector)
  - `client/src/features/operations/` — operations dashboard components (briefing, incident list, density board)
  - `client/src/lib/api.ts` — typed fetch wrapper used across client features

- Server:
  - `server/src/index.ts` — app bootstrap
  - `server/src/features/assistant/` — assistant routes and service (calls Gemini)
  - `server/src/lib/gemini.ts` — Gemini integration and retries
  - `server/src/lib/firestore.ts` — Firestore helpers / mocks

## Environment variables (important)

Put these in `.env` (see `.env.example`):

- `GEMINI_API_KEY` — required for Gemini calls
- `GEMINI_MODEL` — model identifier
- `PORT` — server port (default 8080)
- `ALLOWED_ORIGINS` — CORS origins for local dev
- `GOOGLE_CLOUD_PROJECT` — Firestore project id (if using Firestore)

## Notes on recent repository maintenance

- Filenames in `client/src` use lower-camel file names for imports (e.g. `assistantPage.tsx`, `chatMessageList.tsx`, `appLayout.tsx`) to avoid case-sensitivity issues on Windows and with TypeScript.
- The project uses workspace-level `husky` + `lint-staged` to enforce linting and formatting.

## CI / Deployment

- CI is configured via GitHub Actions (badges in original README). The repo previously built and tested in CI.
- For production, build the client assets and deploy the server (Cloud Run / container) with environment variables and Secret Manager for secrets.

## Contributing

- Fork → branch → open PR. Keep changes focused and include tests.
- Run `npm run test` and `npm run lint` before opening PRs.

## License

- MIT — see `LICENSE`.

---
If you'd like, I can:

- push this updated README to the repository, or
- expand any section with commands, examples, or a short developer walkthrough (start/stop, debugging tips, dev container suggestions).
