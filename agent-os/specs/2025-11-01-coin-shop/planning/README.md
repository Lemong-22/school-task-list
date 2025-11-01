# Coin Shop - Planning Summary

**Feature:** Phase 4.2 - Coin Shop  
**Date:** 2025-11-01  
**Status:** ✅ Research Complete - Ready for Implementation

---

## Executive Summary

The Coin Shop feature enables students to spend their earned coins on cosmetic items (Titles and Badges) that personalize their profile pages. This builds upon the gamification system (Phase 3) and Profile Page (Phase 4.1) to create a complete reward cycle: earn coins → spend coins → showcase achievements.

---

## Key Decisions Made

### 1. Item Types (MVP)
- **Titles (Gelar):** Text-based decorative titles
- **Badges (Lencana):** Visual icon badges
- ❌ Deferred: Namecards, profile themes, animated items

### 2. Pricing Strategy
- **Rarity-Based Pricing:**
  - Common items: 50 coins
  - Rare items: 150 coins
  - Epic items: 500 coins

### 3. Database Architecture
- **New Tables:**
  - `shop_items` - Master catalog of purchasable items
  - `user_inventory` - Tracks item ownership per user
- **Profile Extensions:**
  - `active_title_id` - Currently equipped title (max 1)
  - `equipped_badges` - JSONB array of up to 6 badge IDs

### 4. Equip Mechanics
- **Titles:** Equip exactly 1 at a time
- **Badges:** Display up to 6 in badge gallery
- **Location:** Managed from Profile Page

---

## Planning Documents

1. **[requirements.md](./requirements.md)** - Functional and non-functional requirements
2. **[technical-architecture.md](./technical-architecture.md)** - Database schema, functions, RLS policies, API design
3. **[user-stories.md](./user-stories.md)** - User stories organized by epic (22 stories, 82 points)
4. **[implementation-plan.md](./implementation-plan.md)** - Step-by-step implementation guide with timeline

---

## Scope Summary

### In Scope (MVP)
✅ Shop browsing with filters and sorting  
✅ Purchase items with coin deduction  
✅ Inventory management  
✅ Equip/unequip titles (1 at a time)  
✅ Equip/unequip badges (up to 6)  
✅ Display equipped items on profile  
✅ View other users' equipped items  
✅ At least 10 initial items (5 titles, 5 badges)

### Out of Scope (Deferred)
❌ Limited-time or seasonal items  
❌ Item trading/gifting  
❌ Refunds or selling items back  
❌ Achievement-locked items  
❌ Animated badges or special effects  
❌ Profile themes/namecards  

---

## Technical Highlights

### Security Features
- All purchases via `SECURITY DEFINER` function
- Atomic transactions (deduct coins + add to inventory)
- RLS policies prevent unauthorized access
- Ownership validation before equipping
- Duplicate purchase prevention (UNIQUE constraint)

### Performance Optimizations
- Strategic indexes on `user_id`, `item_id`, `is_active`
- GIN index on `equipped_badges` JSONB column
- Single query functions to prevent N+1 problems
- Frontend caching for shop items

### Database Functions
1. `purchase_shop_item(user_id, item_id)` - Handle purchases
2. `equip_title(user_id, title_id)` - Equip/unequip titles
3. `equip_badges(user_id, badge_ids[])` - Manage badge display
4. `get_shop_items(user_id)` - Fetch shop with ownership status
5. `get_user_inventory(user_id)` - Fetch user's items with equip status

---

## Effort Estimate

### MVP Scope (High Priority Stories Only)
- **Total Story Points:** 42
- **Estimated Duration:** 4.5 days

### Full Feature (All Stories)
- **Total Story Points:** 82
- **Estimated Duration:** 6-7 days

---

## Dependencies

### Required (Already Complete)
- ✅ Phase 3: Gamification System (coin earning)
- ✅ Phase 4.1: User Profile Page (Title/Badge display slots)

### External Assets Needed
- Badge icon files (SVG or PNG, 10+ designs)
- Title text content and styling guidelines

---

## Implementation Phases

### Phase 1: Database Layer (1 day)
- Create tables, indexes, constraints
- Create database functions
- Set up RLS policies
- Seed initial shop items

### Phase 2: Backend API (0.5 day)
- TypeScript types and interfaces
- Supabase hooks (useShop, useInventory)
- Update profile hooks

### Phase 3: Frontend UI (2 days)
- Shop page with filters/sorting
- Purchase flow with confirmation
- Inventory/item management
- Profile page integration

### Phase 4: Testing & Polish (1 day)
- Database and API testing
- Frontend integration testing
- UI/UX polish and animations
- Mobile responsiveness

---

## Success Criteria

The feature will be considered complete when:

✅ Students can browse at least 10 shop items  
✅ Students can successfully purchase items with coins  
✅ Purchases correctly deduct from coin balance  
✅ Students can equip purchased titles and badges  
✅ Equipped items display on user profiles  
✅ Other users can view equipped items on profiles  
✅ All security validations prevent exploits  
✅ Zero data integrity issues or orphaned records  
✅ Mobile-responsive UI on all pages  

---

## Next Steps

1. ✅ Research Phase Complete
2. 🔄 **Ready to Start:** Implementation Phase 1 (Database Layer)
3. ⏳ Create migration file `007_coin_shop.sql`
4. ⏳ Create seed data file `008_seed_shop_items.sql`

---

**Planning Phase:** ✅ Complete  
**Research Summary:** All requirements confirmed with Product Manager  
**Ready for Implementation:** Yes  
**Blocked By:** None
