-- Shared OFFER HUB offer -> Sub Rosa round registry.
-- Run once in the Supabase SQL editor. Safe to run again.
-- This table stores round coordinates and on-chain evidence only; proposal
-- plaintext is never persisted here.

create table if not exists public.sub_rosa_rounds (
  offer_id text primary key check (char_length(offer_id) between 1 and 200),
  round_id text not null check (round_id ~ '^[0-9]+$'),
  reveal_round bigint not null check (reveal_round > 0),
  commit_deadline bigint not null check (commit_deadline > 0),
  reveal_deadline bigint not null check (reveal_deadline > commit_deadline),
  auditor_pubkey_hex text not null check (auditor_pubkey_hex ~ '^[0-9a-fA-F]+$'),
  contract_id text not null check (contract_id like 'C%' and char_length(contract_id) = 56),
  network text not null check (network in ('testnet', 'mainnet')),
  create_tx_hash text check (
    create_tx_hash is null or create_tx_hash ~ '^[0-9a-fA-F]+$'
  ),
  created_at timestamptz not null default now()
);

alter table public.sub_rosa_rounds enable row level security;

drop policy if exists sub_rosa_rounds_public_read on public.sub_rosa_rounds;
create policy sub_rosa_rounds_public_read
  on public.sub_rosa_rounds
  for select
  to anon, authenticated
  using (true);

drop policy if exists sub_rosa_rounds_insert_once on public.sub_rosa_rounds;
create policy sub_rosa_rounds_insert_once
  on public.sub_rosa_rounds
  for insert
  to anon, authenticated
  with check (true);

revoke all on table public.sub_rosa_rounds from anon, authenticated;
grant select, insert on table public.sub_rosa_rounds to anon, authenticated;
