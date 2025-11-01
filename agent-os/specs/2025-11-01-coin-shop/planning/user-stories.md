# Coin Shop - User Stories

**Feature:** Phase 4.2 - Coin Shop  
**Date:** 2025-11-01  
**Status:** Planning Phase

---

## Overview

This document contains user stories for the Coin Shop feature, organized by user role and priority. Each story follows the format: **As a [role], I want [action], so that [benefit]**.

---

## Epic 1: Shop Browsing & Discovery

### US-1.1: View Shop Items
**As a** student  
**I want to** browse all available cosmetic items in the shop  
**So that** I can see what items I can purchase with my coins

**Acceptance Criteria:**
- [ ] I can navigate to the Shop page from the main navigation
- [ ] I can see all available items displayed in a grid or list
- [ ] Each item shows: name, type (Title/Badge), rarity, price, and visual preview
- [ ] I can see my current coin balance prominently displayed on the shop page
- [ ] Items I already own are marked as "Owned"
- [ ] Items I cannot afford are visually distinguished (grayed out or marked)

**Priority:** High  
**Story Points:** 5

---

### US-1.2: Filter Shop Items by Type
**As a** student  
**I want to** filter shop items by type (Titles or Badges)  
**So that** I can quickly find the specific type of item I'm looking for

**Acceptance Criteria:**
- [ ] I can see filter options: "All", "Titles", "Badges"
- [ ] Clicking a filter updates the displayed items immediately
- [ ] The active filter is visually highlighted
- [ ] Item count updates to show how many items match the filter

**Priority:** Medium  
**Story Points:** 3

---

### US-1.3: Sort Shop Items
**As a** student  
**I want to** sort shop items by different criteria  
**So that** I can find items that fit my budget or preferences

**Acceptance Criteria:**
- [ ] I can sort by: Price (Low to High), Price (High to Low), Rarity, Name
- [ ] The sort option is clearly visible (dropdown or buttons)
- [ ] Items re-order immediately when I change the sort option
- [ ] The current sort selection is visually indicated

**Priority:** Low  
**Story Points:** 2

---

### US-1.4: View Item Details
**As a** student  
**I want to** see detailed information about an item before purchasing  
**So that** I can make an informed decision

**Acceptance Criteria:**
- [ ] Clicking on an item shows additional details (description, rarity tier, price)
- [ ] For titles, I can see a preview of how the text will look
- [ ] For badges, I can see a larger view of the icon
- [ ] I can see if I already own this item
- [ ] I can close the details view and return to the shop

**Priority:** Medium  
**Story Points:** 3

---

## Epic 2: Purchasing Items

### US-2.1: Purchase a Shop Item
**As a** student  
**I want to** purchase a cosmetic item from the shop  
**So that** I can customize my profile

**Acceptance Criteria:**
- [ ] Each item has a visible "Buy" button
- [ ] The "Buy" button is disabled if I don't have enough coins
- [ ] The "Buy" button is disabled if I already own the item
- [ ] Clicking "Buy" shows a confirmation dialog with item name and price
- [ ] I can confirm or cancel the purchase from the dialog
- [ ] If confirmed, my coin balance decreases by the item price
- [ ] The item is added to my inventory immediately
- [ ] The item is marked as "Owned" in the shop
- [ ] I see a success message confirming the purchase

**Priority:** High  
**Story Points:** 8

---

### US-2.2: Purchase Validation
**As a** student  
**I want to** receive clear error messages if I cannot complete a purchase  
**So that** I understand why the purchase failed

**Acceptance Criteria:**
- [ ] If I try to buy an item with insufficient coins, I see: "You don't have enough coins!"
- [ ] The error message shows how many coins I need vs. how many I have
- [ ] If I somehow try to buy an item I already own, I see: "You already own this item"
- [ ] Error messages are displayed prominently and clearly
- [ ] My coin balance remains unchanged if purchase fails

**Priority:** High  
**Story Points:** 3

---

### US-2.3: View Purchase History
**As a** student  
**I want to** see when I purchased each item in my inventory  
**So that** I can track my spending and collection

**Acceptance Criteria:**
- [ ] Each item in my inventory shows the purchase date
- [ ] Purchase dates are formatted in a readable way (e.g., "Purchased on: 1 Nov 2024")
- [ ] Items are optionally sortable by purchase date (newest/oldest first)

**Priority:** Low  
**Story Points:** 2

---

## Epic 3: Inventory Management

### US-3.1: View My Inventory
**As a** student  
**I want to** view all the cosmetic items I own  
**So that** I can see my collection and decide what to equip

**Acceptance Criteria:**
- [ ] I can access my inventory from my profile page or a dedicated "My Items" page
- [ ] My inventory shows all items I've purchased
- [ ] Items are grouped by type (Titles, Badges)
- [ ] Each item shows: name, rarity, purchase date
- [ ] Currently equipped items are marked with "Equipped" badge or checkmark
- [ ] I can see how many items I own in each category

**Priority:** High  
**Story Points:** 5

---

### US-3.2: Empty Inventory State
**As a** student who hasn't purchased any items  
**I want to** see a helpful message in my inventory  
**So that** I'm encouraged to visit the shop

**Acceptance Criteria:**
- [ ] If I have no items, I see a friendly message: "You don't have any items yet!"
- [ ] The message includes a call-to-action button: "Visit Shop"
- [ ] Clicking the button takes me to the Shop page
- [ ] The empty state is visually appealing (not just plain text)

**Priority:** Low  
**Story Points:** 2

---

## Epic 4: Equipping Titles

### US-4.1: Equip a Title
**As a** student  
**I want to** equip a title from my inventory  
**So that** it displays on my profile

**Acceptance Criteria:**
- [ ] Each title in my inventory has an "Equip" button
- [ ] Clicking "Equip" on a title sets it as my active title
- [ ] If I already have a title equipped, it is automatically unequipped
- [ ] The newly equipped title is marked as "Equipped" in my inventory
- [ ] The title appears immediately on my profile page
- [ ] I see a success message: "Title equipped successfully!"

**Priority:** High  
**Story Points:** 5

---

### US-4.2: Unequip Title
**As a** student  
**I want to** remove my currently equipped title  
**So that** my profile shows no title

**Acceptance Criteria:**
- [ ] My currently equipped title has an "Unequip" button
- [ ] Clicking "Unequip" removes the title from my profile
- [ ] My profile title area shows the default message: "Belum ada gelar dipilih"
- [ ] The title remains in my inventory (not deleted)
- [ ] I can re-equip the title later

**Priority:** Medium  
**Story Points:** 3

---

### US-4.3: View Equipped Title on Profile
**As a** student  
**I want to** see my equipped title on my profile  
**So that** other users can see my chosen title

**Acceptance Criteria:**
- [ ] If I have a title equipped, it displays prominently on my profile
- [ ] The title is styled to look like a badge or banner
- [ ] The title is visible to all users who view my profile
- [ ] If I have no title equipped, the area shows: "Belum ada gelar dipilih"

**Priority:** High  
**Story Points:** 3

---

## Epic 5: Equipping Badges

### US-5.1: Select Badges to Display
**As a** student  
**I want to** choose up to 6 badges from my collection to display  
**So that** I can showcase my favorite badges on my profile

**Acceptance Criteria:**
- [ ] I can access a "Manage Badges" interface from my inventory or profile
- [ ] I can see all badges I own
- [ ] I can select up to 6 badges to display
- [ ] I cannot select more than 6 badges
- [ ] Currently displayed badges are clearly marked
- [ ] I can deselect badges to remove them from display

**Priority:** High  
**Story Points:** 8

---

### US-5.2: Reorder Displayed Badges
**As a** student  
**I want to** arrange the order of my displayed badges  
**So that** my most important badges appear first

**Acceptance Criteria:**
- [ ] I can drag and drop badges to reorder them (or use up/down arrows)
- [ ] The order I set is reflected on my profile page
- [ ] The first badge appears in the top-left position of the badge gallery
- [ ] Changes are saved when I click "Save" or "Apply"

**Priority:** Medium  
**Story Points:** 5

---

### US-5.3: View Equipped Badges on Profile
**As a** student  
**I want to** see my equipped badges on my profile  
**So that** other users can see my badge collection

**Acceptance Criteria:**
- [ ] My profile shows a "Badge Gallery" section
- [ ] The gallery displays my 6 equipped badges (or fewer if I chose less)
- [ ] Each badge shows its icon clearly
- [ ] Empty badge slots show placeholder graphics
- [ ] If I have no badges equipped, the area shows: "Belum ada lencana yang dimiliki"
- [ ] The badge gallery is visible to all users who view my profile

**Priority:** High  
**Story Points:** 5

---

### US-5.4: Unequip All Badges
**As a** student  
**I want to** clear all my displayed badges at once  
**So that** I can start fresh with a new selection

**Acceptance Criteria:**
- [ ] I can click a "Clear All" or "Unequip All" button
- [ ] All displayed badges are removed from my profile
- [ ] The badges remain in my inventory (not deleted)
- [ ] My profile badge gallery shows the default empty state
- [ ] I see a confirmation: "All badges unequipped"

**Priority:** Low  
**Story Points:** 2

---

## Epic 6: Profile Integration

### US-6.1: View Other Students' Equipped Items
**As a** student  
**I want to** see what titles and badges other students have equipped  
**So that** I can get inspiration for my own profile customization

**Acceptance Criteria:**
- [ ] When I view another student's profile, I can see their equipped title (if any)
- [ ] I can see their equipped badges in their badge gallery
- [ ] Items are displayed the same way as on my own profile
- [ ] I cannot edit or change another user's equipped items

**Priority:** Medium  
**Story Points:** 3

---

### US-6.2: Quick Access to Shop from Profile
**As a** student  
**I want to** easily navigate to the shop from my profile  
**So that** I can purchase items to customize my profile

**Acceptance Criteria:**
- [ ] My profile has a visible "Visit Shop" or "Get Items" button
- [ ] The button is located near the Title or Badge areas
- [ ] Clicking the button takes me directly to the Shop page

**Priority:** Low  
**Story Points:** 1

---

## Epic 7: Admin Management (Future/Optional)

### US-7.1: Add New Shop Items
**As an** admin  
**I want to** add new cosmetic items to the shop  
**So that** students have fresh items to purchase

**Acceptance Criteria:**
- [ ] I can access an admin panel to manage shop items
- [ ] I can create a new item with: name, description, type, rarity, price, icon
- [ ] The new item appears in the shop immediately after creation
- [ ] Students can purchase the new item right away

**Priority:** Low (Deferred to future phase)  
**Story Points:** 5

---

### US-7.2: Hide/Deactivate Shop Items
**As an** admin  
**I want to** temporarily hide items from the shop without deleting them  
**So that** I can manage seasonal or limited-time items

**Acceptance Criteria:**
- [ ] I can toggle an item's "active" status in the admin panel
- [ ] Inactive items do not appear in the shop for students
- [ ] Students who already own inactive items can still use them
- [ ] I can reactivate items to make them available again

**Priority:** Low (Deferred to future phase)  
**Story Points:** 3

---

## Summary

### Story Count by Priority
- **High Priority:** 10 stories (51 story points)
- **Medium Priority:** 6 stories (19 story points)
- **Low Priority:** 6 stories (12 story points)

### Total Effort Estimate
- **Total Stories:** 22
- **Total Story Points:** 82

### MVP Scope (High Priority Only)
- Epic 1: Shop Browsing - US-1.1 (5 pts)
- Epic 2: Purchasing - US-2.1, US-2.2 (11 pts)
- Epic 3: Inventory - US-3.1 (5 pts)
- Epic 4: Titles - US-4.1, US-4.3 (8 pts)
- Epic 5: Badges - US-5.1, US-5.3 (13 pts)
- Epic 6: Profile - (covered in Epic 4 & 5)

**MVP Total: 42 story points**

---

**Document Status:** ✅ Complete  
**Next Step:** Create Implementation Plan Document
