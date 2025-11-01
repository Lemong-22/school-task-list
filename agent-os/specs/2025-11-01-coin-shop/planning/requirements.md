# Coin Shop - Requirements Document

**Feature:** Phase 4.2 - Coin Shop  
**Date:** 2025-11-01  
**Status:** Research Complete  
**Phase:** Phase 4.2 - Refinement & UI/UX Polish

---

## 1. Overview

This document defines all functional and non-functional requirements for the Coin Shop feature, which enables students to spend their earned coins on cosmetic items (Titles and Badges) that personalize their profile pages.

## 2. Business Context

The Coin Shop system aims to:
- Provide meaningful rewards for students who earn coins through task completion
- Increase student engagement through profile customization
- Create a sense of achievement and status through rare cosmetic items
- Build upon the Profile Page (Phase 4.1) infrastructure

## 3. Core Business Rules

### 3.1 Shop Items & Pricing

**Item Types (MVP):**
- **Titles (Gelar):** Text-based decorative titles displayed prominently on the user's profile
- **Badges (Lencana):** Visual icons displayed in the badge gallery on the user's profile

**Rarity-Based Pricing:**
- **Common items:** 50 coins
- **Rare items:** 150 coins
- **Epic items:** 500 coins

**Item Availability:**
- All shop items are available to all students
- No level or achievement requirements for MVP
- Items are one-time purchases (cannot buy duplicates)

### 3.2 Purchase Mechanics

**Purchase Rules:**
- Students can only purchase items if they have sufficient coins
- Purchase cost is deducted from `profiles.total_coins`
- Purchases are recorded in `user_inventory` table
- Purchases are irreversible (no refunds in MVP)
- Each item can only be purchased once per user

**Coin Deduction:**
- Transaction must be atomic (deduct coins AND add to inventory in single operation)
- If transaction fails, no changes should be committed
- Prevent negative coin balance through database constraints and application logic

### 3.3 Equip/Display Mechanics

**Title Equipping:**
- Users can equip **exactly 1 active Title** at a time
- Equipped title is displayed prominently on their profile page
- Users can change their active title at any time from owned titles
- Active title is stored in `profiles.active_title_id`
- Users can unequip their title (set to NULL)

**Badge Display:**
- Users can display up to **6 Badges** in their profile badge gallery
- Users can select which badges to display from their owned badges
- Badge display order can be customized by the user
- Equipped badges are stored in `profiles.equipped_badges` (JSONB array of item IDs)

## 4. Functional Requirements

### FR-1: Shop Browse Page
**Priority:** High  
**Description:** Students must be able to browse all available shop items.

**Acceptance Criteria:**
- Display all shop items in a grid or list layout
- Each item shows: name, type (Title/Badge), rarity, price, and visual preview
- Items are filterable by type (All, Titles, Badges)
- Items are sortable by: Price (low to high, high to low), Rarity, Name
- Items already owned by the user are visually marked as "Owned"
- Items the user cannot afford are visually marked as "Not enough coins"
- Current user's coin balance is prominently displayed

### FR-2: Item Purchase
**Priority:** High  
**Description:** Students must be able to purchase items from the shop.

**Acceptance Criteria:**
- Each item has a "Buy" button (disabled if already owned or insufficient coins)
- Clicking "Buy" shows a confirmation dialog with item details and cost
- Successful purchase:
  - Deducts coins from user's balance
  - Adds item to user's inventory
  - Shows success message with updated coin balance
  - Updates UI to mark item as "Owned"
- Failed purchase (insufficient coins):
  - Shows error message: "You don't have enough coins!"
  - No changes to coin balance or inventory
- Failed purchase (already owned):
  - Button is disabled and shows "Owned"

### FR-3: Inventory Management
**Priority:** High  
**Description:** Users must be able to view all items they own.

**Acceptance Criteria:**
- Users can access their inventory from their profile page or a dedicated "My Items" page
- Inventory displays all owned items grouped by type (Titles, Badges)
- Each item shows: name, rarity, purchase date, and "Equip" action
- Current equipped status is clearly indicated (e.g., "Equipped" badge or checkmark)

### FR-4: Equip Title
**Priority:** High  
**Description:** Users must be able to equip and unequip titles.

**Acceptance Criteria:**
- Users can equip a title from their inventory
- Only 1 title can be equipped at a time
- Equipping a new title automatically unequips the previous one
- Users can unequip their current title (revert to no title)
- Equipped title is immediately visible on their profile page
- Title is displayed to all users who view the profile

### FR-5: Equip Badges
**Priority:** High  
**Description:** Users must be able to equip and manage their badge display.

**Acceptance Criteria:**
- Users can select up to 6 badges to display on their profile
- Users can reorder their displayed badges
- Users can unequip individual badges
- Changes are saved and immediately reflected on their profile page
- Badges are displayed to all users who view the profile

### FR-6: Profile Page Integration
**Priority:** High  
**Description:** Equipped items must be displayed on the user's profile page.

**Acceptance Criteria:**
- If user has an equipped title, it displays in the Title area (Phase 4.1 slot)
- If user has no equipped title, show default message: "Belum ada gelar dipilih"
- Equipped badges display in the Badge Gallery (Phase 4.1 slot)
- Empty badge slots show placeholder message: "Belum ada lencana yang dimiliki"
- Badge gallery shows maximum 6 badges
- All equipped items are visible to other users viewing the profile

## 5. Non-Functional Requirements

### NFR-1: Performance
- Shop page must load all items in under 2 seconds
- Purchase transaction must complete in under 1 second
- Equip/unequip actions must reflect on profile in under 1 second

### NFR-2: Security
- All purchase transactions must be server-side validated
- Users cannot purchase items they already own
- Users cannot purchase items with insufficient coins
- Users cannot equip items they don't own
- Coin balance cannot go negative

### NFR-3: Data Integrity
- Purchase transactions must be atomic (all-or-nothing)
- Equipped items must exist in user's inventory
- Active title ID must reference a valid shop item owned by the user
- Equipped badge IDs must reference valid shop items owned by the user

### NFR-4: Usability
- Shop UI must be intuitive and visually appealing
- Clear visual feedback for all user actions (purchase, equip, unequip)
- Error messages must be helpful and actionable
- Mobile-responsive design for all shop and inventory pages

## 6. Out of Scope (Deferred Features)

The following features are explicitly out of scope for Phase 4.2:

- ❌ Limited-time or seasonal items
- ❌ Item trading between users
- ❌ Gifting items to other users
- ❌ Selling/refunding purchased items
- ❌ Achievement-locked items (require specific accomplishments)
- ❌ Animated badges or special effects
- ❌ Profile themes/namecards
- ❌ Item previews on profile before purchase
- ❌ Wishlist or favorites system

## 7. Database Requirements

### New Tables Required:
1. **`shop_items`** - Master catalog of all purchasable items
2. **`user_inventory`** - Tracks ownership of items per user

### Modified Tables:
1. **`profiles`** - Add columns:
   - `active_title_id` (UUID, nullable, FK to shop_items)
   - `equipped_badges` (JSONB, array of up to 6 item IDs)

## 8. Success Criteria

The Coin Shop feature will be considered successful when:
- ✅ Students can browse and purchase at least 10 different items (5 titles, 5 badges)
- ✅ Students can equip purchased titles and badges
- ✅ Equipped items are visible on profile pages to all users
- ✅ All purchases correctly deduct coins from user balance
- ✅ No users can exploit the system to get free items or duplicate coins
- ✅ Zero data integrity issues or orphaned records

## 9. Dependencies

### Required Completed Features:
- ✅ Phase 3: Gamification System (coin earning mechanism)
- ✅ Phase 4.1: User Profile Page (Title and Badge display slots)

### External Dependencies:
- Badge icon assets (SVG or PNG files)
- Title text content and styling guidelines

## 10. Acceptance Testing Scenarios

### Scenario 1: First-Time Shop Visit
1. Student with 0 coins visits shop
2. All items are visible but marked as "Not enough coins"
3. Student cannot purchase any items

### Scenario 2: Successful Purchase
1. Student with 200 coins visits shop
2. Student purchases a Common Title (50 coins)
3. Coin balance updates to 150 coins
4. Item appears in inventory
5. Item is marked as "Owned" in shop

### Scenario 3: Equip and Display
1. Student purchases a Title and 3 Badges
2. Student equips the Title from inventory
3. Student selects all 3 Badges to display
4. Student views their profile - Title and Badges are visible
5. Another user views the student's profile - Title and Badges are visible

### Scenario 4: Insufficient Funds
1. Student with 100 coins attempts to purchase Epic Badge (500 coins)
2. Purchase button is disabled or shows error
3. No changes to coin balance or inventory

### Scenario 5: Change Equipped Items
1. Student owns 2 Titles and 8 Badges
2. Student equips Title A
3. Student later equips Title B (Title A is auto-unequipped)
4. Student displays 6 badges, then changes to display a different set of 6 badges
5. Profile reflects the latest selections

---

**Document Status:** ✅ Complete  
**Next Step:** Create Technical Architecture Document
