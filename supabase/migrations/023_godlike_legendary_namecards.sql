-- Migration: Add Godlike Legendary Namecards
-- Phase 10+: INSANE luxurious shimmering gradient colorful legendary namecards
-- For the ELITE players only!

BEGIN;

-- ============================================================================
-- GODLIKE LEGENDARY NAMECARDS (2000-2500 Coins) - ULTRA PREMIUM
-- ============================================================================

INSERT INTO public.shop_items (name, type, rarity, price, description, icon_url, display_order)
VALUES
  -- DIVINE RADIANCE - Holy angelic godlike
  ('Divine Radiance', 'namecard', 'legendary', 2500, 'Cahaya surgawi dengan aura emas dan perak. Hanya untuk yang terpilih. Divine power!', '👼', 1000),
  
  -- ETERNAL FLAME - Phoenix fire premium
  ('Eternal Flame', 'namecard', 'legendary', 2500, 'Api abadi phoenix dengan gradasi merah-orange-emas. Unstoppable energy!', '🔥', 1001),
  
  -- MYSTIC AURORA - Northern lights cosmic
  ('Mystic Aurora', 'namecard', 'legendary', 2500, 'Aurora borealis dengan warna-warni magis. Cosmic beauty beyond imagination!', '🌌', 1002),
  
  -- CELESTIAL STORM - Lightning godlike
  ('Celestial Storm', 'namecard', 'legendary', 2500, 'Badai langit dengan kilatan petir biru-ungu. Raw divine power!', '⚡', 1003),
  
  -- PRISMATIC DREAM - Rainbow holographic
  ('Prismatic Dream', 'namecard', 'legendary', 2500, 'Hologram pelangi dengan efek prisma. Reality bending luxury!', '🌈', 1004),
  
  -- SHADOW EMPEROR - Dark premium elegance
  ('Shadow Emperor', 'namecard', 'legendary', 2000, 'Kegelapan misterius dengan aksen ungu dan merah. Silent but deadly!', '🌑', 1005),
  
  -- EMERALD THRONE - Nature luxury
  ('Emerald Throne', 'namecard', 'legendary', 2000, 'Zamrud hijau dengan emas dan cyan. Royal nature power!', '👑', 1006);

COMMIT;

COMMENT ON TABLE shop_items IS 'Shop items with GODLIKE legendary namecards for ultimate flex';
