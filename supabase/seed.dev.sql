-- ============================================================
-- Ballin — Dev seed (akun login + data sampel)
-- Jalankan lewat: pnpm seed:dev
-- Butuh auth.users dibuat dulu oleh scripts/seed-dev.ts
-- ============================================================

-- UUID tetap dev ------------------------------------------------
-- Org:     00000000-0000-0000-0000-000000000001
-- Admin:   10000000-0000-0000-0000-000000000001
-- Coach:   10000000-0000-0000-0000-000000000002
-- Asisten: 10000000-0000-0000-0000-000000000003

-- Bersihkan data dev sebelumnya (idempotent)
delete from drill_events where recorded_by in (
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003'
);
delete from session_drills where id = '50000000-0000-0000-0000-000000000001';
delete from attendance where session_id in (
  '40000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000002'
);
delete from sessions where id in (
  '40000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000002'
);
delete from player_badges where player_id in ('30000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000005');
delete from reports where player_id in ('30000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000005');
delete from player_attributes where player_id in ('30000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000005');
delete from player_cards where player_id in ('30000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000005');
delete from player_credentials where player_id in ('30000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000005');
delete from player_measurements where player_id in ('30000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000005');
delete from team_players where player_id in ('30000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000005');
delete from players where id in ('30000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000005');
delete from coach_teams where coach_id in (
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003'
);
delete from profiles where id in ('10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000003');

-- PROFILES ----------------------------------------------------
insert into profiles (id, organization_id, role, full_name) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'admin', 'Admin Dynasty'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'coach', 'Coach Ferdianka'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'coach', 'Coach Asisten'),
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'player', 'Rizky Ramadhan'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'player', 'Adit Pratama'),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'player', 'Sinta Ayu');

-- COACH ↔ KELAS -----------------------------------------------
insert into coach_teams (coach_id, team_id)
select '10000000-0000-0000-0000-000000000002', id from teams
where organization_id = '00000000-0000-0000-0000-000000000001' and name in ('Boys', 'Girls');

insert into coach_teams (coach_id, team_id)
select '10000000-0000-0000-0000-000000000003', id from teams
where organization_id = '00000000-0000-0000-0000-000000000001' and name = 'Hoops';


-- DRILL LIBRARY (dev minimum untuk lapangan + e2e) ------------
insert into drills (
  id, organization_id, name, category, type, default_target, unit,
  lower_is_better, attribute_weights, instructions
) values
  ('61000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
   'Free throw', 'Shooting', 'attempt', 10, 'percobaan', false,
   '{"shooting":0.8,"attitude":0.2}', 'Dev seed — free throw'),
  ('61000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
   'Dribble zigzag cone', 'Ballhandling', 'timed', null, 'detik', true,
   '{"ballhandling":0.7,"athleticism":0.3}', 'Dev seed — timed drill'),
  ('61000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
   'Two-ball dribble 30 detik', 'Ballhandling', 'count_in_time', 30, 'repetisi', false,
   '{"ballhandling":1.0}', 'Dev seed — count in time'),
  ('61000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
   'Vertical jump', 'Athleticism', 'measure', null, 'cm', false,
   '{"athleticism":1.0}', 'Dev seed — measure'),
  ('61000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
   'Closeout', 'Defense', 'rating', null, 'skala 1-5', false,
   '{"defense":1.0}', 'Dev seed — rating'),
  ('61000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001',
   'Sprint 3/4 lapangan', 'Athleticism', 'timed', null, 'detik', true,
   '{"athleticism":1.0}', 'Dev seed — benchmark sprint'),
  ('61000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001',
   'Defensive slide (lane agility)', 'Defense', 'timed', null, 'detik', true,
   '{"defense":0.6,"athleticism":0.4}', 'Dev seed — benchmark agility'),
  ('61000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001',
   'Beep test', 'Conditioning', 'measure', null, 'level', false,
   '{"athleticism":1.0}', 'Dev seed — benchmark beep'),
  ('61000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001',
   'Spot shooting 5 titik', 'Shooting', 'attempt', 10, 'percobaan', false,
   '{"shooting":1.0}', 'Dev seed — benchmark spot shooting')
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  type = excluded.type,
  default_target = excluded.default_target,
  unit = excluded.unit,
  lower_is_better = excluded.lower_is_better,
  attribute_weights = excluded.attribute_weights,
  instructions = excluded.instructions,
  is_archived = false;

-- PEMAIN ------------------------------------------------------
insert into players (
  id, organization_id, profile_id, full_name, nickname, birth_date,
  jersey_number, position, dominant_hand, school, status, joined_at
) values
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000001', 'Rizky Ramadhan', 'Rizky', '2012-03-15',
   7, 'G/F', 'right', 'SMP N 1 Karawang', 'active', '2024-01-10'),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000002', 'Adit Pratama', 'Adit', '2012-07-22',
   11, 'G', 'right', 'SMP N 2 Karawang', 'active', '2024-02-01'),
  ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000003', 'Sinta Ayu Lestari', 'Sinta', '2011-11-08',
   5, 'G', 'right', 'SMP PGRI Karawang', 'active', '2023-09-01'),
  ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
   null, 'Budi Santoso', 'Budi', '2015-05-30',
   3, null, 'right', 'SD N 5 Karawang', 'active', '2025-01-15'),
  ('30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
   null, 'Dimas Kurniawan', 'Dimas', '2020-02-14',
   null, null, 'right', null, 'active', '2025-08-01');

insert into team_players (team_id, player_id)
select t.id, p.id
from (values
  ('Boys', '30000000-0000-0000-0000-000000000001'),
  ('Boys', '30000000-0000-0000-0000-000000000002'),
  ('Girls', '30000000-0000-0000-0000-000000000003'),
  ('Hoops', '30000000-0000-0000-0000-000000000004'),
  ('Toddler', '30000000-0000-0000-0000-000000000005')
) as m(team_name, player_id)
join teams t on t.name = m.team_name
  and t.organization_id = '00000000-0000-0000-0000-000000000001'
join players p on p.id = m.player_id::uuid;

-- LOGIN PIN (dev: semua PIN = 123456) -------------------------
insert into player_credentials (player_id, username, pin_hash) values
  ('30000000-0000-0000-0000-000000000001', 'rizky', crypt('123456', gen_salt('bf'))),
  ('30000000-0000-0000-0000-000000000002', 'adit', crypt('123456', gen_salt('bf'))),
  ('30000000-0000-0000-0000-000000000003', 'sinta', crypt('123456', gen_salt('bf')));

-- UKURAN TUBUH ------------------------------------------------
insert into player_measurements (player_id, measured_on, height_cm, weight_kg, wingspan_cm, standing_reach_cm) values
  ('30000000-0000-0000-0000-000000000001', '2026-08-01', 168.5, 52.0, 172.0, 215.0),
  ('30000000-0000-0000-0000-000000000002', '2026-08-01', 165.0, 48.5, 168.0, 210.0),
  ('30000000-0000-0000-0000-000000000003', '2026-08-01', 162.0, 50.0, 165.0, 205.0);

-- KARTU QR ----------------------------------------------------
insert into player_cards (id, organization_id, player_id, token) values
  ('60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
   '30000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
   '30000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000002'),
  ('60000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
   '30000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000003');

-- ATRIBUT & LENCANA -------------------------------------------
insert into player_attributes (
  player_id, period_start, period_end,
  shooting, finishing, ballhandling, defense, athleticism, attitude,
  archetype, data_sufficient
) values
  ('30000000-0000-0000-0000-000000000001', '2026-08-01', '2026-08-31',
   55, 78, 62, 45, 71, 80, 'Slasher', true),
  ('30000000-0000-0000-0000-000000000002', '2026-08-01', '2026-08-31',
   72, 58, 55, 50, 60, 75, 'Shooter', true),
  ('30000000-0000-0000-0000-000000000003', '2026-08-01', '2026-08-31',
   60, 55, 68, 52, 58, 82, 'Playmaker', true);

insert into player_badges (player_id, badge_id, earned_at)
select '30000000-0000-0000-0000-000000000001', b.id, '2026-07-15'::timestamptz
from badges b
where b.organization_id = '00000000-0000-0000-0000-000000000001' and b.code = 'streak_5';

insert into player_badges (player_id, badge_id, earned_at)
select '30000000-0000-0000-0000-000000000001', b.id, '2026-08-20'::timestamptz
from badges b
where b.organization_id = '00000000-0000-0000-0000-000000000001' and b.code = 'reps_500';

-- SESI LATIHAN ------------------------------------------------
insert into sessions (
  id, organization_id, team_id, scheduled_start, scheduled_end,
  location, status, session_type, opened_at
) values
  ('40000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000001',
   (select id from teams where name = 'Boys' and organization_id = '00000000-0000-0000-0000-000000000001' limit 1),
   '2026-08-28 16:00:00+07', '2026-08-28 18:00:00+07',
   'GOR Dynasty', 'completed', 'training', '2026-08-28 16:05:00+07'),
  ('40000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000001',
   (select id from teams where name = 'Boys' and organization_id = '00000000-0000-0000-0000-000000000001' limit 1),
   '2026-09-03 16:00:00+07', '2026-09-03 18:00:00+07',
   'GOR Dynasty', 'active', 'training', '2026-09-03 16:02:00+07');

insert into attendance (session_id, player_id, session_date, status, method, recorded_by)
values
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '2026-08-28', 'present', 'qr', '10000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '2026-08-28', 'present', 'qr', '10000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '2026-09-03', 'present', 'manual', '10000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '2026-09-03', 'late', 'manual', '10000000-0000-0000-0000-000000000002');

-- DRILL EVENTS (append-only sample) ---------------------------
insert into session_drills (id, session_id, drill_id, target, track_misses, created_by)
select
  '50000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000001',
  d.id,
  10,
  true,
  '10000000-0000-0000-0000-000000000002'
from drills d
where d.organization_id = '00000000-0000-0000-0000-000000000001'
  and d.name = 'Free throw'
limit 1;

insert into drill_events (
  client_event_id, session_drill_id, player_id, result,
  occurred_at, device_id, recorded_by
) values
  ('80000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'made', '2026-08-28 16:30:00+07', 'dev-seed-device', '10000000-0000-0000-0000-000000000002'),
  ('80000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'made', '2026-08-28 16:30:05+07', 'dev-seed-device', '10000000-0000-0000-0000-000000000002'),
  ('80000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'miss', '2026-08-28 16:30:10+07', 'dev-seed-device', '10000000-0000-0000-0000-000000000002'),
  ('80000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'made', '2026-08-28 16:31:00+07', 'dev-seed-device', '10000000-0000-0000-0000-000000000002'),
  ('80000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'made', '2026-08-28 16:31:05+07', 'dev-seed-device', '10000000-0000-0000-0000-000000000002');

-- RAPOR -------------------------------------------------------
insert into reports (player_id, period_start, period_end, status, content) values
  ('30000000-0000-0000-0000-000000000001', '2026-08-01', '2026-08-31', 'draft',
   '{"summary":"Rizky menunjukkan peningkatan finishing.","highlights":["Layup kanan konsisten","Kehadiran bagus"],"improvements":["Shooting jarak jauh","Defense footwork"]}'),
  ('30000000-0000-0000-0000-000000000002', '2026-08-01', '2026-08-31', 'approved',
   '{"summary":"Adit unggul di shooting spot up.","highlights":["Free throw 80%","Spot shooting stabil"],"improvements":["Finishing tangan kiri"]}');
