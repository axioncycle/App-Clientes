-- Pipeline stages column on customers
alter table customers add column if not exists pipeline_stage text not null default 'primeiro_contato';
-- pipeline_stage values: 'primeiro_contato' | 'negociando' | 'proposta_enviada' | 'fechado' | 'perdido'

-- Tags table
create table if not exists tags (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  color text not null default '#1a8cff',
  created_at timestamptz default now()
);

-- Customer tags junction
create table if not exists customer_tags (
  customer_id uuid references customers(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (customer_id, tag_id)
);

alter table customer_tags disable row level security;
alter table tags disable row level security;
