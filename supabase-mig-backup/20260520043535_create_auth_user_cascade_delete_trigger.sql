-- foreign key cascade delete
alter table public."User"
add constraint users_id_fkey
foreign key (id)
references auth.users(id)
on delete cascade;

-- rls for "User" table
alter table public."User" enable row level security;

-- policies
create policy "read own user"
on public."User"
for select
using (auth.uid() = id);

create policy "update own user"
on public."User"
for update
using (auth.uid() = id);