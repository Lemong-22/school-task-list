-- ============================================================================
-- Migration: 009_deluxe_shop_items.sql
-- Description: Replace shop items with curated deluxe catalog (12 items)
-- Date: 2025-11-01
-- Phase: Phase 4.2 - Coin Shop (Deluxe Edition)
-- ============================================================================

-- ============================================================================
-- SECTION 1: Clear Existing Shop Items
-- ============================================================================

-- Delete all existing shop items (this will NOT affect user_inventory due to ON DELETE RESTRICT)
-- We need to first clear any user purchases if we want a clean slate
-- For safety, we'll just truncate shop_items if there are no purchases yet
DO $$
BEGIN
  -- Check if there are any purchases
  IF NOT EXISTS (SELECT 1 FROM user_inventory LIMIT 1) THEN
    -- Safe to truncate
    TRUNCATE TABLE shop_items CASCADE;
    RAISE NOTICE 'Cleared all existing shop items (no purchases found)';
  ELSE
    -- There are purchases, so we can't safely clear
    -- Instead, we'll just insert new items (they'll coexist with old ones)
    RAISE NOTICE 'Existing purchases found. New items will be added alongside existing ones.';
  END IF;
END $$;

-- ============================================================================
-- SECTION 2: Insert Deluxe Shop Items (12 Items)
-- ============================================================================

-- TITLES (6 items)
INSERT INTO shop_items (name, type, rarity, price, description, icon_url, display_order, is_active) VALUES
('Siswa Baru', 'title', 'common', 0, 'Gelar awal untuk semua siswa.', NULL, 1, true),
('Raja Cepat', 'title', 'rare', 150, 'Diberikan karena sering masuk Top 3.', NULL, 2, true),
('Master Matematika', 'title', 'rare', 150, 'Menunjukkan keahlian di Matematika.', NULL, 3, true),
('Sejarawan', 'title', 'rare', 150, 'Menunjukkan keahlian di Sejarah.', NULL, 4, true),
('Ksatria Deadline', 'title', 'epic', 500, 'Selalu menyelesaikan tugas tepat waktu.', NULL, 5, true),
('Sang Kolektor', 'title', 'epic', 500, 'Memiliki lebih dari 10 item kosmetik.', NULL, 6, true)
ON CONFLICT DO NOTHING;

-- BADGES (6 items)
INSERT INTO shop_items (name, type, rarity, price, description, icon_url, display_order, is_active) VALUES
('Lencana Perunggu', 'badge', 'common', 50, 'Lencana partisipasi dasar.', '🥉', 7, true),
('Lencana Perak', 'badge', 'common', 50, 'Menunjukkan pencapaian yang solid.', '🥈', 8, true),
('Lencana Emas', 'badge', 'rare', 150, 'Untuk pencapaian yang mengesankan.', '🥇', 9, true),
('Trofi Bintang', 'badge', 'rare', 150, 'Lencana untuk performa bintang.', '⭐', 10, true),
('Perisai Kehormatan', 'badge', 'epic', 500, 'Lencana prestise tertinggi.', '🛡️', 11, true),
('Api Semangat', 'badge', 'epic', 500, 'Menunjukkan streak pengerjaan tugas.', '🔥', 12, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SECTION 3: Auto-Grant "Siswa Baru" Title to All Existing Students
-- ============================================================================

-- Automatically add the free "Siswa Baru" title to all existing students
-- This is a one-time bonus for existing users
DO $$
DECLARE
  v_siswa_baru_id UUID;
  v_student_count INTEGER := 0;
BEGIN
  -- Get the ID of "Siswa Baru" title
  SELECT id INTO v_siswa_baru_id
  FROM shop_items
  WHERE name = 'Siswa Baru' AND type = 'title'
  LIMIT 1;
  
  IF v_siswa_baru_id IS NULL THEN
    RAISE EXCEPTION 'Siswa Baru title not found in shop_items';
  END IF;
  
  -- Grant it to all students who don't already own it
  INSERT INTO user_inventory (user_id, item_id, purchased_at)
  SELECT p.id, v_siswa_baru_id, NOW()
  FROM profiles p
  WHERE p.role = 'student'
    AND NOT EXISTS (
      SELECT 1 FROM user_inventory ui
      WHERE ui.user_id = p.id AND ui.item_id = v_siswa_baru_id
    );
  
  GET DIAGNOSTICS v_student_count = ROW_COUNT;
  
  RAISE NOTICE 'Auto-granted "Siswa Baru" title to % existing students', v_student_count;
END $$;

-- ============================================================================
-- SECTION 4: Verification & Summary
-- ============================================================================

DO $$
DECLARE
  v_title_count INTEGER;
  v_badge_count INTEGER;
  v_total_count INTEGER;
  v_common_count INTEGER;
  v_rare_count INTEGER;
  v_epic_count INTEGER;
BEGIN
  -- Count items by type
  SELECT COUNT(*) INTO v_title_count FROM shop_items WHERE type = 'title' AND is_active = true;
  SELECT COUNT(*) INTO v_badge_count FROM shop_items WHERE type = 'badge' AND is_active = true;
  v_total_count := v_title_count + v_badge_count;
  
  -- Count items by rarity
  SELECT COUNT(*) INTO v_common_count FROM shop_items WHERE rarity = 'common' AND is_active = true;
  SELECT COUNT(*) INTO v_rare_count FROM shop_items WHERE rarity = 'rare' AND is_active = true;
  SELECT COUNT(*) INTO v_epic_count FROM shop_items WHERE rarity = 'epic' AND is_active = true;
  
  -- Display summary
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ Migration 009 - Deluxe Shop Items completed successfully';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE 'Total Active Items: %', v_total_count;
  RAISE NOTICE '  - Titles: %', v_title_count;
  RAISE NOTICE '  - Badges: %', v_badge_count;
  RAISE NOTICE '';
  RAISE NOTICE 'By Rarity:';
  RAISE NOTICE '  - Common: % items (Price: 0-50 coins)', v_common_count;
  RAISE NOTICE '  - Rare: % items (Price: 150 coins)', v_rare_count;
  RAISE NOTICE '  - Epic: % items (Price: 500 coins)', v_epic_count;
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  
  -- Verify we have exactly 12 items
  IF v_total_count < 12 THEN
    RAISE WARNING 'Expected 12 items, but only % items were created!', v_total_count;
  END IF;
END $$;

-- ============================================================================
-- SECTION 5: Sample Queries for Testing
-- ============================================================================

-- Uncomment to test after migration:

-- View all shop items
-- SELECT name, type, rarity, price, description FROM shop_items WHERE is_active = true ORDER BY display_order;

-- View items by rarity
-- SELECT rarity, COUNT(*) as count, array_agg(name) as items
-- FROM shop_items 
-- WHERE is_active = true 
-- GROUP BY rarity 
-- ORDER BY CASE rarity WHEN 'common' THEN 1 WHEN 'rare' THEN 2 WHEN 'epic' THEN 3 END;

-- Check free title distribution
-- SELECT COUNT(*) as students_with_free_title
-- FROM user_inventory ui
-- JOIN shop_items si ON ui.item_id = si.id
-- WHERE si.name = 'Siswa Baru';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
