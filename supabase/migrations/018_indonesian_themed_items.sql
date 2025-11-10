-- Migration: Indonesian-Themed Hall of Fame Shop Items
-- Phase 10: Gamification V2 & Advanced Cosmetics
-- Adds epic and legendary items themed around Indonesian school culture

BEGIN;

-- ============================================================================
-- STEP 1: Update Rarity Check Constraint to Include 'legendary'
-- ============================================================================

-- Drop the old constraint
ALTER TABLE public.shop_items
DROP CONSTRAINT IF EXISTS shop_items_rarity_check;

-- Add new constraint with 'legendary' included
ALTER TABLE public.shop_items
ADD CONSTRAINT shop_items_rarity_check 
CHECK (rarity IN ('common', 'rare', 'epic', 'legendary'));

-- Update comment
COMMENT ON COLUMN shop_items.rarity IS 'Item rarity tier: common, rare, epic, legendary';

-- ============================================================================
-- STEP 2: Insert Epic Items (500 Coins)
-- ============================================================================

INSERT INTO public.shop_items (name, type, rarity, price, description, icon_url)
VALUES
  -- Epic Titles
  ('Si Paling SKS', 'title', 'epic', 500, 'Ahli Sistem Kebut Semalam. Mengerjakan 5+ tugas di hari H.', NULL),
  ('Jagoan Presentasi', 'title', 'epic', 500, 'Menguasai panggung. Selalu dapat nilai A+ saat presentasi.', NULL),
  ('Sultan Tugas', 'title', 'epic', 500, 'Hobi ngumpulin tugas duluan. Submission rate 100%.', NULL),
  ('Rajanya UTS', 'title', 'epic', 500, 'Juara Ujian Tengah Semester. Top 3 di semua mata pelajaran.', NULL),
  
  -- Epic Badges
  ('Bintang Kelas', 'badge', 'epic', 500, 'Selalu menonjol di setiap mata pelajaran.', '⭐'),
  ('Sobat Deadline', 'badge', 'epic', 500, 'Tidak pernah terlambat submit tugas. Perfect timing!', '⏰'),
  ('Aktivis OSIS', 'badge', 'epic', 500, 'Aktif di organisasi siswa. Leader sejati!', '🎓'),
  ('Sang Juara', 'badge', 'epic', 500, 'Pemenang kompetisi sekolah. Pride of the class!', '🏆');

-- ============================================================================
-- LEGENDARY ITEMS (1500 Coins)
-- ============================================================================

INSERT INTO public.shop_items (name, type, rarity, price, description, icon_url)
VALUES
  -- Legendary Titles
  ('KING OF THE LEADERBOARD', 'title', 'legendary', 1500, 'Peringkat 1 di Leaderboard selama 3 minggu berturut-turut. Tak terkalahkan!', NULL),
  ('THE FLASH', 'title', 'legendary', 1500, 'Kecepatan absolut. Berhasil submit 10+ tugas sebagai 3 tercepat.', NULL),
  ('Sarjana Muda', 'title', 'legendary', 1500, 'Menyelesaikan 100+ tugas dengan nilai sempurna. Master of all subjects!', NULL),
  ('Legenda Kelas', 'title', 'legendary', 1500, 'Nama yang akan dikenang selamanya. Hall of Fame material.', NULL),
  ('MVP Season', 'title', 'legendary', 1500, 'Most Valuable Player musim ini. The GOAT of students!', NULL),
  
  -- Legendary Badges
  ('Master Olimpiade', 'badge', 'legendary', 1500, 'Mewakili sekolah dalam kompetisi akademis tingkat nasional.', '🥇'),
  ('Perfect Score', 'badge', 'legendary', 1500, 'Mendapat nilai 100 di 20+ tugas. Absolute perfection!', '💯'),
  ('Sang Pionir', 'badge', 'legendary', 1500, 'Yang pertama mencapai 10,000 koin. Trailblazer!', '🚀'),
  ('Crown Jewel', 'badge', 'legendary', 1500, 'Ultimate achievement. Only for the chosen ones.', '👑'),
  ('Infinity Badge', 'badge', 'legendary', 1500, 'Beyond legendary. Unlimited potential unlocked!', '♾️');

-- ============================================================================
-- ADDITIONAL RARE ITEMS (300 Coins) - For More Options
-- ============================================================================

INSERT INTO public.shop_items (name, type, rarity, price, description, icon_url)
VALUES
  -- Rare Titles
  ('Anak Rajin', 'title', 'rare', 300, 'Tidak pernah bolos. Kehadiran 100%!', NULL),
  ('Captain Team', 'title', 'rare', 300, 'Pemimpin kelompok terbaik. Always leading by example.', NULL),
  ('Teman Belajar', 'title', 'rare', 300, 'Sering membantu teman. Collaboration master!', NULL),
  
  -- Rare Badges
  ('Fast Learner', 'badge', 'rare', 300, 'Cepat memahami materi baru. Quick study!', '⚡'),
  ('Konsisten', 'badge', 'rare', 300, 'Submit tugas tepat waktu 30 hari berturut-turut.', '📅'),
  ('Problem Solver', 'badge', 'rare', 300, 'Menyelesaikan 50+ tugas sulit. No challenge too big!', '🧩');

COMMIT;

-- Add comment
COMMENT ON TABLE shop_items IS 'Shop items with Indonesian school-themed epic and legendary cosmetics for Phase 10';
