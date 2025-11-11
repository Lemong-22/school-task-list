-- ============================================================================
-- Diagnostic Query: Why Can't I Post Comments?
-- ============================================================================

-- INSTRUCTIONS:
-- 1. Replace 'YOUR_USER_ID' with your actual user ID (from auth.users)
-- 2. Replace 'YOUR_TASK_ID' with a task ID you're trying to comment on
-- 3. Run this query to see what's blocking you

-- Step 1: Check your user profile
SELECT 
  id,
  full_name,
  role,
  email
FROM profiles
WHERE id = 'YOUR_USER_ID';

-- Step 2: Check the task you're trying to comment on
SELECT 
  id,
  title,
  teacher_id,
  subject
FROM tasks
WHERE id = 'YOUR_TASK_ID';

-- Step 3: If you're a STUDENT, check if you're assigned to this task
SELECT 
  id,
  task_id,
  student_id,
  is_completed
FROM task_assignments
WHERE task_id = 'YOUR_TASK_ID'
AND student_id = 'YOUR_USER_ID';

-- Step 4: Test if you can INSERT a comment (this will fail if RLS blocks it)
-- IMPORTANT: This is just a test. Delete this comment after running.
INSERT INTO task_comments (task_id, user_id, content)
VALUES ('YOUR_TASK_ID', 'YOUR_USER_ID', 'Test comment - please delete');

-- If the INSERT succeeds, the issue is in the frontend
-- If the INSERT fails, check the error message for RLS policy violations

-- Step 5: Check existing comments on this task
SELECT 
  id,
  user_id,
  content,
  created_at
FROM task_comments
WHERE task_id = 'YOUR_TASK_ID';

-- Step 6: Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'task_comments';
