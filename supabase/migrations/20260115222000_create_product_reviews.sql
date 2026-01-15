-- Create review status enum
do $$ 
begin
    if not exists (select 1 from pg_type where typname = 'review_status') then
        create type public.review_status as enum ('pending', 'approved', 'rejected');
    end if;
end $$;

-- Create product_reviews table
create table if not exists public.product_reviews (
    id uuid not null default gen_random_uuid(),
    product_id text not null,
    clerk_user_id text,
    rating integer not null check (rating >= 1 and rating <= 5),
    reviewer_name text not null,
    comment text not null,
    verified_purchase boolean default false,
    helpful_count integer default 0,
    images text[] default array[]::text[],
    status public.review_status default 'pending'::public.review_status,
    created_at timestamp with time zone not null default timezone('utc'::text, now()),
    constraint product_reviews_pkey primary key (id)
);

-- Enable RLS
alter table public.product_reviews enable row level security;

-- Policies
create policy "Public can read approved reviews"
    on public.product_reviews for select
    using (status = 'approved');

-- Allow inserts (validated by server action, but needed for adminClient or auth user)
-- If using adminClient, RLS is bypassed, so this is for potential direct user inserts if architecture changes.
create policy "Authenticated can insert reviews"
    on public.product_reviews for insert
    with check (true);

-- Indexes
create index if not exists product_reviews_product_id_idx on public.product_reviews (product_id);
create index if not exists product_reviews_clerk_user_id_idx on public.product_reviews (clerk_user_id);
