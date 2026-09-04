-- Coach/admin can upsert box scores for org matches
create policy box_scores_manage on box_scores for all
  using (
    exists (
      select 1 from matches m
      where m.id = box_scores.match_id
        and m.organization_id = auth_org_id()
    )
  )
  with check (
    exists (
      select 1 from matches m
      where m.id = box_scores.match_id
        and m.organization_id = auth_org_id()
    )
  );
