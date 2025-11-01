-- ============================================================================
-- Migration: 009a_fix_price_constraint.sql
-- Description: Allow free items (price = 0) in shop
-- Date: 2025-11-01
-- Phase: Phase 4.2 - Coin Shop (Fix)
-- ============================================================================

-- Drop the old constraint that requires price > 0
ALTER TABLE shop_items
DROP CONSTRAINT IF EXISTS shop_items_price_check;

-- Add new constraint that allows price >= 0 (free items allowed)
ALTER TABLE shop_items
ADD CONSTRAINT shop_items_price_check CHECK (price >= 0);

-- Verify the change
DO $$
BEGIN
  RAISE NOTICE '✅ Price constraint updated: Free items (price = 0) are now allowed';
END $$;
