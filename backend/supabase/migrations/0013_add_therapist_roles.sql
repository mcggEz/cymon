-- 0013_add_therapist_roles.sql
-- Adds occupational_therapist and speech_therapist to the user_role enum so
-- reports can be routed to them and they can have accounts. Kept in its own
-- migration (per the convention in README) because new enum values must commit
-- before any code/migration references them.

alter type user_role add value if not exists 'occupational_therapist';
alter type user_role add value if not exists 'speech_therapist';
