# Phase 9.1: Admin Dashboard - Technical Architecture

**Date:** 2025-11-13  
**Status:** Planning Phase  
**Feature:** Admin Dashboard (Shop Management)

---

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Database Layer](#database-layer)
3. [Frontend Layer](#frontend-layer)
4. [Security & Authentication](#security--authentication)
5. [Data Flow](#data-flow)

---

## System Architecture Overview

The Admin Dashboard is a protected, hidden interface for managing shop items.

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
├──────────────────────────────────────────────────────────────┤
│  /admin (Hidden Route - Admin Only)                          │
│  ├── AdminDashboard.tsx                                      │
│  ├── ShopItemForm.tsx (Create/Edit)                          │
│  └── DeleteConfirmModal.tsx                                  │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   │    Supabase Client (RLS Enforced)
                   │
┌──────────────────┴───────────────────────────────────────────┐
│                  Database Layer (PostgreSQL)                  │
├──────────────────────────────────────────────────────────────┤
│  Tables:                                                      │
│  - profiles (role updated to include 'admin')                │
│  - shop_items (existing, no changes needed)                  │
│  - user_inventory (existing, CASCADE behavior)               │
└──────────────────────────────────────────────────────────────┘
```

---

## Database Layer

### Migration: `030_add_admin_role.sql`

```sql
-- ============================================================================
-- Migration: 030_add_admin_role.sql
-- Description: Add 'admin' role to profiles table
-- Date: 2025-11-13
-- Phase: Phase 9.1 - Admin Dashboard
-- ============================================================================

BEGIN;

-- Drop existing role constraint
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new constraint with 'admin' role
ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('student', 'teacher', 'admin'));

-- Add comment
COMMENT ON COLUMN profiles.role IS 'User role: student, teacher, or admin';

-- Create index for admin queries (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_profiles_admin_role 
ON profiles(role) WHERE role = 'admin';

COMMIT;

-- ============================================================================
-- Manual Step (Run in Supabase SQL Editor):
-- Update your own user to be admin
-- ============================================================================
-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE id = 'YOUR-USER-ID-HERE';
```

### Existing Tables (No Changes Needed)

**shop_items table:**
- Already has all required fields
- Supports CRUD operations
- Has proper constraints and indexes

**user_inventory table:**
- Uses `ON DELETE RESTRICT` for shop_items
- This means items with existing owners cannot be deleted
- Admin should see error message if delete fails

---

## Frontend Layer

### File Structure

```
src/
├── pages/
│   └── AdminDashboard.tsx          # Main admin page (CRUD interface)
├── components/
│   ├── admin/
│   │   ├── ShopItemForm.tsx        # Create/Edit form component
│   │   ├── ShopItemTable.tsx       # Items list table
│   │   └── DeleteConfirmModal.tsx  # Delete confirmation
│   └── ProtectedRoute.tsx          # Update to support 'admin' role
├── hooks/
│   └── useShopItems.ts             # Hook for CRUD operations
└── types/
    └── shop.ts                     # ShopItem type (may already exist)
```

### Component Specifications

#### 1. AdminDashboard.tsx

**Purpose:** Main container for admin shop management

**Props:** None (gets admin status from auth context)

**State:**
```typescript
- shopItems: ShopItem[]
- isLoading: boolean
- error: string | null
- editingItem: ShopItem | null
- isFormOpen: boolean
- isDeleteModalOpen: boolean
- itemToDelete: ShopItem | null
```

**Layout:**
```tsx
<Layout>
  <div className="max-w-7xl mx-auto px-4 py-8">
    {/* Header */}
    <div className="mb-6">
      <h1>Admin Dashboard</h1>
      <p>Manage Shop Items</p>
    </div>

    {/* Add Button */}
    <button onClick={() => openCreateForm()}>
      + Add New Item
    </button>

    {/* Items Table */}
    <ShopItemTable 
      items={shopItems}
      onEdit={(item) => openEditForm(item)}
      onDelete={(item) => openDeleteModal(item)}
    />

    {/* Create/Edit Form Modal */}
    {isFormOpen && (
      <ShopItemForm
        item={editingItem}
        onSave={handleSave}
        onCancel={closeForm}
      />
    )}

    {/* Delete Confirmation */}
    {isDeleteModalOpen && (
      <DeleteConfirmModal
        itemName={itemToDelete.name}
        onConfirm={handleDelete}
        onCancel={closeDeleteModal}
      />
    )}
  </div>
</Layout>
```

---

#### 2. ShopItemTable.tsx

**Purpose:** Display all shop items in a table

**Props:**
```typescript
interface ShopItemTableProps {
  items: ShopItem[];
  onEdit: (item: ShopItem) => void;
  onDelete: (item: ShopItem) => void;
}
```

**Columns:**
- Name (text)
- Type (badge with color: title/badge/namecard)
- Rarity (badge with color based on rarity)
- Price (with 🪙 coin icon)
- Active (✓ or ✗)
- Actions (Edit/Delete buttons)

**Styling:**
- Based on `TeacherDashboard.tsx` table
- Elegant dark theme
- Hover states on rows
- Action buttons in last column

---

#### 3. ShopItemForm.tsx

**Purpose:** Create or edit a shop item

**Props:**
```typescript
interface ShopItemFormProps {
  item?: ShopItem | null;  // null for create, item for edit
  onSave: (item: CreateShopItemInput | UpdateShopItemInput) => Promise<void>;
  onCancel: () => void;
}
```

**Fields:**
```typescript
- name: string (required)
- description: string (optional, textarea)
- type: 'title' | 'badge' | 'namecard' (dropdown)
- rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'godlike' (dropdown)
- price: number (required, min: 1)
- icon_url: string (optional, for badges/namecards)
- display_order: number (default: 0)
- is_active: boolean (checkbox, default: true)
```

**Styling:**
- Based on `CreateTaskPage.tsx` form
- Modal or slide-over panel
- Validation on all required fields
- Submit/Cancel buttons at bottom

**Validation:**
```typescript
- name: required, min 3 chars, max 100 chars
- price: required, integer, min 1, max 10000
- type: required, must be valid enum
- rarity: required, must be valid enum
```

---

#### 4. DeleteConfirmModal.tsx

**Purpose:** Confirm deletion of shop item

**Props:**
```typescript
interface DeleteConfirmModalProps {
  itemName: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}
```

**UI:**
```tsx
<Modal>
  <h3>Delete Item?</h3>
  <p>Are you sure you want to delete "{itemName}"?</p>
  <p className="text-sm text-red-400">
    This action cannot be undone.
  </p>
  <div className="flex gap-4">
    <button onClick={onCancel}>Cancel</button>
    <button onClick={onConfirm} className="bg-red-500">
      Delete
    </button>
  </div>
</Modal>
```

**Error Handling:**
- If item has users who own it (foreign key constraint)
- Show error: "Cannot delete. This item is owned by users."

---

### Custom Hook: useShopItems.ts

```typescript
export function useShopItems() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all shop items
  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('shop_items')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    setItems(data);
  };

  // Create new item
  const createItem = async (input: CreateShopItemInput) => {
    const { data, error } = await supabase
      .from('shop_items')
      .insert(input)
      .select()
      .single();
    
    if (error) throw error;
    await fetchItems(); // Refresh list
    return data;
  };

  // Update existing item
  const updateItem = async (id: string, input: UpdateShopItemInput) => {
    const { data, error } = await supabase
      .from('shop_items')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    await fetchItems(); // Refresh list
    return data;
  };

  // Delete item
  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from('shop_items')
      .delete()
      .eq('id', id);
    
    if (error) {
      // Handle foreign key constraint error
      if (error.code === '23503') {
        throw new Error('Cannot delete item that users own');
      }
      throw error;
    }
    await fetchItems(); // Refresh list
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return {
    items,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    refetch: fetchItems
  };
}
```

---

### Type Definitions

**src/types/shop.ts** (may already exist, if so, no changes needed)

```typescript
export interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  type: 'title' | 'badge' | 'namecard';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'godlike';
  price: number;
  icon_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateShopItemInput {
  name: string;
  description?: string;
  type: 'title' | 'badge' | 'namecard';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'godlike';
  price: number;
  icon_url?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateShopItemInput {
  name?: string;
  description?: string;
  type?: 'title' | 'badge' | 'namecard';
  rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'godlike';
  price?: number;
  icon_url?: string;
  display_order?: number;
  is_active?: boolean;
}
```

---

## Security & Authentication

### Route Protection

**App.tsx:**
```tsx
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

**ProtectedRoute.tsx** (update existing component):
```tsx
// Add support for 'admin' role
const allowedRoles = ['student', 'teacher', 'admin'];

if (requiredRole && profile?.role !== requiredRole) {
  // Redirect based on actual role
  if (profile?.role === 'teacher') {
    return <Navigate to="/dashboard/teacher" />;
  } else if (profile?.role === 'student') {
    return <Navigate to="/dashboard/student" />;
  }
  return <Navigate to="/login" />;
}
```

### Row Level Security (RLS)

**shop_items table:**
- Current RLS: SELECT is public (for students to view shop)
- INSERT/UPDATE/DELETE: Already restricted to authenticated users
- Admin check happens at application level (not RLS)
- This is acceptable since only admin can access the page

**Optional Enhancement:**
- Add RLS policy checking for admin role on INSERT/UPDATE/DELETE
- Not required for MVP since page is already protected

---

## Data Flow

### Create Item Flow

```
Admin Dashboard
  ↓
Click "+ Add New Item"
  ↓
ShopItemForm opens (empty)
  ↓
Fill in form fields
  ↓
Click "Save"
  ↓
useShopItems.createItem()
  ↓
Supabase INSERT
  ↓
Refresh items list
  ↓
Close form, show success message
```

### Edit Item Flow

```
Admin Dashboard
  ↓
Click "Edit" on item row
  ↓
ShopItemForm opens (pre-filled with item data)
  ↓
Modify fields
  ↓
Click "Save"
  ↓
useShopItems.updateItem(id, changes)
  ↓
Supabase UPDATE
  ↓
Refresh items list
  ↓
Close form, show success message
```

### Delete Item Flow

```
Admin Dashboard
  ↓
Click "Delete" on item row
  ↓
DeleteConfirmModal opens
  ↓
Click "Confirm"
  ↓
useShopItems.deleteItem(id)
  ↓
Supabase DELETE
  ↓
SUCCESS: Refresh list, show message
ERROR (FK constraint): Show error message
```

---

## Error Handling

### Common Errors

1. **Foreign Key Constraint (Delete)**
   - Error code: `23503`
   - Message: "Cannot delete item that users own"
   - Solution: Tell admin to deactivate instead

2. **Validation Errors**
   - Missing required fields
   - Invalid price (negative or zero)
   - Show field-specific error messages

3. **Network Errors**
   - Show generic error: "Failed to save changes"
   - Provide retry button

4. **Unauthorized Access**
   - Auto-redirect to dashboard
   - No error message (silent redirect)

---

## Performance Considerations

1. **Table Loading**
   - Items fetched once on page load
   - Cached in component state
   - Refresh after each mutation

2. **Optimistic Updates (Optional)**
   - Update UI immediately
   - Rollback if server operation fails
   - Better UX but more complex

3. **Pagination (Future)**
   - Not needed for MVP (< 100 items expected)
   - Add if shop grows beyond 50 items

---

## Design System Integration

### Colors

**Type Badges:**
- Title: Blue (`bg-blue-500/20 text-blue-300`)
- Badge: Purple (`bg-purple-500/20 text-purple-300`)
- Namecard: Pink (`bg-pink-500/20 text-pink-300`)

**Rarity Badges:**
- Common: Gray (`bg-gray-500/20 text-gray-300`)
- Rare: Blue (`bg-blue-500/20 text-blue-300`)
- Epic: Purple (`bg-purple-500/20 text-purple-300`)
- Legendary: Gold (`bg-yellow-500/20 text-yellow-300`)
- Godlike: Red/Rainbow (`bg-red-500/20 text-red-300`)

**Buttons:**
- Primary: `bg-primary text-white`
- Delete: `bg-red-500 text-white`
- Cancel: `bg-gray-700 text-white`

---

**Architecture Status:** ✅ Complete  
**Ready for Implementation Plan:** ✅ Yes
