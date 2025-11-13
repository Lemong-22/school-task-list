# Phase 9.1: Admin Dashboard - Implementation Plan

**Date:** 2025-11-13  
**Status:** Planning Phase  
**Feature:** Admin Dashboard (Shop Management)

---

## Implementation Overview

This implementation follows a **bottom-up approach**: Database → Backend → Frontend.

**Total Estimated Time:** 3-4 hours  
**Risk Level:** Low (leveraging existing patterns and components)

---

## Phase A: Database Layer (30 minutes)

### A.1 Create Migration File

**File:** `supabase/migrations/030_add_admin_role.sql`

**Tasks:**
1. Drop existing `profiles_role_check` constraint
2. Add new constraint including 'admin' role
3. Create index for admin role queries (optional)
4. Add comments for documentation

**SQL:**
```sql
BEGIN;

ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('student', 'teacher', 'admin'));

COMMENT ON COLUMN profiles.role IS 'User role: student, teacher, or admin';

CREATE INDEX IF NOT EXISTS idx_profiles_admin_role 
ON profiles(role) WHERE role = 'admin';

COMMIT;
```

**Acceptance Criteria:**
- ✅ Migration runs without errors
- ✅ Constraint allows 'admin' role
- ✅ Existing student/teacher roles still work

**Testing:**
```sql
-- Test creating a profile with admin role
INSERT INTO profiles (role, full_name, email) 
VALUES ('admin', 'Test Admin', 'admin@test.com');

-- Should succeed
```

---

### A.2 Set Your User as Admin

**Manual Step:** (Run in Supabase SQL Editor)

**Tasks:**
1. Find your user ID
2. Update your profile to admin role
3. Verify the change

**SQL:**
```sql
-- Find your user ID
SELECT id, full_name, email, role FROM profiles 
WHERE email = 'your-email@example.com';

-- Update to admin (replace with your actual ID)
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'your-user-id-here';

-- Verify
SELECT id, full_name, email, role FROM profiles 
WHERE role = 'admin';
```

**Acceptance Criteria:**
- ✅ Your user has `role = 'admin'`
- ✅ You can see the change in Supabase dashboard

---

## Phase B: Frontend - Type Definitions (15 minutes)

### B.1 Check/Create Shop Types

**File:** `src/types/shop.ts`

**Tasks:**
1. Check if file exists
2. If exists, verify ShopItem interface
3. If not exists, create complete type definitions

**Types Needed:**
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

**Acceptance Criteria:**
- ✅ Types are defined
- ✅ TypeScript compilation succeeds
- ✅ Enums match database constraints

---

## Phase C: Frontend - Custom Hook (30 minutes)

### C.1 Create useShopItems Hook

**File:** `src/hooks/useShopItems.ts`

**Tasks:**
1. Create hook with state management
2. Implement fetchItems function
3. Implement createItem function
4. Implement updateItem function
5. Implement deleteItem function
6. Add error handling

**Implementation:**
```typescript
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { ShopItem, CreateShopItemInput, UpdateShopItemInput } from '../types/shop';

export function useShopItems() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('shop_items')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (fetchError) throw fetchError;
      setItems(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (input: CreateShopItemInput) => {
    const { data, error } = await supabase
      .from('shop_items')
      .insert({
        ...input,
        display_order: input.display_order ?? 0,
        is_active: input.is_active ?? true
      })
      .select()
      .single();
    
    if (error) throw error;
    await fetchItems();
    return data;
  };

  const updateItem = async (id: string, input: UpdateShopItemInput) => {
    const { data, error } = await supabase
      .from('shop_items')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    await fetchItems();
    return data;
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from('shop_items')
      .delete()
      .eq('id', id);
    
    if (error) {
      if (error.code === '23503') {
        throw new Error('Cannot delete item that users own');
      }
      throw error;
    }
    await fetchItems();
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

**Acceptance Criteria:**
- ✅ Hook fetches items on mount
- ✅ All CRUD operations work
- ✅ Error handling is robust
- ✅ Loading states work correctly

---

## Phase D: Frontend - Components (1.5-2 hours)

### D.1 Create ShopItemTable Component

**File:** `src/components/admin/ShopItemTable.tsx`

**Tasks:**
1. Create table component
2. Display all item fields
3. Add Edit/Delete action buttons
4. Style with Elegant theme
5. Add empty state

**Key Features:**
- Elegant table design (like TeacherDashboard)
- Type/Rarity badges with colors
- Hover states on rows
- Action buttons in last column

**Acceptance Criteria:**
- ✅ Table displays all items
- ✅ Columns are properly formatted
- ✅ Actions trigger callbacks
- ✅ Empty state shows when no items

---

### D.2 Create ShopItemForm Component

**File:** `src/components/admin/ShopItemForm.tsx`

**Tasks:**
1. Create form component with all fields
2. Add validation
3. Handle create vs edit mode
4. Style with Elegant theme (like CreateTaskPage)
5. Add submit/cancel buttons

**Form Fields:**
- Name (text input, required)
- Description (textarea, optional)
- Type (dropdown, required)
- Rarity (dropdown, required)
- Price (number input, required, min: 1)
- Icon URL (text input, optional)
- Display Order (number input, default: 0)
- Active (checkbox, default: true)

**Acceptance Criteria:**
- ✅ Form validates all fields
- ✅ Create mode works (empty form)
- ✅ Edit mode works (pre-filled)
- ✅ Error messages display clearly
- ✅ Submit saves to database

---

### D.3 Create DeleteConfirmModal Component

**File:** `src/components/admin/DeleteConfirmModal.tsx`

**Tasks:**
1. Create confirmation modal
2. Show item name
3. Add Cancel/Delete buttons
4. Style with Elegant theme

**Acceptance Criteria:**
- ✅ Modal displays item name
- ✅ Cancel button closes modal
- ✅ Delete button triggers deletion
- ✅ Error handling for FK constraints

---

### D.4 Create AdminDashboard Page

**File:** `src/pages/AdminDashboard.tsx`

**Tasks:**
1. Create main page component
2. Use useShopItems hook
3. Integrate table component
4. Add "Add New Item" button
5. Handle form open/close state
6. Handle delete modal state
7. Add loading/error states

**Layout:**
```tsx
<Layout>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Header */}
    <div className="mb-6">
      <h1>Admin Dashboard</h1>
      <p>Manage Shop Items</p>
    </div>

    {/* Loading State */}
    {loading && <Spinner />}

    {/* Error State */}
    {error && <ErrorMessage />}

    {/* Main Content */}
    {!loading && !error && (
      <>
        <button onClick={openCreateForm}>+ Add New Item</button>
        <ShopItemTable 
          items={items}
          onEdit={openEditForm}
          onDelete={openDeleteModal}
        />
      </>
    )}

    {/* Modals */}
    {isFormOpen && <ShopItemForm ... />}
    {isDeleteModalOpen && <DeleteConfirmModal ... />}
  </div>
</Layout>
```

**Acceptance Criteria:**
- ✅ Page is accessible at `/admin`
- ✅ All components integrated
- ✅ CRUD operations work end-to-end
- ✅ Loading/error states display

---

## Phase E: Routing & Protection (30 minutes)

### E.1 Update ProtectedRoute Component

**File:** `src/components/ProtectedRoute.tsx`

**Tasks:**
1. Add support for 'admin' role
2. Update redirect logic
3. Test role-based access

**Changes:**
```tsx
// Existing component, add admin handling
if (requiredRole && profile?.role !== requiredRole) {
  // Redirect non-admins to their dashboard
  if (profile?.role === 'teacher') {
    return <Navigate to="/dashboard/teacher" replace />;
  } else if (profile?.role === 'student') {
    return <Navigate to="/dashboard/student" replace />;
  } else if (profile?.role === 'admin') {
    // Admin trying to access student/teacher route
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/login" replace />;
}
```

**Acceptance Criteria:**
- ✅ Admin can access `/admin`
- ✅ Students cannot access `/admin`
- ✅ Teachers cannot access `/admin`
- ✅ Redirects work correctly

---

### E.2 Add Admin Route to App.tsx

**File:** `src/App.tsx`

**Tasks:**
1. Import AdminDashboard
2. Add protected route
3. Test navigation

**Code:**
```tsx
import { AdminDashboard } from './pages/AdminDashboard';

// Add route
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

**Acceptance Criteria:**
- ✅ Route is registered
- ✅ Protection works
- ✅ Page renders for admins

---

## Phase F: Testing & Polish (30 minutes)

### F.1 Functional Testing

**Admin Access:**
- [ ] Navigate to `/admin` as admin → Success
- [ ] Navigate to `/admin` as teacher → Redirect to teacher dashboard
- [ ] Navigate to `/admin` as student → Redirect to student dashboard
- [ ] Navigate to `/admin` not logged in → Redirect to login

**CRUD Operations:**
- [ ] Create new item → Item appears in table
- [ ] Edit existing item → Changes saved
- [ ] Delete item (no owners) → Item removed
- [ ] Delete item (has owners) → Error message shown
- [ ] Form validation → Required fields enforced

**UI/UX:**
- [ ] Table sorts by display_order
- [ ] Type/Rarity badges have correct colors
- [ ] Loading spinner shows while fetching
- [ ] Error messages are clear
- [ ] Success feedback after operations

---

### F.2 Visual Polish

**Tasks:**
1. Ensure all colors match Elegant theme
2. Add smooth transitions
3. Improve spacing/alignment
4. Test responsive design
5. Add tooltips where helpful

**Design Checklist:**
- [ ] Uses `bg-component-dark`, `bg-background-dark`
- [ ] Text uses `text-text-primary-dark`, `text-text-secondary-dark`
- [ ] Buttons use `bg-primary` with hover states
- [ ] Borders use `border-border-dark`
- [ ] Consistent `rounded-lg` corners
- [ ] Proper shadows (`shadow-md`)

---

## Phase G: Documentation (15 minutes)

### G.1 Update README or Docs

**Tasks:**
1. Document admin access instructions
2. Explain how to add new admins
3. Document CRUD operations

**Content:**
```markdown
## Admin Dashboard

The Admin Dashboard allows administrators to manage shop items.

**Access:** Navigate to `/admin` (hidden route)

**Requirements:** Your user must have `role = 'admin'` in the database

**Adding a New Admin:**
1. Go to Supabase SQL Editor
2. Run: `UPDATE profiles SET role = 'admin' WHERE email = 'user@example.com';`

**Features:**
- Create new shop items
- Edit existing items
- Delete items (if not owned by users)
- View all items in table format
```

---

## Testing Checklist

### Security
- [ ] Only admins can access `/admin`
- [ ] Non-admins are redirected
- [ ] No admin link in navigation
- [ ] Direct URL access is blocked

### CRUD Operations
- [ ] Create item works
- [ ] Edit item works
- [ ] Delete item works
- [ ] Read/List items works
- [ ] Validation prevents invalid data

### UI/UX
- [ ] Elegant theme applied
- [ ] Responsive design works
- [ ] Loading states work
- [ ] Error states work
- [ ] Success messages appear

### Error Handling
- [ ] FK constraint error handled
- [ ] Network errors handled
- [ ] Validation errors shown
- [ ] Empty states handled

---

## Rollout Plan

### Step 1: Deploy Database
1. Run migration `030_add_admin_role.sql`
2. Manually update your user to admin
3. Verify in Supabase dashboard

### Step 2: Deploy Frontend
1. Push code to repository
2. Deploy to production
3. Test `/admin` route

### Step 3: Verify
1. Login as admin
2. Navigate to `/admin`
3. Test all CRUD operations
4. Verify redirects for non-admins

---

## Success Metrics

**Functionality:**
- Admin can create/edit/delete items ✅
- Non-admins cannot access page ✅
- All operations persist to database ✅

**Performance:**
- Page loads < 2 seconds ✅
- CRUD operations < 1 second ✅
- No lag in UI ✅

**UX:**
- Intuitive interface ✅
- Clear error messages ✅
- Consistent design ✅

---

**Implementation Plan Status:** ✅ Complete  
**Ready to Begin:** ✅ Yes  
**Estimated Completion:** 3-4 hours
