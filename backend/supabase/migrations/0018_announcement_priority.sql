-- 0018_announcement_priority.sql
-- Adds a priority label to announcements (separate from `type`, which is the
-- category). Priority drives the badge shown to recipients. Additive and safe:
-- existing rows default to 'normal'.

alter table public.announcements
  add column if not exists priority text not null default 'normal'
    check (priority in ('normal', 'important', 'urgent'));
