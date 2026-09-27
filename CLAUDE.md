# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Admin dashboard + API backend for a LINE bot (salon use case). Next.js App Router, TypeScript, Tailwind CSS v4, using `@line/bot-sdk` for LINE Messaging API integration.

## Commands

```bash
npm run dev      # start dev server (Turbopack) — falls back to :3001+ if :3000 is taken
npm run build    # production build (also runs the TypeScript check)
npm run start    # run the production build
npm run lint     # eslint (flat config: eslint-config-next core-web-vitals + typescript)
npx tsc --noEmit # type-check only, without a full build
```

There is no test setup yet (no test runner installed).

## Architecture

- App Router, source rooted at `src/app`. Import alias `@/*` maps to `./src/*` (see `tsconfig.json`).
- LINE webhook endpoint: `src/app/api/line/webhook/route.ts`. It validates the `x-line-signature` header with `validateSignature` before processing any event, then replies via `messagingApi.MessagingApiClient`. Any new LINE event handling should go through this same verify-then-dispatch flow — never process a webhook body before signature validation.
- Required env vars: `LINE_CHANNEL_SECRET`, `LINE_CHANNEL_ACCESS_TOKEN` (see `.env.example`). Not set in the repo; must be provided via `.env.local` for local dev.
- Event/message types come from the `webhook` namespace of `@line/bot-sdk` (e.g. `webhook.Event`), not a top-level `WebhookEvent` export — the SDK nests its types by API area (`webhook.*`, `messagingApi.*`, etc.).

## Important: Next.js version

This project is on a pre-release/breaking Next.js version (16.x) — APIs and conventions may differ from what training data assumes. `AGENTS.md` (auto-generated and re-written by `next dev`; keep it committed) points to `node_modules/next/dist/docs/` for the version-accurate guide. Check there before assuming App Router behavior from memory, especially around routing, config, or server/client boundaries.
