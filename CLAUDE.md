# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**일감 (ILGAM)** is a Korean senior spot-work platform. The codebase is a Turborepo + pnpm monorepo containing a Next.js 14 employer admin (web), an Expo SDK 51 senior worker app (mobile), shared TS packages, and Supabase (Postgres + Auth + Edge Functions) as the primary backend. Design decisions live in `docs/decisions/ADR-001..008.md` and the ADRs are load-bearing — when making architectural changes, update or cite the relevant ADR.

## Commands

All commands run from the repo root. Turbo delegates to the right workspace.

```bash
pnpm install                 # install all workspaces (requires Node ≥20.11, pnpm ≥9)
pnpm dev:web                 # admin-web on :3000 (Next.js)
pnpm dev:app                 # worker-app (Expo dev client)
pnpm build                   # turbo build — all workspaces
pnpm lint                    # turbo lint
pnpm typecheck               # turbo typecheck (tsc --noEmit everywhere)
pnpm test                    # turbo test (Vitest on web/core, Jest on worker-app)
pnpm format                  # prettier --write .

pnpm db:migrate              # supabase db push (applies packages/db/migrations/*.sql)
pnpm db:reset                # supabase db reset (recreates local DB)
pnpm db:diff                 # supabase db diff
```

Run a single workspace's script directly with Turbo's `--filter`:

```bash
pnpm turbo run test --filter=@ilgam/admin-web
pnpm turbo run test --filter=@ilgam/core -- path/to/foo.test.ts   # args after `--` reach the runner
pnpm turbo run lint typecheck test --filter=...[origin/main]       # only affected workspaces (used by CI)
```

Run pgTAP RLS tests (matches CI's `db-rls-tests` job): start Postgres, apply every file in `packages/db/migrations/` with `psql`, then `pg_prove packages/db/tests/*.sql`.

## Architecture

### Monorepo layout

```
apps/
  admin-web/      @ilgam/admin-web   Next.js 14 App Router (employer admin + marketing)
  worker-app/     @ilgam/worker-app  Expo SDK 51 + expo-router (senior worker app)
packages/
  core/           @ilgam/core        shared TS types, Zod schemas, Supabase client, notify helpers
  db/             @ilgam/db          SQL migrations, seeds, pgTAP tests (no build output)
  design-tokens/  @ilgam/design-tokens  navy/gray palette + a11y tokens
supabase/
  functions/      Deno Edge Functions: match-engine, notify-dispatch, payment-settle, cx-triage
  config.toml     local Supabase CLI config (ports 54321 API / 54322 DB / 54323 Studio)
```

UI components are **not** shared across web/mobile (`shadcn/ui` on web, `React Native Paper` on mobile). Only logic, types, Zod schemas, and Supabase client factory live in `packages/core`. Do not introduce a shared UI layer without updating ADR-001/ADR-003.

### Data model and RLS (ADR-005)

Database schema is defined in `packages/db/migrations/*.sql` and is the source of truth for `packages/core/src/types.ts`. Three schemas:

- `public.*` — tables exposed via PostgREST (jobs, workers, employers, matches, shifts, payments, …)
- `private.*` — sensitive PII (e.g. `private.workers_tax_identity` with `pgp_sym_encrypt`ed RRN / bank). **Never expose `private.*` through RLS or grants**; `revoke all … from anon, authenticated` is mandatory.
- `app.*` — SECURITY DEFINER helper functions used by RLS policies (`app.current_employer_ids()`, `app.is_platform_admin()`, `app.log_admin_access()`).

RLS is enforced on every `public.*` business table with a 3-axis pattern: worker = `profile_id = auth.uid()`, employer = `employer_id IN app.current_employer_ids()`, admin = `app.is_platform_admin()` with prior `app.log_admin_access()` call. Any new table must (a) `enable row level security`, (b) add explicit `grant` in `0003_api_exposure.sql` style (default deny), (c) add pgTAP cases under `packages/db/tests/`.

Schema conventions worth preserving:
- `hourly_wage_krw >= 10030` CHECK (2026 KR minimum wage) on `jobs`.
- `shifts.worked_minutes` is `GENERATED ALWAYS AS (...) STORED` — do not write to it.
- `audit_log` is RANGE-partitioned monthly; add the next partition before month boundaries.
- PII deletion is **split**: user-facing PII hard-delete on withdrawal, but transactional rows (`shifts`, `payments`, `matches`) keep `worker_id` replaced with an anonymous UUID to preserve audit trails.

### Runtime flow

Writes and side effects go through Edge Functions or Next.js API routes; reads go directly via `supabase-js` (ADR-004). Key flows:

- **Matching** (`supabase/functions/match-engine`): Postgres RPC `match_jobs_for_worker` does the 1st-pass filter (region/wage/time overlap, GIN on `cert_codes`), then a weighted rerank runs in Deno (wage 0.5 / distance 0.3 / mentor-tag 0.2). **No LLM in the match path** — Claude is reserved for listing summarization and CX triage only.
- **Notifications** (`supabase/functions/notify-dispatch`, queued via pg-boss): AlimTalk (Bizppurio) first, SMS (Aligo/LG U+) fallback on error codes `R001/R002/T001` (see `packages/core/src/notify.ts`). Retries 15s/1m/5m/15m. `verify_jwt = false` because pg-boss is the caller; guard with the shared service-role key.
- **Payments** (`supabase/functions/payment-settle`): PortOne webhook, `verify_jwt = false`, **self-verifies via webhook signature**. Escrow model (통신판매중개업) — do not introduce direct platform-held balances without revisiting ADR-004 (triggers 전자금융거래법 registration).
- **CX** (`supabase/functions/cx-triage`): Claude intent classifier, confidence ≥0.85 auto-reply from pre-approved FAQ RAG, <0.60 or intent=신고/급여미지급 routes to a human immediately (ADR-008).

### Frontend conventions (ADR-003)

- Next.js: `app/(marketing)/*` → static + ISR; `app/(dashboard)/*` → RSC + Supabase server client, add `export const dynamic = 'force-dynamic'` and `no-store` for anything touching user data.
- Expo: default polling + push on the worker app (15s polling, Realtime used only briefly during match-acceptance screens — battery & LTE constraint on low-end Androids).
- State: TanStack Query for server cache + Zustand for session/filters/outbox. Persist with MMKV (RN) / IndexedDB (web). No Jotai/Redux without hitting the ADR-003 re-evaluation triggers.
- Senior-UX baselines are non-negotiable and enforced via `@ilgam/design-tokens`: touch target ≥48dp, WCAG AAA 7:1 contrast, base 18pt font that survives 200% system zoom.

## Workflow

- Branches: `main` (prod, no direct push), `develop` (staging), feature branches `feat/<scope>-<summary>` etc. Commits follow Conventional Commits with scopes like `web`, `app`, `db`, `infra`, `cx`, `adr`.
- Three release gates (ADR-007): **merge-to-main** requires lint + typecheck + test + pgTAP RLS all green + `expo prebuild` success; **staging deploy** adds Playwright web smoke (12) + Maestro mobile smoke (8) + PortOne sandbox payment/refund; **production deploy** requires 24h staging soak + 1 real-device payment + Axe critical=0 + rollback rehearsal.
- Structural changes → link the relevant ADR in the PR. PII/payment changes → update `docs/architecture/security.md`. See `.github/pull_request_template.md` and `CONTRIBUTING.md`.
- CI (`.github/workflows/ci.yml`) runs lint/typecheck/test only on workspaces affected since `origin/main` via `turbo --filter=...[origin/main]`; a separate job boots Postgres, applies all migrations, and runs pgTAP.

## Secrets and environments

`.env.example` is the template; copy to `.env` locally. Prod secrets live in 1Password Business (ADR-006) and are mirrored to Vercel / Supabase Vault / Expo EAS Secrets / GitHub Actions Secrets. Keep `NEXT_PUBLIC_*` vars safe for client exposure (they ship in the bundle); server-only keys (`SUPABASE_SERVICE_ROLE_KEY`, `PORTONE_API_SECRET`, `ANTHROPIC_API_KEY`, …) must never be referenced from client components or the Expo bundle.
