# Implementation Plan: Task Filters & Search
**Phase 6: Advanced QoL & Teacher Power-User Tools**

**Date:** 2025-11-09  
**Status:** 🟡 Planning Phase  
**Estimated Duration:** 4-6 hours

---

## 📋 Implementation Overview

This document outlines the step-by-step implementation plan for the Task Filters & Search feature. The plan is divided into 4 phases, each with clear deliverables and acceptance criteria.

---

## 🎯 Implementation Phases

### **Phase 1: Database Layer** (Priority: CRITICAL)
**Duration:** 1-1.5 hours  
**Dependencies:** None

#### Tasks

**1.1 Create Database Migration File**
- **File:** `supabase/migrations/YYYYMMDDHHMMSS_add_task_filters_rpc.sql`
- **Content:**
  - Create `filter_teacher_tasks` RPC function
  - Create `filter_student_task_assignments` RPC function
  - Create 6 performance indexes
  - Add comments to functions for documentation

**1.2 Test RPC Functions in Supabase Dashboard**
- Navigate to SQL Editor in Supabase
- Run migration SQL manually
- Test both functions with sample parameters
- Verify results match expected output
- Check query execution time (<100ms ideal)

**1.3 Verify RLS Policies**
- Ensure RPC functions respect existing Row Level Security
- Test with different user roles (teacher/student)
- Confirm data isolation between users

#### Acceptance Criteria
- [ ] Migration file created and committed
- [ ] Both RPC functions execute successfully
- [ ] Indexes created (verify with `\di` in psql)
- [ ] RPC functions return correct data structure
- [ ] Query performance <100ms for 500 tasks
- [ ] RLS policies enforced correctly

#### Rollback Plan
```sql
-- If needed, drop functions and indexes
DROP FUNCTION IF EXISTS filter_teacher_tasks;
DROP FUNCTION IF EXISTS filter_student_task_assignments;
DROP INDEX IF EXISTS idx_tasks_teacher_id;
DROP INDEX IF EXISTS idx_tasks_subject;
DROP INDEX IF EXISTS idx_tasks_due_date;
DROP INDEX IF EXISTS idx_tasks_title_lower;
DROP INDEX IF EXISTS idx_task_assignments_student_id;
DROP INDEX IF EXISTS idx_task_assignments_is_completed;
```

---

### **Phase 2: React Hooks Refactoring** (Priority: HIGH)
**Duration:** 1 hour  
**Dependencies:** Phase 1 complete

#### Tasks

**2.1 Update `useTeacherTasks` Hook**
- **File:** `src/hooks/useTeacherTasks.ts`
- **Changes:**
  1. Add `TaskFilters` interface
  2. Add optional `filters` parameter to hook signature
  3. Replace `.from('tasks').select()` with `.rpc('filter_teacher_tasks')`
  4. Map filter parameters to RPC call
  5. Update `fetchTasks` dependency array to include `filters`
  6. Add TypeScript types for RPC response

**Code Example:**
```typescript
// Add after imports
export interface TaskFilters {
  subject: string | null;
  status: 'all' | 'pending' | 'completed' | 'overdue';
  search: string;
}

// Update hook signature
export const useTeacherTasks = (
  teacherId: string | null,
  filters?: TaskFilters
) => {
  // ... existing state ...
  
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
      const errorMessage = err.message || 'Failed to fetch tasks';
      setError(errorMessage);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [teacherId, filters]); // Add filters to dependencies

  // ... rest of hook unchanged ...
};
```

**2.2 Update `useTasks` Hook (Student)**
- **File:** `src/hooks/useTasks.ts`
- **Changes:**
  1. Add `TaskFilters` interface (same as above)
  2. Add optional `filters` parameter to hook signature
  3. Replace query with `.rpc('filter_student_task_assignments')`
  4. Map filter parameters to RPC call
  5. Update `fetchTasks` dependency array

**Code Example:**
```typescript
export const useTasks = (
  studentId: string | null,
  filters?: TaskFilters
) => {
  // ... existing state ...
  
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
      const errorMessage = err.message || 'Failed to fetch tasks';
      setError(errorMessage);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId, filters]); // Add filters to dependencies

  // ... rest of hook unchanged ...
};
```

**2.3 Export TaskFilters Type**
- Create `src/types/filters.ts`
- Export shared `TaskFilters` interface
- Import in both hooks to avoid duplication

#### Acceptance Criteria
- [ ] `useTeacherTasks` accepts optional `filters` parameter
- [ ] `useTasks` accepts optional `filters` parameter
- [ ] Hooks call correct RPC functions
- [ ] Hooks refetch when `filters` object changes
- [ ] Hooks maintain backward compatibility (filters optional)
- [ ] TypeScript types are correct
- [ ] No TypeScript errors

#### Testing
```typescript
// Test in browser console or create a test file
const { tasks } = useTeacherTasks(teacherId, {
  subject: 'Fisika',
  status: 'pending',
  search: 'homework'
});
// Verify: Only Fisika, pending, homework-containing tasks returned
```

---

### **Phase 3: UI Components** (Priority: HIGH)
**Duration:** 2-2.5 hours  
**Dependencies:** Phase 2 complete

#### Tasks

**3.1 Create `SegmentedControl.tsx` Component**
- **File:** `src/components/SegmentedControl.tsx`
- **Purpose:** Reusable segmented control for Status filter
- **Features:**
  - Accept array of options with value/label
  - Controlled component (value prop)
  - Smooth transitions
  - Match ShopPage styling

**Implementation:**
```typescript
import { motion } from 'framer-motion';

interface SegmentedOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SegmentedControl = ({ 
  options, 
  value, 
  onChange,
  className = '' 
}: SegmentedControlProps) => {
  return (
    <div className={`inline-flex bg-component-dark border border-border-dark rounded-lg p-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
            ${value === option.value 
              ? 'bg-[#223149] text-white' 
              : 'text-text-secondary-dark hover:text-text-primary-dark'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
```

**3.2 Create `TaskFilters.tsx` Component**
- **File:** `src/components/TaskFilters.tsx`
- **Purpose:** Filter bar with search, subject dropdown, status segmented control
- **Features:**
  - Search input with icon and clear button
  - Subject dropdown from `SUBJECT_LIST`
  - Status segmented control
  - Debounced search (300ms)
  - Responsive layout

**Implementation:**
```typescript
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { SUBJECT_LIST } from '../constants/subjects';
import { SegmentedControl } from './SegmentedControl';
import { TaskFilters as TaskFiltersType } from '../types/filters';

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onFilterChange: (filters: TaskFiltersType) => void;
}

export const TaskFilters = ({ filters, onFilterChange }: TaskFiltersProps) => {
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ ...filters, search: searchInput });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Sync with external filter changes
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  const handleClearSearch = () => {
    setSearchInput('');
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subject = e.target.value === 'all' ? null : e.target.value;
    onFilterChange({ ...filters, subject });
  };

  const handleStatusChange = (status: string) => {
    onFilterChange({ 
      ...filters, 
      status: status as TaskFiltersType['status']
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-6">
      {/* Search Input */}
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary-dark" />
        <input
          type="text"
          placeholder="Search tasks by title..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="
            w-full pl-10 pr-10 py-2 
            bg-component-dark border border-border-dark rounded-lg
            text-text-primary-dark placeholder-text-secondary-dark
            focus:outline-none focus:ring-2 focus:ring-primary
          "
        />
        {searchInput && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary-dark hover:text-text-primary-dark"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filters Container */}
      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        {/* Subject Dropdown */}
        <select
          value={filters.subject || 'all'}
          onChange={handleSubjectChange}
          className="
            px-4 py-2 
            bg-component-dark border border-border-dark rounded-lg
            text-text-primary-dark
            focus:outline-none focus:ring-2 focus:ring-primary
          "
        >
          <option value="all">All Subjects</option>
          {SUBJECT_LIST.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>

        {/* Status Segmented Control */}
        <SegmentedControl
          options={[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'completed', label: 'Completed' },
            { value: 'overdue', label: 'Overdue' },
          ]}
          value={filters.status}
          onChange={handleStatusChange}
        />
      </div>
    </div>
  );
};
```

**3.3 Create `EmptyState.tsx` Component**
- **File:** `src/components/EmptyState.tsx`
- **Purpose:** Show when no tasks match filters
- **Features:**
  - Icon support
  - Title and message
  - Optional action button
  - Centered layout

**Implementation:**
```typescript
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ 
  icon, 
  title, 
  message, 
  actionLabel, 
  onAction 
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="mb-4 opacity-50">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-text-primary-dark mb-2">
        {title}
      </h3>
      <p className="text-text-secondary-dark mb-6 max-w-md">
        {message}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
```

**3.4 Create Shared Types File**
- **File:** `src/types/filters.ts`
- **Content:**
```typescript
export interface TaskFilters {
  subject: string | null;
  status: 'all' | 'pending' | 'completed' | 'overdue';
  search: string;
}

export const DEFAULT_FILTERS: TaskFilters = {
  subject: null,
  status: 'all',
  search: '',
};
```

#### Acceptance Criteria
- [ ] `SegmentedControl` component created and styled
- [ ] `TaskFilters` component created with all three controls
- [ ] `EmptyState` component created
- [ ] Search has clear button that appears when text exists
- [ ] Search is debounced at 300ms
- [ ] Subject dropdown populated from `SUBJECT_LIST`
- [ ] Components match Elegant Stitch design system
- [ ] Components are responsive (mobile/desktop)
- [ ] No console errors or warnings

---

### **Phase 4: Dashboard Integration** (Priority: MEDIUM)
**Duration:** 1 hour  
**Dependencies:** Phases 1, 2, 3 complete

#### Tasks

**4.1 Update `TeacherDashboard.tsx`**
- **File:** `src/pages/TeacherDashboard.tsx`
- **Changes:**
  1. Import `TaskFilters` component
  2. Import `EmptyState` component
  3. Add filter state with `useState`
  4. Pass filters to `useTeacherTasks` hook
  5. Add `TaskFilters` component above task list
  6. Add empty state when no tasks
  7. Implement "Clear Filters" handler

**Implementation:**
```typescript
import { useState } from 'react';
import { Search } from 'lucide-react';
import { TaskFilters } from '../components/TaskFilters';
import { EmptyState } from '../components/EmptyState';
import { DEFAULT_FILTERS } from '../types/filters';
import type { TaskFilters as TaskFiltersType } from '../types/filters';

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<TaskFiltersType>(DEFAULT_FILTERS);
  
  const { tasks, loading, error } = useTeacherTasks(user?.id, filters);

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stats cards */}
      {/* ... existing code ... */}

      {/* Filter Bar */}
      <TaskFilters
        filters={filters}
        onFilterChange={setFilters}
      />

      {/* Task List */}
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<Search className="w-16 h-16 text-text-secondary-dark" />}
          title="No tasks found"
          message="Try adjusting your filters or search query to find what you're looking for."
          actionLabel="Clear Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <div className="task-list">
          {/* Existing task rendering */}
        </div>
      )}
    </div>
  );
};
```

**4.2 Update `StudentDashboard.tsx`**
- **File:** `src/pages/StudentDashboard.tsx`
- **Changes:** Same as TeacherDashboard
  1. Import components
  2. Add filter state
  3. Pass filters to `useTasks` hook
  4. Add `TaskFilters` component above task grid
  5. Add empty state when no tasks
  6. Implement "Clear Filters" handler

**Implementation:**
```typescript
import { useState } from 'react';
import { Search } from 'lucide-react';
import { TaskFilters } from '../components/TaskFilters';
import { EmptyState } from '../components/EmptyState';
import { DEFAULT_FILTERS } from '../types/filters';
import type { TaskFilters as TaskFiltersType } from '../types/filters';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<TaskFiltersType>(DEFAULT_FILTERS);
  
  const { tasks, loading, error } = useTasks(user?.id, filters);

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stats cards */}
      {/* ... existing code ... */}

      {/* Filter Bar */}
      <TaskFilters
        filters={filters}
        onFilterChange={setFilters}
      />

      {/* Task Grid */}
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<Search className="w-16 h-16 text-text-secondary-dark" />}
          title="No tasks found"
          message="Try adjusting your filters or search query to find what you're looking for."
          actionLabel="Clear Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <div className="task-grid">
          {/* Existing task grid rendering */}
        </div>
      )}
    </div>
  );
};
```

#### Acceptance Criteria
- [ ] Filter bar appears above task list in TeacherDashboard
- [ ] Filter bar appears above task grid in StudentDashboard
- [ ] Filters trigger data refetch correctly
- [ ] Empty state shows when no results
- [ ] "Clear Filters" button resets all filters
- [ ] UI is responsive on mobile
- [ ] No layout shifts or visual bugs

---

## 🧪 Testing Checklist

### Manual Testing

#### Functionality Tests
- [ ] Search by task title works (case-insensitive)
- [ ] Search debounce works (300ms delay)
- [ ] Clear search button appears/works
- [ ] Subject filter shows all subjects
- [ ] Subject filter filters correctly
- [ ] Status filter "All" shows all tasks
- [ ] Status filter "Pending" shows pending tasks only
- [ ] Status filter "Completed" shows completed tasks only
- [ ] Status filter "Overdue" shows overdue tasks only
- [ ] Multiple filters work together (AND logic)
- [ ] Empty state appears when no results
- [ ] "Clear Filters" button resets everything

#### Edge Cases
- [ ] Empty search (shows all tasks)
- [ ] Search with no results
- [ ] All filters active at once
- [ ] Special characters in search
- [ ] Very long task titles
- [ ] Tasks with no due date
- [ ] Tasks due exactly now

#### Performance Tests
- [ ] Test with 10 tasks
- [ ] Test with 100 tasks
- [ ] Test with 500 tasks
- [ ] Debounce prevents excessive API calls
- [ ] Filter changes feel instant (<100ms)
- [ ] No memory leaks

#### UI/UX Tests
- [ ] Filters match Elegant Stitch design
- [ ] Filters are responsive on mobile
- [ ] Filter bar stacks correctly on mobile
- [ ] Status segmented control looks like ShopPage
- [ ] Clear button (X) appears on hover
- [ ] Focus states work correctly
- [ ] Keyboard navigation works

#### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## 📦 Files to Create/Modify

### New Files (7)
1. `supabase/migrations/YYYYMMDDHHMMSS_add_task_filters_rpc.sql` - Database migration
2. `src/types/filters.ts` - Shared filter types
3. `src/components/SegmentedControl.tsx` - Reusable segmented control
4. `src/components/TaskFilters.tsx` - Filter bar component
5. `src/components/EmptyState.tsx` - Empty state component

### Modified Files (4)
1. `src/hooks/useTeacherTasks.ts` - Add filters parameter, RPC call
2. `src/hooks/useTasks.ts` - Add filters parameter, RPC call
3. `src/pages/TeacherDashboard.tsx` - Integrate filters
4. `src/pages/StudentDashboard.tsx` - Integrate filters

**Total:** 9 files (5 new, 4 modified)

---

## 🚀 Deployment Steps

### 1. Database Migration
```bash
# Apply migration to Supabase
npx supabase db push

# OR manually run in Supabase SQL Editor
# Copy contents of migration file and execute
```

### 2. Code Deployment
```bash
# Commit all changes
git add .
git commit -m "feat: Add task filters and search (Phase 6)"

# Push to branch
git push origin feature/phase6-advanced-qol-filters-search

# Create pull request (if using PR workflow)
# Or merge to main
```

### 3. Verification
- [ ] Test filters in production/staging
- [ ] Check database query performance
- [ ] Monitor error logs
- [ ] Verify RLS policies working

---

## 🔄 Rollback Plan

If critical issues are found:

### 1. Database Rollback
```sql
-- Remove RPC functions
DROP FUNCTION IF EXISTS filter_teacher_tasks;
DROP FUNCTION IF EXISTS filter_student_task_assignments;

-- Keep indexes (they don't hurt)
```

### 2. Code Rollback
```bash
# Revert to previous commit
git revert HEAD

# Or checkout previous version
git checkout [previous-commit-hash]
```

### 3. Quick Fix (Temporary)
```typescript
// In hooks, comment out RPC call and restore old query
const { data } = await supabase
  .from('tasks')
  .select('*')
  .eq('teacher_id', teacherId);
// Filters will be ignored, but app works
```

---

## 📊 Success Metrics

### Performance Metrics
- Filter response time: <100ms (90th percentile)
- Search debounce prevents >90% of unnecessary calls
- Page load time increase: <5%
- Database CPU usage increase: <10%

### User Experience Metrics
- Filter usage rate: Track how many users use filters
- Most used filters: Subject vs Status vs Search
- Average filters per session
- "Clear Filters" button click rate

### Code Quality Metrics
- TypeScript errors: 0
- ESLint warnings: 0
- Test coverage: >80% for new components
- Bundle size increase: <10KB gzipped

---

## 🐛 Known Issues / Future Improvements

### Known Limitations
- Search only works on task titles (not descriptions)
- No "completed" status for teachers (all tasks shown)
- Filters reset on page refresh (session-only)
- No filter presets/saved searches

### Future Enhancements
- Add description search (full-text search)
- Add date range filter
- Add assigned students filter (teacher)
- Save filter presets to localStorage
- Filter URL parameters (shareable links)
- Advanced search syntax (e.g., `subject:Fisika status:pending`)

---

## 📝 Implementation Notes

### Important Reminders
1. **Test RPC functions first** - Don't skip Phase 1 testing
2. **Debounce is critical** - Without it, every keystroke = API call
3. **Default filters matter** - Must match UI default state
4. **RLS policies** - RPC functions must respect user permissions
5. **Responsive design** - Test on mobile early and often

### Common Pitfalls to Avoid
- ❌ Forgetting to add `filters` to hook dependencies
- ❌ Not debouncing search input
- ❌ Hardcoding subject list instead of using constants
- ❌ Not handling empty states
- ❌ Creating RPC functions without indexes

### Best Practices
- ✅ Create migration file first, test in SQL editor
- ✅ Update hooks before building UI components
- ✅ Build small, reusable components
- ✅ Test with realistic data (100+ tasks)
- ✅ Follow Elegant Stitch design system

---

**Plan Version:** 1.0  
**Last Updated:** 2025-11-09  
**Estimated Total Time:** 4-6 hours  
**Status:** ✅ Ready for Implementation
