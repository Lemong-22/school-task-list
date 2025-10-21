# Task Management - Technical Architecture

**Feature:** Core Task Management (CRUD)  
**Date:** 2025-10-21  
**Status:** Planning Phase  

---

## 1. System Overview

The Task Management system enables Teachers to create, read, update, and delete tasks, and Students to view and complete their assigned tasks. The system builds upon the authentication infrastructure from Phase 1 and uses Supabase PostgreSQL for data storage with Row Level Security.

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Teacher    │  │   Student    │  │  Task Detail │          │
│  │  Dashboard   │  │  Dashboard   │  │     Page     │          │
│  │              │  │              │  │              │          │
│  │ - Task List  │  │ - Task List  │  │ - Full Info  │          │
│  │ - Create Btn │  │ - Complete   │  │ - Complete   │          │
│  │ - Edit/Del   │  │   Button     │  │   Button     │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                  │
│                            │                                     │
│                    ┌───────▼────────┐                            │
│                    │  useTasks Hook │                            │
│                    │ (Custom Hook)  │                            │
│                    │                │                            │
│                    │ - fetchTasks   │                            │
│                    │ - createTask   │                            │
│                    │ - updateTask   │                            │
│                    │ - deleteTask   │                            │
│                    │ - completeTask │                            │
│                    └───────┬────────┘                            │
│                            │                                     │
│                    ┌───────▼────────┐                            │
│                    │ Supabase Client│                            │
│                    │   (from Phase1)│                            │
│                    └───────┬────────┘                            │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             │ HTTPS + RLS Policies
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    Supabase Backend                              │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   profiles   │  │    tasks     │  │    task_     │          │
│  │   (Phase 1)  │  │   (NEW)      │  │ assignments  │          │
│  │              │  │              │  │   (NEW)      │          │
│  │ - id         │  │ - id         │  │ - id         │          │
│  │ - full_name  │  │ - title      │  │ - task_id    │          │
│  │ - role       │  │ - desc       │  │ - student_id │          │
│  │              │  │ - due_date   │  │ - status     │          │
│  │              │  │ - teacher_id │  │ - completed  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  Row Level Security (RLS) Policies:                              │
│  - Teachers can only CRUD their own tasks                        │
│  - Students can only view assigned tasks                         │
│  - Students can only update their own assignments                │
└───────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Breakdown

### 3.1 Frontend Components

#### TeacherDashboard (Updated) (`/src/pages/TeacherDashboard.tsx`)
**Responsibility:** Display task management interface for teachers

**New Features:**
- Task list display
- "Create New Task" button
- Task cards with Edit/Delete buttons
- Completion statistics display

**State:**
- `tasks`: Task[] (list of teacher's tasks)
- `loading`: boolean
- `error`: string | null

**Key Functions:**
- `handleCreateTask()`: Navigate to create task form
- `handleEditTask(taskId)`: Navigate to edit task form
- `handleDeleteTask(taskId)`: Show confirmation and delete task
- Uses `useTasks()` hook for data operations

---

#### StudentDashboard (Updated) (`/src/pages/StudentDashboard.tsx`)
**Responsibility:** Display assigned tasks for students

**New Features:**
- Task list display
- Task status indicators (Pending/Completed)
- "Complete Task" buttons
- Overdue task highlighting

**State:**
- `tasks`: TaskAssignment[] (list of assigned tasks)
- `loading`: boolean
- `error`: string | null

**Key Functions:**
- `handleCompleteTask(assignmentId)`: Mark task as complete
- Uses `useTasks()` hook for data operations

---

#### CreateTaskPage (NEW) (`/src/pages/CreateTaskPage.tsx`)
**Responsibility:** Render form for creating new tasks

**Props:** None

**State:**
- `title`: string
- `description`: string
- `dueDate`: string (ISO date)
- `selectedStudents`: string[] (array of student IDs)
- `students`: UserProfile[] (all available students)
- `loading`: boolean
- `error`: string | null

**Key Functions:**
- `fetchStudents()`: Load all students from profiles table
- `handleSubmit()`: Validate and create task
- `handleStudentToggle(studentId)`: Add/remove from selection
- Form validation (required fields, future date)

**Navigation:**
- Success → Redirect to `/dashboard/teacher`
- Cancel → Navigate back to `/dashboard/teacher`

---

#### EditTaskPage (NEW) (`/src/pages/EditTaskPage.tsx`)
**Responsibility:** Render form for editing existing tasks

**Props:** Route params with `taskId`

**State:**
- Same as CreateTaskPage
- Pre-populated with existing task data

**Key Functions:**
- `fetchTask()`: Load task details and current assignments
- `handleSubmit()`: Validate and update task
- Same validation as create

**Navigation:**
- Success → Redirect to `/dashboard/teacher`
- Cancel → Navigate back to `/dashboard/teacher`

---

#### TaskCard Component (NEW) (`/src/components/TaskCard.tsx`)
**Responsibility:** Display a single task in a card format

**Props:**
- `task`: Task
- `assignmentCount?`: number (for teacher view)
- `completedCount?`: number (for teacher view)
- `status?`: 'pending' | 'completed' (for student view)
- `onEdit?`: (taskId: string) => void
- `onDelete?`: (taskId: string) => void
- `onComplete?`: (assignmentId: string) => void
- `isTeacher`: boolean

**Displays:**
- Task title
- Due date (with overdue indicator)
- Description (truncated or full)
- For teachers: "X of Y completed" progress
- For students: "Complete Task" button or "Completed" badge
- For teachers: Edit and Delete buttons

---

#### StudentSelector Component (NEW) (`/src/components/StudentSelector.tsx`)
**Responsibility:** Multi-select interface for assigning students

**Props:**
- `students`: UserProfile[]
- `selectedStudentIds`: string[]
- `onChange`: (studentIds: string[]) => void

**Features:**
- Checkbox list of all students
- Search/filter functionality
- "Select All" / "Deselect All" buttons
- Shows count of selected students

---

### 3.2 Custom Hooks

#### useTasks Hook (NEW) (`/src/hooks/useTasks.ts`)
**Responsibility:** Provide task management functions and state

**Returns:**
```typescript
{
  tasks: Task[] | TaskAssignment[],
  loading: boolean,
  error: string | null,
  createTask: (taskData: CreateTaskInput) => Promise<void>,
  updateTask: (taskId: string, taskData: UpdateTaskInput) => Promise<void>,
  deleteTask: (taskId: string) => Promise<void>,
  completeTask: (assignmentId: string) => Promise<void>,
  fetchTasks: () => Promise<void>,
  fetchTaskById: (taskId: string) => Promise<Task>,
}
```

**Key Functions:**
- `createTask()`: Creates task and assignment records
- `updateTask()`: Updates task and manages assignments
- `deleteTask()`: Deletes task (cascade deletes assignments)
- `completeTask()`: Updates assignment status and timestamp
- `fetchTasks()`: Gets tasks based on user role (teacher: own tasks, student: assigned tasks)
- `fetchTaskById()`: Gets single task with assignments

**Data Fetching Logic:**
- For Teachers: Query `tasks` table where `teacher_id = currentUser.id`
- For Students: Query `task_assignments` joined with `tasks` where `student_id = currentUser.id`

---

### 3.3 TypeScript Types

#### Task Types (NEW) (`/src/types/task.ts`)

```typescript
export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string; // ISO 8601 date string
  teacher_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  student_id: string;
  status: 'pending' | 'completed';
  completed_at: string | null;
  created_at: string;
  // Joined data from tasks table
  task?: Task;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  due_date: string;
  student_ids: string[]; // Array of student UUIDs
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  due_date?: string;
  student_ids?: string[]; // If provided, replaces all assignments
}

export interface TaskWithStats extends Task {
  total_assignments: number;
  completed_assignments: number;
}
```

---

### 3.4 Routing Configuration

#### Updated App Routes (`/src/App.tsx`)

```typescript
<Routes>
  {/* Existing routes from Phase 1 */}
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/login" element={<LoginPage />} />
  
  {/* Teacher routes */}
  <Route path="/dashboard/teacher" element={
    <ProtectedRoute allowedRole="teacher">
      <TeacherDashboard />
    </ProtectedRoute>
  } />
  
  <Route path="/tasks/create" element={
    <ProtectedRoute allowedRole="teacher">
      <CreateTaskPage />
    </ProtectedRoute>
  } />
  
  <Route path="/tasks/edit/:taskId" element={
    <ProtectedRoute allowedRole="teacher">
      <EditTaskPage />
    </ProtectedRoute>
  } />
  
  {/* Student routes */}
  <Route path="/dashboard/student" element={
    <ProtectedRoute allowedRole="student">
      <StudentDashboard />
    </ProtectedRoute>
  } />
  
  {/* Default redirects */}
  <Route path="/" element={<Navigate to="/login" />} />
  <Route path="*" element={<Navigate to="/login" />} />
</Routes>
```

---

## 4. Data Model

### 4.1 Existing Table (From Phase 1)

#### `profiles` Table
```sql
-- Already exists from Phase 1
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4.2 New Tables (Phase 2)

#### `tasks` Table

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  description TEXT CHECK (char_length(description) <= 1000),
  due_date TIMESTAMPTZ NOT NULL,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_tasks_teacher_id ON tasks(teacher_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Teachers can view own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = teacher_id);

-- Students can view tasks assigned to them (via join with task_assignments)
CREATE POLICY "Students can view assigned tasks"
  ON tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM task_assignments
      WHERE task_assignments.task_id = tasks.id
      AND task_assignments.student_id = auth.uid()
    )
  );
```

---

#### `task_assignments` Table

```sql
CREATE TABLE task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one assignment per task-student pair
  UNIQUE(task_id, student_id)
);

-- Create indexes for faster queries
CREATE INDEX idx_task_assignments_task_id ON task_assignments(task_id);
CREATE INDEX idx_task_assignments_student_id ON task_assignments(student_id);
CREATE INDEX idx_task_assignments_status ON task_assignments(status);

-- Enable Row Level Security
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Students can view own assignments"
  ON task_assignments FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can update own assignments"
  ON task_assignments FOR UPDATE
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers can view assignments for their tasks"
  ON task_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_assignments.task_id
      AND tasks.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create assignments for their tasks"
  ON task_assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_assignments.task_id
      AND tasks.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can delete assignments for their tasks"
  ON task_assignments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_assignments.task_id
      AND tasks.teacher_id = auth.uid()
    )
  );
```

---

### 4.3 Database Functions (Optional Helpers)

#### Function: Get Task Statistics

```sql
CREATE OR REPLACE FUNCTION get_task_stats(task_uuid UUID)
RETURNS TABLE (
  total_assignments BIGINT,
  completed_assignments BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_assignments,
    COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_assignments
  FROM task_assignments
  WHERE task_id = task_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 5. API Operations

### 5.1 Teacher Operations

#### Create Task
```typescript
const createTask = async (taskData: CreateTaskInput) => {
  // 1. Insert task record
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .insert({
      title: taskData.title,
      description: taskData.description || null,
      due_date: taskData.due_date,
      teacher_id: user.id,
    })
    .select()
    .single();

  if (taskError) throw taskError;

  // 2. Insert assignment records for each student
  const assignments = taskData.student_ids.map(studentId => ({
    task_id: task.id,
    student_id: studentId,
    status: 'pending',
  }));

  const { error: assignmentError } = await supabase
    .from('task_assignments')
    .insert(assignments);

  if (assignmentError) throw assignmentError;
};
```

#### Fetch Teacher's Tasks
```typescript
const fetchTeacherTasks = async () => {
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select(`
      *,
      task_assignments(count)
    `)
    .eq('teacher_id', user.id)
    .order('due_date', { ascending: true });

  if (error) throw error;
  return tasks;
};
```

#### Update Task
```typescript
const updateTask = async (taskId: string, updates: UpdateTaskInput) => {
  // 1. Update task record
  const { error: taskError } = await supabase
    .from('tasks')
    .update({
      title: updates.title,
      description: updates.description,
      due_date: updates.due_date,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId);

  if (taskError) throw taskError;

  // 2. If student_ids provided, update assignments
  if (updates.student_ids) {
    // Delete old assignments
    await supabase
      .from('task_assignments')
      .delete()
      .eq('task_id', taskId);

    // Create new assignments
    const assignments = updates.student_ids.map(studentId => ({
      task_id: taskId,
      student_id: studentId,
      status: 'pending',
    }));

    await supabase
      .from('task_assignments')
      .insert(assignments);
  }
};
```

#### Delete Task
```typescript
const deleteTask = async (taskId: string) => {
  // Cascade delete will automatically remove assignments
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) throw error;
};
```

---

### 5.2 Student Operations

#### Fetch Assigned Tasks
```typescript
const fetchStudentTasks = async () => {
  const { data, error } = await supabase
    .from('task_assignments')
    .select(`
      id,
      status,
      completed_at,
      task:tasks(
        id,
        title,
        description,
        due_date,
        teacher_id,
        profiles:teacher_id(full_name)
      )
    `)
    .eq('student_id', user.id)
    .order('task.due_date', { ascending: true });

  if (error) throw error;
  return data;
};
```

#### Complete Task
```typescript
const completeTask = async (assignmentId: string) => {
  const { error } = await supabase
    .from('task_assignments')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', assignmentId);

  if (error) throw error;
};
```

---

## 6. Error Handling

### 6.1 Common Errors

**Task Creation Errors:**
- Missing required fields → "Please fill in all required fields"
- Past due date → "Due date cannot be in the past"
- No students selected → "Please select at least one student"
- Database error → "Failed to create task. Please try again."

**Task Update Errors:**
- Unauthorized → "You can only edit your own tasks"
- Database error → "Failed to update task. Please try again."

**Task Deletion Errors:**
- Unauthorized → "You can only delete your own tasks"
- Database error → "Failed to delete task. Please try again."

**Task Completion Errors:**
- Already completed → "This task has already been marked as complete"
- Unauthorized → "You can only complete your own tasks"
- Database error → "Failed to mark task as complete. Please try again."

---

## 7. Security Considerations

### 7.1 Row Level Security (RLS)
- All tables have RLS enabled
- Teachers can only CRUD their own tasks
- Students can only view tasks assigned to them
- Students can only update their own assignment status
- No user can access other users' data

### 7.2 Input Validation
- Client-side validation for immediate feedback
- Server-side validation via database constraints:
  - Title max length: 200 characters
  - Description max length: 1000 characters
  - Due date must be a valid timestamp
  - Status must be 'pending' or 'completed'

### 7.3 SQL Injection Prevention
- Use Supabase parameterized queries (built-in protection)
- Never concatenate user input into SQL strings

---

## 8. Performance Considerations

### 8.1 Database Optimization
- Indexes on foreign keys (teacher_id, task_id, student_id)
- Index on due_date for sorting
- Index on status for filtering completed tasks

### 8.2 Query Optimization
- Use `.select()` to fetch only needed columns
- Use join queries to reduce round trips
- Cache student list in CreateTask/EditTask forms

### 8.3 Frontend Optimization
- Lazy load task details on demand
- Debounce search in StudentSelector
- Use React.memo for TaskCard components
- Optimistic UI updates (show change before API response)

---

## 9. Testing Strategy

### 9.1 Unit Tests (Future)
- Test useTasks hook functions
- Test form validation logic
- Test date calculations (overdue detection)

### 9.2 Integration Tests (Future)
- Test complete task creation flow
- Test task assignment logic
- Test task completion flow
- Test RLS policies

### 9.3 Manual Testing Checklist
- [ ] Teacher can create task and assign to multiple students
- [ ] Students see only their assigned tasks
- [ ] Teacher can edit task and change assignments
- [ ] Teacher can delete task (confirmation required)
- [ ] Student can mark task as complete
- [ ] Completion statistics update correctly
- [ ] Overdue tasks are highlighted
- [ ] All forms validate correctly
- [ ] Mobile responsive design works

---

## 10. Future Enhancements (Post-Phase 2)

- **Phase 3 Integration:**
  - Complete Task button triggers point/coin rewards
  - Track completion time for leaderboard
  
- **Additional Features:**
  - Task filtering (by status, due date)
  - Task search
  - Bulk operations (assign to all students, bulk delete)
  - Task categories/tags
  - File attachments
  - Comments/feedback system
  - Email notifications

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-21  
**Reviewed By:** [Pending]
