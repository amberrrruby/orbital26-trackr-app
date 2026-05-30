/* =========================================================
   USER SYNC SETUP (Supabase Auth → public."User")
   ========================================================= */

/* ---------------------------------------------------------
   1. FUNCTION: create user row on signup
   --------------------------------------------------------- */

drop function if exists public.handle_new_user();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public."User" (id, email, name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'display_name'
  );

  return new;
end;
$$;


/* ---------------------------------------------------------
   2. FUNCTION: sync email updates
   --------------------------------------------------------- */

drop function if exists public.handle_user_email_update();

create or replace function public.handle_user_email_update()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  update public."User"
  set email = new.email
  where id = new.id;

  return new;
end;
$$;


/* ---------------------------------------------------------
   3. TRIGGER: on auth.users insert
   --------------------------------------------------------- */

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();


/* ---------------------------------------------------------
   4. TRIGGER: on auth.users email update
   --------------------------------------------------------- */

drop trigger if exists on_auth_user_email_updated on auth.users;

create trigger on_auth_user_email_updated
after update of email on auth.users
for each row
when (old.email is distinct from new.email)
execute function public.handle_user_email_update();


/* ---------------------------------------------------------
   5. RLS ENABLEMENT
   --------------------------------------------------------- */

alter table public."User" enable row level security;


/* ---------------------------------------------------------
   6. RLS POLICIES
   --------------------------------------------------------- */

drop policy if exists "read own user" on public."User";
drop policy if exists "update own user" on public."User";

create policy "read own user"
on public."User"
for select
using (auth.uid() = id);

create policy "update own user"
on public."User"
for update
using (auth.uid() = id);

/* =========================================================
   APPLICATIONS TABLE RLS (User-owned data access)
   ========================================================= */

/* Enable RLS */

alter table public."Application"
enable row level security;


/* ---------------------------------------------------------
   SELECT: only own applications
   --------------------------------------------------------- */

drop policy if exists "read own applications" on public."Application";

create policy "read own applications"
on public."Application"
for select
using (auth.uid() = "userId");


/* ---------------------------------------------------------
   INSERT: only insert for self
   --------------------------------------------------------- */

drop policy if exists "insert own applications" on public."Application";

create policy "insert own applications"
on public."Application"
for insert
with check (auth.uid() = "userId");


/* ---------------------------------------------------------
   UPDATE: only own applications
   --------------------------------------------------------- */

drop policy if exists "update own applications" on public."Application";

create policy "update own applications"
on public."Application"
for update
using (auth.uid() = "userId")
with check (auth.uid() = "userId");


/* ---------------------------------------------------------
   DELETE: only own applications
   --------------------------------------------------------- */

drop policy if exists "delete own applications" on public."Application";

create policy "delete own applications"
on public."Application"
for delete
using (auth.uid() = "userId");