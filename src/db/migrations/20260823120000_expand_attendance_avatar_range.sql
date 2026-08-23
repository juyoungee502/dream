alter table public.attendances
  drop constraint if exists attendances_avatar_id_range;

alter table public.attendances
  add constraint attendances_avatar_id_range
  check (avatar_id between 1 and 17);
