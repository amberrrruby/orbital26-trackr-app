-- Function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);

  return new;
end;
$$;

-- Avoid duplicate triggers
drop trigger if exists on_auth_user_created on auth.users;

-- Trigger
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();