-- PIN verification for player login (used by /api/auth/player)
create or replace function verify_player_pin(p_player_id uuid, p_pin text)
returns boolean
language sql
security definer
set search_path = public, extensions
as $$
  select exists (
    select 1
    from player_credentials
    where player_id = p_player_id
      and pin_hash = extensions.crypt(p_pin, pin_hash)
  );
$$;

grant execute on function verify_player_pin(uuid, text) to service_role;
