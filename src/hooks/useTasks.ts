import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Task, TaskAssignment, CreateTaskInput, UpdateTaskInput, TaskWithStats } from '../types/task';

export const useTasks = () => {
  const { user, role } = useAuth();
  const [tasks, setTasks] = useState<Task[] | TaskAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks based on user role
  const fetchTasks = async () => {
    if (!user || !role) return;

    setLoading(true);
    setError(null);

    try {
      if (role === 'teacher') {
        // Teachers: fetch their own tasks with assignment counts
        const { data, error: fetchError } = await supabase
          .from('tasks')
          .select(`
            *,
            task_assignments(count)
          `)
          .eq('teacher_id', user.id)
          .order('due_date', { ascending: true });

        if (fetchError) throw fetchError;

        // Transform data to include stats
        const tasksWithStats = await Promise.all(
          (data || []).map(async (task) => {
            const { data: assignments } = await supabase
              .from('task_assignments')
              .select('status')
              .eq('task_id', task.id);

            const totalAssignments = assignments?.length || 0;
            const completedAssignments = assignments?.filter(a => a.status === 'completed').length || 0;

            return {
              ...task,
              total_assignments: totalAssignments,
              completed_assignments: completedAssignments,
            } as TaskWithStats;
          })
        );

        setTasks(tasksWithStats);
      } else {
        // Students: fetch assigned tasks
        const { data, error: fetchError } = await supabase
          .from('task_assignments')
          .select(`
            id,
            task_id,
            student_id,
            status,
            completed_at,
            created_at,
            task:tasks(
              id,
              title,
              description,
              due_date,
              subject,
              teacher_id,
              created_at,
              updated_at,
              profiles:teacher_id(full_name)
            )
          `)
          .eq('student_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setTasks(data || []);
      }
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  // Create a new task
  const createTask = async (taskData: CreateTaskInput) => {
    if (!user || role !== 'teacher') {
      throw new Error('Only teachers can create tasks');
    }

    setError(null);

    try {
      // 1. Insert task record
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description || null,
          due_date: taskData.due_date,
          subject: taskData.subject,
          teacher_id: user.id,
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // 2. Insert assignment records for each student
      const assignments = taskData.student_ids.map(studentId => ({
        task_id: task.id,
        student_id: studentId,
        status: 'pending',
      }));

      const { error: assignmentError } = await supabase
        .from('task_assignments')
        .insert(assignments);

      if (assignmentError) throw assignmentError;

      // Refresh task list
      await fetchTasks();
    } catch (err: any) {
      console.error('Error creating task:', err);
      throw new Error(err.message || 'Failed to create task');
    }
  };

  // Update an existing task
  const updateTask = async (taskId: string, updates: UpdateTaskInput) => {
    if (!user || role !== 'teacher') {
      throw new Error('Only teachers can update tasks');
    }

    setError(null);

    try {
      // 1. Update task record
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description || null;
      if (updates.due_date !== undefined) updateData.due_date = updates.due_date;
      if (updates.subject !== undefined) updateData.subject = updates.subject;

      const { error: taskError } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);

      if (taskError) throw taskError;

      // 2. If student_ids provided, update assignments
      if (updates.student_ids) {
        // Delete old assignments
        await supabase
          .from('task_assignments')
          .delete()
          .eq('task_id', taskId);

        // Create new assignments
        const assignments = updates.student_ids.map(studentId => ({
          task_id: taskId,
          student_id: studentId,
          status: 'pending',
        }));

        const { error: assignmentError } = await supabase
          .from('task_assignments')
          .insert(assignments);

        if (assignmentError) throw assignmentError;
      }

      // Refresh task list
      await fetchTasks();
    } catch (err: any) {
      console.error('Error updating task:', err);
      throw new Error(err.message || 'Failed to update task');
    }
  };

  // Delete a task
  const deleteTask = async (taskId: string) => {
    if (!user || role !== 'teacher') {
      throw new Error('Only teachers can delete tasks');
    }

    setError(null);

    try {
      // Cascade delete will automatically remove assignments
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      // Refresh task list
      await fetchTasks();
    } catch (err: any) {
      console.error('Error deleting task:', err);
      throw new Error(err.message || 'Failed to delete task');
    }
  };

  // Mark a task as complete (for students)
  const completeTask = async (assignmentId: string) => {
    if (!user || role !== 'student') {
      throw new Error('Only students can complete tasks');
    }

    setError(null);

    try {
      const { error } = await supabase
        .from('task_assignments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', assignmentId);

      if (error) throw error;

      // Refresh task list
      await fetchTasks();
    } catch (err: any) {
      console.error('Error completing task:', err);
      throw new Error(err.message || 'Failed to complete task');
    }
  };

  // Fetch a single task by ID (for editing)
  const fetchTaskById = async (taskId: string): Promise<Task | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error fetching task:', err);
      throw new Error(err.message || 'Failed to fetch task');
    }
  };

  // Fetch current assignments for a task (for editing)
  const fetchTaskAssignments = async (taskId: string): Promise<string[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('task_assignments')
        .select('student_id')
        .eq('task_id', taskId);

      if (error) throw error;
      return data?.map(a => a.student_id) || [];
    } catch (err: any) {
      console.error('Error fetching assignments:', err);
      return [];
    }
  };

  // Fetch tasks on mount and when user changes
  useEffect(() => {
    if (user && role) {
      fetchTasks();
    }
  }, [user, role]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    fetchTasks,
    fetchTaskById,
    fetchTaskAssignments,
  };
};
