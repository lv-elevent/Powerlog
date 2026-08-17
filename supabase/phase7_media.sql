-- Phase 7: private media bucket. The application also idempotently ensures this bucket before upload.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('private-media', 'private-media', false, 10485760, array['image/*']::text[])
on conflict (id) do update set public = false, file_size_limit = 10485760, allowed_mime_types = array['image/*']::text[];
