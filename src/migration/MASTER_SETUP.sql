-- ============================================================
-- Progresia Master Database Setup (LENGKAP)
-- Safe to run multiple times on Supabase SQL Editor.
-- Berisi: schema awal + perbaikan keamanan + audit log + constraints
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- TABEL UTAMA
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  student_id text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  course_name text not null,
  description text,
  capacity integer not null default 5 check (capacity between 2 and 10),
  invite_code text not null default gen_random_uuid()::text unique,
  pin_hash text not null,
  leader_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('leader', 'member')),
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null,
  description text,
  assignee_id uuid references public.profiles(id) on delete set null,
  deadline timestamptz,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'in_review', 'done')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.progress_updates (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  description text not null,
  progress_percentage integer check (progress_percentage between 0 and 100),
  created_at timestamptz not null default now()
);

create table if not exists public.progress_files (
  id uuid primary key default gen_random_uuid(),
  progress_update_id uuid not null references public.progress_updates(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  file_type text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.contribution_periods (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null,
  status text not null default 'open' check (status in ('open', 'closed', 'finalized')),
  opened_at timestamptz,
  closed_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contribution_votes (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references public.contribution_periods(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  voter_id uuid not null references public.profiles(id) on delete cascade,
  target_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null check (score between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (period_id, voter_id, target_id),
  check (voter_id <> target_id)
);

create table if not exists public.contribution_reviews (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references public.contribution_periods(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  target_id uuid not null references public.profiles(id) on delete cascade,
  review_text text,
  adjusted_score integer check (adjusted_score between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (period_id, reviewer_id, target_id),
  constraint contribution_reviews_reason_required check (
    (adjusted_score is null)
    or (review_text is not null and length(trim(review_text)) > 0)
  )
);

-- ============================================================
-- TABEL AUDIT LOG
-- ============================================================

create table if not exists public.score_audit_log (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references public.contribution_periods(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  target_id uuid not null references public.profiles(id) on delete cascade,
  previous_score integer,
  new_score integer not null check (new_score between 1 and 5),
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.task_status_history (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  changed_by uuid not null references public.profiles(id) on delete cascade,
  old_status text not null,
  new_status text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_groups_leader_id on public.groups(leader_id);
create index if not exists idx_groups_invite_code on public.groups(invite_code);
create index if not exists idx_group_members_group_id on public.group_members(group_id);
create index if not exists idx_group_members_user_id on public.group_members(user_id);
create index if not exists idx_tasks_group_id on public.tasks(group_id);
create index if not exists idx_tasks_assignee_id on public.tasks(assignee_id);
create index if not exists idx_tasks_created_by on public.tasks(created_by);
create index if not exists idx_progress_updates_task_id on public.progress_updates(task_id);
create index if not exists idx_progress_updates_user_id on public.progress_updates(user_id);
create index if not exists idx_progress_files_progress_update_id on public.progress_files(progress_update_id);
create index if not exists idx_progress_files_task_id on public.progress_files(task_id);
create index if not exists idx_contribution_periods_group_id on public.contribution_periods(group_id);
create index if not exists idx_contribution_votes_period_id on public.contribution_votes(period_id);
create index if not exists idx_contribution_votes_group_id on public.contribution_votes(group_id);
create index if not exists idx_contribution_votes_voter_id on public.contribution_votes(voter_id);
create index if not exists idx_contribution_votes_target_id on public.contribution_votes(target_id);
create index if not exists idx_contribution_reviews_period_id on public.contribution_reviews(period_id);
create index if not exists idx_contribution_reviews_group_id on public.contribution_reviews(group_id);
create index if not exists idx_contribution_reviews_reviewer_id on public.contribution_reviews(reviewer_id);
create index if not exists idx_contribution_reviews_target_id on public.contribution_reviews(target_id);
create index if not exists idx_score_audit_log_period on public.score_audit_log(period_id);
create index if not exists idx_score_audit_log_group on public.score_audit_log(group_id);
create index if not exists idx_score_audit_log_target on public.score_audit_log(target_id);
create index if not exists idx_task_status_history_task on public.task_status_history(task_id);

-- Unique partial index: hanya boleh ada 1 leader per grup
create unique index if not exists idx_group_members_one_leader
on public.group_members(group_id)
where role = 'leader';

-- ============================================================
-- TRIGGERS: UPDATED_AT
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_groups_updated_at on public.groups;
create trigger trg_groups_updated_at
before update on public.groups
for each row execute function public.set_updated_at();

drop trigger if exists trg_tasks_updated_at on public.tasks;
create trigger trg_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

drop trigger if exists trg_contribution_periods_updated_at on public.contribution_periods;
create trigger trg_contribution_periods_updated_at
before update on public.contribution_periods
for each row execute function public.set_updated_at();

drop trigger if exists trg_contribution_votes_updated_at on public.contribution_votes;
create trigger trg_contribution_votes_updated_at
before update on public.contribution_votes
for each row execute function public.set_updated_at();

drop trigger if exists trg_contribution_reviews_updated_at on public.contribution_reviews;
create trigger trg_contribution_reviews_updated_at
before update on public.contribution_reviews
for each row execute function public.set_updated_at();

-- ============================================================
-- TRIGGER: HANDLE NEW USER (auto-create profile)
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, student_id)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'student_id'
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    student_id = excluded.student_id,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============================================================
-- TRIGGER: TASK STATUS HISTORY (auto-catat perubahan status)
-- ============================================================

create or replace function public.log_task_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    insert into public.task_status_history (task_id, changed_by, old_status, new_status)
    values (new.id, auth.uid(), old.status, new.status);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_task_status_history on public.tasks;
create trigger trg_task_status_history
  after update of status on public.tasks
  for each row execute function public.log_task_status_change();

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

create or replace function public.is_group_member(p_group_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = p_group_id
      and gm.user_id = p_user_id
  );
$$;

create or replace function public.is_group_leader(p_group_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = p_group_id
      and gm.user_id = p_user_id
      and gm.role = 'leader'
  );
$$;

create or replace function public.validate_invite_and_pin(p_invite_code text, p_pin_hash text)
returns table (group_id uuid, group_capacity integer)
language sql
security definer
set search_path = public
stable
as $$
  select g.id, g.capacity
  from public.groups g
  where g.invite_code = p_invite_code
    and g.pin_hash = p_pin_hash
  limit 1;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.tasks enable row level security;
alter table public.progress_updates enable row level security;
alter table public.progress_files enable row level security;
alter table public.contribution_periods enable row level security;
alter table public.contribution_votes enable row level security;
alter table public.contribution_reviews enable row level security;
alter table public.score_audit_log enable row level security;
alter table public.task_status_history enable row level security;

-- ============================================================
-- RLS POLICIES: PROFILES
-- ============================================================

drop policy if exists "profiles_select_own_or_groupmates" on public.profiles;
create policy "profiles_select_own_or_groupmates"
on public.profiles for select
to authenticated
using (
  id = auth.uid()
  or exists (
    select 1
    from public.group_members mine
    join public.group_members theirs on theirs.group_id = mine.group_id
    where mine.user_id = auth.uid()
      and theirs.user_id = profiles.id
  )
);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- ============================================================
-- RLS POLICIES: GROUPS
-- ============================================================

drop policy if exists "groups_select_member" on public.groups;
create policy "groups_select_member"
on public.groups for select
to authenticated
using (leader_id = auth.uid() or public.is_group_member(id, auth.uid()));

drop policy if exists "groups_insert_own_leader" on public.groups;
create policy "groups_insert_own_leader"
on public.groups for insert
to authenticated
with check (leader_id = auth.uid());

drop policy if exists "groups_update_leader" on public.groups;
create policy "groups_update_leader"
on public.groups for update
to authenticated
using (public.is_group_leader(id, auth.uid()))
with check (public.is_group_leader(id, auth.uid()));

drop policy if exists "groups_delete_leader" on public.groups;
create policy "groups_delete_leader"
on public.groups for delete
to authenticated
using (public.is_group_leader(id, auth.uid()));

-- ============================================================
-- RLS POLICIES: GROUP MEMBERS
-- ============================================================

drop policy if exists "group_members_select_member" on public.group_members;
create policy "group_members_select_member"
on public.group_members for select
to authenticated
using (public.is_group_member(group_id, auth.uid()));

drop policy if exists "group_members_insert_self_or_leader" on public.group_members;
create policy "group_members_insert_self_or_leader"
on public.group_members for insert
to authenticated
with check (user_id = auth.uid() or public.is_group_leader(group_id, auth.uid()));

drop policy if exists "group_members_update_leader" on public.group_members;
create policy "group_members_update_leader"
on public.group_members for update
to authenticated
using (public.is_group_leader(group_id, auth.uid()))
with check (public.is_group_leader(group_id, auth.uid()));

drop policy if exists "group_members_delete_self_or_leader" on public.group_members;
create policy "group_members_delete_self_or_leader"
on public.group_members for delete
to authenticated
using (user_id = auth.uid() or public.is_group_leader(group_id, auth.uid()));

-- ============================================================
-- RLS POLICIES: TASKS
-- ============================================================

drop policy if exists "tasks_select_member" on public.tasks;
create policy "tasks_select_member"
on public.tasks for select
to authenticated
using (public.is_group_member(group_id, auth.uid()));

drop policy if exists "tasks_insert_member" on public.tasks;
create policy "tasks_insert_member"
on public.tasks for insert
to authenticated
with check (public.is_group_member(group_id, auth.uid()) and created_by = auth.uid());

drop policy if exists "tasks_update_member" on public.tasks;
create policy "tasks_update_member"
on public.tasks for update
to authenticated
using (public.is_group_member(group_id, auth.uid()))
with check (public.is_group_member(group_id, auth.uid()));

drop policy if exists "tasks_delete_leader" on public.tasks;
create policy "tasks_delete_leader"
on public.tasks for delete
to authenticated
using (public.is_group_leader(group_id, auth.uid()));

-- ============================================================
-- RLS POLICIES: PROGRESS UPDATES (append-only, no update/delete)
-- ============================================================

drop policy if exists "progress_updates_select_member" on public.progress_updates;
create policy "progress_updates_select_member"
on public.progress_updates for select
to authenticated
using (
  exists (
    select 1 from public.tasks t
    where t.id = progress_updates.task_id
      and public.is_group_member(t.group_id, auth.uid())
  )
);

drop policy if exists "progress_updates_insert_member" on public.progress_updates;
create policy "progress_updates_insert_member"
on public.progress_updates for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.tasks t
    where t.id = progress_updates.task_id
      and public.is_group_member(t.group_id, auth.uid())
  )
);

-- ============================================================
-- RLS POLICIES: PROGRESS FILES (no delete)
-- ============================================================

drop policy if exists "progress_files_select_member" on public.progress_files;
create policy "progress_files_select_member"
on public.progress_files for select
to authenticated
using (
  exists (
    select 1 from public.tasks t
    where t.id = progress_files.task_id
      and public.is_group_member(t.group_id, auth.uid())
  )
);

drop policy if exists "progress_files_insert_uploader" on public.progress_files;
create policy "progress_files_insert_uploader"
on public.progress_files for insert
to authenticated
with check (
  uploaded_by = auth.uid()
  and exists (
    select 1 from public.tasks t
    where t.id = progress_files.task_id
      and public.is_group_member(t.group_id, auth.uid())
  )
);

-- ============================================================
-- RLS POLICIES: CONTRIBUTION PERIODS
-- ============================================================

drop policy if exists "contribution_periods_select_member" on public.contribution_periods;
create policy "contribution_periods_select_member"
on public.contribution_periods for select
to authenticated
using (public.is_group_member(group_id, auth.uid()));

drop policy if exists "contribution_periods_insert_leader" on public.contribution_periods;
create policy "contribution_periods_insert_leader"
on public.contribution_periods for insert
to authenticated
with check (created_by = auth.uid() and public.is_group_leader(group_id, auth.uid()));

drop policy if exists "contribution_periods_update_leader" on public.contribution_periods;
create policy "contribution_periods_update_leader"
on public.contribution_periods for update
to authenticated
using (public.is_group_leader(group_id, auth.uid()))
with check (public.is_group_leader(group_id, auth.uid()));

-- ============================================================
-- RLS POLICIES: CONTRIBUTION VOTES (hanya saat periode open)
-- ============================================================

drop policy if exists "contribution_votes_select_member" on public.contribution_votes;
create policy "contribution_votes_select_member"
on public.contribution_votes for select
to authenticated
using (public.is_group_member(group_id, auth.uid()));

drop policy if exists "contribution_votes_insert_member" on public.contribution_votes;
create policy "contribution_votes_insert_member"
on public.contribution_votes for insert
to authenticated
with check (
  voter_id = auth.uid()
  and voter_id <> target_id
  and public.is_group_member(group_id, auth.uid())
  and exists (
    select 1 from public.group_members gm
    where gm.group_id = contribution_votes.group_id
      and gm.user_id = contribution_votes.target_id
  )
  and exists (
    select 1 from public.contribution_periods cp
    where cp.id = period_id
      and cp.status = 'open'
  )
);

drop policy if exists "contribution_votes_update_voter" on public.contribution_votes;
create policy "contribution_votes_update_voter"
on public.contribution_votes for update
to authenticated
using (
  voter_id = auth.uid()
  and voter_id <> target_id
  and public.is_group_member(group_id, auth.uid())
  and exists (
    select 1 from public.contribution_periods cp
    where cp.id = period_id
      and cp.status = 'open'
  )
)
with check (
  voter_id = auth.uid()
  and voter_id <> target_id
  and public.is_group_member(group_id, auth.uid())
);

-- ============================================================
-- RLS POLICIES: CONTRIBUTION REVIEWS
-- ============================================================

drop policy if exists "contribution_reviews_select_member" on public.contribution_reviews;
create policy "contribution_reviews_select_member"
on public.contribution_reviews for select
to authenticated
using (public.is_group_member(group_id, auth.uid()));

drop policy if exists "contribution_reviews_insert_leader" on public.contribution_reviews;
create policy "contribution_reviews_insert_leader"
on public.contribution_reviews for insert
to authenticated
with check (reviewer_id = auth.uid() and public.is_group_leader(group_id, auth.uid()));

drop policy if exists "contribution_reviews_update_leader" on public.contribution_reviews;
create policy "contribution_reviews_update_leader"
on public.contribution_reviews for update
to authenticated
using (reviewer_id = auth.uid() and public.is_group_leader(group_id, auth.uid()))
with check (reviewer_id = auth.uid() and public.is_group_leader(group_id, auth.uid()));

-- ============================================================
-- RLS POLICIES: SCORE AUDIT LOG
-- ============================================================

drop policy if exists "score_audit_log_select_member" on public.score_audit_log;
create policy "score_audit_log_select_member"
on public.score_audit_log for select
to authenticated
using (public.is_group_member(group_id, auth.uid()));

-- ============================================================
-- RLS POLICIES: TASK STATUS HISTORY
-- ============================================================

drop policy if exists "task_status_history_select_member" on public.task_status_history;
create policy "task_status_history_select_member"
on public.task_status_history for select
to authenticated
using (
  exists (
    select 1 from public.tasks t
    where t.id = task_status_history.task_id
      and public.is_group_member(t.group_id, auth.uid())
  )
);

-- ============================================================
-- STORAGE BUCKETS (PRIVATE)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('progress-files', 'progress-files', false)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do update set public = excluded.public;

-- ============================================================
-- STORAGE POLICIES: PROGRESS FILES (private, member-only)
-- ============================================================

drop policy if exists "progress_files_storage_select_member" on storage.objects;
create policy "progress_files_storage_select_member"
on storage.objects for select
to authenticated
using (
  bucket_id = 'progress-files'
  and exists (
    select 1
    from public.tasks t
    where t.id::text = (storage.foldername(name))[1]
      and public.is_group_member(t.group_id, auth.uid())
  )
);

drop policy if exists "progress_files_storage_insert_authenticated" on storage.objects;
create policy "progress_files_storage_insert_authenticated"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'progress-files'
  and exists (
    select 1
    from public.tasks t
    where t.id::text = (storage.foldername(name))[1]
      and public.is_group_member(t.group_id, auth.uid())
  )
);

drop policy if exists "progress_files_storage_update_owner" on storage.objects;
create policy "progress_files_storage_update_owner"
on storage.objects for update
to authenticated
using (bucket_id = 'progress-files' and owner = auth.uid())
with check (bucket_id = 'progress-files' and owner = auth.uid());

drop policy if exists "progress_files_storage_delete_owner" on storage.objects;
create policy "progress_files_storage_delete_owner"
on storage.objects for delete
to authenticated
using (bucket_id = 'progress-files' and owner = auth.uid());

-- ============================================================
-- STORAGE POLICIES: AVATARS (private, self or groupmate)
-- ============================================================

drop policy if exists "avatars_storage_select_member" on storage.objects;
create policy "avatars_storage_select_member"
on storage.objects for select
to authenticated
using (
  bucket_id = 'avatars'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (
      select 1
      from public.group_members mine
      join public.group_members theirs
        on theirs.group_id = mine.group_id
      where mine.user_id = auth.uid()
        and theirs.user_id::text = (storage.foldername(name))[1]
    )
  )
);

drop policy if exists "avatars_storage_insert_authenticated" on storage.objects;
create policy "avatars_storage_insert_authenticated"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatars_storage_update_owner" on storage.objects;
create policy "avatars_storage_update_owner"
on storage.objects for update
to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_storage_delete_owner" on storage.objects;
create policy "avatars_storage_delete_owner"
on storage.objects for delete
to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- SELESAI
-- ============================================================
