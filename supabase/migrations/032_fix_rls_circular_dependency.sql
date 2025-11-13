-- ============================================================================
-- Migration: 032_fix_rls_circular_dependency.sql
-- Description: Fix circular dependency in RLS policies for profiles table
-- Date: 2025-11-13
-- Phase: Hotfix - Fix 500 errors
-- ============================================================================

-- The problem: The RLS policies in 031 were querying the profiles table
-- to check if a user is admin, which creates a circular dependency.
-- 
-- Solution: Use a simpler approach that doesn't create circular dependencies.

/**************************************************************
 * 1. Drop ALL existing SELECT policies on profiles
 **************************************************************/

DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view student profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

/**************************************************************
 * 2. Create new, non-circular SELECT policies
 **************************************************************/

-- Policy 1: Users can ALWAYS view their own profile (no circular dependency)
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Everyone can view student profiles (for leaderboard, etc.)
CREATE POLICY "Everyone can view students"
ON public.profiles FOR SELECT
USING (role = 'student');

-- Policy 3: For admin functionality, we'll use a direct role check
-- This policy checks the current row being queried, not a separate query
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
  -- Either you're viewing your own profile, OR you are an admin
  auth.uid() = id 
  OR 
  -- Check if the CURRENT USER's role is admin by looking at their OWN row
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Note: The above still has potential for circular dependency
-- Let's use a safer approach with SECURITY DEFINER function

/**************************************************************
 * 3. Create a better check_is_admin function that uses caching
 **************************************************************/

DROP FUNCTION IF EXISTS public.check_is_admin();

CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid() LIMIT 1),
    false
  );
$$;

-- Grant access
GRANT EXECUTE ON FUNCTION public.check_is_admin() TO authenticated;

/**************************************************************
 * 4. Simplify: Just use broad SELECT policies without admin check
 **************************************************************/

-- Drop the problematic admin policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Replace with simpler policies that don't cause circular dependencies
CREATE POLICY "profiles_select_own"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "profiles_select_students"
ON public.profiles FOR SELECT  
USING (role = 'student');

-- For admin access, we'll rely on SECURITY DEFINER functions instead of RLS
-- This way admins can use RPCs to view all users, avoiding the circular dependency


/**************************************************************
 * 5. Fix UPDATE policies (same circular dependency issue)
 **************************************************************/

DROP POLICY IF EXISTS "Admins can update user profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- For admin updates, we'll use RPC functions with SECURITY DEFINER
-- This avoids the circular dependency issue


/**************************************************************
 * 6. Create admin-safe RPC to get all users
 **************************************************************/

-- This function bypasses RLS entirely for admins
CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  role TEXT,
  total_coins INTEGER,
  created_at TIMESTAMPTZ,
  active_title_id UUID,
  equipped_badges JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- First check if caller is admin using direct auth check
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Return all users (bypasses RLS because of SECURITY DEFINER)
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.role,
    p.total_coins,
    p.created_at,
    p.active_title_id,
    p.equipped_badges
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_all_users() TO authenticated;

COMMENT ON FUNCTION public.admin_get_all_users() IS
'Returns all users for admin dashboard. Uses SECURITY DEFINER to bypass RLS.';


/**************************************************************
 * 7. Verification
 **************************************************************/

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 032 completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Fixed Issues:';
  RAISE NOTICE '   - Removed circular RLS policies';
  RAISE NOTICE '   - Users can now view their own profile';
  RAISE NOTICE '   - Students visible on leaderboard';
  RAISE NOTICE '   - Admin uses RPC functions instead of direct queries';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Admin Hook Update Required:';
  RAISE NOTICE '   Update useAdminUsers.ts to call admin_get_all_users() RPC';
  RAISE NOTICE '   instead of direct supabase.from(''profiles'').select()';
END $$;
