/**
 * useStudentCount Hook
 * Fetches the total count of students in the system
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useStudentCount = () => {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentCount = async () => {
      try {
        setLoading(true);
        setError(null);

        const { count: studentCount, error: countError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'student');

        if (countError) throw countError;

        setCount(studentCount || 0);
      } catch (err) {
        console.error('Error fetching student count:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch student count');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentCount();
  }, []);

  return { count, loading, error };
};
