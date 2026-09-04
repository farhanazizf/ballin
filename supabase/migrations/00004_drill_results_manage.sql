-- Coach/admin can upsert review overrides on drill_results
create policy drill_results_manage on drill_results for all
using (
  exists (
    select 1 from session_drills sd
    join sessions s on s.id = sd.session_id
    where sd.id = drill_results.session_drill_id
      and s.organization_id = auth_org_id()
      and auth_role() in ('admin', 'coach')
  )
);
