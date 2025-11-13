export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  subject: string;
  start: Date;
  end: Date;
  due_date: Date;
  coin_reward: number;
  teacher_id: string;
  status: 'pending' | 'completed' | 'overdue';
  priority?: 'low' | 'medium' | 'high';
  estimated_minutes?: number;
  
  // Teacher-specific fields
  completion_count?: number;
  total_assigned?: number;
  
  // Student-specific fields
  is_completed?: boolean;
  completed_at?: Date | null;
  assignment_id?: string;
}
