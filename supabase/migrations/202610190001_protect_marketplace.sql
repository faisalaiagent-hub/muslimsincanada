-- Marketplace writes require the server's verified owner/moderator flow.
alter policy "public can submit" on public.submission
with check (coalesce(payload->>'channel','') !~ '^mic-marketplace');
create index if not exists submission_marketplace_state_created_idx
on public.submission ((payload->>'market_state'), created_at desc)
where payload->>'channel' = 'mic-marketplace-v1';
create index if not exists submission_marketplace_owner_created_idx
on public.submission ((payload->>'owner_id'), created_at desc)
where payload->>'channel' = 'mic-marketplace-v1';
create index if not exists submission_marketplace_reports_created_idx
on public.submission (created_at desc)
where payload->>'channel' = 'mic-marketplace-report';
