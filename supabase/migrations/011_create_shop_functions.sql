-- ============================================================================
-- Migration: 011_create_shop_functions.sql
-- Description: Create all missing shop RPC functions
-- Date: 2025-11-01
-- Phase: Phase 4.2 - Coin Shop (Functions Fix)
-- ============================================================================

-- Drop existing functions if they exist (to allow recreation)
DROP FUNCTION IF EXISTS get_user_inventory(UUID);
DROP FUNCTION IF EXISTS get_shop_items(UUID);
DROP FUNCTION IF EXISTS purchase_shop_item(UUID, UUID);
DROP FUNCTION IF EXISTS equip_title(UUID, UUID);
DROP FUNCTION IF EXISTS equip_badges(UUID, UUID[]);

-- ============================================================================
-- Function: get_user_inventory
-- Returns all items owned by a user with equipped status
-- ============================================================================

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

-- ============================================================================
-- Function: get_shop_items
-- Returns all active shop items with ownership status
-- ============================================================================

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

-- ============================================================================
-- Function: purchase_shop_item
-- Atomically purchases an item
-- ============================================================================

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
  -- Get item price
  SELECT price, name INTO v_item_price, v_item_name
  FROM shop_items
  WHERE id = p_item_id AND is_active = true;
  
  IF v_item_price IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item not found');
  END IF;
  
  -- Check if already owned
  SELECT EXISTS(
    SELECT 1 FROM user_inventory
    WHERE user_id = p_user_id AND item_id = p_item_id
  ) INTO v_already_owned;
  
  IF v_already_owned THEN
    RETURN jsonb_build_object('success', false, 'error', 'You already own this item');
  END IF;
  
  -- Get user coins
  SELECT total_coins INTO v_user_coins
  FROM profiles
  WHERE id = p_user_id;
  
  IF v_user_coins < v_item_price THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient coins');
  END IF;
  
  -- Deduct coins
  UPDATE profiles
  SET total_coins = total_coins - v_item_price
  WHERE id = p_user_id
  RETURNING total_coins INTO v_new_balance;
  
  -- Add to inventory
  INSERT INTO user_inventory (user_id, item_id)
  VALUES (p_user_id, p_item_id);
  
  RETURN jsonb_build_object(
    'success', true,
    'item_id', p_item_id,
    'item_name', v_item_name,
    'price_paid', v_item_price,
    'new_balance', v_new_balance
  );
END;
$$;

-- ============================================================================
-- Function: equip_title
-- Equips a title for a user
-- ============================================================================

CREATE OR REPLACE FUNCTION equip_title(
  p_user_id UUID,
  p_title_id UUID
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
  IF p_title_id IS NULL THEN
    UPDATE profiles SET active_title_id = NULL WHERE id = p_user_id;
    RETURN jsonb_build_object('success', true, 'equipped_title', NULL);
  END IF;
  
  -- Check ownership
  SELECT EXISTS(
    SELECT 1 FROM user_inventory ui
    JOIN shop_items si ON ui.item_id = si.id
    WHERE ui.user_id = p_user_id AND ui.item_id = p_title_id AND si.type = 'title'
  ) INTO v_owns_item;
  
  IF NOT v_owns_item THEN
    RETURN jsonb_build_object('success', false, 'error', 'You do not own this title');
  END IF;
  
  SELECT name INTO v_title_name FROM shop_items WHERE id = p_title_id;
  
  UPDATE profiles SET active_title_id = p_title_id WHERE id = p_user_id;
  
  RETURN jsonb_build_object('success', true, 'equipped_title', p_title_id, 'title_name', v_title_name);
END;
$$;

-- ============================================================================
-- Function: equip_badges
-- Equips up to 6 badges
-- ============================================================================

CREATE OR REPLACE FUNCTION equip_badges(
  p_user_id UUID,
  p_badge_ids UUID[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owned_badges UUID[];
  v_badge_count INTEGER;
BEGIN
  v_badge_count := COALESCE(array_length(p_badge_ids, 1), 0);
  
  IF v_badge_count > 6 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Maximum 6 badges');
  END IF;
  
  IF v_badge_count = 0 THEN
    UPDATE profiles SET equipped_badges = '[]'::jsonb WHERE id = p_user_id;
    RETURN jsonb_build_object('success', true, 'equipped_badges', '[]'::jsonb);
  END IF;
  
  -- Get owned badges
  SELECT array_agg(ui.item_id)
  INTO v_owned_badges
  FROM user_inventory ui
  JOIN shop_items si ON ui.item_id = si.id
  WHERE ui.user_id = p_user_id AND si.type = 'badge';
  
  -- Check all are owned
  IF NOT (p_badge_ids <@ v_owned_badges) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Some badges are not owned');
  END IF;
  
  UPDATE profiles SET equipped_badges = to_jsonb(p_badge_ids) WHERE id = p_user_id;
  
  RETURN jsonb_build_object('success', true, 'equipped_badges', to_jsonb(p_badge_ids), 'count', v_badge_count);
END;
$$;

-- ============================================================================
-- Grant permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION get_user_inventory TO authenticated;
GRANT EXECUTE ON FUNCTION get_shop_items TO authenticated;
GRANT EXECUTE ON FUNCTION purchase_shop_item TO authenticated;
GRANT EXECUTE ON FUNCTION equip_title TO authenticated;
GRANT EXECUTE ON FUNCTION equip_badges TO authenticated;

-- ============================================================================
-- Verification
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ All shop functions created successfully!';
  RAISE NOTICE '  - get_user_inventory';
  RAISE NOTICE '  - get_shop_items';
  RAISE NOTICE '  - purchase_shop_item';
  RAISE NOTICE '  - equip_title';
  RAISE NOTICE '  - equip_badges';
END $$;
