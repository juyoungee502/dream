create extension if not exists "pgcrypto";

create table if not exists mokjangs (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into mokjangs (name, sort_order) values
('신실 목장', 1),
('은수 목장', 2),
('은택 목장', 3),
('예은 목장', 4),
('석민 목장', 5),
('태양 목장', 6),
('주람 목장', 7),
('희현 목장', 8),
('찬호 목장', 9),
('은서 목장', 10),
('예서 목장', 11),
('민경 목장', 12),
('새가족 목장', 13)
on conflict (name) do update set
  sort_order = excluded.sort_order,
  is_active = true;

update mokjangs
set is_active = false
where name not in (
  '신실 목장',
  '은수 목장',
  '은택 목장',
  '예은 목장',
  '석민 목장',
  '태양 목장',
  '주람 목장',
  '희현 목장',
  '찬호 목장',
  '은서 목장',
  '예서 목장',
  '민경 목장',
  '새가족 목장'
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  started_at timestamptz,
  confirmed_at timestamptz,
  constraint events_status_check
    check (status in ('ready', 'open', 'matching', 'confirmed', 'closed'))
);

create table if not exists people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text not null,
  mokjang_id uuid not null references mokjangs(id),
  created_at timestamptz not null default now(),
  constraint unique_person_per_mokjang unique (normalized_name, mokjang_id)
);

create table if not exists attendances (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  person_id uuid not null references people(id),
  avatar_id integer,
  checked_in_at timestamptz not null default now(),
  constraint attendances_avatar_id_range check (avatar_id between 1 and 16),
  constraint unique_attendance_per_event unique (event_id, person_id)
);

create table if not exists separation_rules (
  id uuid primary key default gen_random_uuid(),
  person_a_id uuid not null references people(id),
  person_b_id uuid not null references people(id),
  created_at timestamptz not null default now(),
  constraint no_same_person_rule check (person_a_id <> person_b_id)
);

create unique index if not exists unique_separation_rule_pair
on separation_rules (
  least(person_a_id, person_b_id),
  greatest(person_a_id, person_b_id)
);

create table if not exists small_groups (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  group_number int not null,
  is_confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  constraint unique_group_number_per_event unique (event_id, group_number)
);

create table if not exists small_group_members (
  id uuid primary key default gen_random_uuid(),
  small_group_id uuid not null references small_groups(id) on delete cascade,
  person_id uuid not null references people(id),
  created_at timestamptz not null default now(),
  constraint unique_member_per_small_group unique (small_group_id, person_id)
);

create index if not exists idx_attendances_event_id on attendances(event_id);
create index if not exists idx_attendances_person_id on attendances(person_id);
create index if not exists idx_people_normalized_name_mokjang on people(normalized_name, mokjang_id);
create index if not exists idx_small_groups_event_id on small_groups(event_id);
create index if not exists idx_small_group_members_person_id on small_group_members(person_id);
create index if not exists idx_small_group_members_group_id on small_group_members(small_group_id);
create index if not exists idx_separation_rules_person_a on separation_rules(person_a_id);
create index if not exists idx_separation_rules_person_b on separation_rules(person_b_id);

insert into events (title, event_date, status)
select '오늘의 산모임', current_date, 'open'
where not exists (
  select 1
  from events
  where event_date = current_date
    and status in ('ready', 'open', 'matching', 'confirmed')
);
