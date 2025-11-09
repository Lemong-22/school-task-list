/**
 * useTasks Hook - Manages task assignments for students
 * Phase 3F: Student Dashboard Integration
 * Phase 6: Added server-side filtering with RPC functions
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { TaskAssignmentWithTask } from '../types/task';
import { TaskFilters } from '../types/filters';
import { useDebounce } from './useDebounce';

export const useTasks = (studentId: string | null, filters?: TaskFilters) => {
  const [tasks, setTasks] = useState<TaskAssignmentWithTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search term to prevent excessive API calls
  const debouncedSearch = useDebounce(filters?.search || '', 300);

  const fetchTasks = useCallback(async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase.rpc('filter_student_task_assignments', {
        p_student_id: studentId,
        p_subject: filters?.subject || null,
        p_status: filters?.status || 'all',
        p_search: debouncedSearch || null,
      });

      if (fetchError) throw fetchError;

      setTasks(data || []);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch tasks';
      setError(errorMessage);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId, filters?.subject, filters?.status, debouncedSearch]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
  };
};
