# Ballin — task list & progress

> **Update terakhir:** 2026-09-04 (Sprint 5–6 selesai)  
> **Cara pakai:** centang `[x]` saat selesai. Agent **wajib** update file ini setiap selesai task.

**Legenda:** `[x]` selesai · `[~]` sebagian · `[ ]` belum

---

## Sprint 1 — Foundation

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 1 | Push DB migration + seed dev | [x] | `pnpm db:push`, `pnpm seed:dev` |
| 2 | Player login session (PIN → `/card`) | [x] | |
| 3 | Sync engine (Dexie → `/api/sync/events`) | [x] | |
| 4 | Dashboard data nyata | [x] | |
| 5 | Player card data nyata | [x] | |

---

## Sprint 2 — Roster & sessions

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 6 | Teams CRUD | [x] | `/settings/teams` |
| 7 | Players CRUD | [x] | `/players/new`, `/players/[id]/edit` |
| 8 | Drill library admin | [x] | `/settings/drills` |
| 9 | Sessions list + buat sesi | [x] | `/sessions` |
| 9b | Jadwal sesi recurring | [x] | `session_schedules`, `/api/session-schedules`, batalkan sesi |
| 10 | QR attendance | [x] | `/session/[id]/attendance` |
| 11 | Card print API | [x] | `/api/cards/print` |
| A3 | Ukuran tubuh pemain | [x] | `/players/[id]/measurements` |
| A6 | Kredensial username/PIN | [x] | `/players/[id]/credentials` |

**Migration Sprint 2b:** `00003_session_schedules_measurements_credentials.sql` — jalankan `pnpm db:push`.

---

## Sprint 3–4 — Field core

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 12 | Stations / pos assignment | [x] | `/api/sessions/[id]/stations`, UI atur pos + rotasi |
| 13 | Drill picker + session_drills | [x] | |
| 14 | Drill grid 15 kartu | [x] | undo per pemain terakhir |
| 15 | Shell timed / count / rating | [x] | `DrillInputShell` + komponen per tipe |
| 16 | Layar review drill | [x] | `/session/[id]/review`, override lokal + sync |
| 17 | Playwright offline gate | [x] | `tests/e2e/offline-drill-gate.spec.ts` |

---

## Sprint 5–6 — Coach + player polish ← **current**

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 18 | Profil pemain coach view | [x] | atribut, wali, absensi, tren drill |
| 19 | Dashboard alerts | [x] | banner + dismiss localStorage |
| 20 | Player logout + refresh | [x] | layout pemain + e2e player-auth |

---

## Sprint 7–8 — Fase 1

| # | Task | Status |
|---|------|--------|
| 21 | Benchmark sessions | [ ] |
| 22 | Rubric scores form | [ ] |
| 23 | Player notes | [ ] |
| 24 | Matches + box scores | [ ] |
| 25 | AI report provider | [ ] |
| 26 | PDF export rapor | [ ] |
| 27 | Playwright hardening | [ ] |

---

## Progress ringkas

| Sprint | Selesai | Total | % |
|--------|---------|-------|---|
| 1 | 5 | 5 | 100% |
| 2 | 11 | 11 | **100%** |
| 3–4 | 6 | 6 | **100%** |
| 5–6 | 3 | 3 | **100%** |
| 7–8 | 0 | 7 | 0% |

**Berikutnya:** Sprint 7–8 — benchmark sessions, rubric scores, player notes.

**Migration:** `00005_station_players_manage.sql` — jalankan `pnpm db:push`.

---

## Changelog progress

| Tanggal | Perubahan |
|---------|-----------|
| 2026-09-04 | Sprint 5–6 selesai: profil coach, dashboard alerts, player logout/refresh |
| 2026-09-04 | Sprint 3–4 selesai: stations, input shells, Playwright offline gate |
| 2026-09-04 | Task 16 review screen selesai |
| 2026-09-04 | Sprint 2 selesai: recurring sessions, measurements, credentials |
| 2026-09-04 | Task 6–8, 7: settings CRUD + players CRUD |
| 2026-09-04 | File task list dibuat |
