-- ============================================================================
-- Test Script: Verify RLS Policies for Interactive Tasks
-- ============================================================================

-- Test 1: Check if task_comments table exists and RLS is enabled
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename IN ('task_comments', 'task_attachments');

-- Test 2: List all policies on task_comments
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'task_comments';

-- Test 3: List all policies on task_attachments
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'task_attachments';

-- Test 4: Check storage bucket exists
SELECT 
  id,
  name,
  public,
  file_size_limit
FROM storage.buckets
WHERE name = 'task-attachments';

-- Test 5: List storage policies
SELECT 
  name,
  bucket_id,
  definition
FROM storage.policies
WHERE bucket_id = 'task-attachments';

-- Instructions:
-- Run this in Supabase SQL Editor to verify all policies are created correctly
