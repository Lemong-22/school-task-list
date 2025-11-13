import { supabase } from '../lib/supabaseClient';
import type { TaskCompletionStats, StudentEngagement, SubjectPerformance, AnalyticsData } from '../types/analytics';

// Helper to get current user ID
const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
};

export const analyticsService = {
  /**
   * Fetch task completion statistics for pie chart
   */
  async getCompletionStats(): Promise<TaskCompletionStats> {
    const { data, error } = await supabase.rpc('get_task_completion_stats');
    
    if (error) {
      console.error('Error fetching completion stats:', error);
      throw new Error(error.message);
    }
    
    return data as TaskCompletionStats;
  },

  /**
   * Fetch student engagement statistics for bar chart
   */
  async getStudentEngagement(): Promise<StudentEngagement[]> {
    const { data, error } = await supabase.rpc('get_student_engagement_stats');
    
    if (error) {
      console.error('Error fetching student engagement:', error);
      throw new Error(error.message);
    }
    
    return (data || []) as StudentEngagement[];
  },

  /**
   * Fetch subject performance statistics for radar chart
   */
  async getSubjectPerformance(): Promise<SubjectPerformance[]> {
    const { data, error } = await supabase.rpc('get_subject_performance_stats');
    
    if (error) {
      console.error('Error fetching subject performance:', error);
      throw new Error(error.message);
    }
    
    return (data || []) as SubjectPerformance[];
  },

  /**
   * Fetch submission timing statistics for procrastination meter
   */
  async getSubmissionTiming(): Promise<import('../types/analytics').SubmissionTiming[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');
    
    const { data, error } = await supabase.rpc('get_submission_timing_stats', {
      p_teacher_id: userId
    });
    
    if (error) {
      console.error('Error fetching submission timing:', error);
      throw new Error(error.message);
    }
    
    return (data || []) as import('../types/analytics').SubmissionTiming[];
  },

  /**
   * Fetch work distribution statistics (task count by subject)
   */
  async getWorkDistribution(): Promise<import('../types/analytics').WorkDistribution[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');
    
    const { data, error } = await supabase.rpc('get_task_count_by_subject', {
      p_teacher_id: userId
    });
    
    if (error) {
      console.error('Error fetching work distribution:', error);
      throw new Error(error.message);
    }
    
    return (data || []) as import('../types/analytics').WorkDistribution[];
  },

  /**
   * Fetch all analytics data in parallel
   */
  async getAllAnalytics(): Promise<AnalyticsData> {
    try {
      const [
        completionStats,
        studentEngagement,
        subjectPerformance,
        submissionTiming,
        workDistribution
      ] = await Promise.all([
        this.getCompletionStats(),
        this.getStudentEngagement(),
        this.getSubjectPerformance(),
        this.getSubmissionTiming(),
        this.getWorkDistribution()
      ]);

      return {
        completionStats,
        studentEngagement,
        subjectPerformance,
        submissionTiming,
        workDistribution
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  }
};
