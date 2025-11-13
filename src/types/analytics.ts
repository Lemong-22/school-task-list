export interface TaskCompletionStats {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  completion_percentage: number;
}

export interface StudentEngagement {
  student_id: string;
  student_name: string;
  total_assigned: number;
  total_completed: number;
  completion_rate: number;
  on_time_rate: number;
  engagement_score: number;
}

export interface SubjectPerformance {
  subject: string;
  total_tasks: number;
  avg_completion_rate: number;
  avg_on_time_rate: number;
  performance_score: number;
}

export interface SubmissionTiming {
  timing_bucket: string;
  submission_count: number;
}

export interface WorkDistribution {
  subject: string;
  task_count: number;
}

export interface AnalyticsData {
  completionStats: TaskCompletionStats;
  studentEngagement: StudentEngagement[];
  subjectPerformance: SubjectPerformance[];
  submissionTiming: SubmissionTiming[];
  workDistribution: WorkDistribution[];
}
