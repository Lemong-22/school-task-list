# Phase 9.1: Admin Dashboard - User Stories

**Date:** 2025-11-13  
**Status:** Planning Phase  
**Feature:** Admin Dashboard (Shop Management)

---

## User Persona: Admin

**Name:** Admin User (You - Product Manager)  
**Role:** Administrator  
**Tech Proficiency:** High  
**Goals:** Manage shop inventory, add new items, maintain item quality  
**Pain Points:** No UI for shop management, must use SQL directly

---

## Epic: Admin Shop Management

### User Story 1: Access Admin Dashboard

**As an** admin  
**I want to** access a hidden admin dashboard  
**So that** I can manage shop items without using SQL

**Acceptance Criteria:**
- Given I am logged in as an admin
- When I navigate to `/admin`
- Then I see the Admin Dashboard with shop management tools
- And I can view all shop items in a table

**Priority:** Critical  
**Estimated Effort:** 1 hour

---

### User Story 2: Security - Prevent Unauthorized Access

**As a** student or teacher  
**I should not** be able to access the admin dashboard  
**So that** shop management remains secure

**Acceptance Criteria:**
- Given I am logged in as a student or teacher
- When I try to navigate to `/admin`
- Then I am automatically redirected to my dashboard
- And I see no error message (silent redirect)
- And there is no visible link to `/admin` in any menu

**Priority:** Critical  
**Estimated Effort:** 30 minutes

---

### User Story 3: View All Shop Items

**As an** admin  
**I want to** see all shop items in a table  
**So that** I can review the current inventory

**Acceptance Criteria:**
- Given I am on the Admin Dashboard
- When the page loads
- Then I see a table listing all shop items
- And each row shows: Name, Type, Rarity, Price, Active status
- And items are sorted by Display Order
- And I can see Edit and Delete buttons for each item

**Priority:** High  
**Estimated Effort:** 1 hour

---

### User Story 4: Create New Shop Item

**As an** admin  
**I want to** add a new item to the shop  
**So that** students have more cosmetic options to purchase

**Acceptance Criteria:**
- Given I am on the Admin Dashboard
- When I click the "+ Add New Item" button
- Then a form opens with fields for:
  - Name (required)
  - Description (optional)
  - Type (Title/Badge/Namecard - required)
  - Rarity (Common/Rare/Epic/Legendary/Godlike - required)
  - Price (required, minimum 1)
  - Icon URL (optional)
  - Display Order (optional, default 0)
  - Active Status (optional, default true)
- And when I fill out required fields and click "Save"
- Then the item is created in the database
- And it appears in the shop items table
- And I see a success message
- And the form closes

**Priority:** High  
**Estimated Effort:** 1.5 hours

---

### User Story 5: Edit Existing Shop Item

**As an** admin  
**I want to** modify an existing shop item  
**So that** I can fix mistakes or update pricing

**Acceptance Criteria:**
- Given I am viewing the shop items table
- When I click the "Edit" button on any item
- Then a form opens pre-filled with that item's data
- And I can modify any field
- And when I click "Save"
- Then the changes are saved to the database
- And the table updates to show the new values
- And I see a success message
- And the form closes

**Priority:** High  
**Estimated Effort:** 1 hour

---

### User Story 6: Delete Shop Item

**As an** admin  
**I want to** delete an item from the shop  
**So that** I can remove outdated or incorrect items

**Acceptance Criteria:**
- Given I am viewing the shop items table
- When I click the "Delete" button on an item
- Then a confirmation modal appears asking "Are you sure you want to delete [item name]?"
- And when I click "Confirm"
- Then the item is deleted from the database
- And it disappears from the table
- And I see a success message

**Priority:** Medium  
**Estimated Effort:** 45 minutes

---

### User Story 7: Handle Delete Constraints

**As an** admin  
**I want to** see a clear error message if I try to delete an item that users own  
**So that** I understand why the deletion failed

**Acceptance Criteria:**
- Given an item exists that some users have purchased
- When I try to delete that item
- Then I see an error message: "Cannot delete item that users own"
- And the item is NOT deleted
- And I can choose to deactivate it instead

**Priority:** Medium  
**Estimated Effort:** 30 minutes

---

### User Story 8: Form Validation

**As an** admin  
**I want to** receive validation errors on the form  
**So that** I don't create invalid shop items

**Acceptance Criteria:**
- Given I am filling out the Create/Edit form
- When I leave a required field empty
- Then I see an error message: "[Field] is required"
- And when I enter an invalid price (0 or negative)
- Then I see an error message: "Price must be at least 1"
- And when I try to submit with errors
- Then the form does not submit
- And error messages persist until fixed

**Priority:** Medium  
**Estimated Effort:** 30 minutes

---

### User Story 9: Visual Feedback

**As an** admin  
**I want to** see loading states and success messages  
**So that** I know when operations are in progress or complete

**Acceptance Criteria:**
- Given I am performing any CRUD operation
- When the operation is in progress
- Then I see a loading spinner or "Saving..." indicator
- And when the operation succeeds
- Then I see a success message (e.g., "Item created successfully")
- And when the operation fails
- Then I see an error message explaining what went wrong

**Priority:** Low  
**Estimated Effort:** 30 minutes

---

## Scenarios & Edge Cases

### Scenario 1: First Time Admin Access

**Context:** Admin has just been granted admin role

**Flow:**
1. User role updated to 'admin' in database
2. User logs out and logs back in
3. User manually navigates to `/admin` by typing URL
4. Dashboard loads with empty or populated table
5. User clicks "+ Add New Item"
6. User creates their first item
7. Item appears in both Admin Dashboard and Shop

**Expected Result:** Smooth onboarding, clear interface

---

### Scenario 2: Bulk Item Creation

**Context:** Admin wants to add 10 new items quickly

**Flow:**
1. Admin navigates to `/admin`
2. For each item:
   - Click "+ Add New Item"
   - Fill form
   - Click "Save"
   - Form closes, table updates
3. Repeat 10 times

**Current Solution:** Manual repetition (acceptable for MVP)  
**Future Enhancement:** Bulk import via CSV or multi-item form

---

### Scenario 3: Price Adjustment

**Context:** Admin wants to have a "sale" by reducing prices

**Flow:**
1. Admin views items table
2. Click "Edit" on first item
3. Change price from 500 to 400
4. Click "Save"
5. Repeat for other items

**Expected Result:** Prices update immediately  
**Student Impact:** Students see new prices in shop instantly

---

### Scenario 4: Deactivating vs Deleting

**Context:** Popular item needs to be temporarily removed

**Flow:**
1. Admin tries to delete item
2. Gets error: "Cannot delete item that users own"
3. Admin clicks "Edit" instead
4. Unchecks "Active" checkbox
5. Saves changes
6. Item disappears from shop but remains in database
7. Users who own it can still use it

**Expected Result:** Graceful handling of items with ownership

---

### Scenario 5: Item Reordering

**Context:** Admin wants specific items to appear first in shop

**Flow:**
1. Admin edits item
2. Changes "Display Order" from 0 to 1
3. Saves changes
4. Item position in shop updates
5. Shop sorts by display_order ascending

**Expected Result:** Admin controls shop layout

---

## Accessibility & UX Considerations

### Color-Coded Item Types
**Requirement:** Type badges should be visually distinct
- Title: Blue badge
- Badge: Purple badge
- Namecard: Pink badge

**Why:** Quick visual scanning of table

---

### Rarity Color System
**Requirement:** Rarity badges match game aesthetic
- Common: Gray
- Rare: Blue
- Epic: Purple
- Legendary: Gold
- Godlike: Red/Rainbow

**Why:** Consistency with student-facing shop

---

### Confirmation Modals
**Requirement:** All destructive actions require confirmation

**Why:** Prevent accidental deletions

---

### Responsive Design
**Requirement:** Dashboard works on tablet/desktop (mobile not required)

**Why:** Admin likely uses desktop for management tasks

---

## Future Enhancements (Out of Scope)

### Bulk Operations
- **Story:** As an admin, I want to select multiple items and delete/deactivate them at once
- **Why:** Efficiency for large operations
- **Effort:** 2 hours

### Image Upload
- **Story:** As an admin, I want to upload badge images instead of pasting URLs
- **Why:** Better UX, no broken links
- **Effort:** 3 hours (requires Supabase Storage integration)

### Audit Log
- **Story:** As an admin, I want to see who created/edited/deleted each item and when
- **Why:** Accountability and debugging
- **Effort:** 4 hours (requires new audit_log table)

### Search & Filter
- **Story:** As an admin, I want to search items by name or filter by type/rarity
- **Why:** Easier to find items in large lists
- **Effort:** 1 hour

### Duplicate Item
- **Story:** As an admin, I want to duplicate an item to create a similar one faster
- **Why:** Saves time when creating variants
- **Effort:** 1 hour

---

## Success Metrics

### Functionality
- ✅ Admin can create items (< 1 minute per item)
- ✅ Admin can edit items (< 30 seconds per edit)
- ✅ Admin can delete items or see clear error
- ✅ 100% of CRUD operations work reliably

### Security
- ✅ 0 unauthorized access attempts succeed
- ✅ All non-admins are redirected
- ✅ No security vulnerabilities

### Usability
- ✅ Admin can complete all tasks without documentation
- ✅ Interface feels intuitive and clean
- ✅ Error messages are helpful and clear

---

**User Stories Status:** ✅ Complete  
**Total Stories:** 9 core + 5 future enhancements  
**Ready for Implementation:** ✅ Yes
