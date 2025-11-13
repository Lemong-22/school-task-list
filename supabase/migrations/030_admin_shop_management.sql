-- ============================================================================
-- Migration: 030_admin_shop_management.sql
-- Description: Add admin role and shop management capabilities
-- Date: 2025-11-13
-- Phase: Admin Shop Management - Database Setup
-- ============================================================================

-- ============================================================================
-- SECTION 1: Add Admin Role Support
-- ============================================================================

-- Note: The profiles.role column already exists with CHECK constraint
-- We need to drop the old constraint and add a new one that includes 'admin'

-- Drop existing role constraint if it exists
DO $$
BEGIN
  -- Find and drop the role check constraint
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname LIKE '%role%' 
    AND conrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  END IF;
END $$;

-- Add new constraint with admin role
ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('student', 'teacher', 'admin'));

-- Add index for admin role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

COMMENT ON CONSTRAINT profiles_role_check ON profiles IS 
'Valid roles: student (default), teacher, admin (shop management)';

-- ============================================================================
-- SECTION 2: Update Shop Items Table for Admin Management
-- ============================================================================

-- Add category field to shop_items (was missing, using 'type' before)
-- We'll keep 'type' for backward compatibility but add 'category' for more granularity
ALTER TABLE shop_items
ADD COLUMN IF NOT EXISTS category TEXT;

-- Update category based on existing type
UPDATE shop_items
SET category = CASE
  WHEN type = 'title' THEN 'badge'
  WHEN type = 'badge' THEN 'badge'
  ELSE 'badge'
END
WHERE category IS NULL;

-- Make category NOT NULL after setting defaults
ALTER TABLE shop_items
ALTER COLUMN category SET NOT NULL;

-- Add category constraint
ALTER TABLE shop_items
DROP CONSTRAINT IF EXISTS shop_items_category_check;

ALTER TABLE shop_items
ADD CONSTRAINT shop_items_category_check
CHECK (category IN ('avatar', 'background', 'badge', 'powerup'));

-- Update rarity constraint to include all rarities
ALTER TABLE shop_items
DROP CONSTRAINT IF EXISTS shop_items_rarity_check;

ALTER TABLE shop_items
ADD CONSTRAINT shop_items_rarity_check
CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary'));

-- Add index for category
CREATE INDEX IF NOT EXISTS idx_shop_items_category ON shop_items(category);

COMMENT ON COLUMN shop_items.category IS 
'Item category: avatar, background, badge, powerup';

-- ============================================================================
-- SECTION 3: Row Level Security (RLS) Policies for Admin
-- ============================================================================

-- Drop existing shop_items policies
DROP POLICY IF EXISTS "shop_items_public_read" ON shop_items;
DROP POLICY IF EXISTS "shop_items_service_role_all" ON shop_items;

-- Policy 1: Everyone can read active shop items
CREATE POLICY "shop_items_public_read"
ON shop_items
FOR SELECT
TO authenticated
USING (is_active = true);

-- Policy 2: Admins can read ALL shop items (including inactive)
CREATE POLICY "shop_items_admin_read_all"
ON shop_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy 3: Admins can INSERT new shop items
CREATE POLICY "shop_items_admin_insert"
ON shop_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy 4: Admins can UPDATE shop items
CREATE POLICY "shop_items_admin_update"
ON shop_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy 5: Admins can DELETE shop items
CREATE POLICY "shop_items_admin_delete"
ON shop_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================================================
-- SECTION 4: Admin Helper Functions
-- ============================================================================

-- Function: check_is_admin
-- Checks if the current user has admin role
CREATE OR REPLACE FUNCTION check_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  ) INTO v_is_admin;
  
  RETURN COALESCE(v_is_admin, false);
END;
$$;

COMMENT ON FUNCTION check_is_admin() IS 
'Returns true if current authenticated user has admin role';

-- Function: get_all_shop_items_admin
-- Returns all shop items (including inactive) for admin dashboard
CREATE OR REPLACE FUNCTION get_all_shop_items_admin()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  type TEXT,
  category TEXT,
  rarity TEXT,
  price INTEGER,
  icon_url TEXT,
  display_order INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify user is admin
  IF NOT check_is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Return all shop items ordered by category, then display_order
  RETURN QUERY
  SELECT 
    si.id,
    si.name,
    si.description,
    si.type,
    si.category,
    si.rarity,
    si.price,
    si.icon_url,
    si.display_order,
    si.is_active,
    si.created_at,
    si.updated_at
  FROM shop_items si
  ORDER BY si.category, si.display_order, si.name;
END;
$$;

COMMENT ON FUNCTION get_all_shop_items_admin() IS 
'Returns all shop items for admin dashboard (requires admin role)';

-- ============================================================================
-- SECTION 5: Verification Queries
-- ============================================================================

-- Verify profiles role constraint
DO $$
DECLARE
  v_constraint_check TEXT;
BEGIN
  SELECT pg_get_constraintdef(oid) INTO v_constraint_check
  FROM pg_constraint
  WHERE conname = 'profiles_role_check'
  AND conrelid = 'profiles'::regclass;
  
  RAISE NOTICE 'Role constraint: %', v_constraint_check;
END $$;

-- Count admin users (should be 0 initially)
DO $$
DECLARE
  v_admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_admin_count
  FROM profiles
  WHERE role = 'admin';
  
  RAISE NOTICE 'Current admin users: %', v_admin_count;
  RAISE NOTICE 'To make a user admin, run: UPDATE profiles SET role = ''admin'' WHERE id = ''<user_id>'';';
END $$;

-- ============================================================================
-- SECTION 6: Grant Permissions
-- ============================================================================

-- Grant execute permissions on admin functions
GRANT EXECUTE ON FUNCTION check_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_shop_items_admin() TO authenticated;

-- ============================================================================
-- Migration Complete
-- ============================================================================

COMMENT ON TABLE shop_items IS 
'Shop items catalog. Admins have full CRUD access via RLS policies.';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 030_admin_shop_management.sql completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Set your user role to admin:';
  RAISE NOTICE '   UPDATE profiles SET role = ''admin'' WHERE id = auth.uid();';
  RAISE NOTICE '';
  RAISE NOTICE '2. Verify admin access:';
  RAISE NOTICE '   SELECT check_is_admin();';
  RAISE NOTICE '';
  RAISE NOTICE '3. Test admin shop items query:';
  RAISE NOTICE '   SELECT * FROM get_all_shop_items_admin();';
END $$;
