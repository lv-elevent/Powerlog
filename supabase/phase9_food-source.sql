-- Phase 9: preserve the origin of foods imported from an external nutrition source.
alter table food_library
  add column if not exists source text not null default 'custom';

alter table food_library
  add column if not exists source_id text;

update food_library
set source = 'custom'
where source is null;

alter table food_library
  drop constraint if exists food_library_source_check;

alter table food_library
  add constraint food_library_source_check
  check (source in ('custom', 'usda_fdc'));

create unique index if not exists idx_food_library_source_id
  on food_library(source, source_id)
  where source_id is not null;
