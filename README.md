# ArenaIQ — AI Stadium Assistant & Operations Dashboard

Live demo: https://fifa-2026-stadium-app.onrender.com
Repository: https://github.com/paladuguganeshnaidu/promptwars4

ArenaIQ is a full-stack demonstration application for a large-event/stadium scenario. It combines a multilingual fan assistant with a staff-facing operations workspace.

> Project framing: working prototype/demo. It is not an official FIFA system, venue-control system, crowd-safety platform or production stadium deployment.

## What it demonstrates

### Fan assistant

A Gemini-powered conversational assistant for fan questions and multilingual interaction.

### Operations workspace

Application-level workflows for incident management, crowd-density views and staff-facing operational information.

The displayed operational data is application/demo data, not verified physical stadium telemetry.

## Architecture

React + TypeScript + Vite → Node.js + Express + TypeScript → Firestore + Gemini.

## Technology

- Frontend: React, TypeScript, Vite, Ant Design.
- Backend: Node.js, Express, TypeScript.
- Database: Firestore.
- AI: Google Gemini SDK.
- Testing: Vitest.
- Quality tooling: ESLint, Prettier, Husky.
- Demo deployment: Render.

## Local development

Prerequisites are Node.js 18+, npm, Firebase/Firestore configuration and Gemini credentials for AI features.

Install dependencies, copy .env.example to .env, configure the required values, then run the server and client workspace development commands documented by the repository.

## Build and quality checks

- npm run build
- npm test
- npm run lint
- npm run type-check

## Project structure

- client/src/features/assistant — fan assistant UI.
- client/src/features/operations — operations dashboard UI.
- client/src/lib/api.ts — client API wrapper.
- server/src/features/assistant — assistant routes/services.
- server/src/lib/gemini.ts — Gemini integration.
- server/src/lib/firestore.ts — database helpers.
- server/src/index.ts — server bootstrap.

## Current limitations

- Demo data is not equivalent to live stadium telemetry.
- Crowd monitoring is an application visualization rather than a verified physical sensing system.
- No real-world crowd-safety performance claim is made.
- Provider/API behavior can change independently of the repository.

## License

MIT License. See LICENSE.

## Author

Paladugu Ganesh Naidu
