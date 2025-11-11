-- Migration: Restore Namecard Emojis in icon_url
-- This reverts the previous migration that replaced emojis with Tailwind classes
-- icon_url should contain emojis for display in Shop/Inventory
-- The frontend CommentItem component handles the gradient styling separately

BEGIN;

-- Restore Legendary Namecard emojis
UPDATE public.shop_items
SET icon_url = CASE name
  -- GODLIKE LEGENDARY
  WHEN 'Divine Radiance' THEN '👼'
  WHEN 'Eternal Flame' THEN '🔥'
  WHEN 'Mystic Aurora' THEN '🌌'
  WHEN 'Celestial Storm' THEN '⚡'
  WHEN 'Prismatic Dream' THEN '🌈'
  WHEN 'Shadow Emperor' THEN '🌑'
  WHEN 'Emerald Throne' THEN '👑'
  WHEN 'Royal Crimson' THEN '👑'
  WHEN 'Galaxy Emperor' THEN '🌌'
  WHEN 'Golden Dynasty' THEN '🏰'
  WHEN 'Obsidian King' THEN '⚫'
  WHEN 'Crystal Diamond' THEN '💎'
  ELSE icon_url
END
WHERE type = 'namecard' AND rarity = 'legendary';

-- Restore Epic Namecard emojis
UPDATE public.shop_items
SET icon_url = CASE name
  WHEN 'Sunset Paradise' THEN '🌅'
  WHEN 'Ocean Depths' THEN '🌊'
  WHEN 'Forest Royale' THEN '🌲'
  WHEN 'Purple Majesty' THEN '💜'
  WHEN 'Cyber Neon' THEN '🔮'
  ELSE icon_url
END
WHERE type = 'namecard' AND rarity = 'epic';

-- Restore Rare Namecard emojis
UPDATE public.shop_items
SET icon_url = CASE name
  WHEN 'Sky Blue' THEN '☁️'
  WHEN 'Rose Garden' THEN '🌹'
  WHEN 'Mint Fresh' THEN '🍃'
  WHEN 'Lavender Dream' THEN '💭'
  ELSE icon_url
END
WHERE type = 'namecard' AND rarity = 'rare';

-- Restore Common Namecard emojis
UPDATE public.shop_items
SET icon_url = CASE name
  WHEN 'Classic Gray' THEN '⬜'
  WHEN 'Warm Beige' THEN '🟫'
  WHEN 'Cool Slate' THEN '🔷'
  ELSE icon_url
END
WHERE type = 'namecard' AND rarity = 'common';

COMMIT;

COMMENT ON COLUMN shop_items.icon_url IS 'Emoji icon for display in Shop/Inventory. Comment gradients are handled in frontend.';
