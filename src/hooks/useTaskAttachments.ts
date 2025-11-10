import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface TaskAttachment {
  id: string;
  task_id: string;
  uploaded_by: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  attachment_type: 'teacher_material' | 'student_submission';
  created_at: string;
  uploader?: {
    id: string;
    full_name: string;
    role: string;
  };
}

interface UseTaskAttachmentsReturn {
  attachments: TaskAttachment[];
  loading: boolean;
  uploading: boolean;
  uploadFile: (file: File, type: 'teacher_material' | 'student_submission') => Promise<void>;
  deleteFile: (attachmentId: string, filePath: string) => Promise<void>;
  downloadFile: (filePath: string, fileName: string) => Promise<void>;
  error: string | null;
}

export function useTaskAttachments(taskId: string): UseTaskAttachmentsReturn {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();

  // Fetch attachments on mount and set up real-time
  useEffect(() => {
    if (!taskId) return;

    fetchAttachments();

    // Set up real-time subscription
    let channel: RealtimeChannel;

    channel = supabase
      .channel(`task_attachments:${taskId}:${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'task_attachments',
          filter: `task_id=eq.${taskId}`
        },
        () => {
          fetchAttachments();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'task_attachments',
          filter: `task_id=eq.${taskId}`
        },
        () => {
          fetchAttachments();
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [taskId]);

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('task_attachments')
        .select(`
          *,
          uploader:profiles!uploaded_by (
            id,
            full_name,
            role
          )
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setAttachments(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load attachments');
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, type: 'teacher_material' | 'student_submission') => {
    if (!user || !profile) {
      setError('You must be logged in to upload files');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Validate file size (10 MB)
      if (file.size > 10485760) {
        throw new Error('File size exceeds 10 MB limit');
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain',
        'application/zip'
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not allowed. Supported: PDF, DOC, DOCX, images, TXT, ZIP');
      }

      // Generate file path based on type
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      
      let filePath: string;
      if (type === 'teacher_material') {
        filePath = `${taskId}/teacher/${timestamp}_${sanitizedFileName}`;
      } else {
        filePath = `${taskId}/student/${user.id}/${timestamp}_${sanitizedFileName}`;
      }

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Create database record
      const { error: dbError } = await supabase
        .from('task_attachments')
        .insert({
          task_id: taskId,
          uploaded_by: user.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          attachment_type: type
        });

      if (dbError) {
        // If DB insert fails, delete the uploaded file
        await supabase.storage.from('task-attachments').remove([filePath]);
        throw dbError;
      }

      // Refresh attachments list
      await fetchAttachments();
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (attachmentId: string, filePath: string) => {
    try {
      setError(null);

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('task-attachments')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('task_attachments')
        .delete()
        .eq('id', attachmentId);

      if (dbError) throw dbError;

      // Update local state
      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete file');
      throw err;
    }
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      setError(null);

      // Download file from storage
      const { data, error: downloadError } = await supabase.storage
        .from('task-attachments')
        .download(filePath);

      if (downloadError) throw downloadError;

      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Failed to download file');
      throw err;
    }
  };

  return {
    attachments,
    loading,
    uploading,
    uploadFile,
    deleteFile,
    downloadFile,
    error
  };
}
