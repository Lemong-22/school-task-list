import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    role: string;
  };
}

interface UseTaskCommentsReturn {
  comments: TaskComment[];
  loading: boolean;
  posting: boolean;
  postComment: (content: string) => Promise<void>;
  editComment: (commentId: string, newContent: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  canEditComment: (comment: TaskComment) => boolean;
  error: string | null;
}

export function useTaskComments(taskId: string): UseTaskCommentsReturn {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch comments and set up real-time subscription
  useEffect(() => {
    if (!taskId) return;

    let channel: RealtimeChannel;

    const setupComments = async () => {
      await fetchComments();
      channel = subscribeToComments();
    };

    setupComments();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [taskId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('task_comments')
        .select(`
          *,
          user:profiles!user_id (
            id,
            full_name,
            role
          )
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      setComments(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToComments = () => {
    const channel = supabase
      .channel(`task_comments:${taskId}:${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'task_comments',
          filter: `task_id=eq.${taskId}`
        },
        async (payload: any) => {
          // Fetch the new comment with user data
          const { data } = await supabase
            .from('task_comments')
            .select(`
              *,
              user:profiles!user_id (
                id,
                full_name,
                role
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setComments(prev => {
              // Prevent duplicates
              if (prev.some(c => c.id === data.id)) {
                return prev;
              }
              return [...prev, data];
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'task_comments',
          filter: `task_id=eq.${taskId}`
        },
        (payload: any) => {
          setComments(prev =>
            prev.map(comment =>
              comment.id === payload.new.id
                ? { ...comment, ...payload.new }
                : comment
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'task_comments',
          filter: `task_id=eq.${taskId}`
        },
        (payload: any) => {
          setComments(prev =>
            prev.filter(comment => comment.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    return channel;
  };

  const postComment = async (content: string) => {
    if (!user) {
      setError('You must be logged in to comment');
      return;
    }

    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (content.length > 1000) {
      setError('Comment exceeds 1000 character limit');
      return;
    }

    try {
      setPosting(true);
      setError(null);

      const { error: insertError } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          user_id: user.id,
          content: content.trim()
        });

      if (insertError) throw insertError;

      // Real-time subscription will add the comment automatically
    } catch (err: any) {
      setError(err.message || 'Failed to post comment');
      throw err;
    } finally {
      setPosting(false);
    }
  };

  const editComment = async (commentId: string, newContent: string) => {
    if (!newContent.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (newContent.length > 1000) {
      setError('Comment exceeds 1000 character limit');
      return;
    }

    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('task_comments')
        .update({
          content: newContent.trim(),
          is_edited: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId);

      if (updateError) {
        if (updateError.message.includes('RLS')) {
          throw new Error('Comments can only be edited within 5 minutes of posting');
        }
        throw updateError;
      }

      // Real-time subscription will update the comment automatically
    } catch (err: any) {
      setError(err.message || 'Failed to edit comment');
      throw err;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      setError(null);

      // Optimistically remove from UI immediately
      setComments(prev => prev.filter(c => c.id !== commentId));

      const { error: deleteError } = await supabase
        .from('task_comments')
        .delete()
        .eq('id', commentId);

      if (deleteError) {
        // Rollback on error - refetch to restore
        await fetchComments();
        throw deleteError;
      }

      // Success - real-time will sync for other users
    } catch (err: any) {
      setError(err.message || 'Failed to delete comment');
      throw err;
    }
  };

  const canEditComment = (comment: TaskComment): boolean => {
    if (!user || comment.user_id !== user.id) return false;

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const commentDate = new Date(comment.created_at);

    return commentDate > fiveMinutesAgo;
  };

  return {
    comments,
    loading,
    posting,
    postComment,
    editComment,
    deleteComment,
    canEditComment,
    error
  };
}
