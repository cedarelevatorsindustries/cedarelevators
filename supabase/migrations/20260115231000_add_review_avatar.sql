-- Add reviewer_avatar_url column to product_reviews table
alter table public.product_reviews
add column if not exists reviewer_avatar_url text;
