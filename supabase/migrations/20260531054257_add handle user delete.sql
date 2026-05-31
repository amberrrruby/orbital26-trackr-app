create or replace function public.handle_user_delete()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  delete from public."User"
  where id = old.id;
  return old;
end;
$$;

create trigger on_auth_user_deleted
after delete on auth.users
for each row
execute function public.handle_user_delete();