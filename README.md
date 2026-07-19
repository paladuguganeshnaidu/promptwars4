# FIFA 2026 Stadium App (ArenaIQ)

[Live Demo](https://fifa-2026-stadium-app.onrender.com) · [Repository](https://github.com/paladuguganeshnaidu/promptwars4)

ArenaIQ is a bilingual/multilingual fan assistant and operations dashboard designed specifically for stadium staff during the FIFA 2026 World Cup. It streamlines stadium operations, helps manage incidents, and provides real-time assistance to fans in multiple languages using GenAI (Gemini).

## What is the use of this project?

This application serves two main purposes:

1. **Fan Assistance**: A GenAI-powered assistant (using Gemini) that helps fans with their queries, navigation, and general information in their native languages.
2. **Operations Dashboard**: A central hub for stadium staff to view real-time data, manage incidents, monitor crowd density, and oversee overall stadium operations during the event.

## Tech Stack

The project is structured as a monorepo containing both the frontend client and the backend server:

- **Frontend (`client/`)**: React, TypeScript, Vite, Ant Design, Vitest.
- **Backend (`server/`)**: Node.js, Express, TypeScript, Firestore, Google Gemini SDK.

## Live Link

Check out the live application here: **[https://fifa-2026-stadium-app.onrender.com](https://fifa-2026-stadium-app.onrender.com)**

## Quickstart (Local Development)

### Prerequisites

- Node.js >= 18 (Client and Server run optimally on Node 22+)
- npm
- Google Cloud credentials (Firestore) and a Gemini API key for AI features.

### Installation & Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Environment Variables**:
   Copy the `.env.example` file to `.env` and fill in your values (like the Gemini API key, Firestore project ID, and ports).

   ```bash
   cp .env.example .env
   ```

3. **Run the Development Servers**:
   Start both the backend and frontend in separate terminals:

   ```bash
   # Start the backend server (typically runs on port 8080)
   npm run dev -w @arenaiq/server

   # Start the frontend client (typically runs on port 5173)
   npm run dev -w @arenaiq/client
   ```

## Build for Production

To build both the client and server for production, run this from the repository root:

```bash
npm run build
```

## Testing & Quality

- **Run all unit tests**:
  ```bash
  npm test
  ```
- Both client and server use `vitest` for testing. Server tests include integration-style checks with mocked Firestore/Gemini.
- Linting and formatting are enforced via `eslint`, `prettier`, and `husky` pre-commit hooks.

## Key Scripts

- `npm run build` — Build both client and server packages.
- `npm run start` — Start the backend server.
- `npm run test` — Run tests across both workspaces.
- `npm run type-check` — Run TypeScript type checking.

## Codebase Overview

- **Client (`client/`)**:
  - `src/App.tsx` — Top-level routing.
  - `src/features/assistant/` — Fan assistant UI components.
  - `src/features/operations/` — Operations dashboard components (incidents, density board).
  - `src/lib/api.ts` — Typed fetch wrapper for communicating with the server.

- **Server (`server/`)**:
  - `src/index.ts` — Application bootstrap and express setup.
  - `src/features/assistant/` — Assistant routes and Gemini service integration.
  - `src/lib/gemini.ts` — Gemini SDK integration and retry logic.
  - `src/lib/firestore.ts` — Database helpers.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
