-- Migration: Refactor User Lists System

-- 1. Cleanup old system collections
DELETE FROM collections 
WHERE slug IN (
  'favorites', 
  'recently-viewed', 
  'new-arrivals', 
  'recommended', 
  'trending', 
  'top-applications'
);

-- 2. Create user_favourites table
CREATE TABLE IF NOT EXISTS user_favourites (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

-- Enable RLS
ALTER TABLE user_favourites ENABLE ROW LEVEL SECURITY;

-- Policies for user_favourites
CREATE POLICY "Users can view own favourites" 
  ON user_favourites FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favourites" 
  ON user_favourites FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favourites" 
  ON user_favourites FOR DELETE 
  USING (auth.uid() = user_id);

-- 3. Create recently_viewed table
CREATE TABLE IF NOT EXISTS recently_viewed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_product_recent UNIQUE (user_id, product_id)
);

-- Enable RLS
ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;

-- Policies for recently_viewed
CREATE POLICY "Users can view own history" 
  ON recently_viewed FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update own history" 
  ON recently_viewed FOR INSERT 
  WITH CHECK (auth.uid() = user_id)
  -- Note: UPDATE policy not strictly needed if we use INSERT ON CONFLICT DO UPDATE
;

CREATE POLICY "Users can update own history"
  ON recently_viewed FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_recently_viewed_user_date ON recently_viewed (user_id, viewed_at DESC);
