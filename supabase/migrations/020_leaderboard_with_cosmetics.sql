-- Migration: Enhanced Leaderboard with Titles & Namecards
-- Phase 10: Show equipped titles and namecards in leaderboard
-- Creates RPC function that joins profile cosmetics

BEGIN;

-- ============================================================================
-- Enhanced Leaderboard Function with Cosmetics
-- ============================================================================

CREATE OR REPLACE FUNCTION get_leaderboard_with_cosmetics(p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  student_id UUID,
  student_name TEXT,
  total_coins INTEGER,
  rank BIGINT,
  active_title_name TEXT,
  active_namecard_name TEXT,
  namecard_rarity TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS student_id,
    p.full_name AS student_name,
    p.total_coins,
    RANK() OVER (ORDER BY p.total_coins DESC) AS rank,
    title_item.name AS active_title_name,
    namecard_item.name AS active_namecard_name,
    namecard_item.rarity AS namecard_rarity
  FROM profiles p
  LEFT JOIN shop_items title_item ON p.active_title_id = title_item.id
  LEFT JOIN shop_items namecard_item ON p.active_namecard_id = namecard_item.id
  WHERE p.role = 'student'
  ORDER BY p.total_coins DESC
  LIMIT p_limit;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_leaderboard_with_cosmetics TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_leaderboard_with_cosmetics IS 'Get leaderboard with equipped titles and namecards for luxury display';

COMMIT;
