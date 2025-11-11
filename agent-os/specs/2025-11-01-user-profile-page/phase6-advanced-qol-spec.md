# Phase 6: Advanced QoL & Teacher Power-User Tools - Technical Specification

**Status:** 🟡 In Progress  
**Branch:** `feature/phase6-advanced-qol-filters-search-bulk`  
**Start Date:** 2025-11-09  
**Target Completion:** TBD

---

## 📋 Overview

This phase enhances the core task management loop by reducing friction for teachers and adding value for students through advanced filtering, search, bulk operations, and data export capabilities.

---

## 🎯 Goals

1. **Reduce Teacher Friction**: Streamline task management with bulk operations and export
2. **Improve Discoverability**: Enable users to quickly find tasks through filters and search
3. **Enhance UX**: Maintain elegant design system while adding powerful features
4. **Maintain Performance**: Ensure real-time updates without page refreshes

---

## 🔧 Feature Breakdown

### 1. Live Task Filtering

**User Stories:**
- As a **Teacher**, I want to filter tasks by subject and status so I can focus on specific categories
- As a **Student**, I want to filter my tasks by subject and status so I can prioritize my work

**Technical Requirements:**

#### Frontend Components
- **Location**: `TeacherDashboard.tsx`, `StudentDashboard.tsx`
- **New Components**: `TaskFilters.tsx` (shared component)

**Filter Types:**
1. **Subject Filter** (Dropdown)
   - Options: All Subjects, Mathematics, Science, English, History, etc.
   - Default: "All Subjects"
   
2. **Status Filter** (Segmented Control)
   - Options: All, Pending, Completed, Overdue
   - Default: "All"
   - Style: Segmented button group matching ShopPage filter pattern

**Implementation Details:**
```typescript
interface TaskFilters {
  subject: string | null;
  status: 'all' | 'pending' | 'completed' | 'overdue';
}
```

**Hook Modifications:**
- Update `useTasks.ts` to accept filter parameters
- Implement client-side filtering for real-time updates
- Maintain existing query structure, add `.filter()` logic

**UI Specifications:**
- Filters positioned at top of task list
- Horizontal layout on desktop, stack on mobile
- Use `bg-component-dark`, `border-border-dark`
- Match elegant design system (rounded-lg, shadow-md)

---

### 2. Live Search

**User Stories:**
- As a **Teacher/Student**, I want to search tasks by title so I can quickly find specific assignments

**Technical Requirements:**

#### Frontend Components
- **Component**: `TaskSearchBar.tsx` (shared component)
- **Location**: Above filters in both dashboards

**Implementation Details:**
```typescript
interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
```

**Features:**
- Real-time search (debounced at 300ms)
- Case-insensitive matching
- Search by task title
- Clear button when text is present
- Search icon (magnifying glass)

**UI Specifications:**
- Full-width input on mobile, max-w-md on desktop
- Icon: Lucide `Search` icon
- Style: `bg-component-dark`, `text-text-primary-dark`
- Placeholder: "Search tasks by title..."
- Clear button: Small `X` icon on right side

---

### 3. Elegant Bulk Operations (Teacher Only)

**User Stories:**
- As a **Teacher**, I want to select multiple tasks and delete/archive them at once so I can manage my task list efficiently

**Technical Requirements:**

#### Frontend Components
- **Modified**: `TeacherDashboard.tsx`
- **New Components**: 
  - `BulkActionBar.tsx` - Contextual action bar
  - `TaskCheckbox.tsx` - Checkbox for task selection

**Selection State:**
```typescript
interface BulkSelectionState {
  selectedTaskIds: Set<string>;
  isAllSelected: boolean;
}
```

**UI Flow:**
1. Add checkbox column to task table (leftmost)
2. Header checkbox for "Select All" (visible tasks only)
3. When ≥1 task selected, show `BulkActionBar` at bottom
4. Bar shows: "X tasks selected" + action buttons

**Bulk Actions:**
1. **Bulk Delete**
   - Confirmation modal: "Delete X tasks? This cannot be undone."
   - Delete all selected tasks from database
   - Show success toast: "X tasks deleted successfully"

2. **Bulk Archive** (Future-proof)
   - Add `archived` boolean column to tasks table
   - Confirmation modal: "Archive X tasks?"
   - Update tasks to set `archived = true`
   - Show success toast: "X tasks archived"

**BulkActionBar Specifications:**
- Position: Fixed bottom, full-width
- Height: 64px
- Background: `bg-component-dark` with `border-t border-border-dark`
- Shadow: `shadow-lg` upward
- Layout: Flex row, space-between
- Left side: "X tasks selected" text
- Right side: Action buttons
- Buttons: 
  - Delete: `bg-red-500 hover:bg-red-600`
  - Archive: `bg-yellow-500 hover:bg-yellow-600`
- Animation: Slide up from bottom (framer-motion)

**Database Migration:**
```sql
-- Add archived column to tasks table
ALTER TABLE tasks 
ADD COLUMN archived BOOLEAN DEFAULT FALSE;

-- Add index for performance
CREATE INDEX idx_tasks_archived ON tasks(archived);
```

---

### 4. Simple Bulk Assignment

**User Stories:**
- As a **Teacher**, I want to quickly select all students when creating a task so I don't have to click each one individually

**Technical Requirements:**

#### Frontend Components
- **Modified**: `CreateTaskPage.tsx`, `EditTaskPage.tsx`
- **Component**: Update `StudentSelector` component

**Features:**
- "Select All Students" button above student list
- "Deselect All" button (appears when all selected)
- Visual indication of selection count: "X of Y students selected"

**UI Specifications:**
- Button position: Top-right of student selector section
- Style: `bg-primary text-white hover:bg-primary/90`
- Icon: Lucide `CheckSquare` / `Square` icons
- Counter: `text-text-secondary-dark text-sm`

**Implementation:**
```typescript
const handleSelectAll = () => {
  setSelectedStudents(allStudents.map(s => s.id));
};

const handleDeselectAll = () => {
  setSelectedStudents([]);
};
```

---

### 5. Data Export (CSV)

**User Stories:**
- As a **Teacher**, I want to export my task list as CSV so I can analyze data in Excel/Google Sheets

**Technical Requirements:**

#### Frontend Components
- **Modified**: `TeacherDashboard.tsx`
- **New Utility**: `utils/exportCSV.ts`

**Export Button:**
- Position: Top-right of dashboard, next to "Create Task" button
- Icon: Lucide `Download` icon
- Text: "Export CSV"
- Style: `bg-component-dark border border-border-dark hover:bg-component-dark/80`

**CSV Format:**
```csv
Task ID,Title,Subject,Due Date,Status,Assigned Students,Created At
uuid-123,Math Homework,Mathematics,2025-11-15,pending,"John Doe, Jane Smith",2025-11-09
```

**Implementation:**
```typescript
interface CSVExportData {
  taskId: string;
  title: string;
  subject: string;
  dueDate: string;
  status: string;
  assignedStudents: string; // comma-separated names
  createdAt: string;
}

function exportToCSV(tasks: Task[]): void {
  // Convert tasks to CSV format
  // Trigger browser download
}
```

**Features:**
- Export respects current filters/search (exports visible tasks only)
- Filename: `tasks-export-YYYY-MM-DD.csv`
- Use `papaparse` library for CSV generation
- Show success toast: "Tasks exported successfully"

---

## 🗄️ Database Changes

### New Migration: `add_archived_column.sql`

```sql
-- Migration: Add archived column for bulk archive feature
-- Date: 2025-11-09

BEGIN;

-- Add archived column
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_tasks_archived ON tasks(archived);

-- Update RLS policies to exclude archived tasks by default
-- (Teachers can still see archived tasks with a filter)

COMMIT;
```

---

## 🎨 UI/UX Specifications

### Design System Compliance

All new components MUST follow the Elegant Stitch design system:

**Colors:**
- Background: `bg-background-dark` (#0f1419)
- Components: `bg-component-dark` (#1a1f2e)
- Borders: `border-border-dark` (#2a3441)
- Text Primary: `text-text-primary-dark` (#e6edf3)
- Text Secondary: `text-text-secondary-dark` (#8b949e)
- Primary: `bg-primary` (#3b82f6)

**Spacing:**
- Card padding: `p-6`
- Section gaps: `gap-6`
- Button padding: `px-4 py-2`

**Borders & Shadows:**
- Border radius: `rounded-lg`
- Shadows: `shadow-md`
- Border width: `border` (1px)

**Typography:**
- Headings: `font-semibold`
- Body: `font-normal`
- Small text: `text-sm`

---

## 📱 Responsive Design

### Mobile Breakpoints

**Filters & Search:**
- Desktop: Horizontal layout, side-by-side
- Mobile: Stack vertically, full-width

**Bulk Action Bar:**
- Desktop: Full-width, fixed bottom
- Mobile: Same, but buttons may stack if needed

**Export Button:**
- Desktop: Full button with icon + text
- Mobile: Icon-only button with tooltip

---

## ✅ Acceptance Criteria

### Feature 1: Live Task Filtering
- [ ] Subject dropdown shows all unique subjects from tasks
- [ ] Status filter has 4 options: All, Pending, Completed, Overdue
- [ ] Filters update task list in real-time (no page refresh)
- [ ] Filters work on both Teacher and Student dashboards
- [ ] Filter state persists during session (not across page reloads)
- [ ] UI matches elegant design system

### Feature 2: Live Search
- [ ] Search input appears above filters
- [ ] Search is case-insensitive
- [ ] Search updates in real-time with 300ms debounce
- [ ] Clear button appears when text is present
- [ ] Search works with filters (AND logic)
- [ ] UI matches elegant design system

### Feature 3: Bulk Operations
- [ ] Checkboxes appear in task table for teachers
- [ ] "Select All" checkbox in table header works correctly
- [ ] Bulk action bar appears when ≥1 task selected
- [ ] Bar shows correct count of selected tasks
- [ ] Bulk Delete shows confirmation modal
- [ ] Bulk Delete removes all selected tasks
- [ ] Bulk Archive updates tasks to archived=true
- [ ] Success toasts appear after actions
- [ ] Selection clears after action completes
- [ ] UI matches elegant design system with smooth animations

### Feature 4: Bulk Assignment
- [ ] "Select All Students" button appears in CreateTaskPage
- [ ] Button toggles between "Select All" and "Deselect All"
- [ ] Selection counter shows "X of Y students selected"
- [ ] Works correctly in both Create and Edit modes
- [ ] UI matches elegant design system

### Feature 5: Data Export
- [ ] Export button appears in TeacherDashboard
- [ ] Clicking button downloads CSV file
- [ ] CSV includes all visible tasks (respects filters)
- [ ] CSV format matches specification
- [ ] Filename includes current date
- [ ] Success toast appears after export
- [ ] UI matches elegant design system

---

## 🧪 Testing Plan

### Unit Tests
- [ ] Filter logic in `useTasks` hook
- [ ] Search debounce functionality
- [ ] CSV export utility function
- [ ] Bulk selection state management

### Integration Tests
- [ ] Filters + Search work together correctly
- [ ] Bulk operations update database correctly
- [ ] Export includes correct filtered data

### Manual Testing
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on mobile (responsive design)
- [ ] Test with large datasets (100+ tasks)
- [ ] Test edge cases (no tasks, all tasks selected, etc.)

---

## 📦 Dependencies

### New Packages
```json
{
  "papaparse": "^5.4.1",
  "@types/papaparse": "^5.3.14"
}
```

### Existing Packages (No Changes)
- `lucide-react` - Icons
- `framer-motion` - Animations
- `react-hot-toast` - Notifications

---

## 🚀 Implementation Order

### Phase 6.1: Filters & Search (Priority 1)
1. Create `TaskFilters.tsx` component
2. Create `TaskSearchBar.tsx` component
3. Update `useTasks.ts` hook with filter/search logic
4. Integrate into `TeacherDashboard.tsx`
5. Integrate into `StudentDashboard.tsx`
6. Test and polish

### Phase 6.2: Bulk Operations (Priority 2)
1. Create database migration for `archived` column
2. Create `BulkActionBar.tsx` component
3. Add checkbox column to task table
4. Implement selection state management
5. Implement bulk delete functionality
6. Implement bulk archive functionality
7. Add confirmation modals
8. Test and polish

### Phase 6.3: Bulk Assignment (Priority 3)
1. Update `StudentSelector` component
2. Add "Select All" / "Deselect All" buttons
3. Add selection counter
4. Test in Create and Edit modes
5. Polish UI

### Phase 6.4: Data Export (Priority 4)
1. Create `exportCSV.ts` utility
2. Add export button to `TeacherDashboard`
3. Implement CSV generation logic
4. Test with various filter combinations
5. Polish UI

---

## 🔄 Future Enhancements (Post-Phase 6)

- **Advanced Filters**: Filter by date range, assigned students
- **Saved Filter Presets**: Save common filter combinations
- **Bulk Edit**: Edit multiple tasks at once (change subject, due date, etc.)
- **Export Formats**: PDF, Excel, JSON
- **Import Tasks**: Upload CSV to create multiple tasks
- **Archive View**: Dedicated page to view/restore archived tasks

---

## 📝 Notes

- All features must maintain the elegant design system established in Phase 5
- Performance is critical - filtering/search must feel instant
- Bulk operations need clear confirmation to prevent accidental deletions
- CSV export should be simple and reliable (no complex formatting)
- This phase sets the foundation for advanced features in Phases 7-10

---

**Spec Version:** 1.0  
**Last Updated:** 2025-11-09  
**Author:** Cascade AI
