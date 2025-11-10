/**
 * Coin Service - API calls for gamification features
 * Phase 3C: TypeScript Services
 */

import { supabase } from '../lib/supabaseClient';
import { CoinTransaction, CoinRewardResult, LeaderboardEntry, StudentRank, TaskCompletionStats } from '../types/coin';

export const coinService = {
  /**
   * Complete a task and award coins
   * Calls the complete_task_and_award_coins database function
   */
  async completeTask(
    taskAssignmentId: string,
    studentId: string
  ): Promise<CoinRewardResult> {
    const { data, error } = await supabase.rpc('complete_task_and_award_coins', {
      p_task_assignment_id: taskAssignmentId,
      p_student_id: studentId,
    });

    if (error) throw error;
    return data as CoinRewardResult;
  },

  /**
   * Get leaderboard with top N students (with titles & namecards)
   */
  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase.rpc('get_leaderboard_with_cosmetics', {
      p_limit: limit,
    });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get a specific student's rank and stats
   */
  async getStudentRank(studentId: string): Promise<StudentRank | null> {
    const { data, error } = await supabase.rpc('get_student_rank', {
      p_student_id: studentId,
    });

    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  },

  /**
   * Get coin transaction history for a student
   */
  async getTransactionHistory(
    studentId: string,
    limit: number = 20
  ): Promise<CoinTransaction[]> {
    const { data, error } = await supabase
      .from('coin_transactions')
      .select(`
        *,
        task:tasks(title, subject)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Get total coins for a student
   */
  async getTotalCoins(studentId: string): Promise<number> {
    const { data, error } = await supabase
      .from('profiles')
      .select('total_coins')
      .eq('id', studentId)
      .single();

    if (error) throw error;
    return data?.total_coins || 0;
  },

  /**
   * Get task completion statistics (for teachers)
   */
  async getTaskCompletionStats(taskId: string): Promise<TaskCompletionStats | null> {
    const { data, error } = await supabase.rpc('get_task_completion_stats', {
      p_task_id: taskId,
    });

    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  },

  /**
   * Recalculate total coins from transaction history (admin/maintenance)
   */
  async recalculateTotalCoins(studentId: string): Promise<number> {
    const { data, error } = await supabase.rpc('recalculate_total_coins', {
      p_student_id: studentId,
    });

    if (error) throw error;
    return data || 0;
  },
};
