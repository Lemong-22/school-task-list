/**
 * Coin and Gamification Type Definitions
 * Phase 3C: TypeScript Types
 */

/**
 * Represents a single coin transaction record
 */
export interface CoinTransaction {
  id: string;
  student_id: string;
  task_id: string;
  coins_awarded: number;
  transaction_type: 'base_reward' | 'bonus_reward' | 'late_penalty';
  completed_at: string;
  created_at: string;
}

/**
 * Result returned from complete_task_and_award_coins function
 */
export interface CoinRewardResult {
  success: boolean;
  task_id: string;
  completed_at: string;
  coins_awarded: number;
  is_bonus: boolean;
  is_on_time: boolean;
  total_coins: number;
  rank?: number;
}

/**
 * Represents a single entry in the leaderboard
 */
export interface LeaderboardEntry {
  rank: number;
  student_id: string;
  student_name: string;
  total_coins: number;
}

/**
 * Student's rank information
 */
export interface StudentRank {
  rank: number;
  student_id: string;
  student_name: string;
  total_coins: number;
  total_students: number;
}

/**
 * Task completion statistics (for teachers)
 */
export interface TaskCompletionStats {
  task_id: string;
  total_assigned: number;
  completed_on_time: number;
  completed_late: number;
  not_completed: number;
  top_3_students: Array<{
    student_id: string;
    student_name: string;
    completed_at: string;
    coins_awarded: number;
  }> | null;
}
