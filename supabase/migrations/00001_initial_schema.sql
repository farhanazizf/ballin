-- =============================================================================
-- Ballin Academy — Initial Schema Migration
-- =============================================================================

-- 1. Extensions
-- =============================================================================
create extension if not exists "pgcrypto";

-- 2. Organizations
-- =============================================================================
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  primary_color text,
  timezone text not null default 'Asia/Jakarta',
  created_at timestamptz not null default now()
);

-- 3. Teams (kelas)
-- =============================================================================
create table teams (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations on delete cascade,
  name text not null,
  age_min int,
  age_max int,
  track_drill_stats boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 4. User roles & profiles
-- =============================================================================
create type user_role as enum ('admin','coach','player','parent');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  organization_id uuid not null references organizations,
  role user_role not null,
  full_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table coach_teams (
  coach_id uuid not null references profiles on delete cascade,
  team_id uuid not null references teams on delete cascade,
  primary key (coach_id, team_id)
);

-- 5. Players
-- =============================================================================
create table players (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations on delete cascade,
  profile_id uuid unique references profiles on delete set null,
  full_name text not null,
  nickname text not null,
  birth_date date not null,
  jersey_number int,
  position text,
  dominant_hand text,
  school text,
  photo_path text,
  guardian_name text,
  guardian_phone text,
  consent_given_at timestamptz,
  consent_given_by text,
  status text not null default 'active',
  joined_at date not null default current_date,
  created_at timestamptz not null default now()
);

create table team_players (
  team_id uuid not null references teams on delete cascade,
  player_id uuid not null references players on delete cascade,
  joined_at date not null default current_date,
  left_at date,
  primary key (team_id, player_id)
);

create table player_measurements (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players on delete cascade,
  measured_on date not null,
  height_cm numeric(5,1),
  weight_kg numeric(5,1),
  wingspan_cm numeric(5,1),
  standing_reach_cm numeric(5,1),
  unique (player_id, measured_on)
);

-- 6. Player cards (QR)
-- =============================================================================
create table player_cards (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations on delete cascade,
  player_id uuid not null references players on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  printed_at timestamptz
);
create index on player_cards (organization_id) where revoked_at is null;

-- 7. Player credentials (PIN login)
-- =============================================================================
create table player_credentials (
  player_id uuid primary key references players on delete cascade,
  username text not null unique,
  pin_hash text not null,
  failed_attempts int not null default 0,
  locked_until timestamptz
);

-- 8. Drills
-- =============================================================================
create type drill_type as enum ('attempt','timed','count_in_time','measure','rating');

create table drills (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations on delete cascade,
  name text not null,
  category text not null,
  type drill_type not null,
  default_target int,
  unit text,
  lower_is_better boolean not null default false,
  attribute_weights jsonb not null default '{}',
  instructions text,
  video_url text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now()
);

-- 9. Sessions
-- =============================================================================
create type session_status as enum ('scheduled','active','completed','cancelled');

create table sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations on delete cascade,
  team_id uuid not null references teams,
  scheduled_start timestamptz not null,
  scheduled_end timestamptz,
  location text,
  status session_status not null default 'scheduled',
  session_type text not null default 'training',
  opened_at timestamptz,
  closed_at timestamptz,
  cancel_reason text,
  notes text,
  created_at timestamptz not null default now()
);
create index on sessions (team_id, scheduled_start desc);

create table session_stations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions on delete cascade,
  label text not null,
  coach_id uuid references profiles,
  sort_order int not null default 0
);

create table station_players (
  station_id uuid not null references session_stations on delete cascade,
  player_id uuid not null references players on delete cascade,
  primary key (station_id, player_id)
);

-- 10. Attendance
-- =============================================================================
create type attendance_status as enum ('present','late','excused','sick','absent');

create table attendance (
  session_id uuid not null references sessions on delete cascade,
  player_id uuid not null references players on delete cascade,
  session_date date not null,
  status attendance_status not null,
  checked_in_at timestamptz,
  method text not null default 'manual',
  recorded_by uuid references profiles,
  primary key (session_id, player_id)
);

create unique index attendance_one_session_per_day
  on attendance (player_id, session_date)
  where status in ('present','late');

-- 11. Drill logging (append-only core)
-- =============================================================================
create table session_drills (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions on delete cascade,
  station_id uuid references session_stations on delete set null,
  drill_id uuid not null references drills,
  target int,
  track_misses boolean not null default false,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_by uuid not null references profiles
);

create table drill_events (
  id uuid primary key default gen_random_uuid(),
  client_event_id uuid not null,
  session_drill_id uuid not null references session_drills on delete cascade,
  player_id uuid not null references players on delete cascade,
  result text not null,
  value numeric,
  occurred_at timestamptz not null,
  device_id text not null,
  recorded_by uuid not null references profiles,
  voided_at timestamptz,
  created_at timestamptz not null default now(),
  unique (client_event_id)
);
create index on drill_events (session_drill_id, player_id) where voided_at is null;

create table drill_results (
  session_drill_id uuid not null references session_drills on delete cascade,
  player_id uuid not null references players on delete cascade,
  made int not null default 0,
  attempts int not null default 0,
  value numeric,
  is_dnp boolean not null default false,
  overridden boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (session_drill_id, player_id)
);

-- 12. Phase 1 tables
-- =============================================================================
create table rubric_scores (
  session_id uuid not null references sessions on delete cascade,
  player_id uuid not null references players on delete cascade,
  effort int check (effort between 1 and 5),
  coachability int check (coachability between 1 and 5),
  discipline int check (discipline between 1 and 5),
  recorded_by uuid not null references profiles,
  created_at timestamptz not null default now(),
  primary key (session_id, player_id)
);

create table player_notes (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players on delete cascade,
  session_id uuid references sessions on delete set null,
  note text not null,
  kind text not null default 'observation',
  created_by uuid not null references profiles,
  created_at timestamptz not null default now()
);

create table matches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations on delete cascade,
  team_id uuid not null references teams,
  opponent text not null,
  match_type text not null,
  played_at timestamptz not null,
  location text,
  score_for int,
  score_against int,
  notes text
);

create table box_scores (
  match_id uuid not null references matches on delete cascade,
  player_id uuid not null references players on delete cascade,
  minutes int, points int,
  fgm int, fga int, tpm int, tpa int, ftm int, fta int,
  oreb int, dreb int, assists int, steals int, blocks int,
  turnovers int, fouls int,
  primary key (match_id, player_id)
);

create table player_attributes (
  player_id uuid not null references players on delete cascade,
  period_start date not null,
  period_end date not null,
  shooting numeric(5,2), finishing numeric(5,2), ballhandling numeric(5,2),
  defense numeric(5,2), athleticism numeric(5,2), attitude numeric(5,2),
  archetype text,
  archetype_locked boolean not null default false,
  data_sufficient boolean not null default true,
  computed_at timestamptz not null default now(),
  primary key (player_id, period_start)
);

create type report_status as enum ('draft','approved','sent');

create table reports (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players on delete cascade,
  period_start date not null,
  period_end date not null,
  status report_status not null default 'draft',
  ai_draft jsonb,
  content jsonb not null,
  approved_by uuid references profiles,
  approved_at timestamptz,
  pdf_path text,
  unique (player_id, period_start)
);

create table badges (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations on delete cascade,
  code text not null, name text not null, description text,
  criteria jsonb not null,
  unique (organization_id, code)
);

create table player_badges (
  player_id uuid not null references players on delete cascade,
  badge_id uuid not null references badges on delete cascade,
  earned_at timestamptz not null default now(),
  seen_at timestamptz,
  primary key (player_id, badge_id)
);

-- 13. Player card view (hides raw attribute values from players)
-- =============================================================================
create view player_card_view as
select p.id, p.nickname, p.jersey_number, pa.archetype,
       round(pa.shooting/100.0, 2) as shape_shooting,
       round(pa.finishing/100.0, 2) as shape_finishing,
       round(pa.ballhandling/100.0, 2) as shape_ballhandling,
       round(pa.defense/100.0, 2) as shape_defense,
       round(pa.athleticism/100.0, 2) as shape_athleticism,
       round(pa.attitude/100.0, 2) as shape_attitude,
       pa.period_start, pa.period_end, pa.data_sufficient
from players p 
left join player_attributes pa on pa.player_id = p.id;

-- 14. Trigger for drill_results aggregation
-- =============================================================================
create or replace function update_drill_results()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    insert into drill_results (session_drill_id, player_id, made, attempts, is_dnp)
    values (
      NEW.session_drill_id,
      NEW.player_id,
      case when NEW.result = 'made' and NEW.voided_at is null then 1 else 0 end,
      case when NEW.result in ('made','miss') and NEW.voided_at is null then 1 else 0 end,
      NEW.result = 'dnp'
    )
    on conflict (session_drill_id, player_id)
    do update set
      made = case when drill_results.overridden then drill_results.made else (
        select count(*) from drill_events
        where session_drill_id = NEW.session_drill_id
          and player_id = NEW.player_id
          and result = 'made'
          and voided_at is null
      ) end,
      attempts = case when drill_results.overridden then drill_results.attempts else (
        select count(*) from drill_events
        where session_drill_id = NEW.session_drill_id
          and player_id = NEW.player_id
          and result in ('made','miss')
          and voided_at is null
      ) end,
      is_dnp = exists (
        select 1 from drill_events
        where session_drill_id = NEW.session_drill_id
          and player_id = NEW.player_id
          and result = 'dnp'
          and voided_at is null
      ),
      updated_at = now()
    where not drill_results.overridden or NEW.result = 'dnp';
  end if;

  if TG_OP = 'UPDATE' and OLD.voided_at is null and NEW.voided_at is not null then
    update drill_results set
      made = case when drill_results.overridden then drill_results.made else (
        select count(*) from drill_events
        where session_drill_id = NEW.session_drill_id
          and player_id = NEW.player_id
          and result = 'made'
          and voided_at is null
      ) end,
      attempts = case when drill_results.overridden then drill_results.attempts else (
        select count(*) from drill_events
        where session_drill_id = NEW.session_drill_id
          and player_id = NEW.player_id
          and result in ('made','miss')
          and voided_at is null
      ) end,
      updated_at = now()
    where session_drill_id = NEW.session_drill_id
      and player_id = NEW.player_id
      and not drill_results.overridden;
  end if;

  return NEW;
end;
$$ language plpgsql;

create trigger trg_drill_events_aggregate
  after insert or update on drill_events
  for each row execute function update_drill_results();

-- 15. Row Level Security
-- =============================================================================

-- Enable RLS on all tables
alter table organizations enable row level security;
alter table teams enable row level security;
alter table profiles enable row level security;
alter table coach_teams enable row level security;
alter table players enable row level security;
alter table team_players enable row level security;
alter table player_measurements enable row level security;
alter table player_cards enable row level security;
alter table player_credentials enable row level security;
alter table drills enable row level security;
alter table sessions enable row level security;
alter table session_stations enable row level security;
alter table station_players enable row level security;
alter table attendance enable row level security;
alter table session_drills enable row level security;
alter table drill_events enable row level security;
alter table drill_results enable row level security;
alter table rubric_scores enable row level security;
alter table player_notes enable row level security;
alter table matches enable row level security;
alter table box_scores enable row level security;
alter table player_attributes enable row level security;
alter table reports enable row level security;
alter table badges enable row level security;
alter table player_badges enable row level security;

-- Helper function: get user's organization
create or replace function auth_org_id()
returns uuid as $$
  select organization_id from profiles where id = auth.uid()
$$ language sql stable security definer;

-- Helper function: get user's role
create or replace function auth_role()
returns user_role as $$
  select role from profiles where id = auth.uid()
$$ language sql stable security definer;

-- Organizations: users see their own org
create policy org_read on organizations for select
using (id = auth_org_id());

-- Teams: users see teams in their org
create policy teams_read on teams for select
using (organization_id = auth_org_id());

create policy teams_manage on teams for all
using (organization_id = auth_org_id() and auth_role() = 'admin');

-- Profiles: users see profiles in their org
create policy profiles_read on profiles for select
using (organization_id = auth_org_id());

create policy profiles_manage on profiles for all
using (organization_id = auth_org_id() and auth_role() = 'admin');

-- Coach teams: coaches see their assignments
create policy coach_teams_read on coach_teams for select
using (
  exists (select 1 from profiles where id = auth.uid() and organization_id = auth_org_id())
);

-- Players: players see themselves, coaches/admins see org players
create policy player_reads_own on players for select
using (
  profile_id = auth.uid()
  or (organization_id = auth_org_id() and auth_role() in ('admin','coach'))
);

create policy player_manage on players for all
using (organization_id = auth_org_id() and auth_role() in ('admin','coach'));

-- Team players: coach sees players in their teams
create policy team_players_read on team_players for select
using (
  exists (select 1 from coach_teams ct where ct.coach_id = auth.uid() and ct.team_id = team_players.team_id)
  or auth_role() = 'admin'
);

-- Player measurements: same as players
create policy measurements_read on player_measurements for select
using (
  exists (select 1 from players p where p.id = player_measurements.player_id
    and (p.profile_id = auth.uid() or (p.organization_id = auth_org_id() and auth_role() in ('admin','coach'))))
);

-- Player cards: admin/coach manage
create policy cards_read on player_cards for select
using (organization_id = auth_org_id());

create policy cards_manage on player_cards for all
using (organization_id = auth_org_id() and auth_role() in ('admin','coach'));

-- Drills: org-wide read, admin manage
create policy drills_read on drills for select
using (organization_id = auth_org_id());

create policy drills_manage on drills for all
using (organization_id = auth_org_id() and auth_role() = 'admin');

-- Sessions: org read, coach/admin manage
create policy sessions_read on sessions for select
using (organization_id = auth_org_id());

create policy sessions_manage on sessions for all
using (organization_id = auth_org_id() and auth_role() in ('admin','coach'));

-- Session stations: inherit from session
create policy stations_read on session_stations for select
using (
  exists (select 1 from sessions s where s.id = session_stations.session_id and s.organization_id = auth_org_id())
);

create policy stations_manage on session_stations for all
using (
  exists (select 1 from sessions s where s.id = session_stations.session_id and s.organization_id = auth_org_id())
  and auth_role() in ('admin','coach')
);

-- Station players
create policy station_players_read on station_players for select
using (
  exists (
    select 1 from session_stations ss
    join sessions s on s.id = ss.session_id
    where ss.id = station_players.station_id and s.organization_id = auth_org_id()
  )
);

-- Attendance: org read, coach manage
create policy attendance_read on attendance for select
using (
  exists (select 1 from sessions s where s.id = attendance.session_id and s.organization_id = auth_org_id())
);

create policy attendance_manage on attendance for all
using (
  exists (select 1 from sessions s where s.id = attendance.session_id and s.organization_id = auth_org_id())
  and auth_role() in ('admin','coach')
);

-- Session drills
create policy session_drills_read on session_drills for select
using (
  exists (select 1 from sessions s where s.id = session_drills.session_id and s.organization_id = auth_org_id())
);

create policy session_drills_manage on session_drills for all
using (
  exists (select 1 from sessions s where s.id = session_drills.session_id and s.organization_id = auth_org_id())
  and auth_role() in ('admin','coach')
);

-- Drill events: org read, coach insert
create policy drill_events_read on drill_events for select
using (
  exists (
    select 1 from session_drills sd
    join sessions s on s.id = sd.session_id
    where sd.id = drill_events.session_drill_id and s.organization_id = auth_org_id()
  )
);

create policy drill_events_insert on drill_events for insert
with check (
  exists (
    select 1 from session_drills sd
    join sessions s on s.id = sd.session_id
    where sd.id = drill_events.session_drill_id and s.organization_id = auth_org_id()
  )
  and auth_role() in ('admin','coach')
);

-- Drill results
create policy drill_results_read on drill_results for select
using (
  exists (
    select 1 from session_drills sd
    join sessions s on s.id = sd.session_id
    where sd.id = drill_results.session_drill_id and s.organization_id = auth_org_id()
  )
);

-- Rubric scores
create policy rubric_read on rubric_scores for select
using (
  exists (select 1 from sessions s where s.id = rubric_scores.session_id and s.organization_id = auth_org_id())
);

create policy rubric_manage on rubric_scores for all
using (
  exists (select 1 from sessions s where s.id = rubric_scores.session_id and s.organization_id = auth_org_id())
  and auth_role() in ('admin','coach')
);

-- Player notes
create policy notes_read on player_notes for select
using (
  exists (select 1 from players p where p.id = player_notes.player_id and p.organization_id = auth_org_id())
  and auth_role() in ('admin','coach')
);

create policy notes_manage on player_notes for all
using (
  exists (select 1 from players p where p.id = player_notes.player_id and p.organization_id = auth_org_id())
  and auth_role() in ('admin','coach')
);

-- Matches
create policy matches_read on matches for select
using (organization_id = auth_org_id());

create policy matches_manage on matches for all
using (organization_id = auth_org_id() and auth_role() in ('admin','coach'));

-- Box scores
create policy box_scores_read on box_scores for select
using (
  exists (select 1 from matches m where m.id = box_scores.match_id and m.organization_id = auth_org_id())
);

-- Player attributes: coach/admin see all, player sees normalized shape only via view
create policy attributes_read on player_attributes for select
using (
  exists (select 1 from players p where p.id = player_attributes.player_id and p.organization_id = auth_org_id())
  and auth_role() in ('admin','coach')
);

-- Reports: draft only for coach/admin, approved for player too
create policy reports_coach_read on reports for select
using (
  exists (select 1 from players p where p.id = reports.player_id and p.organization_id = auth_org_id())
  and auth_role() in ('admin','coach')
);

create policy reports_player_read on reports for select
using (
  status in ('approved','sent')
  and exists (select 1 from players pl where pl.id = reports.player_id and pl.profile_id = auth.uid())
);

create policy reports_manage on reports for all
using (
  exists (select 1 from players p where p.id = reports.player_id and p.organization_id = auth_org_id())
  and auth_role() in ('admin','coach')
);

-- Badges
create policy badges_read on badges for select
using (organization_id = auth_org_id());

-- Player badges
create policy player_badges_read on player_badges for select
using (
  exists (select 1 from players p where p.id = player_badges.player_id
    and (p.profile_id = auth.uid() or (p.organization_id = auth_org_id() and auth_role() in ('admin','coach'))))
);

-- Player credentials: only service role should access this normally
create policy credentials_admin on player_credentials for all
using (auth_role() = 'admin');
