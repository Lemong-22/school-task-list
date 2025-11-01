# Coin Shop - Implementation Plan

**Feature:** Phase 4.2 - Coin Shop  
**Date:** 2025-11-01  
**Status:** Planning Phase

---

## 1. Implementation Overview

The Coin Shop feature will be implemented in 4 main phases:
1. **Database Layer** - Schema, functions, RLS policies
2. **Backend API** - Supabase integration and hooks
3. **Frontend UI** - Shop, inventory, and profile integration
4. **Testing & Polish** - QA, bug fixes, and refinements

**Estimated Duration:** 3-5 days  
**Estimated Effort:** 42 story points (MVP)

---

## 2. Phase 1: Database Layer

### 2.1 Migration File
**File:** `supabase/migrations/007_coin_shop.sql`

**Tasks:**
- [ ] Create `shop_items` table with schema
- [ ] Create `user_inventory` table with schema
- [ ] Alter `profiles` table (add `active_title_id`, `equipped_badges`)
- [ ] Add indexes for performance
- [ ] Add constraints (UNIQUE, CHECK, FK)
- [ ] Add table and column comments

**Estimated Time:** 2 hours

---

### 2.2 Database Functions
**File:** `supabase/migrations/007_coin_shop.sql` (continued)

**Tasks:**
- [ ] Create `purchase_shop_item(user_id, item_id)` function
- [ ] Create `equip_title(user_id, title_id)` function
- [ ] Create `equip_badges(user_id, badge_ids[])` function
- [ ] Create `get_shop_items(user_id)` function
- [ ] Create `get_user_inventory(user_id)` function
- [ ] Add function comments and SECURITY DEFINER
- [ ] Grant EXECUTE permissions to authenticated role

**Estimated Time:** 3 hours

---

### 2.3 RLS Policies
**File:** `supabase/migrations/007_coin_shop.sql` (continued)

**Tasks:**
- [ ] Enable RLS on `shop_items` table
- [ ] Create SELECT policy for active items
- [ ] Enable RLS on `user_inventory` table
- [ ] Create SELECT policies for inventory viewing
- [ ] Update `profiles` policies for new columns
- [ ] Test policies with different user roles

**Estimated Time:** 1 hour

---

### 2.4 Seed Data
**File:** `supabase/migrations/008_seed_shop_items.sql`

**Tasks:**
- [ ] Create at least 5 Titles (mix of common, rare, epic)
- [ ] Create at least 5 Badges (mix of common, rare, epic)
- [ ] Assign appropriate prices based on rarity
- [ ] Add descriptions and display order
- [ ] Prepare badge icon assets (SVG/PNG)

**Estimated Time:** 2 hours

**Sample Titles:**
- "Novice Learner" (Common, 50 coins)
- "Dedicated Student" (Rare, 150 coins)
- "Master Scholar" (Epic, 500 coins)

**Sample Badges:**
- "Early Bird" badge (Common, 50 coins)
- "Top Performer" badge (Rare, 150 coins)
- "Legend" badge (Epic, 500 coins)

---

## 3. Phase 2: Backend API Layer

### 3.1 TypeScript Types
**File:** `src/types/shop.ts`

```typescript
export interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  type: 'title' | 'badge';
  rarity: 'common' | 'rare' | 'epic';
  price: number;
  icon_url: string | null;
  is_owned?: boolean;
}

export interface InventoryItem extends ShopItem {
  purchased_at: string;
  is_equipped: boolean;
}

export interface PurchaseResult {
  success: boolean;
  error?: string;
  item_id?: string;
  price_paid?: number;
  new_balance?: number;
}
```

**Estimated Time:** 30 minutes

---

### 3.2 Supabase Hooks
**File:** `src/hooks/useShop.ts`

**Tasks:**
- [ ] Create `useShopItems()` hook - fetch all shop items
- [ ] Create `usePurchaseItem()` mutation hook
- [ ] Handle loading, error, and success states
- [ ] Invalidate queries after successful purchase

**Estimated Time:** 2 hours

---

**File:** `src/hooks/useInventory.ts`

**Tasks:**
- [ ] Create `useInventory()` hook - fetch user's owned items
- [ ] Create `useEquipTitle()` mutation hook
- [ ] Create `useEquipBadges()` mutation hook
- [ ] Handle optimistic updates for better UX

**Estimated Time:** 2 hours

---

### 3.3 Update Existing Hooks
**File:** `src/hooks/useProfile.ts`

**Tasks:**
- [ ] Update profile fetch to include `active_title_id`
- [ ] Update profile fetch to include `equipped_badges`
- [ ] Join with `shop_items` to get title/badge details
- [ ] Update TypeScript types

**Estimated Time:** 1 hour

---

## 4. Phase 3: Frontend UI

### 4.1 Shop Page
**File:** `src/pages/ShopPage.tsx`

**Tasks:**
- [ ] Create main shop page layout
- [ ] Display user's current coin balance
- [ ] Implement item grid/list view
- [ ] Add filter controls (All, Titles, Badges)
- [ ] Add sort controls (Price, Rarity, Name)
- [ ] Show loading and error states

**Estimated Time:** 3 hours

---

**File:** `src/components/shop/ShopItemCard.tsx`

**Tasks:**
- [ ] Display item: name, type, rarity, price, preview
- [ ] Show "Buy" button (disabled if owned or insufficient coins)
- [ ] Show "Owned" badge for purchased items
- [ ] Visual indicator for insufficient coins
- [ ] Click handler to open purchase confirmation

**Estimated Time:** 2 hours

---

**File:** `src/components/shop/PurchaseConfirmModal.tsx`

**Tasks:**
- [ ] Show item details in modal
- [ ] Show current balance and cost
- [ ] Confirm/Cancel buttons
- [ ] Call purchase mutation on confirm
- [ ] Show success/error messages
- [ ] Auto-close on success

**Estimated Time:** 2 hours

---

### 4.2 Inventory/Management Page
**File:** `src/pages/InventoryPage.tsx` or section in `ProfilePage.tsx`

**Tasks:**
- [ ] Create inventory page layout
- [ ] Group items by type (Titles, Badges)
- [ ] Show empty state if no items
- [ ] Display purchase dates
- [ ] Mark equipped items

**Estimated Time:** 2 hours

---

**File:** `src/components/inventory/TitleManager.tsx`

**Tasks:**
- [ ] List all owned titles
- [ ] Show "Equip" button for unequipped titles
- [ ] Show "Unequip" button for equipped title
- [ ] Call equip mutation on click
- [ ] Optimistic UI updates

**Estimated Time:** 2 hours

---

**File:** `src/components/inventory/BadgeManager.tsx`

**Tasks:**
- [ ] Display all owned badges
- [ ] Allow selection of up to 6 badges
- [ ] Implement drag-and-drop reordering (or up/down arrows)
- [ ] Show "Save" button
- [ ] Call equip badges mutation
- [ ] Visual feedback for equipped badges

**Estimated Time:** 4 hours

---

### 4.3 Profile Page Updates
**File:** `src/pages/ProfilePage.tsx`

**Tasks:**
- [ ] Fetch active title details (join with shop_items)
- [ ] Display equipped title prominently
- [ ] Show default message if no title equipped
- [ ] Fetch equipped badge details (join with shop_items)
- [ ] Display badge gallery (6 slots)
- [ ] Show badge icons or placeholders
- [ ] Add "Visit Shop" or "Manage Items" button

**Estimated Time:** 3 hours

---

### 4.4 Navigation Updates
**File:** `src/components/Header.tsx` or navigation component

**Tasks:**
- [ ] Add "Shop" link to main navigation
- [ ] Add "My Items" link (if separate from profile)
- [ ] Highlight active route

**Estimated Time:** 30 minutes

---

## 5. Phase 4: Testing & Polish

### 5.1 Database Testing

**Tasks:**
- [ ] Test purchase with sufficient coins
- [ ] Test purchase with insufficient coins
- [ ] Test duplicate purchase prevention
- [ ] Test equip title (owned vs. unowned)
- [ ] Test equip badges (max 6 validation)
- [ ] Test concurrent purchases (race conditions)
- [ ] Verify RLS policies block unauthorized access

**Estimated Time:** 2 hours

---

### 5.2 Frontend Testing

**Tasks:**
- [ ] Test shop filtering and sorting
- [ ] Test purchase flow (happy path)
- [ ] Test error handling (insufficient coins, network errors)
- [ ] Test equip/unequip titles
- [ ] Test badge selection and reordering
- [ ] Test profile display for own and other users
- [ ] Mobile responsiveness testing

**Estimated Time:** 3 hours

---

### 5.3 UI/UX Polish

**Tasks:**
- [ ] Add loading skeletons for shop items
- [ ] Add smooth transitions for equip/unequip
- [ ] Add success toast notifications
- [ ] Polish empty states
- [ ] Ensure consistent styling across all components
- [ ] Add icons and visual flourishes
- [ ] Accessibility improvements (keyboard navigation, ARIA labels)

**Estimated Time:** 2 hours

---

## 6. Deployment Checklist

### Pre-Deployment
- [ ] Run migration on staging database
- [ ] Seed initial shop items
- [ ] Test all functionality in staging environment
- [ ] Review security policies
- [ ] Test with different user roles

### Deployment
- [ ] Run migration on production database
- [ ] Seed production shop items
- [ ] Deploy frontend changes
- [ ] Monitor for errors in first hour

### Post-Deployment
- [ ] Verify shop is accessible
- [ ] Test purchase flow in production
- [ ] Monitor Supabase logs for errors
- [ ] Gather user feedback

---

## 7. File Structure Summary

```
supabase/migrations/
├── 007_coin_shop.sql              (Tables, functions, RLS)
└── 008_seed_shop_items.sql        (Initial shop data)

src/
├── types/
│   └── shop.ts                    (TypeScript interfaces)
├── hooks/
│   ├── useShop.ts                 (Shop API hooks)
│   ├── useInventory.ts            (Inventory API hooks)
│   └── useProfile.ts              (Updated)
├── pages/
│   ├── ShopPage.tsx               (Main shop page)
│   ├── InventoryPage.tsx          (Optional separate page)
│   └── ProfilePage.tsx            (Updated)
└── components/
    ├── shop/
    │   ├── ShopItemCard.tsx
    │   ├── ShopFilters.tsx
    │   └── PurchaseConfirmModal.tsx
    └── inventory/
        ├── TitleManager.tsx
        └── BadgeManager.tsx
```

---

## 8. Risk Assessment

### High Risk
- **Concurrent Purchases:** Two users buying the last of an item simultaneously
  - **Mitigation:** Database constraints + SERIALIZABLE transactions

### Medium Risk
- **Negative Coin Balance:** User purchasing with exactly enough coins while earning more
  - **Mitigation:** CHECK constraint on profiles.total_coins, atomic transactions

### Low Risk
- **UI State Sync:** Frontend showing outdated coin balance
  - **Mitigation:** Invalidate queries after purchases, optimistic updates

---

## 9. Success Metrics

After implementation, track:
- Number of items purchased per day/week
- Most popular items (by purchase count)
- Average coins per user
- Conversion rate (users who visit shop → users who purchase)
- Profile customization rate (% of users with equipped items)

---

## 10. Timeline Estimate

| Phase | Tasks | Duration |
|-------|-------|----------|
| Phase 1: Database | Tables, functions, RLS, seed data | 1 day |
| Phase 2: Backend | Types, hooks, API integration | 0.5 day |
| Phase 3: Frontend | Shop, inventory, profile UI | 2 days |
| Phase 4: Testing | QA, polish, bug fixes | 1 day |
| **Total** | | **4.5 days** |

---

**Document Status:** ✅ Complete  
**Next Step:** Begin Implementation (Phase 1 - Database Layer)
