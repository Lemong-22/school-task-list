-- ============================================================================
-- Migration: 007_coin_shop.sql
-- Description: Add Coin Shop system with purchasable cosmetic items
-- Date: 2025-11-01
-- Phase: Phase 4.2 - Coin Shop
-- ============================================================================

-- ============================================================================
-- SECTION 1: Create New Tables
-- ============================================================================

-- Table: shop_items
-- Master catalog of all purchasable cosmetic items (titles and badges)
CREATE TABLE shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('title', 'badge')),
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic')),
  price INTEGER NOT NULL CHECK (price > 0),
  icon_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for shop_items
CREATE INDEX idx_shop_items_type ON shop_items(type);
CREATE INDEX idx_shop_items_rarity ON shop_items(rarity);
CREATE INDEX idx_shop_items_active ON shop_items(is_active) WHERE is_active = true;
CREATE INDEX idx_shop_items_display_order ON shop_items(display_order);

-- Comments for shop_items
COMMENT ON TABLE shop_items IS 'Master catalog of all purchasable cosmetic items (titles and badges)';
COMMENT ON COLUMN shop_items.type IS 'Item type: title (text decoration) or badge (visual icon)';
COMMENT ON COLUMN shop_items.rarity IS 'Item rarity tier: common (50 coins), rare (150 coins), epic (500 coins)';
COMMENT ON COLUMN shop_items.price IS 'Purchase price in coins';
COMMENT ON COLUMN shop_items.icon_url IS 'URL/path to badge icon asset (NULL for titles)';
COMMENT ON COLUMN shop_items.display_order IS 'Order for displaying items in shop (lower = first)';
COMMENT ON COLUMN shop_items.is_active IS 'Admin flag to hide items from shop without deletion';

-- Table: user_inventory
-- Tracks which items each user owns
CREATE TABLE user_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES shop_items(id) ON DELETE RESTRICT,
  purchased_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Prevent duplicate ownership
  UNIQUE(user_id, item_id)
);

-- Indexes for user_inventory
CREATE INDEX idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX idx_user_inventory_item_id ON user_inventory(item_id);
CREATE INDEX idx_user_inventory_user_item ON user_inventory(user_id, item_id);

-- Comments for user_inventory
COMMENT ON TABLE user_inventory IS 'Tracks item ownership per user (prevents duplicate purchases)';
COMMENT ON COLUMN user_inventory.user_id IS 'User who owns this item';
COMMENT ON COLUMN user_inventory.item_id IS 'Item owned by the user';
COMMENT ON COLUMN user_inventory.purchased_at IS 'Timestamp when item was purchased';

-- ============================================================================
-- SECTION 2: Modify Existing Tables
-- ============================================================================

-- Add columns to profiles for equipped items
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS active_title_id UUID REFERENCES shop_items(id) ON DELETE SET NULL;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS equipped_badges JSONB DEFAULT '[]'::jsonb NOT NULL;

-- Add constraint to limit equipped_badges to max 6 items
ALTER TABLE profiles
ADD CONSTRAINT check_equipped_badges_max_6 
CHECK (jsonb_array_length(equipped_badges) <= 6);

-- Indexes for new profile columns
CREATE INDEX idx_profiles_active_title ON profiles(active_title_id);
CREATE INDEX idx_profiles_equipped_badges ON profiles USING GIN(equipped_badges);

-- Comments for new profile columns
COMMENT ON COLUMN profiles.active_title_id IS 'Currently equipped title (max 1). NULL if no title equipped.';
COMMENT ON COLUMN profiles.equipped_badges IS 'JSONB array of up to 6 equipped badge item IDs in display order.';

-- ============================================================================
-- SECTION 3: Database Functions
-- ============================================================================

-- Function 1: purchase_shop_item
-- Atomically purchases an item: validates, deducts coins, adds to inventory
CREATE OR REPLACE FUNCTION purchase_shop_item(
  p_user_id UUID,
  p_item_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item_price INTEGER;
  v_user_coins INTEGER;
  v_already_owned BOOLEAN;
  v_new_balance INTEGER;
  v_item_name TEXT;
BEGIN
  -- 1. Get item price and validate item exists and is active
  SELECT price, name INTO v_item_price, v_item_name
  FROM shop_items
  WHERE id = p_item_id AND is_active = true;
  
  IF v_item_price IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Item not found or not available'
    );
  END IF;
  
  -- 2. Check if user already owns this item
  SELECT EXISTS(
    SELECT 1 FROM user_inventory
    WHERE user_id = p_user_id AND item_id = p_item_id
  ) INTO v_already_owned;
  
  IF v_already_owned THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'You already own this item'
    );
  END IF;
  
  -- 3. Get user's current coin balance
  SELECT total_coins INTO v_user_coins
  FROM profiles
  WHERE id = p_user_id;
  
  IF v_user_coins IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User profile not found'
    );
  END IF;
  
  -- 4. Check if user has enough coins
  IF v_user_coins < v_item_price THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient coins',
      'required', v_item_price,
      'current', v_user_coins,
      'missing', v_item_price - v_user_coins
    );
  END IF;
  
  -- 5. Perform atomic transaction: deduct coins AND add to inventory
  -- Deduct coins
  UPDATE profiles
  SET total_coins = total_coins - v_item_price
  WHERE id = p_user_id
  RETURNING total_coins INTO v_new_balance;
  
  -- Add to inventory
  INSERT INTO user_inventory (user_id, item_id)
  VALUES (p_user_id, p_item_id);
  
  -- 6. Return success with details
  RETURN jsonb_build_object(
    'success', true,
    'item_id', p_item_id,
    'item_name', v_item_name,
    'price_paid', v_item_price,
    'new_balance', v_new_balance
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Transaction failed: ' || SQLERRM
    );
END;
$$;

COMMENT ON FUNCTION purchase_shop_item IS 
'Atomically purchases an item: validates item/user, checks coins, deducts coins, adds to inventory. Returns success status and new balance.';

-- Function 2: equip_title
-- Equips a title for a user (or unequips if NULL)
CREATE OR REPLACE FUNCTION equip_title(
  p_user_id UUID,
  p_title_id UUID  -- NULL to unequip
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owns_item BOOLEAN;
  v_title_name TEXT;
BEGIN
  -- If unequipping (NULL), just update and return
  IF p_title_id IS NULL THEN
    UPDATE profiles
    SET active_title_id = NULL
    WHERE id = p_user_id;
    
    RETURN jsonb_build_object(
      'success', true, 
      'equipped_title', NULL,
      'message', 'Title unequipped'
    );
  END IF;
  
  -- Check if user owns this title and it's actually a title
  SELECT EXISTS(
    SELECT 1 FROM user_inventory ui
    JOIN shop_items si ON ui.item_id = si.id
    WHERE ui.user_id = p_user_id 
      AND ui.item_id = p_title_id
      AND si.type = 'title'
  ) INTO v_owns_item;
  
  IF NOT v_owns_item THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'You do not own this title or item is not a title'
    );
  END IF;
  
  -- Get title name for response
  SELECT name INTO v_title_name
  FROM shop_items
  WHERE id = p_title_id;
  
  -- Equip the title (automatically unequips previous one)
  UPDATE profiles
  SET active_title_id = p_title_id
  WHERE id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'equipped_title', p_title_id,
    'title_name', v_title_name,
    'message', 'Title equipped successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Failed to equip title: ' || SQLERRM
    );
END;
$$;

COMMENT ON FUNCTION equip_title IS 
'Equips a title for a user. Pass NULL to unequip. Validates ownership and item type.';

-- Function 3: equip_badges
-- Equips up to 6 badges for a user
CREATE OR REPLACE FUNCTION equip_badges(
  p_user_id UUID,
  p_badge_ids UUID[]  -- Array of up to 6 badge IDs
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owned_badges UUID[];
  v_invalid_badges UUID[];
  v_badge_count INTEGER;
BEGIN
  -- Get array length (handle NULL case)
  v_badge_count := COALESCE(array_length(p_badge_ids, 1), 0);
  
  -- Validate max 6 badges
  IF v_badge_count > 6 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Maximum 6 badges can be equipped',
      'attempted', v_badge_count
    );
  END IF;
  
  -- If empty array, just clear all equipped badges
  IF v_badge_count = 0 THEN
    UPDATE profiles
    SET equipped_badges = '[]'::jsonb
    WHERE id = p_user_id;
    
    RETURN jsonb_build_object(
      'success', true,
      'equipped_badges', '[]'::jsonb,
      'message', 'All badges unequipped'
    );
  END IF;
  
  -- Get all badge IDs the user owns
  SELECT array_agg(ui.item_id)
  INTO v_owned_badges
  FROM user_inventory ui
  JOIN shop_items si ON ui.item_id = si.id
  WHERE ui.user_id = p_user_id AND si.type = 'badge';
  
  -- If user owns no badges, can't equip any
  IF v_owned_badges IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'You do not own any badges'
    );
  END IF;
  
  -- Check if all requested badges are owned
  SELECT array_agg(badge_id)
  INTO v_invalid_badges
  FROM unnest(p_badge_ids) AS badge_id
  WHERE NOT (badge_id = ANY(v_owned_badges));
  
  IF v_invalid_badges IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Some badges are not owned or are not badge items',
      'invalid_badges', array_to_json(v_invalid_badges)
    );
  END IF;
  
  -- Update equipped badges (convert UUID[] to JSONB)
  UPDATE profiles
  SET equipped_badges = to_jsonb(p_badge_ids)
  WHERE id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'equipped_badges', to_jsonb(p_badge_ids),
    'count', v_badge_count,
    'message', 'Badges equipped successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Failed to equip badges: ' || SQLERRM
    );
END;
$$;

COMMENT ON FUNCTION equip_badges IS 
'Equips up to 6 badges for a user. Validates ownership and max count. Pass empty array to unequip all.';

-- Function 4: get_shop_items
-- Returns all active shop items with ownership status for the given user
CREATE OR REPLACE FUNCTION get_shop_items(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  type TEXT,
  rarity TEXT,
  price INTEGER,
  icon_url TEXT,
  display_order INTEGER,
  is_owned BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    si.id,
    si.name,
    si.description,
    si.type,
    si.rarity,
    si.price,
    si.icon_url,
    si.display_order,
    EXISTS(
      SELECT 1 FROM user_inventory ui
      WHERE ui.user_id = p_user_id AND ui.item_id = si.id
    ) AS is_owned
  FROM shop_items si
  WHERE si.is_active = true
  ORDER BY si.display_order, si.rarity DESC, si.price;
END;
$$;

COMMENT ON FUNCTION get_shop_items IS 
'Returns all active shop items with ownership status for the given user. Ordered by display_order, rarity, price.';

-- Function 5: get_user_inventory
-- Returns all items owned by a user with equipped status
CREATE OR REPLACE FUNCTION get_user_inventory(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  type TEXT,
  rarity TEXT,
  icon_url TEXT,
  price INTEGER,
  purchased_at TIMESTAMPTZ,
  is_equipped BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_active_title_id UUID;
  v_equipped_badges JSONB;
BEGIN
  -- Get user's currently equipped items
  SELECT active_title_id, equipped_badges
  INTO v_active_title_id, v_equipped_badges
  FROM profiles
  WHERE id = p_user_id;
  
  RETURN QUERY
  SELECT 
    si.id,
    si.name,
    si.description,
    si.type,
    si.rarity,
    si.icon_url,
    si.price,
    ui.purchased_at,
    CASE
      WHEN si.type = 'title' THEN si.id = v_active_title_id
      WHEN si.type = 'badge' THEN v_equipped_badges @> to_jsonb(si.id::text)
      ELSE false
    END AS is_equipped
  FROM user_inventory ui
  JOIN shop_items si ON ui.item_id = si.id
  WHERE ui.user_id = p_user_id
  ORDER BY 
    CASE si.type 
      WHEN 'title' THEN 1 
      WHEN 'badge' THEN 2 
    END,
    si.rarity DESC,
    si.name;
END;
$$;

COMMENT ON FUNCTION get_user_inventory IS 
'Returns all items owned by a user with equipped status. Ordered by type, rarity, name.';

-- ============================================================================
-- SECTION 4: Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on shop_items
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view active items
CREATE POLICY "shop_items_select_active"
ON shop_items FOR SELECT
TO authenticated
USING (is_active = true);

-- Policy: Service role can do everything (for admin operations)
CREATE POLICY "shop_items_service_role_all"
ON shop_items FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Enable RLS on user_inventory
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own inventory
CREATE POLICY "user_inventory_select_own"
ON user_inventory FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: Users can view other users' inventory (for public profiles)
CREATE POLICY "user_inventory_select_all"
ON user_inventory FOR SELECT
TO authenticated
USING (true);

-- Policy: Service role can do everything (admin operations)
CREATE POLICY "user_inventory_service_role_all"
ON user_inventory FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Note: No INSERT/UPDATE/DELETE policies for regular users
-- All modifications go through SECURITY DEFINER functions

-- ============================================================================
-- SECTION 5: Grant Permissions
-- ============================================================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION purchase_shop_item TO authenticated;
GRANT EXECUTE ON FUNCTION equip_title TO authenticated;
GRANT EXECUTE ON FUNCTION equip_badges TO authenticated;
GRANT EXECUTE ON FUNCTION get_shop_items TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_inventory TO authenticated;

-- ============================================================================
-- SECTION 6: Verification
-- ============================================================================

DO $$
DECLARE
  v_error_msg TEXT := '';
BEGIN
  -- Check if shop_items table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'shop_items'
  ) THEN
    v_error_msg := v_error_msg || 'Table shop_items was not created; ';
  END IF;
  
  -- Check if user_inventory table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'user_inventory'
  ) THEN
    v_error_msg := v_error_msg || 'Table user_inventory was not created; ';
  END IF;
  
  -- Check if active_title_id column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'active_title_id'
  ) THEN
    v_error_msg := v_error_msg || 'Column profiles.active_title_id was not created; ';
  END IF;
  
  -- Check if equipped_badges column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'equipped_badges'
  ) THEN
    v_error_msg := v_error_msg || 'Column profiles.equipped_badges was not created; ';
  END IF;
  
  -- Check if functions exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'purchase_shop_item'
  ) THEN
    v_error_msg := v_error_msg || 'Function purchase_shop_item was not created; ';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'equip_title'
  ) THEN
    v_error_msg := v_error_msg || 'Function equip_title was not created; ';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'equip_badges'
  ) THEN
    v_error_msg := v_error_msg || 'Function equip_badges was not created; ';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'get_shop_items'
  ) THEN
    v_error_msg := v_error_msg || 'Function get_shop_items was not created; ';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'get_user_inventory'
  ) THEN
    v_error_msg := v_error_msg || 'Function get_user_inventory was not created; ';
  END IF;
  
  -- Raise exception if any errors
  IF v_error_msg != '' THEN
    RAISE EXCEPTION 'Migration verification failed: %', v_error_msg;
  END IF;
  
  RAISE NOTICE '✅ Migration 007_coin_shop.sql completed successfully';
  RAISE NOTICE 'Created tables: shop_items, user_inventory';
  RAISE NOTICE 'Modified table: profiles (added active_title_id, equipped_badges)';
  RAISE NOTICE 'Created functions: purchase_shop_item, equip_title, equip_badges, get_shop_items, get_user_inventory';
  RAISE NOTICE 'Enabled RLS policies for shop_items and user_inventory';
END $$;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
