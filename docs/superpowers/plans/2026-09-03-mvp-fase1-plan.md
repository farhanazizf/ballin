# Ballin MVP + Fase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver Ballin MVP + Fase 1 for DBA pilot — offline drill logging, coach dashboard, player card, reports — within 12 weeks.

**Architecture:** Parallel workstreams (Foundation, Field, Coach, Player) with dependency gates. Local-first Dexie outbox, Supabase RLS, append-only drill_events.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, Supabase, Dexie, Serwist, Vitest, Playwright, Tailwind v4, Zod v4.

## Global Constraints

- All domain tables have `organization_id`
- Drills are rows, never enums in code
- drill_events append-only with `client_event_id` idempotency
- Offline-first: local write first, sync later; UI never waits on network
- Authorization via Postgres RLS, not UI checks
- Players never see rankings or other players' data
- Offline status neutral: "Tersimpan di HP"
- Undo always available on drill input screen
- 0 ≠ DNP
- Draft reports invisible to players until coach approves
- UI language: Indonesian, sentence case
- One commit per testable deliverable (see spec §6)
- Touch feedback < 100ms; grid 15 cards re-render < 16ms

---

## Sprint 1 — Foundation (Week 1–2) ← CURRENT

### Task 1: Push DB migration + seed dev

**Files:** `supabase/migrations/00002_verify_player_pin.sql`, `scripts/seed-dev.ts`

- [ ] Run `pnpm db:push`
- [ ] Run `pnpm seed:dev`
- [ ] Commit: `chore(db): push verify_player_pin and load dev seed`

### Task 2: Player login session

**Files:**
- Modify: `src/app/api/auth/player/route.ts`
- Create: `src/lib/supabase/admin.ts`
- Modify: `src/lib/supabase/middleware.ts`
- Modify: `src/app/(auth)/player-login/page.tsx` (redirect to `/card`)

**Flow:** Verify PIN → admin.generateLink magiclink → verifyOtp → set SSR cookies → redirect `/card`

- [ ] Implement session creation in route handler
- [ ] Middleware: player role → allow `/card` only; coach → `/dashboard`
- [ ] Test login with rizky/123456
- [ ] Commit: `feat(auth): complete player PIN login session`

### Task 3: Sync engine end-to-end

**Files:**
- Create: `src/app/api/sync/events/route.ts`
- Modify: `src/lib/sync/outbox.ts`
- Create: `src/components/providers/sync-provider.tsx`
- Modify: `src/app/(field)/layout.tsx`

**Interfaces:**
- Consumes: `OutboxItem` from Dexie
- Produces: `flush()` calls POST `/api/sync/events` with batch payload

- [ ] API: batch insert drill_events ON CONFLICT (client_event_id) DO NOTHING
- [ ] Wire flush() to API
- [ ] Mount SyncProvider + startSyncEngine on field layout
- [ ] Commit: `feat(sync): implement outbox flush to Supabase`

### Task 4: Wire dashboard to real data

**Files:**
- Create: `src/lib/queries/dashboard.ts`
- Modify: `src/app/(app)/dashboard/page.tsx` → server component wrapper + client chart

- [ ] Query sessions, attendance, drill distribution for coach org
- [ ] Fallback empty state when no data
- [ ] Commit: `feat(coach): wire dashboard to Supabase queries`

### Task 5: Wire player card to real data

**Files:**
- Create: `src/lib/queries/player-card.ts`
- Modify: `src/app/(player)/card/page.tsx`

- [ ] Read from `player_card_view` + attendance streak + badges
- [ ] Commit: `feat(player): wire card page to Supabase data`

---

## Sprint 2 — Roster & Sessions (Week 3–4)

### Task 6: Teams CRUD — `(app)/settings/teams`
### Task 7: Players CRUD — `(app)/players`
### Task 8: Drill library admin — `(app)/settings/drills`
### Task 9: Sessions list + recurring — `(app)/sessions`
### Task 10: QR attendance — `(field)/session/[id]/attendance`
### Task 11: Card print API — `api/cards/print`

Each task: implement → test → commit separately.

---

## Sprint 3–4 — Field Core (Week 5–7)

### Task 12: Stations/pos assignment
### Task 13: Drill picker + session_drills
### Task 14: Drill grid component (15 cards, isolated count state)
### Task 15: Timed/count/rating input shells
### Task 16: Undo + review screen
### Task 17: Playwright offline gate test

---

## Sprint 5–6 — Coach + Player polish (Week 7–8)

### Task 18: Player profile coach view `/players/[id]`
### Task 19: Dashboard alerts (attendance drop, attention list)
### Task 20: Player logout + session refresh

---

## Sprint 7–8 — Fase 1 (Week 9–12)

### Task 21: Benchmark sessions
### Task 22: Rubric scores form
### Task 23: Player notes
### Task 24: Matches + box scores
### Task 25: AI report provider + generate route
### Task 26: PDF export
### Task 27: Playwright hardening suite

---

## Overnight execution order (Sprint 1)

1. Task 1 (db)
2. Tasks 2–5 in parallel where possible
3. Commit after each task
