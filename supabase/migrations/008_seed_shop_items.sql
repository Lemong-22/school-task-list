-- ============================================================================
-- Migration: 008_seed_shop_items.sql
-- Description: Seed initial shop items (titles and badges)
-- Date: 2025-11-01
-- Phase: Phase 4.2 - Coin Shop (Seed Data)
-- ============================================================================

-- ============================================================================
-- SECTION 1: Seed Titles
-- ============================================================================

INSERT INTO shop_items (name, description, type, rarity, price, icon_url, display_order) VALUES
-- Common Titles (50 coins)
('Novice Learner', 'For those just starting their journey', 'title', 'common', 50, NULL, 1),
('Task Taker', 'Complete your first task', 'title', 'common', 50, NULL, 2),
('Student Scholar', 'A dedicated learner', 'title', 'common', 50, NULL, 3),

-- Rare Titles (150 coins)
('Dedicated Student', 'Shows commitment to learning', 'title', 'rare', 150, NULL, 4),
('Top Performer', 'Consistently excels in tasks', 'title', 'rare', 150, NULL, 5),
('Knowledge Seeker', 'Always pursuing wisdom', 'title', 'rare', 150, NULL, 6),
('Honor Student', 'Excellence in all endeavors', 'title', 'rare', 150, NULL, 7),

-- Epic Titles (500 coins)
('Master Scholar', 'A true master of learning', 'title', 'epic', 500, NULL, 8),
('Academic Legend', 'Legendary dedication and skill', 'title', 'epic', 500, NULL, 9),
('Grand Achiever', 'Reached the pinnacle of success', 'title', 'epic', 500, NULL, 10);

-- ============================================================================
-- SECTION 2: Seed Badges
-- ============================================================================

INSERT INTO shop_items (name, description, type, rarity, price, icon_url, display_order) VALUES
-- Common Badges (50 coins)
('Early Bird', 'For completing tasks early', 'badge', 'common', 50, '🌅', 11),
('First Steps', 'Beginning your journey', 'badge', 'common', 50, '👣', 12),
('Bronze Star', 'A solid start', 'badge', 'common', 50, '⭐', 13),
('Quick Learner', 'Fast and efficient', 'badge', 'common', 50, '⚡', 14),

-- Rare Badges (150 coins)
('Silver Crown', 'Above average achievement', 'badge', 'rare', 150, '👑', 15),
('Speedster', 'Lightning-fast completion', 'badge', 'rare', 150, '🚀', 16),
('Consistent', 'Reliable and steady', 'badge', 'rare', 150, '📊', 17),
('Team Player', 'Works well with others', 'badge', 'rare', 150, '🤝', 18),
('Perfect Score', 'Flawless execution', 'badge', 'rare', 150, '💯', 19),

-- Epic Badges (500 coins)
('Gold Medal', 'Champion of champions', 'badge', 'epic', 500, '🏅', 20),
('Diamond Tier', 'Absolute excellence', 'badge', 'epic', 500, '💎', 21),
('Phoenix Rising', 'Overcame all challenges', 'badge', 'epic', 500, '🔥', 22),
('Legendary', 'The stuff of legends', 'badge', 'epic', 500, '🌟', 23);

-- ============================================================================
-- SECTION 3: Verification
-- ============================================================================

DO $$
DECLARE
  v_title_count INTEGER;
  v_badge_count INTEGER;
  v_total_count INTEGER;
BEGIN
  -- Count titles
  SELECT COUNT(*) INTO v_title_count
  FROM shop_items
  WHERE type = 'title';
  
  -- Count badges
  SELECT COUNT(*) INTO v_badge_count
  FROM shop_items
  WHERE type = 'badge';
  
  -- Total count
  v_total_count := v_title_count + v_badge_count;
  
  -- Verify minimum items exist
  IF v_title_count < 5 THEN
    RAISE EXCEPTION 'Insufficient titles seeded. Expected at least 5, got %', v_title_count;
  END IF;
  
  IF v_badge_count < 5 THEN
    RAISE EXCEPTION 'Insufficient badges seeded. Expected at least 5, got %', v_badge_count;
  END IF;
  
  RAISE NOTICE '✅ Seed data migration completed successfully';
  RAISE NOTICE 'Total items seeded: %', v_total_count;
  RAISE NOTICE '  - Titles: % (% common, % rare, % epic)', 
    v_title_count,
    (SELECT COUNT(*) FROM shop_items WHERE type = 'title' AND rarity = 'common'),
    (SELECT COUNT(*) FROM shop_items WHERE type = 'title' AND rarity = 'rare'),
    (SELECT COUNT(*) FROM shop_items WHERE type = 'title' AND rarity = 'epic');
  RAISE NOTICE '  - Badges: % (% common, % rare, % epic)', 
    v_badge_count,
    (SELECT COUNT(*) FROM shop_items WHERE type = 'badge' AND rarity = 'common'),
    (SELECT COUNT(*) FROM shop_items WHERE type = 'badge' AND rarity = 'rare'),
    (SELECT COUNT(*) FROM shop_items WHERE type = 'badge' AND rarity = 'epic');
  RAISE NOTICE 'Price ranges: Common (50), Rare (150), Epic (500) coins';
END $$;

-- ============================================================================
-- SECTION 4: Sample Queries for Testing
-- ============================================================================

-- Uncomment these to test after running the migration:

-- View all shop items
-- SELECT name, type, rarity, price FROM shop_items ORDER BY display_order;

-- View items by type
-- SELECT name, rarity, price FROM shop_items WHERE type = 'title' ORDER BY price;
-- SELECT name, rarity, price FROM shop_items WHERE type = 'badge' ORDER BY price;

-- View items by rarity
-- SELECT name, type, price FROM shop_items WHERE rarity = 'common' ORDER BY type, name;
-- SELECT name, type, price FROM shop_items WHERE rarity = 'rare' ORDER BY type, name;
-- SELECT name, type, price FROM shop_items WHERE rarity = 'epic' ORDER BY type, name;

-- ============================================================================
-- END OF SEED DATA MIGRATION
-- ============================================================================
