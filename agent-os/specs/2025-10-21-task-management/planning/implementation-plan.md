# Task Management - Implementation Plan

**Feature:** Core Task Management (CRUD)  
**Date:** 2025-10-21  
**Status:** Planning Phase  

---

## 1. Overview

This document provides a step-by-step implementation plan for Phase 2: Core Task Management. The implementation is divided into logical phases, each building upon the previous one.

---

## 2. Prerequisites

Before starting implementation, ensure:
- ✅ Phase 1 (User Authentication) is fully functional
- ✅ Development environment is set up
- ✅ Supabase project is configured
- ✅ All specification documents have been reviewed and approved

---

## 3. Implementation Phases

### Phase A: Database Setup
**Estimated Time:** 1-2 hours  
**Priority:** High (Must be completed first)

#### A1. Create Database Schema
**File:** Supabase SQL Editor

**Tasks:**
1. Create `tasks` table with all fields and constraints
2. Create `task_assignments` table with all fields and constraints
3. Add foreign key relationships
4. Create indexes for performance
5. Enable Row Level Security on both tables
6. Create RLS policies for teachers (view, create, update, delete)
7. Create RLS policies for students (view assignments, update status)
8. Test policies with sample data

**SQL Script:**
```sql
-- See technical-architecture.md Section 4.2 for complete SQL
```

**Verification:**
- [ ] Both tables exist in Supabase
- [ ] All constraints are working (test with invalid data)
- [ ] RLS policies prevent unauthorized access
- [ ] Indexes are created

---

### Phase B: TypeScript Types & Interfaces
**Estimated Time:** 30 minutes  
**Priority:** High

#### B1. Create Task Type Definitions
**File:** `/src/types/task.ts`

**Tasks:**
1. Create `Task` interface
2. Create `TaskAssignment` interface
3. Create `CreateTaskInput` interface
4. Create `UpdateTaskInput` interface
5. Create `TaskWithStats` interface
6. Export all types

**Code Reference:** See technical-architecture.md Section 3.3

**Verification:**
- [ ] File compiles without TypeScript errors
- [ ] All interfaces are properly exported

---

### Phase C: Custom Hook - useTasks
**Estimated Time:** 3-4 hours  
**Priority:** High

#### C1. Create useTasks Hook
**File:** `/src/hooks/useTasks.ts`

**Tasks:**
1. Set up hook structure with state (tasks, loading, error)
2. Import Supabase client and useAuth hook
3. Implement `fetchTasks()` function
   - Detect user role (teacher vs student)
   - Query appropriate data based on role
   - Handle errors
4. Implement `createTask()` function
   - Insert task record
   - Insert assignment records
   - Handle errors
   - Refresh task list after creation
5. Implement `updateTask()` function
   - Update task record
   - Update assignments if student_ids changed
   - Handle errors
   - Refresh task list after update
6. Implement `deleteTask()` function
   - Delete task (cascade will handle assignments)
   - Handle errors
   - Refresh task list after deletion
7. Implement `completeTask()` function (for students)
   - Update assignment status
   - Set completed_at timestamp
   - Handle errors
   - Refresh task list after completion
8. Implement `fetchTaskById()` function
   - Query single task with assignments
   - Handle errors
9. Add useEffect to fetch tasks on mount

**Code Structure:**
```typescript
export const useTasks = () => {
  const { user, role } = useAuth();
  const [tasks, setTasks] = useState<Task[] | TaskAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => { /* ... */ };
  const createTask = async (data: CreateTaskInput) => { /* ... */ };
  const updateTask = async (id: string, data: UpdateTaskInput) => { /* ... */ };
  const deleteTask = async (id: string) => { /* ... */ };
  const completeTask = async (assignmentId: string) => { /* ... */ };
  const fetchTaskById = async (id: string) => { /* ... */ };

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    fetchTasks,
    fetchTaskById,
  };
};
```

**Verification:**
- [ ] Hook compiles without errors
- [ ] All functions handle errors gracefully
- [ ] Functions respect user role (teacher vs student)
- [ ] Test with console.log to verify data flow

---

### Phase D: Shared Components
**Estimated Time:** 2-3 hours  
**Priority:** Medium

#### D1. Create TaskCard Component
**File:** `/src/components/TaskCard.tsx`

**Tasks:**
1. Create component with props interface
2. Implement layout with Tailwind CSS
3. Display task title, due date, description
4. Add conditional rendering for teacher vs student view
5. For teachers: Show completion statistics
6. For students: Show status and complete button
7. Add overdue highlighting (compare due_date with today)
8. Add Edit/Delete buttons for teachers
9. Style with Tailwind CSS to match existing design

**Verification:**
- [ ] Component renders correctly with sample data
- [ ] Overdue tasks are visually highlighted
- [ ] Buttons trigger correct callbacks
- [ ] Mobile responsive

#### D2. Create StudentSelector Component
**File:** `/src/components/StudentSelector.tsx`

**Tasks:**
1. Create component with props interface
2. Fetch all students (role='student') from profiles table
3. Implement checkbox list UI
4. Add search/filter functionality
5. Add "Select All" / "Deselect All" buttons
6. Show count of selected students
7. Style with Tailwind CSS

**Verification:**
- [ ] All students are loaded and displayed
- [ ] Search/filter works correctly
- [ ] Selection state updates properly
- [ ] onChange callback fires with correct data

---

### Phase E: Teacher Features
**Estimated Time:** 6-8 hours  
**Priority:** High

#### E1. Update TeacherDashboard
**File:** `/src/pages/TeacherDashboard.tsx`

**Tasks:**
1. Import `useTasks` hook
2. Add "Create New Task" button in header
3. Replace placeholder with task list
4. Map over tasks and render TaskCard for each
5. Implement `handleCreateTask` - navigate to `/tasks/create`
6. Implement `handleEditTask` - navigate to `/tasks/edit/:id`
7. Implement `handleDeleteTask` - show confirmation, call deleteTask
8. Add loading and error states
9. Add empty state message

**Verification:**
- [ ] Task list displays correctly
- [ ] Navigation works
- [ ] Delete confirmation appears
- [ ] Statistics show correct numbers

#### E2. Create CreateTaskPage
**File:** `/src/pages/CreateTaskPage.tsx`

**Tasks:**
1. Create page component with form
2. Add form fields: title, description, due_date
3. Integrate StudentSelector component
4. Implement form validation
   - Title required, max 200 chars
   - Due date required, cannot be in past
   - At least one student selected
5. Implement `handleSubmit`
   - Validate form
   - Call `createTask` from useTasks
   - Show success message
   - Navigate to teacher dashboard
6. Add Cancel button
7. Style form with Tailwind CSS

**Verification:**
- [ ] Form validates correctly
- [ ] Task creation works
- [ ] Success message appears
- [ ] Redirects after creation
- [ ] Error handling works

#### E3. Create EditTaskPage
**File:** `/src/pages/EditTaskPage.tsx`

**Tasks:**
1. Create page component with form
2. Get taskId from route params
3. Fetch task data on mount using `fetchTaskById`
4. Pre-populate form with existing data
5. Fetch current assignments and pre-select students
6. Reuse same form structure as CreateTaskPage
7. Implement `handleSubmit` to call `updateTask`
8. Add Cancel button
9. Add loading state while fetching

**Verification:**
- [ ] Task data loads correctly
- [ ] Form is pre-populated
- [ ] Updates save correctly
- [ ] Redirects after update
- [ ] Error handling works

#### E4. Add Routes for Teacher Pages
**File:** `/src/App.tsx`

**Tasks:**
1. Import CreateTaskPage and EditTaskPage
2. Add route for `/tasks/create`
3. Add route for `/tasks/edit/:taskId`
4. Wrap both with ProtectedRoute (allowedRole="teacher")

**Verification:**
- [ ] Routes are accessible to teachers only
- [ ] Navigation between pages works

---

### Phase F: Student Features
**Estimated Time:** 3-4 hours  
**Priority:** High

#### F1. Update StudentDashboard
**File:** `/src/pages/StudentDashboard.tsx`

**Tasks:**
1. Import `useTasks` hook
2. Replace placeholder with task list
3. Map over task assignments and render TaskCard for each
4. Pass assignment status to TaskCard
5. Implement `handleCompleteTask` - call completeTask from hook
6. Add loading and error states
7. Add empty state message
8. Sort tasks: pending first (by due date), then completed
9. Add visual separation between pending and completed tasks

**Verification:**
- [ ] Task list displays correctly
- [ ] Complete button works
- [ ] Status updates after completion
- [ ] Overdue tasks are highlighted
- [ ] Completed tasks are visually distinct

---

### Phase G: Testing & Refinement
**Estimated Time:** 4-6 hours  
**Priority:** High

#### G1. Manual Testing
**Test Scenarios:**

**Teacher Workflows:**
1. [ ] Create task with single student
2. [ ] Create task with multiple students
3. [ ] Edit task - change title/description
4. [ ] Edit task - add more students
5. [ ] Edit task - remove students
6. [ ] Delete task (verify confirmation dialog)
7. [ ] Verify completion statistics update when student completes
8. [ ] Test validation - empty fields
9. [ ] Test validation - past due date
10. [ ] Test validation - no students selected

**Student Workflows:**
1. [ ] View assigned tasks
2. [ ] Complete a task
3. [ ] Verify completed task appears in completed section
4. [ ] Verify cannot "uncomplete" a task
5. [ ] Verify only assigned tasks are visible

**Cross-Role Testing:**
1. [ ] Create task as Teacher, verify Student sees it
2. [ ] Complete task as Student, verify Teacher sees updated stats
3. [ ] Edit task as Teacher, verify Student sees changes
4. [ ] Delete task as Teacher, verify Student no longer sees it

**Security Testing:**
1. [ ] Verify student cannot access teacher routes
2. [ ] Verify teacher cannot access student routes
3. [ ] Verify students cannot see other students' tasks
4. [ ] Verify teachers cannot edit other teachers' tasks

#### G2. Bug Fixes
**Tasks:**
1. Document all bugs found during testing
2. Prioritize bugs (critical, high, medium, low)
3. Fix critical and high priority bugs
4. Retest after fixes

#### G3. UI/UX Refinement
**Tasks:**
1. Review all pages on mobile devices
2. Ensure consistent styling with Phase 1
3. Add loading spinners where appropriate
4. Improve error messages for clarity
5. Add success toasts/notifications
6. Ensure keyboard accessibility

---

## 4. Implementation Order

**Recommended sequence:**

1. **Day 1:** Database Setup (Phase A) + TypeScript Types (Phase B)
2. **Day 2:** useTasks Hook (Phase C)
3. **Day 3:** Shared Components (Phase D)
4. **Day 4-5:** Teacher Features (Phase E)
5. **Day 6:** Student Features (Phase F)
6. **Day 7-8:** Testing & Refinement (Phase G)

**Total Estimated Time:** 7-8 working days

---

## 5. File Checklist

### New Files to Create:
- [ ] `/src/types/task.ts`
- [ ] `/src/hooks/useTasks.ts`
- [ ] `/src/components/TaskCard.tsx`
- [ ] `/src/components/StudentSelector.tsx`
- [ ] `/src/pages/CreateTaskPage.tsx`
- [ ] `/src/pages/EditTaskPage.tsx`

### Files to Modify:
- [ ] `/src/pages/TeacherDashboard.tsx`
- [ ] `/src/pages/StudentDashboard.tsx`
- [ ] `/src/App.tsx`

### Database:
- [ ] Create `tasks` table in Supabase
- [ ] Create `task_assignments` table in Supabase
- [ ] Create RLS policies

**Total:** 6 new files, 3 modified files, 2 new database tables

---

## 6. Dependencies & Libraries

### No New Dependencies Required
All required libraries are already installed from Phase 1:
- ✅ React & React-DOM
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ React Router DOM
- ✅ Supabase JS Client

### Optional Enhancement (Post-MVP):
- `react-datepicker` - Better date picker UX (can use HTML5 date input for MVP)
- `react-select` - Better multi-select UX (can use checkboxes for MVP)

---

## 7. Error Handling Checklist

Each function should handle:
- [ ] Network errors (Supabase connection failed)
- [ ] Permission errors (RLS policy violations)
- [ ] Validation errors (client-side)
- [ ] Database constraint violations
- [ ] Not found errors (task doesn't exist)
- [ ] Unexpected errors (generic fallback)

**Error Display:**
- Show user-friendly messages
- Log technical details to console
- Don't expose sensitive information
- Provide actionable guidance

---

## 8. Performance Optimization Checklist

- [ ] Use database indexes on foreign keys
- [ ] Use `.select()` to fetch only needed columns
- [ ] Implement pagination if task list grows large (future)
- [ ] Use React.memo for TaskCard components
- [ ] Debounce search in StudentSelector
- [ ] Cache student list in create/edit forms
- [ ] Optimistic UI updates for better perceived performance

---

## 9. Code Quality Checklist

- [ ] All TypeScript types are properly defined
- [ ] No `any` types (use proper typing)
- [ ] Follow existing code style from Phase 1
- [ ] Use consistent naming conventions
- [ ] Add comments for complex logic
- [ ] No console.log in production code
- [ ] Handle all edge cases
- [ ] Consistent error handling pattern

---

## 10. Documentation Updates

After implementation:
- [ ] Update project README with new features
- [ ] Document any environment variables (if added)
- [ ] Update deployment instructions (if changed)
- [ ] Create user guide for teachers and students
- [ ] Document known issues/limitations

---

## 11. Deployment Checklist

Before deploying to production:
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Database migrations completed
- [ ] RLS policies are active
- [ ] Environment variables configured
- [ ] Test on staging environment
- [ ] Get approval from stakeholders
- [ ] Create backup of database
- [ ] Deploy to production
- [ ] Verify functionality in production
- [ ] Monitor for errors

---

## 12. Post-Deployment

- [ ] Monitor error logs for first 24 hours
- [ ] Gather user feedback
- [ ] Create list of improvements for next iteration
- [ ] Plan for Phase 3 (Gamification)

---

## 13. Risk Mitigation

| Risk | Mitigation Strategy |
|------|-------------------|
| Database schema errors | Test thoroughly in development before production |
| RLS policy too restrictive | Test with both teacher and student accounts |
| Poor mobile UX | Test on actual mobile devices early |
| Performance issues | Implement indexes, test with realistic data volume |
| User confusion | Provide clear labels and instructions |
| Data loss on edit | Implement confirmation dialogs |

---

## 14. Success Criteria

Phase 2 is complete when:

1. ✅ All files in checklist are created/modified
2. ✅ All database tables and policies are in place
3. ✅ All manual test scenarios pass
4. ✅ No critical or high priority bugs remain
5. ✅ UI is mobile-responsive
6. ✅ Code follows project standards
7. ✅ Feature has been demonstrated to stakeholders
8. ✅ Documentation is updated

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-21  
**Ready for Implementation:** Yes
