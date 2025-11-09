# Technical Architecture: Task Filters & Search
**Phase 6: Advanced QoL & Teacher Power-User Tools**

**Date:** 2025-11-09  
**Status:** 🟡 Planning Phase  
**Architecture Decision:** Backend Filtering (Supabase RPC)

---

## 📐 Architecture Overview

This feature implements **server-side filtering and search** using Supabase RPC (Remote Procedure Call) functions. The React frontend will send filter parameters to PostgreSQL functions that efficiently query and return only matching tasks.

### Why Backend Filtering?

- ✅ **Scalable**: Efficiently handles 1000+ tasks
- ✅ **Database-optimized**: Leverages PostgreSQL indexes
- ✅ **Network-efficient**: Only transfers matching results
- ✅ **Future-proof**: Easy to add complex filters later

---

## 🗄️ Database Layer

### New PostgreSQL Functions (RPC)

We will create **TWO** new RPC functions in Supabase:

#### 1. `filter_teacher_tasks`
**Purpose:** Fetch filtered tasks for teachers  
**Parameters:**
```sql
CREATE OR REPLACE FUNCTION filter_teacher_tasks(
  p_teacher_id UUID,
  p_subject TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'all',
  p_search TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  subject TEXT,
  due_date TIMESTAMPTZ,
  coin_reward INTEGER,
  teacher_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.description,
    t.subject,
    t.due_date,
    t.coin_reward,
    t.teacher_id,
    t.created_at,
    t.updated_at
  FROM tasks t
  WHERE 
    t.teacher_id = p_teacher_id
    AND (p_subject IS NULL OR t.subject = p_subject)
    AND (
      p_status = 'all' 
      OR (p_status = 'pending' AND t.due_date >= NOW())
      OR (p_status = 'overdue' AND t.due_date < NOW())
      -- Note: 'completed' status requires checking task_assignments
    )
    AND (
      p_search IS NULL 
      OR p_search = '' 
      OR t.title ILIKE '%' || p_search || '%'
    )
  ORDER BY t.created_at DESC;
END;
$$;
```

**Notes:**
- Uses `ILIKE` for case-insensitive search
- `%` wildcards allow partial matching
- Filters are applied using `AND` logic
- Returns results ordered by creation date (newest first)

---

#### 2. `filter_student_task_assignments`
**Purpose:** Fetch filtered task assignments for students  
**Parameters:**
```sql
CREATE OR REPLACE FUNCTION filter_student_task_assignments(
  p_student_id UUID,
  p_subject TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'all',
  p_search TEXT DEFAULT NULL
)
RETURNS TABLE (
  id INTEGER,
  task_id UUID,
  student_id UUID,
  is_completed BOOLEAN,
  completed_at TIMESTAMPTZ,
  task JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ta.id,
    ta.task_id,
    ta.student_id,
    ta.is_completed,
    ta.completed_at,
    jsonb_build_object(
      'id', t.id,
      'title', t.title,
      'description', t.description,
      'subject', t.subject,
      'due_date', t.due_date,
      'coin_reward', t.coin_reward,
      'teacher_id', t.teacher_id,
      'created_at', t.created_at,
      'updated_at', t.updated_at
    ) as task
  FROM task_assignments ta
  INNER JOIN tasks t ON ta.task_id = t.id
  WHERE 
    ta.student_id = p_student_id
    AND (p_subject IS NULL OR t.subject = p_subject)
    AND (
      p_status = 'all'
      OR (p_status = 'pending' AND ta.is_completed = FALSE AND t.due_date >= NOW())
      OR (p_status = 'completed' AND ta.is_completed = TRUE)
      OR (p_status = 'overdue' AND ta.is_completed = FALSE AND t.due_date < NOW())
    )
    AND (
      p_search IS NULL 
      OR p_search = '' 
      OR t.title ILIKE '%' || p_search || '%'
    )
  ORDER BY ta.id DESC;
END;
$$;
```

**Notes:**
- Joins `task_assignments` with `tasks` table
- Returns task data as JSONB for easy parsing
- Status logic considers both completion and due date
- Matches existing `TaskAssignmentWithTask` type structure

---

### Database Indexes (Performance Optimization)

Create indexes to speed up RPC queries:

```sql
-- Index for teacher_id lookups
CREATE INDEX IF NOT EXISTS idx_tasks_teacher_id 
ON tasks(teacher_id);

-- Index for subject filtering
CREATE INDEX IF NOT EXISTS idx_tasks_subject 
ON tasks(subject);

-- Index for due_date comparisons (overdue check)
CREATE INDEX IF NOT EXISTS idx_tasks_due_date 
ON tasks(due_date);

-- Index for title search (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_tasks_title_lower 
ON tasks(LOWER(title));

-- Index for student assignments
CREATE INDEX IF NOT EXISTS idx_task_assignments_student_id 
ON task_assignments(student_id);

-- Index for completion status
CREATE INDEX IF NOT EXISTS idx_task_assignments_is_completed 
ON task_assignments(is_completed);
```

**Note:** The `LOWER(title)` index improves `ILIKE` search performance.

---

## 🔧 Frontend Layer

### Hook Refactoring

#### Updated `useTeacherTasks` Hook

**New Interface:**
```typescript
interface TaskFilters {
  subject: string | null;
  status: 'all' | 'pending' | 'completed' | 'overdue';
  search: string;
}

export const useTeacherTasks = (teacherId: string | null, filters?: TaskFilters)
```

**Implementation Strategy:**
```typescript
const fetchTasks = useCallback(async () => {
  if (!teacherId) {
    setLoading(false);
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const { data, error: fetchError } = await supabase.rpc('filter_teacher_tasks', {
      p_teacher_id: teacherId,
      p_subject: filters?.subject || null,
      p_status: filters?.status || 'all',
      p_search: filters?.search || null,
    });

    if (fetchError) throw fetchError;

    setTasks(data || []);
  } catch (err: any) {
    setError(err.message || 'Failed to fetch tasks');
    console.error('Error fetching tasks:', err);
  } finally {
    setLoading(false);
  }
}, [teacherId, filters]);
```

**Key Changes:**
- Add optional `filters` parameter to hook
- Replace `.from('tasks').select()` with `.rpc('filter_teacher_tasks')`
- Pass filter parameters to RPC function
- Hook will re-fetch when `filters` object changes

---

#### Updated `useTasks` Hook (Student)

**New Interface:**
```typescript
interface TaskFilters {
  subject: string | null;
  status: 'all' | 'pending' | 'completed' | 'overdue';
  search: string;
}

export const useTasks = (studentId: string | null, filters?: TaskFilters)
```

**Implementation Strategy:**
```typescript
const fetchTasks = useCallback(async () => {
  if (!studentId) {
    setLoading(false);
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const { data, error: fetchError } = await supabase.rpc('filter_student_task_assignments', {
      p_student_id: studentId,
      p_subject: filters?.subject || null,
      p_status: filters?.status || 'all',
      p_search: filters?.search || null,
    });

    if (fetchError) throw fetchError;

    setTasks(data || []);
  } catch (err: any) {
    setError(err.message || 'Failed to fetch tasks');
    console.error('Error fetching tasks:', err);
  } finally {
    setLoading(false);
  }
}, [studentId, filters]);
```

---

### New React Components

#### 1. `TaskFilters.tsx` (Shared Component)

**Location:** `src/components/TaskFilters.tsx`

**Props Interface:**
```typescript
interface TaskFiltersProps {
  filters: {
    subject: string | null;
    status: 'all' | 'pending' | 'completed' | 'overdue';
    search: string;
  };
  onFilterChange: (filters: TaskFiltersProps['filters']) => void;
  onClearFilters: () => void;
}
```

**Component Structure:**
```typescript
export const TaskFilters = ({ filters, onFilterChange, onClearFilters }: TaskFiltersProps) => {
  const [searchInput, setSearchInput] = useState(filters.search);
  
  // Debounced search (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ ...filters, search: searchInput });
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchInput]);
  
  return (
    <div className="filter-bar">
      {/* Search Input */}
      {/* Subject Dropdown */}
      {/* Status Segmented Control */}
    </div>
  );
};
```

**Key Features:**
- Uses `useEffect` for debounced search (300ms delay)
- Search input has local state to avoid lag
- Subject dropdown populated from `SUBJECT_LIST`
- Status uses segmented control (4 buttons)
- Responsive: horizontal on desktop, vertical on mobile

---

#### 2. `SegmentedControl.tsx` (Reusable Component)

**Location:** `src/components/SegmentedControl.tsx`

**Props Interface:**
```typescript
interface SegmentedControlProps {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}
```

**Usage Example:**
```typescript
<SegmentedControl
  options={[
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'overdue', label: 'Overdue' },
  ]}
  value={filters.status}
  onChange={(status) => onFilterChange({ ...filters, status })}
/>
```

**Styling:**
- Match ShopPage segmented control design
- Active button: `bg-[#223149] text-white`
- Inactive buttons: `bg-transparent text-text-secondary-dark`
- Smooth transition on hover/active

---

#### 3. `EmptyState.tsx` (Shared Component)

**Location:** `src/components/EmptyState.tsx`

**Props Interface:**
```typescript
interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}
```

**Usage Example:**
```typescript
{tasks.length === 0 && (
  <EmptyState
    title="No tasks found"
    message="Try adjusting your filters or search query"
    actionLabel="Clear Filters"
    onAction={handleClearFilters}
    icon={<Search className="w-12 h-12 text-text-secondary-dark" />}
  />
)}
```

---

## 🎨 UI Component Hierarchy

```
TeacherDashboard / StudentDashboard
├── TaskFilters
│   ├── SearchInput (with clear button)
│   ├── SubjectDropdown (select element)
│   └── SegmentedControl (Status filter)
│
├── TaskList / TaskGrid
│   ├── TaskCard (existing)
│   └── EmptyState (if no results)
│
└── (rest of dashboard)
```

---

## 📊 Data Flow Architecture

### Flow Diagram

```
User Interaction
    ↓
Filter State (React useState)
    ↓
useTeacherTasks / useTasks Hook
    ↓
Supabase RPC Call
    ↓
PostgreSQL Function (filter_teacher_tasks / filter_student_task_assignments)
    ↓
Database Query with Indexes
    ↓
Filtered Results (JSON)
    ↓
React Hook setState
    ↓
UI Re-render with Filtered Tasks
```

---

## 🔄 State Management

### Filter State in Dashboard Components

**TeacherDashboard State:**
```typescript
const [filters, setFilters] = useState<TaskFilters>({
  subject: null,
  status: 'all',
  search: '',
});

const { tasks, loading, error } = useTeacherTasks(user?.id, filters);

const handleFilterChange = (newFilters: TaskFilters) => {
  setFilters(newFilters);
  // Hook automatically refetches when filters change
};

const handleClearFilters = () => {
  setFilters({
    subject: null,
    status: 'all',
    search: '',
  });
};
```

**Key Points:**
- Filter state is local to the dashboard component
- No localStorage (session-only persistence)
- Filters reset on page refresh
- Hook dependency on `filters` triggers automatic refetch

---

## 🚀 Performance Considerations

### Debouncing Strategy

**Search Input:**
- User types → Local state updates immediately (no lag)
- After 300ms of no typing → Trigger filter change
- Filter change → Hook refetches from database

**Implementation:**
```typescript
const [searchInput, setSearchInput] = useState(filters.search);

useEffect(() => {
  const timer = setTimeout(() => {
    onFilterChange({ ...filters, search: searchInput });
  }, 300);
  
  return () => clearTimeout(timer);
}, [searchInput]);
```

### Network Efficiency

- Each filter change triggers ONE RPC call
- Database returns only matching tasks
- No overfetching of data
- Indexes ensure fast query execution

---

## 🔐 Security Considerations

### RLS (Row Level Security)

The RPC functions **must** respect existing RLS policies:

**Teacher RLS:**
```sql
-- Teachers can only see their own tasks
CREATE POLICY "Teachers can view own tasks"
ON tasks FOR SELECT
USING (auth.uid() = teacher_id);
```

**Student RLS:**
```sql
-- Students can only see their assigned tasks
CREATE POLICY "Students can view assigned tasks"
ON task_assignments FOR SELECT
USING (auth.uid() = student_id);
```

**Note:** Our RPC functions use `p_teacher_id` and `p_student_id` parameters, which should be validated against `auth.uid()` in production.

---

## 📱 Responsive Design

### Desktop Layout (≥768px)
```
┌────────────────────────────────────────────────────┐
│  [Search Input.................] [Subject▼] [Status Segmented] │
└────────────────────────────────────────────────────┘
```

### Mobile Layout (<768px)
```
┌──────────────────────────┐
│ [Search Input..........] │
├──────────────────────────┤
│ [Subject Dropdown▼]      │
├──────────────────────────┤
│ [Status Segmented Ctrl]  │
└──────────────────────────┘
```

**Implementation:**
```typescript
<div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
  <SearchInput className="w-full md:flex-1" />
  <div className="flex gap-2 w-full md:w-auto">
    <SubjectDropdown />
    <SegmentedControl />
  </div>
</div>
```

---

## ✅ Acceptance Criteria (Technical)

### Database Layer
- [ ] `filter_teacher_tasks` RPC function created and tested
- [ ] `filter_student_task_assignments` RPC function created and tested
- [ ] All 6 database indexes created
- [ ] RPC functions respect RLS policies
- [ ] RPC functions return correct data types

### Hook Layer
- [ ] `useTeacherTasks` refactored to accept filters parameter
- [ ] `useTasks` refactored to accept filters parameter
- [ ] Hooks trigger refetch when filters change
- [ ] Hooks handle RPC errors gracefully

### Component Layer
- [ ] `TaskFilters` component created with all three controls
- [ ] `SegmentedControl` component created and styled
- [ ] `EmptyState` component created with action button
- [ ] Search has 300ms debounce
- [ ] Search has clear button (X)
- [ ] Filters are responsive (desktop/mobile)

### Integration
- [ ] Filters work correctly in `TeacherDashboard`
- [ ] Filters work correctly in `StudentDashboard`
- [ ] Multiple filters use AND logic
- [ ] Empty state shows when no results
- [ ] "Clear Filters" button resets all filters
- [ ] UI matches Elegant Stitch design system

---

## 🧪 Testing Strategy

### Unit Tests
- RPC function logic (mock Supabase)
- Debounce functionality
- Filter state management

### Integration Tests
- Full filter flow: UI → Hook → RPC → UI
- Multiple filter combinations
- Edge cases (empty results, all filters active)

### Manual Testing
- Test with 100+ tasks
- Test search performance
- Test on mobile devices
- Test with slow network (3G throttling)

---

## 📦 Dependencies

**No new NPM packages required!** 🎉

All functionality uses existing dependencies:
- `react` - State management, hooks
- `@supabase/supabase-js` - RPC calls
- `lucide-react` - Icons (Search, X)
- `framer-motion` - (optional) Smooth transitions

---

## 🔮 Future Enhancements

### Phase 7+ Additions
- **Advanced Filters**: Date range, assigned students
- **Saved Filter Presets**: Store favorite filter combinations
- **Filter Analytics**: Track which filters are most used
- **Full-text Search**: PostgreSQL `ts_vector` for description search
- **Filter Suggestions**: Auto-suggest subjects based on typing

---

**Architecture Version:** 1.0  
**Last Updated:** 2025-11-09  
**Reviewed By:** Product Manager  
**Status:** ✅ Ready for Implementation
