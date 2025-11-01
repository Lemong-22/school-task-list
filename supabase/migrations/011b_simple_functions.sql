-- ============================================================================
-- Simple version: Just create the get_user_inventory function
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
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    si.id,
    si.name,
    si.description,
    si.type,
    si.rarity,
    si.icon_url,
    si.price,
    ui.purchased_at,
    false as is_equipped
  FROM user_inventory ui
  JOIN shop_items si ON ui.item_id = si.id
  WHERE ui.user_id = p_user_id
  ORDER BY si.type, si.rarity DESC, si.name;
$$;

GRANT EXECUTE ON FUNCTION get_user_inventory TO authenticated;

-- Test it
SELECT 'Function created!' as status;
