-- College Complaint Management System
-- Paste this entire file into the Supabase SQL Editor and run it.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null,
  category text not null check (
    category in ('Hostel', 'Academics', 'Infrastructure', 'Canteen', 'Transport', 'Other')
  ),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'resolved')),
  image_path text,
  assigned_to uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.status_history (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints (id) on delete cascade,
  status text not null check (status in ('pending', 'in_progress', 'resolved')),
  changed_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists complaints_student_id_idx on public.complaints (student_id);
create index if not exists complaints_status_idx on public.complaints (status);
create index if not exists complaints_category_idx on public.complaints (category);
create index if not exists status_history_complaint_id_idx on public.status_history (complaint_id);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'student'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_complaints_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists complaints_set_updated_at on public.complaints;
create trigger complaints_set_updated_at
  before update on public.complaints
  for each row execute function public.set_complaints_updated_at();

create or replace function public.insert_initial_status_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.status_history (complaint_id, status, changed_by)
  values (new.id, new.status, new.student_id);
  return new;
end;
$$;

drop trigger if exists complaints_initial_status_history on public.complaints;
create trigger complaints_initial_status_history
  after insert on public.complaints
  for each row execute function public.insert_initial_status_history();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.complaints enable row level security;
alter table public.status_history enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
  on public.profiles
  for select
  to authenticated
  using (public.is_admin());

-- Students need staff names on complaint detail (assigned_to).
drop policy if exists "Authenticated can read admin profiles" on public.profiles;
create policy "Authenticated can read admin profiles"
  on public.profiles
  for select
  to authenticated
  using (role = 'admin');

drop policy if exists "Students can insert own complaints" on public.complaints;
create policy "Students can insert own complaints"
  on public.complaints
  for insert
  to authenticated
  with check (student_id = auth.uid());

drop policy if exists "Students can select own complaints" on public.complaints;
create policy "Students can select own complaints"
  on public.complaints
  for select
  to authenticated
  using (student_id = auth.uid());

drop policy if exists "Admins can select all complaints" on public.complaints;
create policy "Admins can select all complaints"
  on public.complaints
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update all complaints" on public.complaints;
create policy "Admins can update all complaints"
  on public.complaints
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Students can select own complaint history" on public.status_history;
create policy "Students can select own complaint history"
  on public.status_history
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.complaints c
      where c.id = status_history.complaint_id
        and c.student_id = auth.uid()
    )
  );

drop policy if exists "Admins can select all status history" on public.status_history;
create policy "Admins can select all status history"
  on public.status_history
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can insert status history" on public.status_history;
create policy "Admins can insert status history"
  on public.status_history
  for insert
  to authenticated
  with check (public.is_admin());

grant usage on schema public to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update on public.complaints to authenticated;
grant select, insert on public.status_history to authenticated;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'complaint-images',
  'complaint-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Students can upload own complaint images" on storage.objects;
create policy "Students can upload own complaint images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'complaint-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Students can select own complaint images" on storage.objects;
create policy "Students can select own complaint images"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'complaint-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Admins can select all complaint images" on storage.objects;
create policy "Admins can select all complaint images"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'complaint-images'
    and public.is_admin()
  );
