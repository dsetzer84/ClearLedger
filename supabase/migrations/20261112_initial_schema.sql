-- 1. Profiles (extends Supabase Auth users + stores Stripe Connect account ID)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  business_name text,
  stripe_account_id text,
  stripe_onboarding_complete boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Clients
create table public.clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  email text not null,
  company text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Invoices (share_token powers the public shared invoice link)
create table public.invoices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete restrict not null,
  invoice_number text not null,
  status text check (status in ('draft', 'sent', 'paid', 'overdue')) default 'draft' not null,
  due_date date not null,
  notes text,
  share_token uuid default gen_random_uuid() unique not null,
  stripe_payment_intent_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Invoice Line Items
create table public.invoice_items (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  description text not null,
  quantity numeric(10,2) default 1 not null,
  unit_price numeric(10,2) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;

-- Policies: Users can only manage their own data
create policy "Users manage own profile" on public.profiles
  for all using (auth.uid() = id);

create policy "Users manage own clients" on public.clients
  for all using (auth.uid() = user_id);

create policy "Users manage own invoices" on public.invoices
  for all using (auth.uid() = user_id);

create policy "Users manage own invoice items" on public.invoice_items
  for all using (
    exists (
      select 1 from public.invoices
      where invoices.id = invoice_items.invoice_id
      and invoices.user_id = auth.uid()
    )
  );

-- Automatically create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$ begin insert into public.profiles (id, email) values (new.id, new.email); return new; end; $$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
