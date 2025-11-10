/**
 * Task and Task Assignment Type Definitions
 * Phase 3H: Teacher Task CRUD with Gamification
 */

/**
 * Represents a task created by a teacher
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  subject: string;
  due_date: string;
  teacher_id: string;
  coin_reward: number;
  created_at: string;
  updated_at: string;
  status?: string; // Assignment status: 'Pending' or 'Graded'
}

/**
 * Represents a task assignment to a student
 */
export interface TaskAssignment {
  id: string;
  task_id: string;
  student_id: string;
  is_completed: boolean;
  completed_at: string | null;
  assigned_at: string;
  task?: Task; // Joined task data
}

/**
 * Extended task assignment with task details
 */
export interface TaskAssignmentWithTask extends TaskAssignment {
  task: Task;
}

/**
 * Input for creating a new task
 */
export interface CreateTaskInput {
  title: string;
  description?: string;
  subject: string;
  due_date: string;
  coin_reward: number;
  student_ids: string[];
}

/**
 * Input for updating an existing task
 * Note: coin_reward cannot be changed after task creation
 */
export interface UpdateTaskInput {
  title?: string;
  description?: string;
  subject?: string;
  due_date?: string;
}
