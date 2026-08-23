alter table public.attendances
  add column if not exists avatar_id integer;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'attendances_avatar_id_range'
      and conrelid = 'public.attendances'::regclass
  ) then
    alter table public.attendances
      add constraint attendances_avatar_id_range
      check (avatar_id between 1 and 17);
  end if;
end $$;
