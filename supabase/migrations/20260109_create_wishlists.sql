-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  name TEXT DEFAULT 'My Wishlist',
  is_default BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_default_wishlist UNIQUE(user_id, is_default) DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- Create wishlist_items table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_wishlist_variant UNIQUE(wishlist_id, variant_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_session_id ON wishlists(session_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist_id ON wishlist_items(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id ON wishlist_items(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_variant_id ON wishlist_items(variant_id);

-- Enable RLS
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wishlists
-- Users can view their own wishlists or wishlists with their session_id
CREATE POLICY "Users can view own wishlists"
  ON wishlists FOR SELECT
  USING (
    auth.uid() = user_id 
    OR session_id = current_setting('app.session_id', true)
  );

-- Users can insert their own wishlists
CREATE POLICY "Users can insert own wishlists"
  ON wishlists FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    OR (auth.uid() IS NULL AND session_id IS NOT NULL)
  );

-- Users can update their own wishlists
CREATE POLICY "Users can update own wishlists"
  ON wishlists FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR session_id = current_setting('app.session_id', true)
  );

-- Users can delete their own wishlists
CREATE POLICY "Users can delete own wishlists"
  ON wishlists FOR DELETE
  USING (
    auth.uid() = user_id 
    OR session_id = current_setting('app.session_id', true)
  );

-- RLS Policies for wishlist_items
-- Users can view items in their wishlists
CREATE POLICY "Users can view own wishlist items"
  ON wishlist_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND (
        wishlists.user_id = auth.uid()
        OR wishlists.session_id = current_setting('app.session_id', true)
      )
    )
  );

-- Users can insert items into their wishlists
CREATE POLICY "Users can insert own wishlist items"
  ON wishlist_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND (
        wishlists.user_id = auth.uid()
        OR wishlists.session_id = current_setting('app.session_id', true)
      )
    )
  );

-- Users can update items in their wishlists
CREATE POLICY "Users can update own wishlist items"
  ON wishlist_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND (
        wishlists.user_id = auth.uid()
        OR wishlists.session_id = current_setting('app.session_id', true)
      )
    )
  );

-- Users can delete items from their wishlists
CREATE POLICY "Users can delete own wishlist items"
  ON wishlist_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND (
        wishlists.user_id = auth.uid()
        OR wishlists.session_id = current_setting('app.session_id', true)
      )
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_wishlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_wishlists_updated_at
  BEFORE UPDATE ON wishlists
  FOR EACH ROW
  EXECUTE FUNCTION update_wishlist_updated_at();
