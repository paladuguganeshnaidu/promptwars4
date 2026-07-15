# ArenaIQ - GenAI Stadium Operations for FIFA 2026

[![CI](https://github.com/my-org/arenaiq/actions/workflows/ci.yml/badge.svg)](https://github.com/my-org/arenaiq/actions/workflows/ci.yml)
[![CodeQL](https://github.com/my-org/arenaiq/actions/workflows/codeql.yml/badge.svg)](https://github.com/my-org/arenaiq/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen.svg)](package.json)

ArenaIQ is a monorepo for a stadium operations and fan experience platform built for the FIFA World Cup 2026. It combines a multilingual fan assistant with an operations dashboard so venue staff can monitor crowd conditions, incidents, and sustainability metrics while fans receive grounded, accessible guidance.

**Live demo:** <https://arenaiq.com>
**Repository:** <https://github.com/my-org/arenaiq>
**Region:** asia-south1 · **GCP project:** project-da29f6cf-ccbd-43b6-8b3

---

## What the project does

ArenaIQ supports two main experiences:

- **Fan assistant**: a multilingual assistant that answers venue questions about navigation, accessibility, transport, and facilities.
- **Operations dashboard**: a live operational view for crowd density, incidents, and sustainability data with AI-generated briefing support.

The assistant is grounded in a curated venue dataset so it can provide structured, venue-specific answers instead of relying on unverified model knowledge.

---

## Core features

- Multilingual responses for fan questions
- Grounded venue guidance for gates, sections, facilities, and transport
- Accessibility-aware routing and user experience
- Live operational snapshots for zones, incidents, and sustainability metrics
- AI-generated operational briefing from the current snapshot
- Security hardening through validation, rate limiting, and sanitized error handling

---

## Architecture overview

This repository is organized as an npm workspace monorepo with two main parts:

- **Client**: React, TypeScript, and Vite for the web experience
- **Server**: Express and TypeScript for the assistant, operations routes, and backend integrations

### Project structure

```text
client/         Web app (React + Vite)
server/         API and backend services
scripts/        Maintenance and preflight helpers
docs/           Architecture and design notes
e2e/            End-to-end test suite
```

### Main integrations

- **Gemini** for grounded assistant responses and briefing generation
- **Firestore** for live operational state
- **Google Secret Manager** for secure deployment secrets
- **Cloud Run** for hosting the service

---

## Prerequisites

- Node.js 22 or newer
- npm
- A Gemini API key
- Optional: Google Cloud project and Firestore access for full deployment

---

## Environment setup

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env` with your local configuration. The most important variables are:

   - `GEMINI_API_KEY`: your Gemini API key
   - `GEMINI_MODEL`: model name to use
   - `PORT`: server port (defaults to 8080)
   - `ALLOWED_ORIGINS`: allowed client origins for local development
   - `GOOGLE_CLOUD_PROJECT`: your Google Cloud project id if using Firestore
   - `TELEMETRY_SIM_ENABLED`: enable or disable the telemetry simulator

---

## Running locally

Install dependencies:

```bash
npm install
```

Start the backend and frontend in separate terminals:

```bash
npm run dev -w @arenaiq/server
```

```bash
npm run dev -w @arenaiq/client
```

The server typically runs on port 8080 and the client on port 5173.

---

## Scripts

Useful project scripts include:

```bash
npm run build
npm run type-check
npm run test
npm run test:coverage
```

The repository also includes Playwright coverage for browser and accessibility testing under [e2e](e2e) and supporting architecture notes in [docs](docs).

---

## Testing and quality

The project includes automated testing and quality checks for the client and server workspaces, covering:

- unit and integration testing
- accessibility-focused UI checks
- end-to-end browser testing
- static analysis and linting

---

## Security and deployment notes

ArenaIQ uses server-side validation, rate limiting, and sanitized error responses to reduce abuse and prevent sensitive internals from leaking to clients. For deployment details, see [SECURITY.md](SECURITY.md) and [docs](docs).

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for the full text.

Built by Paadugu Ganesh Naidu for Hack2skill PromptWars Virtual — Week 4.
