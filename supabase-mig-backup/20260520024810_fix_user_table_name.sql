-- our table is named user not users. force string exact match
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public."User" (id, email)
  values (new.id, new.email);

  return new;
end;
$$;