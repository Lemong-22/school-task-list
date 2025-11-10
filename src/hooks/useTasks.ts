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
import { RealtimeChannel } from '@supabase/supabase-js';

export const useTasks = (studentId: string | null, filters?: TaskFilters) => {
  const [tasks, setTasks] = useState<TaskAssignmentWithTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTaskCount, setNewTaskCount] = useState(0);

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

      // Parse JSONB task field - RPC returns task as JSONB, we need to parse it
      const parsedData = (data || []).map((item: any) => ({
        ...item,
        task: typeof item.task === 'string' ? JSON.parse(item.task) : item.task,
      }));

      // Sort tasks: pending first (by due date), then completed (by completion date, newest first)
      const sortedData = parsedData.sort((a: TaskAssignmentWithTask, b: TaskAssignmentWithTask) => {
        // Incomplete tasks first
        if (a.is_completed !== b.is_completed) {
          return a.is_completed ? 1 : -1;
        }
        
        // For pending tasks: sort by due date (soonest first)
        if (!a.is_completed && !b.is_completed) {
          return new Date(a.task.due_date).getTime() - new Date(b.task.due_date).getTime();
        }
        
        // For completed tasks: sort by completion date (newest first)
        if (a.is_completed && b.is_completed && a.completed_at && b.completed_at) {
          return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime();
        }
        
        return 0;
      });

      setTasks(sortedData);
      setNewTaskCount(0); // Reset notification when tasks are refreshed
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

  // Real-time subscription for new task assignments
  useEffect(() => {
    if (!studentId) return;

    let channel: RealtimeChannel;

    const setupRealtime = () => {
      channel = supabase
        .channel(`task_assignments:${studentId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'task_assignments',
            filter: `student_id=eq.${studentId}`
          },
          () => {
            // New task assigned - increment notification counter
            setNewTaskCount(prev => prev + 1);
            // Force a re-render by also fetching tasks in background
            setTimeout(() => fetchTasks(), 100);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'task_assignments',
            filter: `student_id=eq.${studentId}`
          },
          () => {
            fetchTasks(); // Auto-refresh on updates
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [studentId, fetchTasks]);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    newTaskCount,
    clearNotification: () => setNewTaskCount(0),
  };
};
