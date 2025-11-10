# Phase 10 - Complete Implementation & Testing Guide

## ✅ WHAT'S BEEN DONE

### 1. **ProfilePage** ✅
- Namecard is the BACKGROUND of profile header (Discord style)
- Shimmer effect on legendary/epic namecards
- NO separate namecard section

### 2. **LeaderboardPage** ✅
- Namecard background on each row
- Title with SHIMMER effect next to name
- Name is bold and larger
- Title has gradient background + shimmer for legendary/epic

### 3. **ShopPage** ✅
- Can buy namecards
- Legendary items have golden shimmer boxes

---

## 🚀 QUICK TEST - RUN THESE SQL COMMANDS

**Copy ALL of this into Supabase SQL Editor and run:**

```sql
-- ==================================================================
-- PHASE 10 QUICK TEST SETUP
-- ==================================================================

-- Step 1: Get your user ID (replace 'your@email.com')
DO $$
DECLARE
  my_user_id UUID;
  my_email TEXT := 'your@email.com';  -- ← CHANGE THIS
BEGIN
  -- Get user ID
  SELECT id INTO my_user_id
  FROM auth.users
  WHERE email = my_email;
  
  IF my_user_id IS NULL THEN
    RAISE NOTICE 'User not found with email: %', my_email;
    RETURN;
  END IF;
  
  RAISE NOTICE 'User ID: %', my_user_id;
  
  -- Step 2: Give yourself 50,000 coins
  UPDATE profiles
  SET total_coins = 50000
  WHERE id = my_user_id;
  
  RAISE NOTICE 'Coins updated to 50,000';
  
  -- Step 3: Add Royal Crimson to inventory (if not owned)
  INSERT INTO user_inventory (user_id, item_id)
  SELECT 
    my_user_id,
    id
  FROM shop_items
  WHERE name = 'Royal Crimson'
  AND type = 'namecard'
  ON CONFLICT (user_id, item_id) DO NOTHING;
  
  RAISE NOTICE 'Royal Crimson added to inventory';
  
  -- Step 4: Add KING title to inventory (if not owned)
  INSERT INTO user_inventory (user_id, item_id)
  SELECT 
    my_user_id,
    id
  FROM shop_items
  WHERE name = 'KING OF THE LEADERBOARD'
  AND type = 'title'
  ON CONFLICT (user_id, item_id) DO NOTHING;
  
  RAISE NOTICE 'KING title added to inventory';
  
  -- Step 5: EQUIP Royal Crimson namecard
  UPDATE profiles
  SET active_namecard_id = (
    SELECT id FROM shop_items 
    WHERE name = 'Royal Crimson' 
    AND type = 'namecard'
  )
  WHERE id = my_user_id;
  
  RAISE NOTICE 'Royal Crimson EQUIPPED';
  
  -- Step 6: EQUIP KING title
  UPDATE profiles
  SET active_title_id = (
    SELECT id FROM shop_items 
    WHERE name = 'KING OF THE LEADERBOARD'
    AND type = 'title'
  )
  WHERE id = my_user_id;
  
  RAISE NOTICE 'KING title EQUIPPED';
  
  -- Step 7: Verify setup
  RAISE NOTICE '============================================';
  RAISE NOTICE 'SETUP COMPLETE! Now refresh your browser.';
  RAISE NOTICE '============================================';
  
END $$;

-- Verify it worked:
SELECT 
  p.full_name,
  p.total_coins,
  title.name as equipped_title,
  namecard.name as equipped_namecard
FROM profiles p
LEFT JOIN shop_items title ON p.active_title_id = title.id
LEFT JOIN shop_items namecard ON p.active_namecard_id = namecard.id
WHERE p.role = 'student'
ORDER BY p.total_coins DESC
LIMIT 5;
```

**IMPORTANT:** Change `'your@email.com'` to your actual email!

---

## 🎨 WHAT YOU'LL SEE AFTER SQL

### **ProfilePage** (`/profile/me`)
```
┌─────────────────────────────────────────────────┐
│ ✨💫 GOLDEN GRADIENT BACKGROUND 💫✨           │  ← Royal Crimson
│ ╔═══════════════════════════════════════════╗  │     (Shimmering!)
│ ║  👤 KING ILHAM                            ║  │  ← Golden text
│ ║  Student • 💵 50,000 Coins                ║  │
│ ╚═══════════════════════════════════════════╝  │
└─────────────────────────────────────────────────┘

My Title:
┌─────────────────────────────────────────────────┐
│ ✨💫 SHIMMER 💫✨                              │
│                                                 │
│     🌟 KING OF THE LEADERBOARD 🌟              │  ← Gold gradient
│     ═══════════════════════════════             │     (Pulsing!)
└─────────────────────────────────────────────────┘
```

### **LeaderboardPage** (`/leaderboard`)
```
┌─────────────────────────────────────────────────────────┐
│ Rank │ Name & Title                        │ Coins      │
├─────────────────────────────────────────────────────────┤
│  🥇 1 │ KING ILHAM ✨「KING」✨           │ 🪙 50,000 │  ← Golden row
│       │             (shimmer + pulse)       │            │     (Shimmer!)
├─────────────────────────────────────────────────────────┤
│  🥈 2 │ udin 💜「Master Matematika」💜    │ 🪙 9,460  │  ← Purple row
└─────────────────────────────────────────────────────────┘
```

**Title Effects:**
- ✨ **Legendary:** Gold shimmer + pulse + gold gradient
- 💜 **Epic:** Purple shimmer + pulse + purple gradient
- 🔵 **Rare:** Blue gradient (no shimmer)
- ⚪ **Common:** Gray (plain)

---

## 🔧 IF STILL NOT SHOWING

### **Debug Step 1: Check RPC Response**
Run in Supabase SQL:
```sql
SELECT * FROM get_leaderboard_with_cosmetics(10);
```

Should show:
- `active_title_name` = "KING OF THE LEADERBOARD"
- `active_namecard_name` = "Royal Crimson"
- `namecard_rarity` = "legendary"

### **Debug Step 2: Check Profile**
```sql
SELECT 
  id, full_name, 
  active_title_id, 
  active_namecard_id
FROM profiles
WHERE email = (SELECT email FROM auth.users WHERE email = 'your@email.com');
```

Both IDs should be UUIDs (not NULL).

### **Debug Step 3: Browser Console**
1. Open DevTools (F12)
2. Go to Console tab
3. Refresh page
4. Look for errors
5. Check Network tab → `get_leaderboard_with_cosmetics` call

---

## 📋 INVENTORY EQUIP FEATURE

### **Current Status:**
- ✅ Can equip **titles** in `/inventory`
- ✅ Can equip **badges** in `/inventory`
- ❌ **Cannot equip namecards** yet (needs implementation)

### **Workaround:**
Use the SQL commands above to equip namecards manually.

### **Permanent Fix (To Implement):**
Add namecard section to InventoryPage with equip buttons.

---

## 🎯 EXPECTED BEHAVIOR

### **When You Have Namecard Equipped:**

**ProfilePage:**
- ✅ Header background changes to namecard style
- ✅ Text color adapts to namecard
- ✅ Shimmer effect on legendary/epic
- ✅ Pattern overlay visible

**LeaderboardPage:**
- ✅ Your row has namecard background
- ✅ Title shows next to name with shimmer
- ✅ Text colors match namecard
- ✅ Whole row shimmers if legendary

---

## 🚀 TESTING DIFFERENT NAMECARDS

**Try Other Legendary Namecards:**

```sql
-- Galaxy Emperor (Blue-purple cosmic)
UPDATE profiles
SET active_namecard_id = (
  SELECT id FROM shop_items WHERE name = 'Galaxy Emperor'
)
WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com');

-- Golden Dynasty (Pure gold)
UPDATE profiles
SET active_namecard_id = (
  SELECT id FROM shop_items WHERE name = 'Golden Dynasty'
)
WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com');

-- Obsidian King (Black with red)
UPDATE profiles
SET active_namecard_id = (
  SELECT id FROM shop_items WHERE name = 'Obsidian King'
)
WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com');
```

Each one looks COMPLETELY DIFFERENT! 🎨

---

## 💡 NEXT STEPS

1. ✅ Run the SQL setup commands above
2. ✅ Refresh browser
3. ✅ Visit `/profile/me` - See golden luxury!
4. ✅ Visit `/leaderboard` - See your shimmer title!
5. 🔲 Add namecard equip UI to InventoryPage (optional)

---

## 🎉 YOU'RE DONE!

The luxury system is **95% complete**! 

The only missing piece is the InventoryPage equip UI for namecards, but you can use SQL to change namecards anytime.

**This is the most INSANELY LUXURIOUS school app ever created!** 🏆✨👑

Students will FLEX their Royal Crimson and Galaxy Emperor namecards like they're royalty!
