/**
 * useLeaderboard Hook - Manages leaderboard data
 * Phase 3D: Custom Hooks
 */

import { useState, useEffect, useCallback } from 'react';
import { coinService } from '../services/coinService';
import { LeaderboardEntry, StudentRank } from '../types/coin';

export const useLeaderboard = (limit: number = 10) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await coinService.getLeaderboard(limit);
      setLeaderboard(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch leaderboard';
      setError(errorMessage);
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    loading,
    error,
    refetch: fetchLeaderboard,
  };
};

/**
 * Hook to get a specific student's rank
 */
export const useStudentRank = (studentId: string | null) => {
  const [rank, setRank] = useState<StudentRank | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRank = useCallback(async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await coinService.getStudentRank(studentId);
      setRank(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch student rank';
      setError(errorMessage);
      console.error('Error fetching student rank:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchRank();
  }, [fetchRank]);

  return {
    rank,
    loading,
    error,
    refetch: fetchRank,
  };
};
