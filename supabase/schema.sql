-- Customer Management App - Bike Shop Schema

create extension if not exists "uuid-ossp";

-- Customers table
create table if not exists customers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text,
  email text,
  status text not null default 'interested', -- 'interested' | 'purchased'
  service_date date,
  purchase_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Customer SKUs table
create table if not exists customer_skus (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references customers(id) on delete cascade,
  sku text not null,
  description text,
  quantity integer default 1,
  type text not null default 'interest', -- 'interest' | 'purchased'
  unit_price numeric(10,2),
  created_at timestamptz default now()
);

-- Follow-ups table
create table if not exists follow_ups (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references customers(id) on delete cascade,
  contact_date date not null,
  notes text,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists customers_status_idx on customers(status);
create index if not exists customers_service_date_idx on customers(service_date);
create index if not exists customers_created_at_idx on customers(created_at desc);
create index if not exists customer_skus_customer_id_idx on customer_skus(customer_id);
create index if not exists customer_skus_sku_idx on customer_skus(sku);
create index if not exists follow_ups_customer_id_idx on follow_ups(customer_id);
create index if not exists follow_ups_contact_date_idx on follow_ups(contact_date desc);

-- Updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_customers_updated_at
  before update on customers
  for each row
  execute procedure update_updated_at_column();

-- RLS Policies (enable when auth is configured)
-- alter table customers enable row level security;
-- alter table customer_skus enable row level security;
-- alter table follow_ups enable row level security;
