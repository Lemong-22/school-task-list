-- Test if comment delete is working
-- Replace COMMENT_ID with actual comment ID to test

-- Step 1: Check if comment exists
SELECT id, user_id, content, created_at 
FROM task_comments 
WHERE id = 'YOUR_COMMENT_ID_HERE';

-- Step 2: Check who can delete this comment
-- Run as the student who posted it:
SELECT 
  tc.id,
  tc.user_id,
  tc.content,
  auth.uid() as current_user,
  tc.user_id = auth.uid() as can_delete_own,
  EXISTS (
    SELECT 1 FROM tasks 
    WHERE tasks.id = tc.task_id 
    AND tasks.teacher_id = auth.uid()
  ) as can_delete_as_teacher
FROM task_comments tc
WHERE tc.id = 'YOUR_COMMENT_ID_HERE';

-- Step 3: Try to delete (this should work if you're the owner or the teacher)
-- DELETE FROM task_comments WHERE id = 'YOUR_COMMENT_ID_HERE';
