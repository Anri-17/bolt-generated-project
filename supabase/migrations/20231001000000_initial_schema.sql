-- Update profiles policy to prevent recursion
create policy "Users can view their own profile"
on profiles for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on profiles for update
using (auth.uid() = id)
with check (
  -- Allow role changes only for admins
  (select role from profiles where id = auth.uid()) = 'admin' or
  role = (select role from profiles where id = auth.uid())
);

-- Add new policy for admin access
create policy "Admin can manage all profiles"
on profiles for all
using (
  exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  )
)
with check (
  exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- Update the prevent_role_change function
create or replace function prevent_role_change()
returns trigger as $$
begin
  if old.role is distinct from new.role and
    not exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    ) then
    raise exception 'Only admins can change roles' using errcode = 'P0001';
  end if;
  return new;
end;
$$ language plpgsql;

-- Update the enforce_admin_role_assignment function
create or replace function enforce_admin_role_assignment()
returns trigger as $$
begin
  if new.role = 'admin' and
    not exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    ) then
    raise exception 'Only admins can assign admin role' using errcode = 'P0002';
  end if;
  return new;
end;
$$ language plpgsql;
