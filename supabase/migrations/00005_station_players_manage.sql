-- RLS manage policy for station_players (coach/admin assign players to pos)

create policy station_players_manage on station_players for all
using (
  exists (
    select 1 from session_stations ss
    join sessions s on s.id = ss.session_id
    where ss.id = station_players.station_id and s.organization_id = auth_org_id()
  )
  and auth_role() in ('admin','coach')
);
