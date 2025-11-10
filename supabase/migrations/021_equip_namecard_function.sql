-- Migration: Add equip_namecard RPC Function
-- Phase 10: Allow users to equip namecards from inventory

BEGIN;

-- ============================================================================
-- RPC Function: equip_namecard
-- ============================================================================

CREATE OR REPLACE FUNCTION equip_namecard(
  p_user_id UUID,
  p_namecard_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate that the user owns the namecard (if not null)
  IF p_namecard_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM user_inventory ui
      JOIN shop_items si ON ui.item_id = si.id
      WHERE ui.user_id = p_user_id
        AND si.id = p_namecard_id
        AND si.type = 'namecard'
    ) THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'You do not own this namecard'
      );
    END IF;
  END IF;

  -- Update the user's active namecard
  UPDATE profiles
  SET active_namecard_id = p_namecard_id
  WHERE id = p_user_id;

  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'error', NULL
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION equip_namecard TO authenticated;

-- Add comment
COMMENT ON FUNCTION equip_namecard IS 'Equip or unequip a namecard for a user';

COMMIT;
