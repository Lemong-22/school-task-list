-- Migration: Add Namecard Item Type & Luxury Namecards
-- Phase 10: Gamification V2 - Namecards for Profile/Leaderboard Customization
-- Creates stunning, luxurious namecard backgrounds

BEGIN;

-- ============================================================================
-- STEP 1: Update Item Type to Include 'namecard'
-- ============================================================================

-- Drop old constraint
ALTER TABLE public.shop_items
DROP CONSTRAINT IF EXISTS shop_items_type_check;

-- Add new constraint with 'namecard'
ALTER TABLE public.shop_items
ADD CONSTRAINT shop_items_type_check 
CHECK (type IN ('title', 'badge', 'namecard'));

-- Update comment
COMMENT ON COLUMN shop_items.type IS 'Item type: title, badge, or namecard (background/border style)';

-- ============================================================================
-- STEP 2: Add active_namecard_id to Profiles
-- ============================================================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS active_namecard_id UUID REFERENCES shop_items(id) ON DELETE SET NULL;

COMMENT ON COLUMN profiles.active_namecard_id IS 'Currently equipped namecard for profile/leaderboard display';

-- ============================================================================
-- STEP 3: Insert Legendary Namecards (1500 Coins) - ULTRA LUXURY
-- ============================================================================

INSERT INTO public.shop_items (name, type, rarity, price, description, icon_url)
VALUES
  ('Royal Crimson', 'namecard', 'legendary', 1500, 'Background merah kerajaan dengan efek emas. Untuk yang paling elite.', '👑'),
  ('Galaxy Emperor', 'namecard', 'legendary', 1500, 'Latar belakang galaksi biru-ungu dengan bintang berkelap-kelip. Cosmic power!', '🌌'),
  ('Golden Dynasty', 'namecard', 'legendary', 1500, 'Gradasi emas murni dengan pola oriental. Simbol kemakmuran dan kekuasaan.', '🏰'),
  ('Obsidian King', 'namecard', 'legendary', 1500, 'Hitam pekat dengan aksen merah gelap. Mysterious and powerful.', '⚫'),
  ('Crystal Diamond', 'namecard', 'legendary', 1500, 'Putih kristal dengan efek prisma pelangi. Pure elegance.', '💎');

-- ============================================================================
-- STEP 4: Insert Epic Namecards (500 Coins) - PREMIUM
-- ============================================================================

INSERT INTO public.shop_items (name, type, rarity, price, description, icon_url)
VALUES
  ('Sunset Paradise', 'namecard', 'epic', 500, 'Orange-pink gradient seperti sunset. Warm and inviting.', '🌅'),
  ('Ocean Depths', 'namecard', 'epic', 500, 'Biru laut dalam dengan gradient cyan. Deep and mysterious.', '🌊'),
  ('Forest Royale', 'namecard', 'epic', 500, 'Hijau zamrud dengan aksen emas. Nature meets luxury.', '🌲'),
  ('Purple Majesty', 'namecard', 'epic', 500, 'Ungu kerajaan dengan gradient magenta. Majestic vibes.', '💜'),
  ('Cyber Neon', 'namecard', 'epic', 500, 'Neon pink-cyan futuristik. Tech and style.', '🔮');

-- ============================================================================
-- STEP 5: Insert Rare Namecards (300 Coins) - STYLISH
-- ============================================================================

INSERT INTO public.shop_items (name, type, rarity, price, description, icon_url)
VALUES
  ('Sky Blue', 'namecard', 'rare', 300, 'Biru langit cerah dengan gradient putih. Fresh and clean.', '☁️'),
  ('Rose Garden', 'namecard', 'rare', 300, 'Pink lembut dengan gradient merah muda. Soft and elegant.', '🌹'),
  ('Mint Fresh', 'namecard', 'rare', 300, 'Hijau mint dengan gradient tosca. Cool and refreshing.', '🍃'),
  ('Lavender Dream', 'namecard', 'rare', 300, 'Ungu lavender dengan gradient soft pink. Dreamy aesthetic.', '💭');

-- ============================================================================
-- STEP 6: Insert Common Namecards (100 Coins) - BASIC
-- ============================================================================

INSERT INTO public.shop_items (name, type, rarity, price, description, icon_url)
VALUES
  ('Classic Gray', 'namecard', 'common', 100, 'Abu-abu netral. Simple and professional.', '⬜'),
  ('Warm Beige', 'namecard', 'common', 100, 'Beige hangat. Comfortable and cozy.', '🟫'),
  ('Cool Slate', 'namecard', 'common', 100, 'Biru-abu gelap. Modern and sleek.', '🔷');

COMMIT;

-- Add indexes for namecard lookups
CREATE INDEX IF NOT EXISTS idx_profiles_active_namecard ON profiles(active_namecard_id) WHERE active_namecard_id IS NOT NULL;

COMMENT ON TABLE shop_items IS 'Shop items including titles, badges, and luxurious namecards for profile/leaderboard customization';
