/**
 * useTotalCoinsAwarded Hook
 * Fetches the total coins awarded by a specific teacher
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useTotalCoinsAwarded = (teacherId: string | null) => {
  const [totalCoins, setTotalCoins] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teacherId) {
      setLoading(false);
      return;
    }

    const fetchTotalCoinsAwarded = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: rpcError } = await supabase
          .rpc('get_total_coins_awarded', { p_teacher_id: teacherId });

        if (rpcError) throw rpcError;

        setTotalCoins(data || 0);
      } catch (err) {
        console.error('Error fetching total coins awarded:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch total coins awarded');
      } finally {
        setLoading(false);
      }
    };

    fetchTotalCoinsAwarded();
  }, [teacherId]);

  return { totalCoins, loading, error };
};
