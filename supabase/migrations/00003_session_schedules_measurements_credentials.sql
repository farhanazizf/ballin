-- Recurring session schedules + measurements RLS + credential upsert helper

create table session_schedules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations on delete cascade,
  team_id uuid not null references teams,
  days_of_week smallint[] not null,
  start_time time not null,
  location text,
  session_type text not null default 'training',
  horizon_weeks int not null default 8 check (horizon_weeks between 1 and 26),
  is_active boolean not null default true,
  created_by uuid references profiles,
  created_at timestamptz not null default now(),
  constraint session_schedules_days_valid check (
    coalesce(array_length(days_of_week, 1), 0) >= 1
    and days_of_week <@ array[1, 2, 3, 4, 5, 6, 7]::smallint[]
  )
);

create index session_schedules_org_idx on session_schedules (organization_id, is_active);

alter table sessions add column if not exists schedule_id uuid references session_schedules on delete set null;

alter table session_schedules enable row level security;

create policy session_schedules_read on session_schedules for select
using (organization_id = auth_org_id());

create policy session_schedules_manage on session_schedules for all
using (organization_id = auth_org_id() and auth_role() in ('admin', 'coach'));

create policy measurements_manage on player_measurements for all
using (
  exists (
    select 1 from players p
    where p.id = player_measurements.player_id
      and p.organization_id = auth_org_id()
      and auth_role() in ('admin', 'coach')
  )
);

create or replace function upsert_player_credentials(
  p_player_id uuid,
  p_username text,
  p_pin text
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if length(trim(p_pin)) <> 6 or trim(p_pin) !~ '^[0-9]+$' then
    raise exception 'PIN harus 6 digit angka';
  end if;

  insert into player_credentials (player_id, username, pin_hash, failed_attempts, locked_until)
  values (
    p_player_id,
    lower(trim(p_username)),
    extensions.crypt(p_pin, extensions.gen_salt('bf')),
    0,
    null
  )
  on conflict (player_id) do update set
    username = excluded.username,
    pin_hash = excluded.pin_hash,
    failed_attempts = 0,
    locked_until = null;
end;
$$;

grant execute on function upsert_player_credentials(uuid, text, text) to service_role;
