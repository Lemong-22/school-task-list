/**
 * Task and Task Assignment Type Definitions
 * Phase 3C: TypeScript Types
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
  created_by: string;
  created_at: string;
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
