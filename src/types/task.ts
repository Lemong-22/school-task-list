export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string; // ISO 8601 date string
  subject: string; // Mata Pelajaran
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
  task?: Task & {
    profiles?: {
      full_name: string;
    };
  };
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  due_date: string;
  subject: string; // Mata Pelajaran
  student_ids: string[]; // Array of student UUIDs
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  due_date?: string;
  subject?: string; // Mata Pelajaran
  student_ids?: string[]; // If provided, replaces all assignments
}

export interface TaskWithStats extends Task {
  total_assignments: number;
  completed_assignments: number;
}
