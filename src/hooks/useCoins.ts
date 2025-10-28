/**
 * useCoins Hook - Manages coin-related operations
 * Phase 3D: Custom Hooks
 */

import { useState, useCallback } from 'react';
import { coinService } from '../services/coinService';
import { CoinRewardResult } from '../types/coin';

export const useCoins = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Complete a task and award coins
   */
  const completeTask = useCallback(async (
    taskAssignmentId: string,
    studentId: string
  ): Promise<CoinRewardResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await coinService.completeTask(taskAssignmentId, studentId);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to complete task';
      setError(errorMessage);
      console.error('Error completing task:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get total coins for a student
   */
  const getTotalCoins = useCallback(async (studentId: string): Promise<number> => {
    try {
      return await coinService.getTotalCoins(studentId);
    } catch (err: any) {
      console.error('Error fetching total coins:', err);
      return 0;
    }
  }, []);

  return {
    completeTask,
    getTotalCoins,
    loading,
    error,
  };
};
