/**
 * useTeacherTasks Hook - Manages task CRUD operations for teachers
 * Phase 3H: Teacher Task Management with Gamification
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Task, CreateTaskInput, UpdateTaskInput } from '../types/task';

export const useTeacherTasks = (teacherId: string | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all tasks created by this teacher
   */
  const fetchTasks = useCallback(async () => {
    if (!teacherId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setTasks(data || []);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch tasks';
      setError(errorMessage);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  /**
   * Create a new task and assign it to students
   */
  const createTask = async (input: CreateTaskInput): Promise<Task> => {
    if (!teacherId) {
      throw new Error('Teacher ID is required');
    }

    try {
      // 1. Create the task
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert({
          title: input.title,
          description: input.description || '',
          subject: input.subject,
          due_date: input.due_date,
          coin_reward: input.coin_reward,
          teacher_id: teacherId,
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // 2. Create task assignments for selected students
      if (input.student_ids.length > 0) {
        const assignments = input.student_ids.map((studentId) => ({
          task_id: task.id,
          student_id: studentId,
          is_completed: false,
        }));

        const { error: assignmentError } = await supabase
          .from('task_assignments')
          .insert(assignments);

        if (assignmentError) throw assignmentError;
      }

      // Refresh the task list
      await fetchTasks();

      return task;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create task');
    }
  };

  /**
   * Update an existing task
   */
  const updateTask = async (taskId: string, input: UpdateTaskInput): Promise<Task> => {
    try {
      const { data: task, error: updateError } = await supabase
        .from('tasks')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .eq('teacher_id', teacherId)
        .select()
        .single();

      if (updateError) throw updateError;

      await fetchTasks();

      return task;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update task');
    }
  };

  /**
   * Delete a task and its assignments
   */
  const deleteTask = async (taskId: string): Promise<void> => {
    try {
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('teacher_id', teacherId);

      if (deleteError) throw deleteError;

      await fetchTasks();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete task');
    }
  };

  /**
   * Get a single task by ID
   */
  const getTaskById = async (taskId: string): Promise<Task | null> => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .eq('teacher_id', teacherId)
        .single();

      if (error) throw error;

      return data;
    } catch (err: any) {
      console.error('Error fetching task:', err);
      return null;
    }
  };

  /**
   * Get task assignments for a specific task
   */
  const getTaskAssignments = async (taskId: string) => {
    try {
      const { data, error } = await supabase
        .from('task_assignments')
        .select(`
          *,
          student:profiles!task_assignments_student_id_fkey(id, full_name)
        `)
        .eq('task_id', taskId);

      if (error) throw error;

      return data || [];
    } catch (err: any) {
      console.error('Error fetching task assignments:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    getTaskById,
    getTaskAssignments,
    refetch: fetchTasks,
  };
};
