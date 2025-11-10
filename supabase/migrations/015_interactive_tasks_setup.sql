-- ============================================================================
-- Migration: 015_interactive_tasks_setup.sql
-- Description: Add file attachments and real-time comments to tasks
-- Date: 2025-11-10
-- Phase: Phase 7 - Interactive Tasks (Attachments & Comments)
-- ============================================================================

-- ============================================================================
-- SECTION 1: Create Storage Bucket
-- ============================================================================

-- Create private storage bucket for task attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'task-attachments',
  'task-attachments',
  false, -- Private bucket, requires authentication
  10485760, -- 10 MB file size limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'application/zip'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 2: Create New Tables
-- ============================================================================

-- Create task_attachments table to store file metadata
CREATE TABLE IF NOT EXISTS public.task_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL CHECK (file_size > 0 AND file_size <= 10485760),
  file_type VARCHAR(50) NOT NULL,
  attachment_type VARCHAR(20) NOT NULL CHECK (attachment_type IN ('teacher_material', 'student_submission')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for task_attachments
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id 
ON public.task_attachments(task_id);

CREATE INDEX IF NOT EXISTS idx_task_attachments_uploaded_by 
ON public.task_attachments(uploaded_by);

-- Add comments for documentation
COMMENT ON TABLE public.task_attachments IS 'Stores metadata for files attached to tasks (teacher materials and student submissions)';
COMMENT ON COLUMN public.task_attachments.attachment_type IS 'Type of attachment: teacher_material or student_submission';
COMMENT ON COLUMN public.task_attachments.file_path IS 'Path in Supabase Storage bucket';

-- Create task_comments table for real-time commenting
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (LENGTH(content) > 0 AND LENGTH(content) <= 1000),
  is_edited BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for task_comments
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id_created 
ON public.task_comments(task_id, created_at);

CREATE INDEX IF NOT EXISTS idx_task_comments_user_id 
ON public.task_comments(user_id);

-- Add comments for documentation
COMMENT ON TABLE public.task_comments IS 'Stores comments on tasks for teacher-student communication';
COMMENT ON COLUMN public.task_comments.is_edited IS 'Indicates if comment was edited after initial posting';
COMMENT ON COLUMN public.task_comments.content IS 'Comment text content (max 1000 characters)';

-- ============================================================================
-- SECTION 3: Enable Row Level Security (RLS)
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 4: RLS Policies for task_attachments Table
-- ============================================================================

-- Policy: Teachers can view all attachments on their tasks
CREATE POLICY "teachers_view_task_attachments"
ON public.task_attachments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = task_attachments.task_id
    AND tasks.teacher_id = auth.uid()
  )
);

-- Policy: Students can view teacher materials on their assigned tasks
CREATE POLICY "students_view_teacher_materials"
ON public.task_attachments
FOR SELECT
TO authenticated
USING (
  attachment_type = 'teacher_material'
  AND EXISTS (
    SELECT 1 FROM public.task_assignments
    WHERE task_assignments.task_id = task_attachments.task_id
    AND task_assignments.student_id = auth.uid()
  )
);

-- Policy: Students can view their own submissions
CREATE POLICY "students_view_own_submissions"
ON public.task_attachments
FOR SELECT
TO authenticated
USING (
  attachment_type = 'student_submission'
  AND uploaded_by = auth.uid()
);

-- Policy: Teachers can upload attachments to their tasks
CREATE POLICY "teachers_upload_attachments"
ON public.task_attachments
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = task_attachments.task_id
    AND tasks.teacher_id = auth.uid()
  )
);

-- Policy: Students can upload submissions to their assigned tasks
CREATE POLICY "students_upload_submissions"
ON public.task_attachments
FOR INSERT
TO authenticated
WITH CHECK (
  attachment_type = 'student_submission'
  AND uploaded_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.task_assignments
    WHERE task_assignments.task_id = task_attachments.task_id
    AND task_assignments.student_id = auth.uid()
  )
);

-- Policy: Users can delete only their own attachments
CREATE POLICY "users_delete_own_attachments"
ON public.task_attachments
FOR DELETE
TO authenticated
USING (
  uploaded_by = auth.uid()
);

-- ============================================================================
-- SECTION 5: RLS Policies for task_comments Table
-- ============================================================================

-- Policy: Teachers can view all comments on their tasks
CREATE POLICY "teachers_view_task_comments"
ON public.task_comments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = task_comments.task_id
    AND tasks.teacher_id = auth.uid()
  )
);

-- Policy: Students can view comments on their assigned tasks
CREATE POLICY "students_view_task_comments"
ON public.task_comments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.task_assignments
    WHERE task_assignments.task_id = task_comments.task_id
    AND task_assignments.student_id = auth.uid()
  )
);

-- Policy: Teachers can post comments on their tasks
CREATE POLICY "teachers_post_comments"
ON public.task_comments
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = task_comments.task_id
    AND tasks.teacher_id = auth.uid()
  )
);

-- Policy: Students can post comments on their assigned tasks
CREATE POLICY "students_post_comments"
ON public.task_comments
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.task_assignments
    WHERE task_assignments.task_id = task_comments.task_id
    AND task_assignments.student_id = auth.uid()
  )
);

-- Policy: Users can edit their own comments within 5 minutes
CREATE POLICY "users_edit_own_comments"
ON public.task_comments
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  AND created_at > NOW() - INTERVAL '5 minutes'
)
WITH CHECK (
  user_id = auth.uid()
);

-- Policy: Users can delete their own comments
CREATE POLICY "users_delete_own_comments"
ON public.task_comments
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
);

-- Policy: Teachers can delete any comment on their tasks
CREATE POLICY "teachers_delete_task_comments"
ON public.task_comments
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = task_comments.task_id
    AND tasks.teacher_id = auth.uid()
  )
);

-- ============================================================================
-- SECTION 6: RLS Policies for Storage Bucket
-- ============================================================================

-- Policy: Teachers can read all files in their task folders
CREATE POLICY "teachers_read_task_files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'task-attachments'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.tasks WHERE teacher_id = auth.uid()
  )
);

-- Policy: Students can read teacher materials in their assigned task folders
CREATE POLICY "students_read_teacher_materials"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'task-attachments'
  AND (storage.foldername(name))[2] = 'teacher'
  AND (storage.foldername(name))[1] IN (
    SELECT task_id::text FROM public.task_assignments WHERE student_id = auth.uid()
  )
);

-- Policy: Students can read their own submission files
CREATE POLICY "students_read_own_submissions"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'task-attachments'
  AND (storage.foldername(name))[2] = 'student'
  AND (storage.foldername(name))[3] = auth.uid()::text
);

-- Policy: Teachers can upload files to their task folders
CREATE POLICY "teachers_upload_task_files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'task-attachments'
  AND (storage.foldername(name))[2] = 'teacher'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.tasks WHERE teacher_id = auth.uid()
  )
);

-- Policy: Students can upload files to their submission folders
CREATE POLICY "students_upload_submission_files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'task-attachments'
  AND (storage.foldername(name))[2] = 'student'
  AND (storage.foldername(name))[3] = auth.uid()::text
  AND (storage.foldername(name))[1] IN (
    SELECT task_id::text FROM public.task_assignments WHERE student_id = auth.uid()
  )
);

-- Policy: Teachers can delete files from their task folders
CREATE POLICY "teachers_delete_task_files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'task-attachments'
  AND (storage.foldername(name))[2] = 'teacher'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.tasks WHERE teacher_id = auth.uid()
  )
);

-- Policy: Students can delete their own submission files
CREATE POLICY "students_delete_own_files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'task-attachments'
  AND (storage.foldername(name))[2] = 'student'
  AND (storage.foldername(name))[3] = auth.uid()::text
);

-- ============================================================================
-- SECTION 7: Create Helper Function for Comment Updates
-- ============================================================================

-- Function to automatically update updated_at timestamp on comment edits
CREATE OR REPLACE FUNCTION public.update_comment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function on comment updates
CREATE TRIGGER set_updated_at_on_comment_update
BEFORE UPDATE ON public.task_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_comment_timestamp();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Summary:
-- ✅ Storage bucket 'task-attachments' created
-- ✅ Table 'task_attachments' created with indexes
-- ✅ Table 'task_comments' created with indexes
-- ✅ RLS enabled on both tables
-- ✅ 6 RLS policies created for task_attachments
-- ✅ 7 RLS policies created for task_comments
-- ✅ 7 RLS policies created for storage.objects (bucket access)
-- ✅ Trigger function for automatic updated_at timestamp

-- Next steps:
-- 1. Apply this migration to your Supabase project
-- 2. Verify all tables and policies in Supabase Dashboard
-- 3. Test RLS policies with different user roles
-- 4. Proceed to Phase B: File Attachments frontend implementation
