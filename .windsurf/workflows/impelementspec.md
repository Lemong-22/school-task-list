---
description: 
---

## IMPLEMENTATION COMMAND: Phase 2 - Core Task Management

**## CONTEXT**
-   **Feature to Implement:** Phase 2 - Core Task Management (CRUD).
-   **Specification Directory:** `/agent-os/specs/2025-10-21-task-management/`
-   **Status:** The project is on the `feature/task-management` branch. Phase 1 (Auth) is complete. The Supabase database is **READY** with the `tasks` and `task_assignments` tables and RLS policies already created.

**## YOUR TASK**
Your objective is to write the complete source code for the **Core Task Management** feature, following the `technical-architecture.md` and `implementation-plan.md` from the spec folder.

This involves **creating new files** and **modifying existing files**.

---

**### 1. New Files to Create**

You must create the following new files:

**A. `src/hooks/useTasks.ts`**
* This is the most critical file.
* It must manage all task-related logic and state (`loading`, `error`, `data`).
* It needs to export functions for:
    * `createTask(taskData, assignedStudentIds)`: For teachers. This function must insert into `tasks` AND `task_assignments` tables within a single operation.
    * `fetchTeacherTasks()`: For teachers. Fetches all tasks created by the logged-in teacher, including progress (e.g., "3 of 5 completed").
    * `fetchStudentTasks()`: For students. Fetches all tasks assigned to the logged-in student (joining with the `tasks` table to get details).
    * `updateTaskStatus(assignmentId, newStatus)`: For students. To mark a task as 'completed'.
* This hook **MUST** use the `useAuth` hook to get the current user's `id` and `role` to use in Supabase queries.

**B. `src/components/StudentSelector.tsx`**
* A reusable component for the create task form.
* It must fetch a list of all users with the role 'student' from the `profiles` table.
* It should display this list as a multi-select dropdown or a list of checkboxes.
* It will pass the array of selected student `id`s back to the parent form.

**C. `src/pages/CreateTaskPage.tsx`**
* A new page, accessible **only by teachers**.
* It must contain a form with fields for: **Title**, **Description**, and **Due Date**.
* It must use the `StudentSelector.tsx` component to select students.
* On submit, it must call the `createTask` function from the `useTasks` hook.
* Redirect back to the teacher dashboard on success.

**D. `src/components/TaskCard.tsx`**
* A reusable UI component to display a single task.
* It should accept a `task` object as a prop.
* It must display: **Title**, **Due Date**, and **Status**.
* If the user is a **Student**, it must show the **"Selesaikan Tugas" button**.
* If the user is a **Teacher**, it must show the **progress** (e.g., "3/5 Selesai").

---

**### 2. Existing Files to Modify**

You must modify the following existing files:

**A. `src/pages/TeacherDashboard.tsx`**
* Modify this page to use the `useTasks` hook to `fetchTeacherTasks()`.
* Display the list of tasks using the `TaskCard.tsx` component for each task.
* Add a new button or link (e.g., "Buat Tugas Baru") that navigates to the `/dashboard/teacher/create-task` page.

**B. `src/pages/StudentDashboard.tsx`**
* Modify this page to use the `useTasks` hook to `fetchStudentTasks()`.
* Display the list of assigned tasks using the `TaskCard.tsx` component for each task.
* The "Selesaikan Tugas" button on the card should be functional.

**C. `src/App.tsx`**
* Modify the router configuration.
* Add the new route for `CreateTaskPage`:
    * `path="/dashboard/teacher/create-task"`
    * This route MUST be wrapped in `<ProtectedRoute />` and require the role `'teacher'`.

---

Please review all specifications and standards, then create and modify all the files as instructed.