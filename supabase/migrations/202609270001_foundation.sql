create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'operation');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 2 and 120),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text check (full_name is null or length(trim(full_name)) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_memberships (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  role public.app_role not null default 'operation',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create index organization_memberships_user_idx on public.organization_memberships (user_id, organization_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = target_org
      and membership.user_id = (select auth.uid())
  );
$$;

create or replace function public.is_org_admin(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = target_org
      and membership.user_id = (select auth.uid())
      and membership.role = 'admin'
  );
$$;

create or replace function public.is_org_member_path(target_org text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id::text = target_org
      and membership.user_id = (select auth.uid())
  );
$$;

create or replace function public.is_org_admin_path(target_org text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id::text = target_org
      and membership.user_id = (select auth.uid())
      and membership.role = 'admin'
  );
$$;

revoke all on function public.is_org_member(uuid) from public;
revoke all on function public.is_org_admin(uuid) from public;
revoke all on function public.is_org_member_path(text) from public;
revoke all on function public.is_org_admin_path(text) from public;
grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.is_org_admin(uuid) to authenticated;
grant execute on function public.is_org_member_path(text) to authenticated;
grant execute on function public.is_org_admin_path(text) to authenticated;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_memberships enable row level security;

grant select, update on public.organizations to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.organization_memberships to authenticated;

create policy "organization members can view their organization"
on public.organizations for select to authenticated
using ((select public.is_org_member(id)));

create policy "organization admins can update their organization"
on public.organizations for update to authenticated
using ((select public.is_org_admin(id)))
with check ((select public.is_org_admin(id)));

create policy "users can view their own profile"
on public.profiles for select to authenticated
using (user_id = (select auth.uid()));

create policy "users can update their own profile"
on public.profiles for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "members can view memberships in their organization"
on public.organization_memberships for select to authenticated
using (
  user_id = (select auth.uid())
  or (select public.is_org_admin(organization_id))
);

create policy "admins can add organization members"
on public.organization_memberships for insert to authenticated
with check ((select public.is_org_admin(organization_id)));

create policy "admins can change organization members"
on public.organization_memberships for update to authenticated
using ((select public.is_org_admin(organization_id)))
with check ((select public.is_org_admin(organization_id)));

create policy "admins can remove organization members"
on public.organization_memberships for delete to authenticated
using ((select public.is_org_admin(organization_id)));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'business-media',
  'business-media',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

create policy "organization members can view business media"
on storage.objects for select to authenticated
using (
  bucket_id = 'business-media'
  and (select public.is_org_member_path((storage.foldername(name))[1]))
);

create policy "organization members can upload business media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'business-media'
  and (select public.is_org_member_path((storage.foldername(name))[1]))
);

create policy "organization admins can update business media"
on storage.objects for update to authenticated
using (
  bucket_id = 'business-media'
  and (select public.is_org_admin_path((storage.foldername(name))[1]))
)
with check (
  bucket_id = 'business-media'
  and (select public.is_org_admin_path((storage.foldername(name))[1]))
);

create policy "organization admins can delete business media"
on storage.objects for delete to authenticated
using (
  bucket_id = 'business-media'
  and (select public.is_org_admin_path((storage.foldername(name))[1]))
);
