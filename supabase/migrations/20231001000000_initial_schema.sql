-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Users Table with Role Management
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  full_name text,
  phone text,
  address text,
  city text,
  zip_code text,
  role text not null default 'customer' check (role in ('customer', 'guest-buyer', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone
);

-- Products Table
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  image text not null,
  category text not null check (category in ('jersey', 'cleats', 'accessories')),
  featured boolean not null default false,
  stock integer not null default 0 check (stock >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone
);

-- Orders Table
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete set null,
  payment_id text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'shipped', 'cancelled')),
  total numeric(10, 2) not null check (total >= 0),
  items jsonb not null,
  customer_details jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone
);

-- Payments Table
create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  payment_id text not null,
  amount numeric(10, 2) not null check (amount >= 0),
  currency text not null default 'GEL',
  method text not null check (method in ('bog', 'tbc', 'apple', 'google', 'stripe')),
  status text not null check (status in ('pending', 'success', 'failed')),
  destination text, -- Stores IBAN or payment destination
  error text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Reviews Table
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete set null,
  product_id uuid references products(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone
);

-- Contact Messages Table
create table if not exists contact_messages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  message text not null,
  status text not null default 'unread' check (status in ('unread', 'read', 'replied')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for better performance
create index if not exists idx_products_category on products(category);
create index if not exists idx_orders_user_id on orders(user_id);
create index if not exists idx_payments_order_id on payments(order_id);
create index if not exists idx_reviews_product_id on reviews(product_id);
create index if not exists idx_contact_messages_status on contact_messages(status);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table payments enable row level security;
alter table reviews enable row level security;
alter table contact_messages enable row level security;

-- Security Policies
-- Profiles
create policy "Users can view their own profile"
on profiles for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on profiles for update
using (auth.uid() = id)
with check (
  -- Prevent role changes
  role = (select role from profiles where id = auth.uid())
);

create policy "Admin can view all profiles"
on profiles for select
using (exists (
  select 1 from profiles
  where profiles.id = auth.uid() and profiles.role = 'admin'
));

-- Products
create policy "Public read access"
on products for select
using (true);

create policy "Admin full access"
on products for all
using (exists (
  select 1 from profiles
  where profiles.id = auth.uid() and profiles.role = 'admin'
));

-- Orders
create policy "Users can manage their own orders"
on orders for all
using (user_id = auth.uid());

create policy "Admin can manage all orders"
on orders for all
using (exists (
  select 1 from profiles
  where profiles.id = auth.uid() and profiles.role = 'admin'
));

-- Payments
create policy "Users can view their own payments"
on payments for select
using (exists (
  select 1 from orders
  where orders.id = payments.order_id and orders.user_id = auth.uid()
));

create policy "Admin can view all payments"
on payments for select
using (exists (
  select 1 from profiles
  where profiles.id = auth.uid() and profiles.role = 'admin'
));

-- Reviews
create policy "Users can manage their own reviews"
on reviews for all
using (user_id = auth.uid());

create policy "Public read access"
on reviews for select
using (true);

-- Contact Messages
create policy "Admin can manage contact messages"
on contact_messages for all
using (exists (
  select 1 from profiles
  where profiles.id = auth.uid() and profiles.role = 'admin'
));

-- Set up storage for product images
insert into storage.buckets (id, name)
values ('product-images', 'product-images')
on conflict do nothing;

create policy "Public read access for product images"
on storage.objects for select
using (bucket_id = 'product-images');

create policy "Admin write access for product images"
on storage.objects for insert
with check (
  bucket_id = 'product-images' and exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- Function to prevent role changes
create or replace function prevent_role_change()
returns trigger as $$
begin
  if old.role is distinct from new.role then
    raise exception 'Role changes are not allowed' using errcode = 'P0001';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger prevent_role_change_trigger
before update on profiles
for each row
execute function prevent_role_change();

-- Function to enforce admin-only role assignment
create or replace function enforce_admin_role_assignment()
returns trigger as $$
begin
  if new.role = 'admin' and not exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Only admins can assign admin role' using errcode = 'P0002';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger enforce_admin_role_assignment_trigger
before insert or update on profiles
for each row
execute function enforce_admin_role_assignment();

-- Function to update product stock after order
create or replace function update_product_stock()
returns trigger as $$
declare
  item record;
begin
  for item in select * from jsonb_array_elements(new.items) loop
    update products
    set stock = stock - (item->>'quantity')::int
    where id = (item->>'product_id')::uuid;
  end loop;
  return new;
end;
$$ language plpgsql;

create trigger update_product_stock_trigger
after insert on orders
for each row
execute function update_product_stock();

-- Function to validate IBAN
create or replace function validate_iban(iban text)
returns boolean as $$
begin
  return iban ~ '^GE\d{2}[A-Z]{2}\d{16}$';
end;
$$ language plpgsql;

-- Function to log payment errors
create or replace function log_payment_error()
returns trigger as $$
begin
  if new.status = 'failed' then
    insert into error_logs (type, message, details)
    values ('payment_error', new.error, jsonb_build_object(
      'payment_id', new.id,
      'order_id', new.order_id,
      'method', new.method
    ));
  end if;
  return new;
end;
$$ language plpgsql;

create trigger log_payment_error_trigger
after insert or update on payments
for each row
execute function log_payment_error();

-- Error Logs Table
create table if not exists error_logs (
  id uuid primary key default uuid_generate_v4(),
  type text not null,
  message text not null,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
