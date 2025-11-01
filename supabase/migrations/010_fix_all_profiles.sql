-- ============================================================================
-- Migration: 010_fix_all_profiles.sql
-- Description: Create missing profiles and ensure all users have new columns
-- Date: 2025-11-01
-- Phase: Phase 4.2 - Coin Shop (Profile Fix)
-- ============================================================================

-- ============================================================================
-- SECTION 1: Ensure columns exist (idempotent)
-- ============================================================================

DO $$
BEGIN
  -- Add active_title_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'active_title_id'
  ) THEN
    ALTER TABLE profiles
    ADD COLUMN active_title_id UUID REFERENCES shop_items(id) ON DELETE SET NULL;
    
    CREATE INDEX idx_profiles_active_title ON profiles(active_title_id);
    
    RAISE NOTICE 'Added active_title_id column';
  END IF;

  -- Add equipped_badges if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'equipped_badges'
  ) THEN
    ALTER TABLE profiles
    ADD COLUMN equipped_badges JSONB DEFAULT '[]'::jsonb NOT NULL;
    
    CREATE INDEX idx_profiles_equipped_badges ON profiles USING GIN(equipped_badges);
    
    RAISE NOTICE 'Added equipped_badges column';
  END IF;
END $$;

-- ============================================================================
-- SECTION 2: Set default values for existing profiles
-- ============================================================================

-- Set NULL values to defaults for any existing profiles
UPDATE profiles
SET 
  active_title_id = NULL,
  equipped_badges = COALESCE(equipped_badges, '[]'::jsonb)
WHERE equipped_badges IS NULL;

-- ============================================================================
-- SECTION 3: Create missing profiles for ALL auth users
-- ============================================================================

INSERT INTO profiles (id, full_name, role, total_coins, active_title_id, equipped_badges, created_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email, 'Unknown User') as full_name,
  COALESCE(au.raw_user_meta_data->>'role', 'student') as role,
  0 as total_coins,
  NULL as active_title_id,
  '[]'::jsonb as equipped_badges,
  au.created_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO UPDATE SET
  active_title_id = EXCLUDED.active_title_id,
  equipped_badges = EXCLUDED.equipped_badges;

-- ============================================================================
-- SECTION 4: Auto-grant free "Siswa Baru" title to all students
-- ============================================================================

DO $$
DECLARE
  v_siswa_baru_id UUID;
  v_granted_count INTEGER := 0;
BEGIN
  -- Get the ID of "Siswa Baru" title
  SELECT id INTO v_siswa_baru_id
  FROM shop_items
  WHERE name = 'Siswa Baru' AND type = 'title'
  LIMIT 1;
  
  IF v_siswa_baru_id IS NOT NULL THEN
    -- Grant it to all students who don't already own it
    INSERT INTO user_inventory (user_id, item_id, purchased_at)
    SELECT p.id, v_siswa_baru_id, NOW()
    FROM profiles p
    WHERE p.role = 'student'
      AND NOT EXISTS (
        SELECT 1 FROM user_inventory ui
        WHERE ui.user_id = p.id AND ui.item_id = v_siswa_baru_id
      )
    ON CONFLICT (user_id, item_id) DO NOTHING;
    
    GET DIAGNOSTICS v_granted_count = ROW_COUNT;
    
    RAISE NOTICE 'Auto-granted "Siswa Baru" title to % students', v_granted_count;
  ELSE
    RAISE NOTICE 'Siswa Baru title not found - skipping auto-grant';
  END IF;
END $$;

-- ============================================================================
-- SECTION 5: Verification
-- ============================================================================

DO $$
DECLARE
  v_auth_users_count INTEGER;
  v_profiles_count INTEGER;
  v_missing_count INTEGER;
BEGIN
  -- Count users
  SELECT COUNT(*) INTO v_auth_users_count FROM auth.users;
  SELECT COUNT(*) INTO v_profiles_count FROM profiles;
  
  v_missing_count := v_auth_users_count - v_profiles_count;
  
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ Migration 010 - Profile Fix completed successfully';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE 'Auth Users: %', v_auth_users_count;
  RAISE NOTICE 'Profiles: %', v_profiles_count;
  
  IF v_missing_count > 0 THEN
    RAISE WARNING 'Still missing % profiles!', v_missing_count;
  ELSE
    RAISE NOTICE 'All users have profiles! ✓';
  END IF;
  
  -- Show column status
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'active_title_id'
  ) THEN
    RAISE NOTICE 'Column active_title_id: EXISTS ✓';
  ELSE
    RAISE WARNING 'Column active_title_id: MISSING ✗';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'equipped_badges'
  ) THEN
    RAISE NOTICE 'Column equipped_badges: EXISTS ✓';
  ELSE
    RAISE WARNING 'Column equipped_badges: MISSING ✗';
  END IF;
  
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
