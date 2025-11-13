# Admin Shop Management - User Stories

**Project**: School Task List - Admin Shop Management  
**Created**: 2025-11-13  
**Version**: 1.0

---

## Table of Contents
1. [Overview](#overview)
2. [User Personas](#user-personas)
3. [Epic: Shop Item Management](#epic-shop-item-management)
4. [Acceptance Criteria](#acceptance-criteria)
5. [User Flows](#user-flows)
6. [Edge Cases & Error Handling](#edge-cases--error-handling)

---

## Overview

This document outlines user stories for the Admin Shop Management feature, which enables designated administrators to manage the shop inventory through a secure, hidden admin interface.

### Goals
- Provide intuitive CRUD operations for shop items
- Ensure secure access control
- Maintain consistency with existing UI/UX patterns
- Enable efficient shop management workflows

---

## User Personas

### Primary Persona: School Administrator (Admin)
**Name**: Ms. Johnson  
**Role**: School Administrator  
**Tech Savvy**: Medium  
**Goals**:
- Manage shop items efficiently
- Add new rewards for students
- Update pricing and availability
- Remove outdated items

**Pain Points**:
- Manual database updates are error-prone
- No easy way to see all shop items at once
- Difficult to make quick changes

**Needs**:
- Simple, intuitive interface
- Quick add/edit/delete operations
- Visual confirmation of changes
- Error prevention

### Secondary Persona: Teacher (Non-Admin)
**Name**: Mr. Smith  
**Role**: Teacher  
**Tech Savvy**: Low-Medium  
**Goals**:
- Focus on teaching tasks
- Not distracted by admin features

**Needs**:
- Clean UI without admin clutter
- Automatic protection from admin areas
- Clear error messages if accidentally accessing admin routes

---

## Epic: Shop Item Management

### Story 1: Access Admin Dashboard
**As an** administrator  
**I want to** access a secure admin dashboard  
**So that** I can manage shop items without exposing admin features to regular users

**Acceptance Criteria**:
- ✅ Admin route is hidden (not in navigation menus)
- ✅ Only users with `role = 'admin'` can access
- ✅ Non-admins are automatically redirected with friendly message
- ✅ Route is accessible via direct URL: `/admin`
- ✅ Page loads with current user's admin status verified

**Priority**: P0 (Critical)  
**Story Points**: 3

---

### Story 2: View All Shop Items
**As an** administrator  
**I want to** see all shop items in a table  
**So that** I can quickly review the entire inventory

**Acceptance Criteria**:
- ✅ All shop items displayed in elegant table format
- ✅ Columns: Name, Description, Category, Price, Rarity, Actions
- ✅ Items sorted by category, then by price
- ✅ Empty state shows helpful message if no items exist
- ✅ Loading state shows skeleton during data fetch
- ✅ Table uses consistent Elegant design system

**Priority**: P0 (Critical)  
**Story Points**: 2

---

### Story 3: Create New Shop Item
**As an** administrator  
**I want to** add new items to the shop  
**So that** I can expand student reward options

**Acceptance Criteria**:
- ✅ "Add New Item" button prominently displayed
- ✅ Form includes fields: name, description, category, price, rarity
- ✅ All fields are validated before submission
- ✅ Price must be positive integer
- ✅ Category dropdown includes all valid options
- ✅ Rarity dropdown includes: common, uncommon, rare, epic, legendary
- ✅ Success message shown after creation
- ✅ Form resets after successful submission
- ✅ New item immediately appears in table

**Priority**: P0 (Critical)  
**Story Points**: 5

**Validation Rules**:
```typescript
- name: required, 1-100 characters
- description: required, 1-500 characters
- category: required, one of [avatar, background, badge, powerup]
- price: required, integer, min 1, max 10000
- rarity: required, one of [common, uncommon, rare, epic, legendary]
```

---

### Story 4: Edit Existing Shop Item
**As an** administrator  
**I want to** update existing shop items  
**So that** I can correct errors or adjust pricing

**Acceptance Criteria**:
- ✅ Each item has "Edit" button in actions column
- ✅ Edit opens pre-filled form with current values
- ✅ All fields are editable
- ✅ Same validation rules as create
- ✅ "Save Changes" button updates item
- ✅ "Cancel" button discards changes
- ✅ Success message shown after update
- ✅ Updated values immediately reflected in table
- ✅ Edit form clearly labeled (e.g., "Edit: Item Name")

**Priority**: P0 (Critical)  
**Story Points**: 5

---

### Story 5: Delete Shop Item
**As an** administrator  
**I want to** remove items from the shop  
**So that** I can clean up outdated or unwanted items

**Acceptance Criteria**:
- ✅ Each item has "Delete" button in actions column
- ✅ Delete triggers confirmation dialog
- ✅ Confirmation shows item name for verification
- ✅ "Confirm Delete" permanently removes item
- ✅ "Cancel" closes dialog without changes
- ✅ Success message shown after deletion
- ✅ Item immediately removed from table
- ✅ Deleted items cannot be recovered (clear warning)

**Priority**: P0 (Critical)  
**Story Points**: 3

**Confirmation Dialog**:
```
Title: Delete Shop Item?
Message: Are you sure you want to delete "{item_name}"? 
         This action cannot be undone.
Buttons: [Cancel] [Delete]
```

---

### Story 6: Handle Errors Gracefully
**As an** administrator  
**I want to** see clear error messages when something goes wrong  
**So that** I can understand and fix issues

**Acceptance Criteria**:
- ✅ Network errors show "Unable to connect" message
- ✅ Validation errors highlight specific fields
- ✅ Database errors show friendly message (not technical details)
- ✅ Duplicate item names show "Item already exists"
- ✅ Error messages auto-dismiss after 5 seconds
- ✅ Errors don't crash the page
- ✅ User can retry failed operations

**Priority**: P1 (High)  
**Story Points**: 3

---

## Acceptance Criteria

### Functional Requirements
- [ ] All CRUD operations working correctly
- [ ] Data persists to Supabase database
- [ ] Real-time updates (optimistic UI)
- [ ] Form validation prevents invalid data
- [ ] Error handling for all edge cases

### Security Requirements
- [ ] Only admin users can access `/admin` route
- [ ] Non-admins redirected with 403 forbidden
- [ ] Database RLS policies enforce admin-only writes
- [ ] No client-side bypasses possible
- [ ] Admin status verified on server

### UX Requirements
- [ ] Consistent with Elegant design system
- [ ] Loading states for all async operations
- [ ] Empty states with helpful messages
- [ ] Success/error toast notifications
- [ ] Responsive design (mobile-friendly)
- [ ] Keyboard navigation support

### Performance Requirements
- [ ] Initial page load < 1 second
- [ ] Form submission < 500ms
- [ ] Table renders smoothly with 100+ items
- [ ] No UI blocking during operations

---

## User Flows

### Flow 1: First-Time Admin Access
```
1. Admin user logs in
2. Types '/admin' in browser URL
3. System verifies admin role
4. Admin dashboard loads
5. User sees empty state (if no items) or item table
6. User clicks "Add New Item"
7. Form appears
```

### Flow 2: Add New Item (Happy Path)
```
1. Admin on dashboard
2. Clicks "Add New Item" button
3. Form opens/expands
4. Fills in all fields:
   - Name: "Golden Trophy Badge"
   - Description: "A shiny trophy for top performers"
   - Category: badge
   - Price: 500
   - Rarity: epic
5. Clicks "Create Item"
6. Form validates → ✅ Pass
7. Item created in database
8. Success toast: "Item created successfully!"
9. New item appears in table
10. Form resets to empty
```

### Flow 3: Edit Item (Happy Path)
```
1. Admin viewing item table
2. Clicks "Edit" on "Golden Trophy Badge"
3. Form pre-fills with current values
4. Changes price: 500 → 750
5. Changes rarity: epic → legendary
6. Clicks "Save Changes"
7. Validation passes
8. Item updated in database
9. Success toast: "Item updated successfully!"
10. Table shows new values
```

### Flow 4: Delete Item (Happy Path)
```
1. Admin viewing item table
2. Clicks "Delete" on outdated item
3. Confirmation dialog appears
4. Dialog shows: "Delete 'Old Item'? Cannot be undone."
5. Admin clicks "Delete"
6. Item removed from database
7. Success toast: "Item deleted successfully!"
8. Table updates, item gone
```

### Flow 5: Validation Error (Error Path)
```
1. Admin clicks "Add New Item"
2. Fills in form:
   - Name: "Test"
   - Description: "" (empty)
   - Price: -100 (negative)
3. Clicks "Create Item"
4. Validation fails
5. Error messages appear:
   - "Description is required"
   - "Price must be positive"
6. Invalid fields highlighted in red
7. User corrects errors
8. Resubmits → Success
```

### Flow 6: Non-Admin Access (Error Path)
```
1. Regular teacher/student tries to access '/admin'
2. System checks role → not admin
3. Immediate redirect to '/'
4. Error toast: "Access denied. Admin privileges required."
5. User sees their normal dashboard
```

---

## Edge Cases & Error Handling

### Edge Case 1: Duplicate Item Names
**Scenario**: Admin tries to create item with existing name

**Expected Behavior**:
```
1. Form submitted with duplicate name
2. Database constraint violation
3. Error caught by client
4. Toast message: "An item with this name already exists"
5. Form stays open with current values
6. User can modify name and retry
```

### Edge Case 2: Network Timeout
**Scenario**: Request takes too long

**Expected Behavior**:
```
1. Operation started (create/update/delete)
2. Network request times out (30s)
3. Error boundary catches timeout
4. Toast message: "Request timed out. Please try again."
5. UI returns to stable state
6. User can retry operation
```

### Edge Case 3: Concurrent Edits
**Scenario**: Two admins edit same item simultaneously

**Expected Behavior**:
```
1. Admin A loads item (price: 100)
2. Admin B loads same item (price: 100)
3. Admin A changes price to 150, saves
4. Admin B changes price to 200, saves
5. Last write wins (price becomes 200)
6. No data corruption
Note: Advanced conflict resolution out of scope for v1
```

### Edge Case 4: Delete Item Student Owns
**Scenario**: Admin deletes item that students purchased

**Expected Behavior**:
```
1. Admin deletes "Cool Avatar"
2. Item removed from shop_items table
3. Student inventories remain intact (foreign key preserved)
4. Students keep their purchased items
5. Item just no longer available for new purchases
```

### Edge Case 5: Special Characters in Names
**Scenario**: Item name contains emojis or special chars

**Expected Behavior**:
```
1. Admin enters: "🏆 Trophy Badge (Gold)"
2. Form accepts input
3. Database stores correctly (UTF-8)
4. Table displays properly
5. No encoding issues
```

### Edge Case 6: Very Long Descriptions
**Scenario**: Admin enters 500-character description

**Expected Behavior**:
```
1. Text area allows up to 500 chars
2. Character counter shows: "450/500"
3. At 500 chars, input stops
4. Full text stored in database
5. Table shows truncated version with "..."
6. Hover/expand to see full description
```

### Edge Case 7: Session Expires
**Scenario**: Admin session expires mid-operation

**Expected Behavior**:
```
1. Admin filling out form
2. Session expires (60 min timeout)
3. Admin clicks "Create Item"
4. API returns 401 Unauthorized
5. Toast: "Session expired. Please log in again."
6. Redirect to /login
7. After login, return to /admin (form data lost)
```

### Edge Case 8: Invalid Category/Rarity
**Scenario**: Client sends invalid enum value

**Expected Behavior**:
```
1. Malicious/buggy client sends category: "hacked"
2. Database constraint rejects
3. Error caught: "Invalid category value"
4. Form shows error
5. Dropdown resets to valid option
6. User must choose valid category
```

---

## Success Metrics

### Quantitative Metrics
- **Task Completion Rate**: >95% of admin operations succeed
- **Error Rate**: <5% of operations result in errors
- **Time to Complete Task**:
  - Add item: <60 seconds
  - Edit item: <30 seconds
  - Delete item: <10 seconds
- **User Satisfaction**: 4.5/5 stars

### Qualitative Metrics
- Admin feels confident managing shop
- No confusion about how to perform operations
- Error messages are helpful and actionable
- UI feels professional and polished

---

## Future Enhancements (Out of Scope for v1)

### Phase 2 Features
- Bulk operations (import/export CSV)
- Image upload for item icons
- Rich text editor for descriptions
- Drag-and-drop reordering
- Item preview before creation

### Phase 3 Features
- Admin user management
- Audit logs (who created/modified what)
- Analytics dashboard (popular items)
- Scheduled item releases
- A/B testing for pricing

### Phase 4 Features
- Multi-language support
- Version history (undo changes)
- Approval workflow (request → review → publish)
- Integration with external asset libraries

---

## Appendix: Example Test Scenarios

### Test Scenario 1: Create Item - Valid Data
```typescript
Input:
{
  name: "Rainbow Avatar",
  description: "A colorful avatar for creative students",
  category: "avatar",
  price: 300,
  rarity: "rare"
}

Expected Output:
- ✅ Item created in database
- ✅ Success toast shown
- ✅ Item appears in table
- ✅ Form resets
```

### Test Scenario 2: Create Item - Missing Required Field
```typescript
Input:
{
  name: "Test Item",
  description: "", // Empty!
  category: "badge",
  price: 100,
  rarity: "common"
}

Expected Output:
- ❌ Validation fails
- ❌ Error message: "Description is required"
- ❌ Description field highlighted red
- ❌ No database write
```

### Test Scenario 3: Edit Item - Price Change
```typescript
Before:
{ id: 1, name: "Test", price: 100 }

Action:
Edit price: 100 → 250

After:
{ id: 1, name: "Test", price: 250 }

Expected:
- ✅ Database updated
- ✅ Table shows 250
- ✅ Success toast shown
```

### Test Scenario 4: Delete Item - With Confirmation
```typescript
Before:
shop_items.length = 10

Action:
1. Click delete on item id=5
2. See confirmation
3. Click "Delete"

After:
shop_items.length = 9
Item id=5 not in table

Expected:
- ✅ Confirmation shown
- ✅ Item deleted from DB
- ✅ Table updated
- ✅ Success toast shown
```

---

## Sign-Off

### Ready for Implementation When:
- [x] All three specification docs created
- [ ] Technical architecture reviewed
- [ ] Implementation plan approved
- [ ] User stories validated
- [ ] Database schema ready
- [ ] UI mockups complete (optional)

### Stakeholder Approval:
- [ ] Product Owner: _______________ Date: _______
- [ ] Tech Lead: _______________ Date: _______
- [ ] Designer: _______________ Date: _______

---

**Document Status**: ✅ Complete  
**Next Step**: Begin Phase 1 implementation  
**Estimated Development Time**: 8-12 hours
