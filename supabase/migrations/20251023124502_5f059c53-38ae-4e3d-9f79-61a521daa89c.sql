-- Create user_roles table using existing user_role enum
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role user_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Create security definer function to check roles safely
create or replace function public.has_role(_user_id uuid, _role user_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Migrate existing roles from profiles to user_roles
insert into public.user_roles (user_id, role)
select id, role from public.profiles
on conflict (user_id, role) do nothing;

-- Drop old problematic policies on profiles
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Users can view their own profile" on public.profiles;

-- Create new safe policies for profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.has_role(auth.uid(), 'admin'));

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can update all profiles"
  on public.profiles for update
  using (public.has_role(auth.uid(), 'admin'));

-- Drop old permissive policies on customers
drop policy if exists "Authenticated users can view customers" on public.customers;
drop policy if exists "Authenticated users can insert customers" on public.customers;
drop policy if exists "Authenticated users can update customers" on public.customers;
drop policy if exists "Authenticated users can delete customers" on public.customers;

-- Create role-based policies for customers
create policy "Admins manage customers"
  on public.customers for all
  using (public.has_role(auth.uid(), 'admin'));

create policy "Staff view customers"
  on public.customers for select
  using (public.has_role(auth.uid(), 'staff'));

create policy "Staff insert customers"
  on public.customers for insert
  with check (public.has_role(auth.uid(), 'staff'));

-- Drop old permissive policies on vehicles
drop policy if exists "Authenticated users can view vehicles" on public.vehicles;
drop policy if exists "Authenticated users can insert vehicles" on public.vehicles;
drop policy if exists "Authenticated users can update vehicles" on public.vehicles;
drop policy if exists "Authenticated users can delete vehicles" on public.vehicles;

-- Create role-based policies for vehicles
create policy "Admins manage vehicles"
  on public.vehicles for all
  using (public.has_role(auth.uid(), 'admin'));

create policy "Staff view vehicles"
  on public.vehicles for select
  using (public.has_role(auth.uid(), 'staff'));

create policy "Staff insert vehicles"
  on public.vehicles for insert
  with check (public.has_role(auth.uid(), 'staff'));

-- Drop old permissive policies on services
drop policy if exists "Authenticated users can view services" on public.services;
drop policy if exists "Authenticated users can insert services" on public.services;
drop policy if exists "Authenticated users can update services" on public.services;
drop policy if exists "Authenticated users can delete services" on public.services;

-- Create role-based policies for services
create policy "Admins manage services"
  on public.services for all
  using (public.has_role(auth.uid(), 'admin'));

create policy "Staff view services"
  on public.services for select
  using (public.has_role(auth.uid(), 'staff'));

create policy "Staff insert services"
  on public.services for insert
  with check (public.has_role(auth.uid(), 'staff'));

create policy "Staff update services"
  on public.services for update
  using (public.has_role(auth.uid(), 'staff'));

-- Drop old permissive policies on service_feedback
drop policy if exists "Authenticated users can view feedback" on public.service_feedback;
drop policy if exists "Authenticated users can insert feedback" on public.service_feedback;
drop policy if exists "Authenticated users can update feedback" on public.service_feedback;
drop policy if exists "Authenticated users can delete feedback" on public.service_feedback;

-- Create role-based policies for service_feedback
create policy "Admins manage feedback"
  on public.service_feedback for all
  using (public.has_role(auth.uid(), 'admin'));

create policy "Staff view feedback"
  on public.service_feedback for select
  using (public.has_role(auth.uid(), 'staff'));

create policy "Staff insert feedback"
  on public.service_feedback for insert
  with check (public.has_role(auth.uid(), 'staff'));

-- RLS policies for user_roles table
create policy "Users can view own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);

create policy "Admins can view all roles"
  on public.user_roles for select
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage roles"
  on public.user_roles for all
  using (public.has_role(auth.uid(), 'admin'));

-- Update handle_new_user trigger to use user_roles table
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Insert profile without role
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', new.email)
  );
  
  -- Insert default staff role into user_roles
  insert into public.user_roles (user_id, role)
  values (new.id, 'staff');
  
  return new;
end;
$$;

-- Remove role column from profiles (data already migrated)
alter table public.profiles drop column if exists role;