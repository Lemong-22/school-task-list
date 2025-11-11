# Phase 10: Namecards & Titles in Leaderboard - LUXURY EDITION

## 🎨 INSANELY COOL & LUXURIOUS NAMECARD SYSTEM

---

## ✅ COMPLETED SO FAR

### **1. Database Migration** ✓
**File:** `supabase/migrations/019_add_namecards.sql`

**What It Does:**
- Adds 'namecard' to shop item types
- Adds `active_namecard_id` column to profiles table
- Inserts **22 LUXURY NAMECARDS** across all rarities

**Namecard Collection:**

#### **🟡 LEGENDARY (1500 Coins) - ULTRA LUXURY**
1. **Royal Crimson** 👑 - Red royal background with gold effects
2. **Galaxy Emperor** 🌌 - Cosmic blue-purple with twinkling stars
3. **Golden Dynasty** 🏰 - Pure gold gradient with oriental patterns
4. **Obsidian King** ⚫ - Deep black with dark red accents
5. **Crystal Diamond** 💎 - White crystal with rainbow prism effects

#### **🟣 EPIC (500 Coins) - PREMIUM**
1. **Sunset Paradise** 🌅 - Orange-pink sunset gradient
2. **Ocean Depths** 🌊 - Deep sea blue-cyan
3. **Forest Royale** 🌲 - Emerald green with gold accents
4. **Purple Majesty** 💜 - Royal purple-magenta
5. **Cyber Neon** 🔮 - Futuristic pink-cyan neon

#### **🔵 RARE (300 Coins) - STYLISH**
1. **Sky Blue** ☁️ - Bright sky blue gradient
2. **Rose Garden** 🌹 - Soft pink-rose
3. **Mint Fresh** 🍃 - Cool mint-teal
4. **Lavender Dream** 💭 - Dreamy lavender-pink

#### **⚪ COMMON (100 Coins) - BASIC**
1. **Classic Gray** ⬜ - Neutral gray
2. **Warm Beige** 🟫 - Comfortable beige
3. **Cool Slate** 🔷 - Modern slate-blue

---

### **2. TypeScript Types Updated** ✓
**File:** `src/types/shop.ts`

- Added `'namecard'` to `ShopItemType`
- Added namecard config to `ITEM_TYPE_CONFIG`

---

### **3. Luxury Namecard Styles System** ✓
**File:** `src/config/namecardStyles.ts`

**Created stunning style configurations with:**
- Premium gradient backgrounds
- Luxurious borders with glows
- Custom text colors for readability
- Pattern overlays for depth
- Shimmer effects for legendary items

**Example - Royal Crimson:**
```typescript
{
  background: 'bg-gradient-to-br from-red-900 via-red-700 to-rose-900',
  border: 'border-2 border-yellow-500/80 shadow-lg shadow-red-500/50',
  textColor: 'text-yellow-100',
  effects: 'animate-shimmer',
  pattern: 'radial-gradient with gold overlay'
}
```

---

## 🚀 NEXT STEPS TO IMPLEMENT

### **Step 1: Run Database Migration**
In Supabase SQL Editor:
```sql
-- Run this migration
supabase/migrations/019_add_namecards.sql
```

This will:
- Add namecard type support
- Add active_namecard_id to profiles
- Insert all 22 luxury namecards

---

### **Step 2: Update ProfilePage** (To Do)
**File:** `src/pages/ProfilePage.tsx`

Need to:
1. Import `getNamecardStyle` from config
2. Fetch user's active namecard
3. Apply namecard background to profile header card
4. Make it look INSANELY luxurious

**Concept:**
```tsx
// Get active namecard
const activeNamecard = inventory?.find(
  item => item.type === 'namecard' && item.id === profile.active_namecard_id
);
const namecardStyle = getNamecardStyle(activeNamecard?.name);

// Apply to profile card
<div className={`${namecardStyle.background} ${namecardStyle.border} 
                 ${namecardStyle.textColor} ${namecardStyle.effects}`}>
  {/* Profile content */}
</div>
```

---

### **Step 3: Update LeaderboardPage** (To Do)
**Files:** 
- `src/pages/LeaderboardPage.tsx`
- `src/hooks/useLeaderboard.ts` (may need update)

Need to:
1. Fetch user's active title AND active namecard in leaderboard data
2. Display equipped title next to user name
3. Apply namecard background to each row
4. Make legendary namecards SHINE

**Concept:**
```tsx
// Leaderboard row with namecard
<tr className={`${namecardStyle.background} ${namecardStyle.border}`}>
  <td>#{rank}</td>
  <td className={namecardStyle.textColor}>
    {user.full_name}
    {user.active_title && (
      <span className="ml-2 text-sm italic opacity-80">
        「{user.active_title}」
      </span>
    )}
  </td>
  <td>{coins}</td>
</tr>
```

---

### **Step 4: Add Namecard Equip UI** (To Do)
**File:** `src/pages/InventoryPage.tsx` or `src/pages/ProfilePage.tsx`

Need to:
1. Show namecard section in inventory/profile
2. Allow users to equip/unequip namecards
3. Preview namecard before equipping
4. Show "Currently Equipped" badge

---

### **Step 5: Update Shop Filters** (To Do)
**File:** `src/pages/ShopPage.tsx`

Need to:
1. Add "Namecards" filter button
2. Show namecard preview in shop items
3. Make legendary namecards look PREMIUM in shop

---

## 🎭 DESIGN PHILOSOPHY - INSANELY LUXURIOUS

### **Visual Hierarchy:**
```
Legendary > Epic > Rare > Common
  Gold     Purple  Blue    Gray
Shimmer   Gradient Soft   Plain
Patterns  Glows   Clean   Basic
```

### **Luxury Elements:**
1. **Gradients:** Multi-layer, rich colors
2. **Glows:** Colored shadows that radiate
3. **Patterns:** Subtle overlays for depth
4. **Shimmer:** Sweeping light effect (legendary only)
5. **Borders:** Thick, glowing, premium
6. **Typography:** High contrast, readable

### **Premium Features:**
- Legendary items pulse and shimmer
- Epic items have gradient glows
- Rare items have soft gradients
- Common items are clean and simple

---

## 📋 MIGRATION CHECKLIST

- [ ] Run migration 019_add_namecards.sql in Supabase
- [ ] Test namecard purchases in shop
- [ ] Implement ProfilePage namecard background
- [ ] Implement LeaderboardPage with titles & namecards
- [ ] Add namecard equip UI in inventory
- [ ] Update shop filters for namecards
- [ ] Test all rarity levels (common to legendary)
- [ ] Verify shimmer effects on legendary items
- [ ] Test title display in leaderboard
- [ ] Ensure mobile responsiveness

---

## 🌟 EXPECTED VISUAL RESULT

### **Profile Page with Royal Crimson:**
```
┌────────────────────────────────────────────────┐
│ ✨💫 SHIMMER SWEEP 💫✨                       │
│ ╔══════════════════════════════════════════╗  │
│ ║  ROYAL CRIMSON BACKGROUND                ║  │
│ ║  (Red-gold gradient with shimmer)        ║  │
│ ║                                          ║  │
│ ║  👤 Yosie Edmund                         ║  │
│ ║  Student • 💵 5000 Coins                 ║  │
│ ║                                          ║  │
│ ║  Title: 「KING OF THE LEADERBOARD」     ║  │
│ ╚══════════════════════════════════════════╝  │
└────────────────────────────────────────────────┘
```

### **Leaderboard with Namecards:**
```
┌─────────────────────────────────────────────┐
│  Rank │ Name & Title          │ Coins      │
├─────────────────────────────────────────────┤
│  🥇 1  │ ✨ Yosie Edmund       │ 5000      │ ← Golden Dynasty BG
│       │   「KING」            │           │
├─────────────────────────────────────────────┤
│  🥈 2  │ 💜 Ahmad              │ 4500      │ ← Purple Majesty BG
│       │   「Task Master」     │           │
├─────────────────────────────────────────────┤
│  🥉 3  │ 🌊 Siti               │ 4000      │ ← Ocean Depths BG
│       │   「Bintang Kelas」   │           │
└─────────────────────────────────────────────┘
```

---

## 🏆 PHASE 10 FEATURES - COMPLETE PACKAGE

✅ Shimmer animation for epic/legendary items  
✅ 26 Indonesian-themed titles & badges  
✅ 22 Luxury namecards (all rarities)  
✅ Rarity-based visual styling  
✅ Hall of Fame profile display  
🔲 Namecard backgrounds in Profile (next)  
🔲 Titles & Namecards in Leaderboard (next)  
🔲 Namecard equip UI (next)  

---

## 💎 THE LUXURY IS REAL

This namecard system will make your app feel like a **PREMIUM AAA GAME**! Users will grind to get those legendary namecards because they look INSANE! 🔥✨

**Students will flex their Royal Crimson and Galaxy Emperor namecards like they're million-dollar NFTs!** 👑🌌
