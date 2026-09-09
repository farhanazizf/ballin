-- Allow coaches to void already-synced drill events (append-only undo).
-- UPDATE is limited to rows in the coach's organization via existing org helpers.

create policy drill_events_void on drill_events for update
using (
  exists (
    select 1 from session_drills sd
    join sessions s on s.id = sd.session_id
    where sd.id = drill_events.session_drill_id and s.organization_id = auth_org_id()
  )
  and auth_role() in ('admin','coach')
)
with check (
  exists (
    select 1 from session_drills sd
    join sessions s on s.id = sd.session_id
    where sd.id = drill_events.session_drill_id and s.organization_id = auth_org_id()
  )
  and auth_role() in ('admin','coach')
);
