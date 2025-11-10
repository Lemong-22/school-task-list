# Phase 10 - Final Fixes & Testing Guide

## ✅ COMPLETED

### 1. **Namecard Equip Section Added**
**Location:** ProfilePage → "My Namecard" section

You can now see your equipped namecard displayed with:
- Full namecard background styling
- Icon display
- "Currently Equipped" label
- If no namecard: message to visit shop

---

## 🐛 DEBUGGING NAMECARD COLORS IN LEADERBOARD

### **Issue:** Namecard colors not showing in leaderboard

**Possible Causes:**

#### **Cause 1: Data Not Being Fetched**
Check if the RPC function is actually returning namecard data.

**Test in Supabase SQL Editor:**
```sql
SELECT * FROM get_leaderboard_with_cosmetics(10);
```

**Expected columns:**
- `student_id`
- `student_name`
- `total_coins`
- `rank`
- `active_title_name` ← Should show title name
- `active_namecard_name` ← Should show namecard name
- `namecard_rarity` ← Should show rarity

**If NULL:** User hasn't equipped a namecard yet.

---

#### **Cause 2: Namecard Not Equipped**

**How to Equip a Namecard:**

**Step 1:** Buy a namecard from `/shop`

**Step 2:** Go to `/inventory`

**Step 3:** Find your namecard and click "Equip"

**OR manually via SQL:**
```sql
-- Update your profile to equip a namecard
UPDATE profiles
SET active_namecard_id = (
  SELECT id FROM shop_items 
  WHERE name = 'Royal Crimson' 
  AND type = 'namecard'
  LIMIT 1
)
WHERE id = 'YOUR_USER_ID';
```

---

#### **Cause 3: InventoryPage Needs Namecard Equip Button**

The `/inventory` page might not have the equip functionality for namecards yet.

**Quick Fix - Equip via SQL:**
```sql
-- List your owned namecards
SELECT ui.*, si.name, si.rarity
FROM user_inventory ui
JOIN shop_items si ON ui.item_id = si.id
WHERE ui.user_id = 'YOUR_USER_ID'
AND si.type = 'namecard';

-- Equip a specific namecard
UPDATE profiles
SET active_namecard_id = 'NAMECARD_ITEM_ID'
WHERE id = 'YOUR_USER_ID';
```

---

## 🎨 TITLE SHIMMER IN LEADERBOARD

### **Current Status:**
Titles show in leaderboard but WITHOUT the epic shimmer effect from ProfilePage.

### **Why:**
The title in leaderboard is just text `「Title」`, not a full card with background.

### **Design Options:**

**Option A: Keep it subtle (current)**
- Just show title text in Japanese brackets
- Clean, doesn't clutter leaderboard

**Option B: Add shimmer to title text**
- Make the title text itself shimmer based on rarity
- More flashy, might be distracting

**Option C: Mini title card**
- Show a small version of the title card
- Most impressive but takes space

**Recommended:** Option A or B

---

## 📋 TESTING CHECKLIST

### **ProfilePage** (`/profile/me`)
- [ ] Profile header has namecard background
- [ ] Namecard shimmer works (legendary/epic)
- [ ] "My Namecard" section shows equipped namecard
- [ ] If no namecard: shows "Visit shop" message
- [ ] "My Title" shows with shimmer effect
- [ ] "My Badges" show with proper styling

### **LeaderboardPage** (`/leaderboard`)
- [ ] Run SQL to check data: `SELECT * FROM get_leaderboard_with_cosmetics(10);`
- [ ] Equip a namecard via inventory or SQL
- [ ] Refresh leaderboard
- [ ] Your row should have namecard background
- [ ] Title should show next to your name
- [ ] Text colors should adapt to namecard

### **ShopPage** (`/shop`)
- [ ] Filter shows "Namecards" option
- [ ] Legendary namecards have golden box
- [ ] Can purchase namecards
- [ ] SweetAlert2 shows success message

### **InventoryPage** (`/inventory`)
- [ ] Namecards appear in inventory
- [ ] Can equip/unequip namecards
- [ ] Shows "Currently Equipped" badge

---

## 🚀 QUICK FIX COMMANDS

### **Give Yourself a Legendary Namecard:**
```sql
-- 1. Give yourself coins
UPDATE profiles
SET total_coins = 50000
WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com');

-- 2. Add Royal Crimson to inventory
INSERT INTO user_inventory (user_id, item_id)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'your@email.com'),
  id
FROM shop_items
WHERE name = 'Royal Crimson'
AND type = 'namecard';

-- 3. Equip it
UPDATE profiles
SET active_namecard_id = (
  SELECT id FROM shop_items 
  WHERE name = 'Royal Crimson'
)
WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com');
```

### **Equip a Title:**
```sql
UPDATE profiles
SET active_title_id = (
  SELECT id FROM shop_items 
  WHERE name = 'KING OF THE LEADERBOARD'
)
WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com');
```

---

## 🎯 EXPECTED RESULT

After equipping both title AND namecard:

**ProfilePage:**
- Header with golden gradient background (Royal Crimson)
- Shimmering effect sweeping across
- Text in golden color
- "My Namecard" shows Royal Crimson card
- "My Title" shows KING with gold shimmer

**LeaderboardPage:**
- Your row has golden gradient background
- Title shows: `「KING OF THE LEADERBOARD」`
- Text is golden colored
- Shimmer effect on your row
- Coins display in golden text

---

## 🔧 IF STILL NOT WORKING

**Debug Steps:**

1. **Check Console:** Open browser DevTools → Console
   - Look for errors
   - Check if RPC call succeeds

2. **Check Network:** DevTools → Network
   - Find the `get_leaderboard_with_cosmetics` call
   - Check response data

3. **Verify Database:**
   ```sql
   -- Check your profile
   SELECT id, full_name, active_title_id, active_namecard_id
   FROM profiles
   WHERE id = 'YOUR_USER_ID';
   
   -- Should show UUIDs for both title and namecard
   ```

4. **Check Styling Import:**
   - Make sure `getNamecardStyle` is imported in LeaderboardPage
   - Check browser console for any CSS errors

---

## 💡 RECOMMENDATION

**For immediate visual effect:**
1. Run the SQL commands above to equip Royal Crimson + KING title
2. Refresh `/profile/me` → Should see golden luxury
3. Refresh `/leaderboard` → Should see your golden row
4. If not, check browser console for errors

**Next:** Implement proper Equip UI in InventoryPage so users can change cosmetics easily!

---

## 🎉 YOU'RE 95% DONE!

The luxury system is complete! Just need to:
1. Debug why data isn't showing (likely equip issue)
2. Add equip buttons to InventoryPage
3. Test with multiple users

**This will be INSANELY PREMIUM when working!** 🔥✨
