# Phase 9.1: Admin Dashboard - Requirements Document

**Date:** 2025-11-13  
**Status:** Planning Phase Complete  
**Approved By:** Product Manager

---

## Overview

This document captures the approved requirements for Phase 9.1: Admin Dashboard (Shop Management), which provides admin users with a private interface to manage the coin shop inventory.

---

## 1. Security Model ✅

### Approved Solution: New 'admin' Role

**Implementation:**
- Add `'admin'` as a new allowed value to the existing `role` column in the `profiles` table
- Update the CHECK constraint to include: `('student', 'teacher', 'admin')`
- Admin status is determined by checking if `profile.role === 'admin'`

**Initial Setup:**
- Product Manager will manually update their own user record in Supabase to have `role = 'admin'`
- This is the most scalable solution for future growth

**Security Benefits:**
- Database-level role enforcement
- Easy to add more admins in the future
- Clean separation of concerns
- No hardcoded user IDs in application code

---

## 2. Navigation & Access ✅

### Approved Solution: Hidden Route with Auto-Redirect

**Route Configuration:**
- Path: `/admin`
- Visibility: **NOT** shown in any navigation menu
- Protection: Redirect non-admin users to their dashboard

**Access Flow:**
```
User navigates to /admin
  ↓
Is user authenticated?
  → No: Redirect to /login
  → Yes: Continue
  ↓
Is user.role === 'admin'?
  → No: Redirect to /dashboard/teacher or /dashboard/student
  → Yes: Show Admin Dashboard
```

**Why This Approach:**
- Keeps admin tools separate from student/teacher UI
- Prevents accidental discovery
- Simple and secure
- Clean URL structure

---

## 3. Core Functionality ✅

### Approved Solution: Full CRUD for shop_items Table

**Required Operations:**

#### **Create** - Add New Shop Item
- Form to create new items
- Fields:
  - Name (text, required)
  - Description (textarea, optional)
  - Type (dropdown: 'title', 'badge', 'namecard')
  - Rarity (dropdown: 'common', 'rare', 'epic', 'legendary', 'godlike')
  - Price (number, required, min: 1)
  - Icon URL (text, optional, for badges/namecards)
  - Display Order (number, default: 0)
  - Active Status (checkbox, default: true)

#### **Read** - View All Shop Items
- Table view listing all items
- Columns to display:
  - Name
  - Type
  - Rarity
  - Price
  - Active Status
  - Actions (Edit/Delete buttons)
- Sort by: Display Order (ascending)
- Filter by: Type, Rarity, Active Status (optional enhancement)

#### **Update** - Edit Existing Item
- Click "Edit" button on any item
- Open form pre-filled with current values
- Allow editing all fields except ID and timestamps
- Save changes to database

#### **Delete** - Remove Item
- Click "Delete" button on any item
- Show confirmation modal: "Are you sure you want to delete [item name]?"
- On confirm: Delete from database
- Handle cascade: Items in user inventories should be handled gracefully

**Data Integrity:**
- Validate all inputs before submission
- Ensure prices are positive integers
- Prevent duplicate names (optional enhancement)
- Show success/error messages for all operations

---

## 4. UI Design ✅

### Approved Solution: Re-use Existing Elegant Components

**Design System:**
- **Colors:** Use existing `bg-component-dark`, `bg-background-dark`, `text-text-primary-dark`, `text-text-secondary-dark`
- **Borders:** `border-border-dark`
- **Buttons:** `bg-primary text-white rounded-lg hover:bg-primary/90`
- **Cards:** Consistent with `rounded-lg shadow-md`

**Component Re-use:**

1. **Table View** (for listing items)
   - Based on: `TeacherDashboard.tsx` table style
   - Elegant table with borders
   - Hover states on rows
   - Action buttons in last column

2. **Create/Edit Form** (for adding/editing items)
   - Based on: `CreateTaskPage.tsx` form style
   - Clean form layout with labels
   - Input validation
   - Submit/Cancel buttons

3. **Delete Confirmation**
   - Simple modal or confirm dialog
   - Two buttons: "Cancel" (gray) and "Delete" (red)

**Layout:**
```
┌─────────────────────────────────────────┐
│  Admin Dashboard                         │
│  Manage Shop Items                       │
├─────────────────────────────────────────┤
│  [+ Add New Item] button                 │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐│
│  │  Name  │ Type  │ Rarity │ Price │...││
│  │─────────────────────────────────────││
│  │  Item1 │ Badge │ Epic   │ 500  │...││
│  │  Item2 │ Title │ Rare   │ 150  │...││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

**Why This Approach:**
- Fast implementation (no new UI patterns)
- Consistent with existing design
- Familiar to developers
- Professional and clean

---

## 5. Success Criteria

**Functionality:**
- ✅ Admin can create new shop items
- ✅ Admin can view all shop items in a table
- ✅ Admin can edit existing items
- ✅ Admin can delete items with confirmation
- ✅ Non-admin users cannot access `/admin`
- ✅ All CRUD operations update database correctly

**Security:**
- ✅ Only users with `role = 'admin'` can access
- ✅ Auto-redirect works for non-admins
- ✅ No admin links visible to non-admins

**UX:**
- ✅ UI matches existing Elegant design
- ✅ Forms are intuitive and validate inputs
- ✅ Success/error messages are clear
- ✅ Table is easy to read and navigate

---

## 6. Out of Scope (Future Enhancements)

The following features are **NOT** included in Phase 9.1:

- ❌ Bulk operations (bulk delete, bulk edit)
- ❌ Image upload for badge icons (will use URLs for now)
- ❌ Admin user management (adding/removing admins)
- ❌ Audit logs (tracking who changed what)
- ❌ Advanced filtering/search in table
- ❌ Pagination (assuming < 100 items for now)

These can be added in Phase 9.2 if needed.

---

## 7. Dependencies

**Database:**
- Existing `shop_items` table (already exists)
- Existing `profiles` table (needs role constraint update)

**UI Components:**
- Existing Elegant design system
- Existing form components from CreateTaskPage
- Existing table components from TeacherDashboard

**Libraries:**
- No new dependencies required
- All functionality can be built with existing tech stack

---

**Requirements Approval:** ✅ Approved  
**Ready for Implementation:** ✅ Yes
