# Ballin — task list & progress

> **Update terakhir:** 2026-09-04 (Sprint 7–8 selesai)  
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

## Sprint 5–6 — Coach + player polish

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 18 | Profil pemain coach view | [x] | atribut, wali, absensi, tren drill |
| 19 | Dashboard alerts | [x] | banner + dismiss localStorage |
| 20 | Player logout + refresh | [x] | layout pemain + e2e player-auth |

---

## Sprint 7–8 — Fase 1 ← **current**

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 21 | Benchmark sessions | [x] | battery auto-attach, toggle di form sesi |
| 22 | Rubric scores form | [x] | `/session/[id]/rubric`, rotasi 5 pemain |
| 23 | Player notes | [x] | `/session/[id]/close`, catatan sesi + pemain |
| 24 | Matches + box scores | [x] | `/matches`, box score form |
| 25 | AI report provider | [x] | `lib/ai/provider`, template fallback |
| 26 | PDF export rapor | [x] | `/api/reports/[id]/pdf` |
| 27 | Playwright hardening | [x] | benchmark + sync hook e2e |

---

## Progress ringkas

| Sprint | Selesai | Total | % |
|--------|---------|-------|---|
| 1 | 5 | 5 | 100% |
| 2 | 11 | 11 | **100%** |
| 3–4 | 6 | 6 | **100%** |
| 5–6 | 3 | 3 | **100%** |
| 7–8 | 7 | 7 | **100%** |

**Berikutnya:** Pilot prep lapangan — `pnpm db:push` migration 00007, seed dev, uji jalur absensi + drill offline.

**Migration:** `00007_drill_events_void.sql` — jalankan `pnpm db:push` (plus 00006 jika belum).

---

## Pilot prep P0

| # | Task | Status | Catatan |
|---|------|--------|---------|
| P0-1 | Kartu input drill satu tangan + undo/DNP | [x] | `PlayerDrillCard` di-wire; DNP ≠ 0; Urungkan per kartu |
| P0-2 | Void sync setelah undo | [x] | `/api/sync/events/void` + RLS update |
| P0-3 | Drill bootstrap offline | [x] | Cache Dexie + `session_drills` lokal |
| P0-4 | Absensi 5 status + cari nama | [x] | Hadir/Terlambat/Izin/Sakit/Alfa; scan duplikat "sudah absen" |
| P0-5 | Kartu QR terbit + cetak | [x] | `/api/players/[id]/cards`, PDF QR ECC M |
| P0-6 | Copy lapangan + i18n main | [x] | Rebase ke main i18n; field logic tetap |

---

## Changelog progress

| Tanggal | Perubahan |
|---------|-----------|
| 2026-09-09 | Field P0: drill satu tangan, void sync, absensi 5 status, QR cetak (tanpa rapor) |
| 2026-09-04 | Sprint 7–8 selesai: benchmark, rubrik, notes, match, rapor AI/PDF |
| 2026-09-04 | Sprint 7–8 selesai: profil coach, dashboard alerts, player logout/refresh |
| 2026-09-04 | Sprint 3–4 selesai: stations, input shells, Playwright offline gate |
| 2026-09-04 | Task 16 review screen selesai |
| 2026-09-04 | Sprint 2 selesai: recurring sessions, measurements, credentials |
| 2026-09-04 | Task 6–8, 7: settings CRUD + players CRUD |
| 2026-09-04 | File task list dibuat |
