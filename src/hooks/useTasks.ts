/**
 * useTasks Hook - Manages task assignments for students
 * Phase 3F: Student Dashboard Integration
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { TaskAssignmentWithTask } from '../types/task';

export const useTasks = (studentId: string | null) => {
  const [tasks, setTasks] = useState<TaskAssignmentWithTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('task_assignments')
        .select(`
          *,
          task:tasks(*)
        `)
        .eq('student_id', studentId)
        .order('assigned_at', { ascending: false });

      if (fetchError) throw fetchError;

      setTasks(data || []);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch tasks';
      setError(errorMessage);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

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
