-- Phase 8: body records also carry the client idempotency key used by offline retries.
alter table body_measurements add column if not exists client_idempotency_key text;
create unique index if not exists idx_body_measurements_client_key on body_measurements(client_idempotency_key) where client_idempotency_key is not null;
