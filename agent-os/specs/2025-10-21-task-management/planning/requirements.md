# Task Management - Requirements Document

**Feature:** Core Task Management (CRUD)  
**Date:** 2025-10-21  
**Status:** Planning Phase  

---

## 1. Overview

This document defines all functional and non-functional requirements for the Task Management feature (Phase 2), which enables Teachers to create and manage tasks, and Students to view and complete their assigned tasks.

## 2. User Roles

The system continues to support two distinct user roles from Phase 1:
- **Student**: Can view assigned tasks and mark them as complete
- **Teacher**: Can create, read, update, delete tasks and assign them to students

## 3. Functional Requirements

### FR-1: Teacher - Create Task
**Priority:** High  
**Description:** Teachers must be able to create new tasks and assign them to multiple students.

**Acceptance Criteria:**
- Create Task form includes the following fields:
  - **Judul Tugas** (Task Title) - Text input, required, max 200 characters
  - **Deskripsi** (Description) - Textarea, optional, max 1000 characters
  - **Tanggal Jatuh Tempo** (Due Date) - Date picker, required, must be today or future date
  - **Assign to Students** - Multi-select dropdown or checkbox list, required (at least 1 student)
- Form validation prevents submission with missing required fields
- Multi-select shows all registered students in the system
- Teacher can select one or multiple students to assign the task to
- Successful creation shows a success message
- After creation, teacher is redirected to their task list
- Task is immediately visible in assigned students' task lists

---

### FR-2: Teacher - View Task List
**Priority:** High  
**Description:** Teachers must be able to view all tasks they have created with completion statistics.

**Acceptance Criteria:**
- Dashboard displays a list of all tasks created by the logged-in teacher
- Each task card/row shows:
  - **Judul Tugas** (Task Title)
  - **Tanggal Jatuh Tempo** (Due Date)
  - **Status Progres** (Progress Status) - Format: "X of Y students completed"
    - X = number of students who completed the task
    - Y = total number of students assigned
- Tasks are sorted by due date (nearest first)
- Empty state message when teacher has not created any tasks yet
- Visual indicator for tasks past due date (e.g., red text or warning icon)
- Each task has action buttons: "Edit" and "Delete"

---

### FR-3: Teacher - Edit Task
**Priority:** High  
**Description:** Teachers must be able to update existing tasks they have created.

**Acceptance Criteria:**
- Clicking "Edit" on a task opens an edit form
- Edit form is pre-populated with current task data
- Teacher can modify:
  - Task title
  - Description
  - Due date
  - Assigned students (add or remove)
- Form validation same as create form
- Successful update shows a success message
- Changes are immediately reflected in:
  - Teacher's task list
  - All assigned students' task lists
  - Completion statistics are recalculated if students were added/removed

---

### FR-4: Teacher - Delete Task
**Priority:** High  
**Description:** Teachers must be able to delete tasks they have created.

**Acceptance Criteria:**
- Clicking "Delete" shows a confirmation dialog
- Confirmation dialog warns: "Are you sure? This will delete the task for all assigned students."
- User can cancel or confirm deletion
- Upon confirmation, task is permanently deleted from database
- Task is removed from:
  - Teacher's task list
  - All assigned students' task lists
  - All related task_assignments records are deleted (cascade delete)
- Success message confirms deletion

---

### FR-5: Student - View Assigned Tasks
**Priority:** High  
**Description:** Students must be able to view all tasks assigned to them.

**Acceptance Criteria:**
- Dashboard displays a list of all tasks assigned to the logged-in student
- Each task card/row shows:
  - **Judul Tugas** (Task Title)
  - **Tanggal Jatuh Tempo** (Due Date)
  - **Status** (Status) - "Tertunda" (Pending) or "Selesai" (Completed)
- Tasks are sorted by due date (nearest first)
- Completed tasks are visually distinct (e.g., strikethrough, greyed out, or separate section)
- Empty state message when student has no assigned tasks
- Visual indicator for overdue tasks (past due date and still pending)

---

### FR-6: Student - Complete Task
**Priority:** High  
**Description:** Students must be able to mark tasks as completed.

**Acceptance Criteria:**
- Each pending task has a "Selesaikan Tugas" (Complete Task) button
- Clicking the button marks the task as completed
- Completed tasks show "Selesai" status
- The "Complete Task" button is replaced with "Completed" label or checkmark icon
- Completion is immediately reflected in:
  - Student's task list (status changes)
  - Teacher's task list (progress statistics update)
- Completion timestamp is recorded in database
- **Important for Phase 3:** This action will trigger point/coin rewards in future phase

---

### FR-7: Task Assignment System
**Priority:** High  
**Description:** System must properly handle task assignments to multiple students.

**Acceptance Criteria:**
- When a task is created, a separate assignment record is created for each selected student
- Each assignment tracks:
  - Which task
  - Which student
  - Completion status (pending/completed)
  - Completion timestamp (when marked complete)
- Students only see tasks assigned to them
- Teachers only see tasks they created
- Assignment records are deleted when task is deleted (cascade)

---

## 4. Non-Functional Requirements

### NFR-1: Performance
- Task list should load within 2 seconds
- Create/Update/Delete operations should complete within 3 seconds
- Real-time updates not required (page refresh acceptable)

### NFR-2: Usability
- Forms should be intuitive and easy to fill out
- Error messages should be clear and actionable
- Multi-select for students should be searchable for large lists
- Due date picker should prevent selection of past dates
- Mobile-responsive design (works on phone, tablet, desktop)

### NFR-3: Data Integrity
- Task cannot be created without at least one student assigned
- Due date cannot be in the past (except when editing existing tasks)
- Students cannot modify tasks (read-only except for completion button)
- Teachers can only edit/delete their own tasks
- Completion status cannot be undone (students cannot "uncomplete" tasks in MVP)

### NFR-4: Security
- All task operations protected by authentication
- Row Level Security (RLS) policies enforce:
  - Teachers can only see/edit/delete their own tasks
  - Students can only see tasks assigned to them
  - Students can only complete their own assignments
- No SQL injection vulnerabilities (use Supabase parameterized queries)

### NFR-5: Scalability
- System should handle up to 100 students per teacher
- System should handle up to 50 tasks per teacher
- Database queries should use proper indexes for performance

---

## 5. Technical Requirements

### TR-1: Technology Stack
- **Frontend:** React with TypeScript (existing)
- **Backend:** Supabase PostgreSQL database
- **State Management:** React Context API (consider custom hook for tasks)
- **UI Components:** Reuse Tailwind CSS styling from Phase 1
- **Date Picker:** Use HTML5 date input or lightweight library (e.g., react-datepicker)

### TR-2: Database Schema
Required tables:
- `tasks` - Stores task information
- `task_assignments` - Junction table for many-to-many relationship

### TR-3: API Integration
- Use Supabase JavaScript client for all database operations
- Implement proper error handling for all API calls
- Use async/await pattern consistently

### TR-4: Data Validation
- Client-side validation for immediate feedback
- Server-side validation via database constraints
- Consistent validation error messages

---

## 6. Out of Scope (for MVP)

The following are explicitly **NOT** included in Phase 2:
- ❌ Point/coin rewards (Phase 3: Gamification)
- ❌ Leaderboard (Phase 3: Gamification)
- ❌ Task categories or tags
- ❌ File attachments to tasks
- ❌ Comments or teacher feedback on tasks
- ❌ Email/push notifications for new tasks or due dates
- ❌ Advanced search and filtering
- ❌ Task priority levels (high/medium/low)
- ❌ Recurring tasks
- ❌ Task templates
- ❌ Bulk operations (delete multiple, assign to class)
- ❌ Student ability to "uncomplete" tasks
- ❌ Task history or audit log

---

## 7. Dependencies

### Phase 1 Dependencies (Already Completed)
- ✅ User authentication system
- ✅ `profiles` table with `id`, `full_name`, `role`
- ✅ Teacher and Student dashboards
- ✅ Protected routes with role-based access

### External Dependencies
- Supabase project configured and running
- Environment variables for Supabase connection

---

## 8. Assumptions

1. All students are already registered in the system (from Phase 1)
2. A teacher can assign tasks to any student in the system (no concept of "classes" yet)
3. Tasks are individual assignments (no group tasks)
4. All users have stable internet connection
5. Due dates are in the same timezone as the user
6. Email confirmation is disabled in Supabase (as set in Phase 1)

---

## 9. Success Metrics

### Functional Success
- ✅ 100% of CRUD operations work correctly
- ✅ Teachers can successfully assign tasks to multiple students
- ✅ Students see only their assigned tasks
- ✅ Completion statistics are accurate
- ✅ Zero data loss or corruption

### User Experience Success
- ✅ Users can complete all workflows without assistance
- ✅ Form validation provides helpful error messages
- ✅ Page loads are fast (< 2 seconds)
- ✅ Mobile experience is usable

### Technical Success
- ✅ All database queries use proper RLS policies
- ✅ No security vulnerabilities
- ✅ Code follows existing project structure and patterns
- ✅ TypeScript types are properly defined

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|---------|------------|
| Performance issues with large task lists | Medium | Medium | Implement pagination or virtual scrolling in future |
| Students accidentally completing wrong task | Low | Low | Add confirmation dialog for completion |
| Teacher deletes task with completions | Medium | Medium | Confirmation dialog with clear warning |
| Timezone confusion for due dates | Medium | Low | Document assumption, add timezone handling in Phase 3 |
| Multi-select UX poor on mobile | Medium | Medium | Test on mobile, consider alternative UI for small screens |

---

## 11. Acceptance Criteria Summary

Phase 2 is considered complete when:

1. ✅ Teachers can create tasks with all required fields
2. ✅ Teachers can assign tasks to multiple students simultaneously
3. ✅ Students can view their assigned tasks with correct information
4. ✅ Students can mark tasks as complete
5. ✅ Teachers can view completion statistics for each task
6. ✅ Teachers can edit existing tasks
7. ✅ Teachers can delete tasks with confirmation
8. ✅ All RLS policies are properly enforced
9. ✅ UI is mobile-responsive and user-friendly
10. ✅ All error cases are handled gracefully

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-21  
**Next Review Date:** After implementation completion
