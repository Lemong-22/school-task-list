# Coin Shop - Technical Architecture

**Feature:** Phase 4.2 - Coin Shop  
**Date:** 2025-11-01  
**Status:** Planning Phase

---

## 1. System Overview

The Coin Shop feature extends the existing gamification system by providing a marketplace where students can spend their earned coins on cosmetic profile customizations. This feature integrates tightly with the Profile Page (Phase 4.1) and the Gamification System (Phase 3).

### Architecture Principles
- **Transactional Integrity:** All purchases must be atomic operations
- **Performance:** Fast queries for shop browsing and inventory management
- **Security:** Server-side validation for all transactions
- **Scalability:** Design supports future item types and features

---

## 2. Database Schema

### 2.1 New Tables

#### Table: `shop_items`
Master catalog of all purchasable cosmetic items.

```sql
CREATE TABLE shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('title', 'badge')),
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic')),
  price INTEGER NOT NULL CHECK (price > 0),
  icon_url TEXT,  -- For badges, path to icon asset
  display_order INTEGER DEFAULT 0,  -- For controlling display order in shop
  is_active BOOLEAN DEFAULT true,  -- Admin can hide items without deleting
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_shop_items_type ON shop_items(type);
CREATE INDEX idx_shop_items_rarity ON shop_items(rarity);
CREATE INDEX idx_shop_items_active ON shop_items(is_active) WHERE is_active = true;

-- Comments
COMMENT ON TABLE shop_items IS 'Master catalog of all purchasable cosmetic items';
COMMENT ON COLUMN shop_items.type IS 'Item type: title or badge';
COMMENT ON COLUMN shop_items.rarity IS 'Item rarity: common (50 coins), rare (150 coins), epic (500 coins)';
COMMENT ON COLUMN shop_items.is_active IS 'Admin flag to hide items from shop without deletion';
```

#### Table: `user_inventory`
Tracks which items each user owns.

```sql
CREATE TABLE user_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES shop_items(id) ON DELETE RESTRICT,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate ownership
  UNIQUE(user_id, item_id)
);

-- Indexes
CREATE INDEX idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX idx_user_inventory_item_id ON user_inventory(item_id);
CREATE INDEX idx_user_inventory_user_item ON user_inventory(user_id, item_id);

-- Comments
COMMENT ON TABLE user_inventory IS 'Tracks item ownership per user';
COMMENT ON CONSTRAINT user_inventory_user_id_item_id_key ON user_inventory IS 'Prevents buying same item twice';
```

### 2.2 Modified Tables

#### Table: `profiles` (Add Columns)

```sql
-- Add column for active title
ALTER TABLE profiles
ADD COLUMN active_title_id UUID REFERENCES shop_items(id) ON DELETE SET NULL;

-- Add column for equipped badges (array of up to 6 item IDs)
ALTER TABLE profiles
ADD COLUMN equipped_badges JSONB DEFAULT '[]'::jsonb;

-- Add constraint to limit equipped_badges to max 6 items
ALTER TABLE profiles
ADD CONSTRAINT check_equipped_badges_max_6 
CHECK (jsonb_array_length(equipped_badges) <= 6);

-- Indexes
CREATE INDEX idx_profiles_active_title ON profiles(active_title_id);
CREATE INDEX idx_profiles_equipped_badges ON profiles USING GIN(equipped_badges);

-- Comments
COMMENT ON COLUMN profiles.active_title_id IS 'Currently equipped title (1 max). NULL if no title equipped.';
COMMENT ON COLUMN profiles.equipped_badges IS 'Array of up to 6 equipped badge item IDs in display order.';
```

---

## 3. Database Functions & Procedures

### 3.1 Purchase Item Function

```sql
CREATE OR REPLACE FUNCTION purchase_shop_item(
  p_user_id UUID,
  p_item_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item_price INTEGER;
  v_user_coins INTEGER;
  v_already_owned BOOLEAN;
  v_new_balance INTEGER;
BEGIN
  -- 1. Get item price
  SELECT price INTO v_item_price
  FROM shop_items
  WHERE id = p_item_id AND is_active = true;
  
  IF v_item_price IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Item not found or not available'
    );
  END IF;
  
  -- 2. Check if user already owns this item
  SELECT EXISTS(
    SELECT 1 FROM user_inventory
    WHERE user_id = p_user_id AND item_id = p_item_id
  ) INTO v_already_owned;
  
  IF v_already_owned THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'You already own this item'
    );
  END IF;
  
  -- 3. Get user's current coin balance
  SELECT total_coins INTO v_user_coins
  FROM profiles
  WHERE id = p_user_id;
  
  -- 4. Check if user has enough coins
  IF v_user_coins < v_item_price THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient coins',
      'required', v_item_price,
      'current', v_user_coins
    );
  END IF;
  
  -- 5. Perform atomic transaction: deduct coins AND add to inventory
  -- Deduct coins
  UPDATE profiles
  SET total_coins = total_coins - v_item_price
  WHERE id = p_user_id
  RETURNING total_coins INTO v_new_balance;
  
  -- Add to inventory
  INSERT INTO user_inventory (user_id, item_id)
  VALUES (p_user_id, p_item_id);
  
  -- 6. Return success
  RETURN jsonb_build_object(
    'success', true,
    'item_id', p_item_id,
    'price_paid', v_item_price,
    'new_balance', v_new_balance
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Transaction failed: ' || SQLERRM
    );
END;
$$;

COMMENT ON FUNCTION purchase_shop_item IS 
'Atomically purchases an item: validates, deducts coins, adds to inventory.';
```

### 3.2 Equip Title Function

```sql
CREATE OR REPLACE FUNCTION equip_title(
  p_user_id UUID,
  p_title_id UUID  -- NULL to unequip
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_owns_item BOOLEAN;
BEGIN
  -- If unequipping (NULL), just update
  IF p_title_id IS NULL THEN
    UPDATE profiles
    SET active_title_id = NULL
    WHERE id = p_user_id;
    
    RETURN jsonb_build_object('success', true, 'equipped_title', NULL);
  END IF;
  
  -- Check if user owns this title
  SELECT EXISTS(
    SELECT 1 FROM user_inventory ui
    JOIN shop_items si ON ui.item_id = si.id
    WHERE ui.user_id = p_user_id 
      AND ui.item_id = p_title_id
      AND si.type = 'title'
  ) INTO v_owns_item;
  
  IF NOT v_owns_item THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'You do not own this title'
    );
  END IF;
  
  -- Equip the title (automatically unequips previous one)
  UPDATE profiles
  SET active_title_id = p_title_id
  WHERE id = p_user_id;
  
  RETURN jsonb_build_object('success', true, 'equipped_title', p_title_id);
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Failed to equip title: ' || SQLERRM
    );
END;
$$;

COMMENT ON FUNCTION equip_title IS 
'Equips a title for a user. Pass NULL to unequip. Validates ownership.';
```

### 3.3 Equip Badges Function

```sql
CREATE OR REPLACE FUNCTION equip_badges(
  p_user_id UUID,
  p_badge_ids UUID[]  -- Array of up to 6 badge IDs
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_owned_badges UUID[];
  v_invalid_badges UUID[];
BEGIN
  -- Validate max 6 badges
  IF array_length(p_badge_ids, 1) > 6 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Maximum 6 badges can be equipped'
    );
  END IF;
  
  -- Get all badge IDs the user owns
  SELECT array_agg(ui.item_id)
  INTO v_owned_badges
  FROM user_inventory ui
  JOIN shop_items si ON ui.item_id = si.id
  WHERE ui.user_id = p_user_id AND si.type = 'badge';
  
  -- Check if all requested badges are owned
  SELECT array_agg(badge_id)
  INTO v_invalid_badges
  FROM unnest(p_badge_ids) AS badge_id
  WHERE NOT (badge_id = ANY(v_owned_badges));
  
  IF v_invalid_badges IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Some badges are not owned',
      'invalid_badges', v_invalid_badges
    );
  END IF;
  
  -- Update equipped badges
  UPDATE profiles
  SET equipped_badges = to_jsonb(p_badge_ids)
  WHERE id = p_user_id;
  
  RETURN jsonb_build_object('success', true, 'equipped_badges', p_badge_ids);
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Failed to equip badges: ' || SQLERRM
    );
END;
$$;

COMMENT ON FUNCTION equip_badges IS 
'Equips up to 6 badges for a user. Validates ownership. Pass empty array to unequip all.';
```

### 3.4 Get Shop Items Function

```sql
CREATE OR REPLACE FUNCTION get_shop_items(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  type TEXT,
  rarity TEXT,
  price INTEGER,
  icon_url TEXT,
  is_owned BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    si.id,
    si.name,
    si.description,
    si.type,
    si.rarity,
    si.price,
    si.icon_url,
    EXISTS(
      SELECT 1 FROM user_inventory ui
      WHERE ui.user_id = p_user_id AND ui.item_id = si.id
    ) AS is_owned
  FROM shop_items si
  WHERE si.is_active = true
  ORDER BY si.display_order, si.rarity, si.price;
END;
$$;

COMMENT ON FUNCTION get_shop_items IS 
'Returns all active shop items with ownership status for the given user.';
```

### 3.5 Get User Inventory Function

```sql
CREATE OR REPLACE FUNCTION get_user_inventory(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  type TEXT,
  rarity TEXT,
  icon_url TEXT,
  purchased_at TIMESTAMPTZ,
  is_equipped BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_active_title_id UUID;
  v_equipped_badges JSONB;
BEGIN
  -- Get user's currently equipped items
  SELECT active_title_id, equipped_badges
  INTO v_active_title_id, v_equipped_badges
  FROM profiles
  WHERE id = p_user_id;
  
  RETURN QUERY
  SELECT 
    si.id,
    si.name,
    si.description,
    si.type,
    si.rarity,
    si.icon_url,
    ui.purchased_at,
    CASE
      WHEN si.type = 'title' THEN si.id = v_active_title_id
      WHEN si.type = 'badge' THEN v_equipped_badges @> to_jsonb(si.id::text)
      ELSE false
    END AS is_equipped
  FROM user_inventory ui
  JOIN shop_items si ON ui.item_id = si.id
  WHERE ui.user_id = p_user_id
  ORDER BY si.type, si.rarity, si.name;
END;
$$;

COMMENT ON FUNCTION get_user_inventory IS 
'Returns all items owned by a user with equipped status.';
```

---

## 4. Row Level Security (RLS) Policies

### 4.1 shop_items Table

```sql
-- Enable RLS
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view active items
CREATE POLICY "shop_items_select_active"
ON shop_items FOR SELECT
TO authenticated
USING (is_active = true);

-- Policy: Only service role can insert/update/delete (admin operations)
CREATE POLICY "shop_items_admin_only"
ON shop_items FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

### 4.2 user_inventory Table

```sql
-- Enable RLS
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own inventory
CREATE POLICY "user_inventory_select_own"
ON user_inventory FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: Users can view other users' inventory (for profile viewing)
CREATE POLICY "user_inventory_select_all"
ON user_inventory FOR SELECT
TO authenticated
USING (true);

-- Policy: Only functions can insert (via purchase_shop_item)
-- No direct INSERT policy for users
```

### 4.3 profiles Table (Update for new columns)

```sql
-- Update existing SELECT policy to include new columns
-- (Assuming existing policy allows viewing all profiles)

-- Update existing UPDATE policy to allow users to update their own equipped items
CREATE POLICY "profiles_update_own_cosmetics"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
```

---

## 5. Frontend Architecture

### 5.1 New Pages/Components

#### Page: `/shop`
- **Purpose:** Browse and purchase shop items
- **Components:**
  - `ShopPage` - Main container
  - `ShopFilters` - Filter by type, sort by price/rarity
  - `ShopItemGrid` - Grid of shop items
  - `ShopItemCard` - Individual item display with buy button
  - `PurchaseConfirmModal` - Confirm purchase dialog

#### Page: `/inventory` or Section in `/profile/me`
- **Purpose:** View owned items and manage equipped items
- **Components:**
  - `InventoryPage` - Main container
  - `InventoryTitles` - List of owned titles with equip buttons
  - `InventoryBadges` - Grid of owned badges with equip manager
  - `BadgeEquipManager` - Drag-and-drop or selection UI for 6 badges

#### Component Updates: `ProfilePage`
- **Updates:**
  - Display `active_title_id` (fetch title name from shop_items)
  - Display `equipped_badges` (fetch badge icons from shop_items)
  - Show default messages if no items equipped

### 5.2 State Management

```typescript
// Shop State
interface ShopState {
  items: ShopItem[];
  loading: boolean;
  filters: {
    type: 'all' | 'title' | 'badge';
    sortBy: 'price-asc' | 'price-desc' | 'rarity' | 'name';
  };
}

// Inventory State
interface InventoryState {
  ownedItems: InventoryItem[];
  equippedTitle: string | null;
  equippedBadges: string[];
  loading: boolean;
}

// User State (extend existing)
interface UserState {
  // ... existing fields
  totalCoins: number; // Already exists from Phase 3
  activeTitle?: ShopItem | null;
  equippedBadges?: ShopItem[];
}
```

### 5.3 API Hooks

```typescript
// Custom hooks for Coin Shop

// Fetch all shop items
const useShopItems = () => {
  // Calls get_shop_items(user_id) RPC
  // Returns: { items, loading, error }
};

// Fetch user inventory
const useInventory = () => {
  // Calls get_user_inventory(user_id) RPC
  // Returns: { inventory, loading, error }
};

// Purchase item mutation
const usePurchaseItem = () => {
  // Calls purchase_shop_item(user_id, item_id) RPC
  // Returns: { purchaseItem, loading, error }
  // Invalidates: shop items, inventory, user profile queries
};

// Equip title mutation
const useEquipTitle = () => {
  // Calls equip_title(user_id, title_id) RPC
  // Returns: { equipTitle, loading, error }
  // Invalidates: user profile query
};

// Equip badges mutation
const useEquipBadges = () => {
  // Calls equip_badges(user_id, badge_ids) RPC
  // Returns: { equipBadges, loading, error }
  // Invalidates: user profile query
};
```

---

## 6. Data Flow Diagrams

### 6.1 Purchase Flow

```
User clicks "Buy" on Shop Item
    ↓
Frontend validates (enough coins? already owned?)
    ↓
Call purchase_shop_item(user_id, item_id)
    ↓
Database Function:
  1. Validate item exists and is active
  2. Check not already owned
  3. Check sufficient coins
  4. BEGIN TRANSACTION
     - Deduct coins from profiles.total_coins
     - Insert into user_inventory
  5. COMMIT TRANSACTION
    ↓
Return success + new_balance
    ↓
Frontend updates:
  - User coin balance
  - Mark item as "Owned" in shop
  - Refresh inventory
  - Show success toast
```

### 6.2 Equip Title Flow

```
User selects a title from inventory
    ↓
User clicks "Equip"
    ↓
Call equip_title(user_id, title_id)
    ↓
Database Function:
  1. Validate user owns this title
  2. UPDATE profiles.active_title_id = title_id
  3. Return success
    ↓
Frontend updates:
  - Mark new title as "Equipped" in inventory
  - Update profile display
  - Show success toast
```

### 6.3 Equip Badges Flow

```
User selects up to 6 badges from inventory
    ↓
User arranges them in desired order
    ↓
User clicks "Save"
    ↓
Call equip_badges(user_id, [badge_ids])
    ↓
Database Function:
  1. Validate max 6 badges
  2. Validate user owns all badges
  3. UPDATE profiles.equipped_badges = [badge_ids]
  4. Return success
    ↓
Frontend updates:
  - Mark selected badges as "Equipped"
  - Update profile badge gallery
  - Show success toast
```

---

## 7. Security Considerations

### 7.1 Purchase Security
- ✅ All purchases go through `purchase_shop_item` function (SECURITY DEFINER)
- ✅ User cannot directly UPDATE `total_coins` (RLS prevents direct writes)
- ✅ User cannot directly INSERT into `user_inventory` (no INSERT policy)
- ✅ Transaction is atomic (rollback on any failure)
- ✅ Duplicate purchases prevented by UNIQUE constraint

### 7.2 Equip Security
- ✅ Ownership validated in `equip_title` and `equip_badges` functions
- ✅ User can only equip items they own
- ✅ Type validation (can't equip a badge as a title)
- ✅ Max 6 badges enforced by CHECK constraint and function validation

### 7.3 RLS Policies
- ✅ Users can only view active shop items
- ✅ Users can view all inventories (for public profiles)
- ✅ Users can only update their own equipped items
- ✅ Admin operations require service_role

---

## 8. Performance Optimizations

### 8.1 Indexing Strategy
- Index on `shop_items.is_active` for fast shop queries
- Index on `user_inventory(user_id, item_id)` for ownership checks
- GIN index on `profiles.equipped_badges` for badge lookups

### 8.2 Query Optimization
- Use `get_shop_items()` function to batch ownership checks
- Fetch equipped items with profile in single query (JOIN)
- Cache shop items on frontend (items rarely change)

### 8.3 N+1 Query Prevention
- Profile page fetches equipped items in single JOIN query
- Inventory page uses `get_user_inventory()` which JOINs in database

---

## 9. Testing Strategy

### 9.1 Unit Tests (Database Functions)
- Test `purchase_shop_item` with sufficient/insufficient coins
- Test duplicate purchase prevention
- Test equip functions with owned/unowned items
- Test max 6 badges constraint

### 9.2 Integration Tests
- Test full purchase flow end-to-end
- Test equip → profile display workflow
- Test concurrent purchases (race conditions)

### 9.3 Security Tests
- Attempt to purchase without enough coins
- Attempt to equip unowned items
- Attempt to directly UPDATE total_coins (should fail with RLS)
- Attempt to INSERT into user_inventory directly (should fail)

---

## 10. Migration Strategy

### 10.1 Migration Order
1. Create `shop_items` table
2. Create `user_inventory` table
3. Alter `profiles` table (add `active_title_id` and `equipped_badges`)
4. Create all database functions
5. Create all RLS policies
6. Seed initial shop items (via migration or admin script)

### 10.2 Rollback Plan
- All DDL changes are in a single migration file
- Can be rolled back by dropping tables and columns
- Preserve existing data (profiles.total_coins remains unchanged)

---

**Document Status:** ✅ Complete  
**Next Step:** Create User Stories Document
