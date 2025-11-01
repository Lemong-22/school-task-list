-- ============================================================================
-- Migration: Update Profiles RLS for Public Profile Pages
-- Feature: Phase 4.1 - User Profile Page
-- Date: 2025-11-01
-- ============================================================================
-- Purpose: Update RLS policies to support public profile viewing and
--          self-editing of profile information
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public leaderboard data" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- ============================================================================
-- NEW SELECT POLICY: All authenticated users can view all profiles
-- ============================================================================
-- Rationale: Required for public profile pages. Users need to be able to
--            view any profile by clicking on names in the leaderboard or
--            navigating directly to profile URLs.
-- Note: Email visibility is handled at the application layer (frontend)
--       based on whether the viewer is viewing their own profile.
-- ============================================================================

CREATE POLICY "Public profiles for authenticated users"
ON profiles
FOR SELECT
TO authenticated
USING (true);

-- ============================================================================
-- NEW UPDATE POLICY: Users can only update their own profile
-- ============================================================================
-- Rationale: Users should only be able to edit their own profile information
--            (currently limited to full_name in Phase 4.1)
-- ============================================================================

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Run this to verify the policies were created successfully:
-- 
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'profiles'
-- ORDER BY policyname;
-- 
-- Expected results:
-- 1. "Public profiles for authenticated users" - SELECT - authenticated
-- 2. "Users can update own profile" - UPDATE - authenticated
-- ============================================================================

-- Add comment for documentation
COMMENT ON POLICY "Public profiles for authenticated users" ON profiles IS 
'Allows all authenticated users to view any profile. Part of Phase 4.1: User Profile Page implementation.';

COMMENT ON POLICY "Users can update own profile" ON profiles IS 
'Allows users to update only their own profile information. Currently supports editing full_name.';
