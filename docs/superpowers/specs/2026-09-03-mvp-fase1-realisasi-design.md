# Ballin — Spec Realisasi MVP + Fase 1

**Tanggal:** 3 September 2026  
**Status:** Disetujui (brainstorming)  
**Mendampingi:** PRD v1.0, TRD v1.0  
**Akademi pilot:** Dynasty Basketball Academy (DBA), Karawang

---

## 1. Ringkasan keputusan

| Parameter | Keputusan |
|---|---|
| Cakupan | MVP + Fase 1 (opsi B) |
| Go-live pilot | ~12 minggu — semua fitur aktif sebelum pilot penuh |
| Kelas aktif | Keempat kelas (Toddler absensi-only, Hoops/Girls/Boys drill stats) |
| Desain UI | Agent + taste-skill + brand guideline; review per milestone |
| AI rapor | Provider abstrak; `AI_API_KEY` sementara, migrasi key nanti |
| Pendekatan build | **Parallel workstreams + dependency gates** (bukan big-bang UI) |

**Kriteria lulus go-live (PRD):**

- Coach mandiri 8 sesi berturut tanpa diingatkan
- Overhead ≤ 5 menit per sesi (4 drill)
- Nol kehilangan data (offline → sync)
- Toddler: absensi + catatan naratif saja
- Pemain tidak pernah melihat ranking / data pemain lain

---

## 2. Posisi codebase (baseline)

| Area | Status |
|---|---|
| Skema DB + RLS + seed dasar | Selesai |
| Migration `verify_player_pin` + seed dev | Siap, perlu `db push` + `pnpm seed:dev` |
| Auth UI coach + PIN pemain | UI selesai; session pemain belum |
| PWA + Dexie + sync skeleton | Kerangka; flush/outbox belum end-to-end |
| Layar field (absensi, drill, pos) | Placeholder |
| Dashboard + kartu pemain | UI mock |
| Unit test | 25 test (validators, utils, atribut, outbox) |

---

## 3. Workstreams & dependency gates

### 3.1 Tiga stream paralel

| Stream | Fokus | Minggu aktif |
|---|---|---|
| **Foundation** | Auth lengkap, seed dev, sync engine, PWA, RLS test | 1–2 |
| **Field** | Sesi, QR absensi, pos, drill grid, undo, review, offline | 4–7 |
| **Coach** | Roster, drill library, dashboard nyata, evaluasi pemain, rapor | 3–8 |
| **Player** | Login session, kartu data nyata, badges, rapor approved | 7–8 |
| **Fase 1** | Benchmark, rubrik, match, atribut cron, rapor AI, PDF | 9–12 |
| **Hardening** | Playwright offline/multi-device/perf, pilot prep | 7, 12 |

### 3.2 Gate wajib (tidak boleh dilewati)

1. **Gate Sync (minggu 7):** Playwright offline 100 rep + multi-device + idempotensi
2. **Gate RLS (minggu 2 & 8):** pemain A ≠ pemain B; coach ≠ kelas lain
3. **Gate Go-live (minggu 12):** TRD §11 seluruhnya lulus

### 3.3 Kontrak antar stream

| Interface | Kontrak |
|---|---|
| `recordRep()` | Append-only ke Dexie; `client_event_id` UUID; < 100ms feedback |
| `flush()` | Batch INSERT `drill_events` ON CONFLICT DO NOTHING |
| `player_card_view` | Pemain hanya baca baris sendiri (RLS + view) |
| Auth coach | Supabase Auth session (email/password) |
| Auth player | `POST /api/auth/player` → session token/JWT |
| Offline status | Netral: "Tersimpan di HP" — bukan error |
| Toddler | `track_drill_stats = false` → sembunyikan drill UI |

---

## 4. Peta 12 minggu

| Minggu | Deliverable utama |
|---|---|
| 1 | Auth lengkap, push migration, seed dev, RLS smoke test |
| 2 | Sync engine end-to-end, outbox flush, sync status UI |
| 3 | Roster CRUD, drill library admin, jadwal sesi recurring |
| 4 | Absensi QR + manual, generator kartu cetak |
| 5 | Pos/stations, mulai drill, grid input (attempt type) |
| 6 | Timed/count/rating drill, undo, layar review |
| 7 | **Gate sync** + backfill pasca-sesi + wire dashboard/kartu (data nyata) |
| 8 | Dashboard alert, profil pemain coach, player login session |
| 9 | Sesi benchmark, rubrik end-of-session |
| 10 | Catatan pemain/sesi, match scheduling |
| 11 | Box score, atribut cron, rapor AI draft |
| 12 | PDF export, hardening Playwright, pilot prep |

---

## 5. Epic PRD → deliverable teknis

### Epic A — Organisasi & Roster (minggu 3–4)

| Story | Deliverable | Lokasi kode (target) |
|---|---|---|
| A1 | CRUD kelas, `track_drill_stats` | `(app)/settings/teams` |
| A2 | CRUD pemain + assign kelas | `(app)/players` |
| A3 | Ukuran tubuh berkala | `(app)/players/[id]/measurements` |
| A4 | Kartu QR generate/revoke/cetak | `(app)/players/cards` |
| A5 | Kelola akun coach | `(app)/settings/coaches` |
| A6 | Akun pemain username/PIN | `(app)/players/[id]/credentials` |

### Epic B — Sesi & Absensi (minggu 4–5)

| Story | Deliverable | Lokasi kode (target) |
|---|---|---|
| B1 | Jadwal Sel/Kam, 2 slot | `(app)/sessions` |
| B2 | Scan QR berurutan | `(field)/session/[id]/attendance` |
| B3 | Absen manual | sama |
| B4 | Daftar belum datang | komponen + filter sesi |

### Epic C — Pos & Drill Logging (minggu 5–7) — inti produk

| Story | Deliverable | Lokasi kode (target) |
|---|---|---|
| C1 | Pos & assign pemain | `(field)/session/[id]/stations` |
| C2 | Pilih drill, recent-first | `(field)/session/[id]/drill/[drillId]` |
| C3 | Grid 15 kartu, satu ketukan = satu event | `lib/sync/record-rep.ts`, grid component |
| C4 | Drill timed/count/measure/rating | shell input per `drill.type` |
| C5 | Review pre-save | `(field)/session/[id]/review` |
| C6 | Offline-first sync | `lib/sync/engine.ts`, `outbox.ts` |
| C7 | Backfill pasca-sesi | mode edit di review |

### Epic D — Kartu Pemain (minggu 7–8)

| Story | Deliverable | Lokasi kode (target) |
|---|---|---|
| D1–D4 | Progress, streak, archetype, radar | `(player)/card` — ganti mock → Supabase |

### Epic E — Dashboard Coach (minggu 7–8)

| Story | Deliverable | Lokasi kode (target) |
|---|---|---|
| E1–E3 | Bento overview, profil pemain, alert | `(app)/dashboard`, `(app)/players/[id]` |

### Epic F — Benchmark (minggu 9–10)

| Story | Deliverable |
|---|---|
| F1 | `session_type = 'benchmark'`, drill terkurasi, snapshot |

### Epic G — Rubrik & Catatan (minggu 9–10)

| Story | Deliverable |
|---|---|
| G1 | `rubric_scores` form akhir sesi |
| G2 | `player_notes` + `sessions.notes` |

### Epic H — Match & Box Score (minggu 10–11)

| Story | Deliverable |
|---|---|
| H1–H3 | `(app)/matches`, box score form, tab di kartu pemain |

### Epic I — Rapor (minggu 11–12)

| Story | Deliverable |
|---|---|
| I1 | `lib/ai/provider.ts`, batch rapor → `reports.ai_draft` |
| I2 | PDF `@react-pdf/renderer`, PNG share `satori` |
| I3 | Pemain baca rapor `approved/sent` saja |

### Drill library (minggu 3)

Admin CRUD `drills` — edit preset seed, arsip, buat baru. **Bukan enum di kode.**

---

## 6. Kebijakan commit bertahap

Setiap unit kerja selesai **wajib commit terpisah** agar history ter-track dan rollback mudah.

### 6.1 Format pesan commit

```
<type>(<scope>): <ringkasan singkat>

[opsional: 1-2 kalimat why]
```

**Type:** `feat`, `fix`, `test`, `chore`, `refactor`, `docs`  
**Scope:** `auth`, `sync`, `field`, `coach`, `player`, `db`, `reports`, dll.

### 6.2 Aturan

1. **Satu commit = satu deliverable testable** — jangan campur epic berbeda
2. **Commit sebelum pindah task** — jangan biarkan WIP > 1 hari tanpa commit
3. **Test harus hijau** sebelum commit (Vitest untuk unit; Playwright saat gate)
4. **Jangan commit** `.env.local`, kredensial, atau data produksi
5. **Migration SQL** = commit terpisah dari UI yang memakainya
6. **Refactor** = commit terpisah dari feat (reviewer-friendly)

### 6.3 Contoh urutan commit (Sprint 1 — minggu 1–2)

```
chore(db): push verify_player_pin migration
chore(seed): add dev seed script and sample accounts
feat(auth): complete player login session via route handler
test(auth): add player login route unit tests
feat(sync): implement outbox flush to drill_events
test(sync): add idempotency tests for client_event_id
feat(ui): wire sync status indicator to outbox state
```

### 6.4 Milestone tag (opsional)

Setelah gate lulus, tag git opsional:

```
v0.1.0-gate-sync
v0.2.0-mvp
v1.0.0-pilot
```

---

## 7. Testing matrix

| Layer | Tool | Kapan |
|---|---|---|
| Validators, utils, atribut | Vitest | setiap commit fitur |
| RLS policies | Script Supabase + test accounts | minggu 2, 8 |
| Offline 100 rep | Playwright | gate minggu 7 |
| Multi-device concurrent | Playwright 2 context | gate minggu 7 |
| Idempotensi batch | Vitest + integration | gate minggu 7 |
| Perf grid 200 tap | Playwright + perf trace | minggu 12 |
| PWA installability | Manual + manifest check | minggu 12 |

---

## 8. Arsitektur AI rapor

```
lib/ai/
  provider.ts      # interface generateReportDraft(context)
  claude.ts        # implementasi default (API key dari env)
  prompts/
    report.ts      # template prompt rapor bulanan
```

- Env: `AI_API_KEY`, `AI_MODEL` (default claude-sonnet)
- Output: JSON → `reports.ai_draft`; coach edit → `content` → approve
- Rate limit pada route generate rapor (TRD §12)

---

## 9. Risiko & mitigasi

| Risiko | Mitigasi |
|---|---|
| UI duluan sebelum sync | Gate minggu 7; mock UI sudah ada, wire data setelah sync |
| Toddler dipaksai drill | `track_drill_stats` + hide drill menu |
| AI key sementara | Provider abstrak; swap env tanpa ubah UI |
| Scope creep Fase 1 | Epic I/H/F hanya mulai minggu 9 setelah gate sync |
| Multi-coach conflict | Append-only events; review flag duplikat |

---

## 10. Langkah berikutnya

1. Review spec ini (user)
2. Tulis implementation plan → `docs/superpowers/plans/2026-09-03-mvp-fase1-plan.md`
3. Sprint 1: Foundation (auth session, db push, seed dev, sync engine)
4. Commit bertahap per §6

---

## Lampiran: posisi vs TRD milestone

| TRD milestone | Minggu spec | Status |
|---|---|---|
| 1 DB + RLS + auth | 1 | ~80% |
| 2 PWA + Dexie + sync | 2 | ~40% |
| 3 Sesi + QR + kartu | 4 | 0% |
| 4 Pos + drill grid | 5–6 | 0% |
| 5 Kartu pemain + dashboard | 7–8 | UI mock |
| 6 Hardening | 7, 12 | 0% |
| Fase 1 (rapor, match, dll) | 9–12 | 0% |
