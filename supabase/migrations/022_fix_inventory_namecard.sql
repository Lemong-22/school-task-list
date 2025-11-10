-- Migration: Fix get_user_inventory to Include Namecard is_equipped Status
-- Phase 10: Make namecard show as equipped in inventory

BEGIN;

DROP FUNCTION IF EXISTS get_user_inventory(UUID);

CREATE OR REPLACE FUNCTION get_user_inventory(p_user_id UUID)
RETURNS TABLE (
  item_id UUID,
  item_name TEXT,
  item_description TEXT,
  item_type TEXT,
  item_rarity TEXT,
  item_icon_url TEXT,
  item_price INTEGER,
  purchased_at TIMESTAMPTZ,
  is_equipped BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_active_title_id UUID;
  v_active_namecard_id UUID;
  v_equipped_badges JSONB;
BEGIN
  -- Get user's currently equipped items (INCLUDING NAMECARD!)
  SELECT p.active_title_id, p.active_namecard_id, p.equipped_badges
  INTO v_active_title_id, v_active_namecard_id, v_equipped_badges
  FROM profiles p
  WHERE p.id = p_user_id;
  
  RETURN QUERY
  SELECT 
    si.id AS item_id,
    si.name AS item_name,
    si.description AS item_description,
    si.type AS item_type,
    si.rarity AS item_rarity,
    si.icon_url AS item_icon_url,
    si.price AS item_price,
    ui.purchased_at,
    CASE
      WHEN si.type = 'title' THEN si.id = v_active_title_id
      WHEN si.type = 'namecard' THEN si.id = v_active_namecard_id
      WHEN si.type = 'badge' THEN v_equipped_badges @> to_jsonb(si.id::text)
      ELSE false
    END AS is_equipped
  FROM user_inventory ui
  JOIN shop_items si ON ui.item_id = si.id
  WHERE ui.user_id = p_user_id
  ORDER BY 
    CASE si.type 
      WHEN 'title' THEN 1 
      WHEN 'namecard' THEN 2
      WHEN 'badge' THEN 3 
    END,
    si.rarity DESC,
    si.name;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_inventory TO authenticated;

COMMIT;
