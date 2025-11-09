-- ============================================================================
-- Migration: Add Task Filters & Search RPC Functions
-- Phase 6: Advanced QoL & Teacher Power-User Tools
-- Date: 2025-11-09
-- Description: Server-side filtering for tasks using PostgreSQL RPC functions
-- ============================================================================

BEGIN;

-- ============================================================================
-- SECTION 1: Performance Indexes
-- ============================================================================
-- These indexes optimize the filter queries for fast performance

-- Index for teacher_id lookups (teachers viewing their own tasks)
CREATE INDEX IF NOT EXISTS idx_tasks_teacher_id 
ON tasks(teacher_id);

-- Index for subject filtering
CREATE INDEX IF NOT EXISTS idx_tasks_subject 
ON tasks(subject);

-- Index for due_date comparisons (overdue check)
CREATE INDEX IF NOT EXISTS idx_tasks_due_date 
ON tasks(due_date);

-- Index for case-insensitive title search (improves ILIKE performance)
CREATE INDEX IF NOT EXISTS idx_tasks_title_lower 
ON tasks(LOWER(title));

-- Index for student assignments lookups
CREATE INDEX IF NOT EXISTS idx_task_assignments_student_id 
ON task_assignments(student_id);

-- Index for completion status filtering
CREATE INDEX IF NOT EXISTS idx_task_assignments_is_completed 
ON task_assignments(is_completed);

-- ============================================================================
-- SECTION 2: RPC Function - Filter Teacher Tasks
-- ============================================================================
-- Purpose: Fetch filtered tasks for teachers with server-side filtering
-- Parameters:
--   p_teacher_id: UUID - The teacher's user ID
--   p_subject: TEXT - Subject filter (NULL = all subjects)
--   p_status: TEXT - Status filter ('all', 'pending', 'overdue')
--   p_search: TEXT - Search term for title (NULL or empty = no search)
-- Returns: Table of tasks matching all filter criteria (AND logic)

CREATE OR REPLACE FUNCTION filter_teacher_tasks(
  p_teacher_id UUID,
  p_subject TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'all',
  p_search TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  subject TEXT,
  due_date TIMESTAMPTZ,
  coin_reward INTEGER,
  teacher_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.description,
    t.subject,
    t.due_date,
    t.coin_reward,
    t.teacher_id,
    t.created_at,
    t.updated_at
  FROM tasks t
  WHERE 
    -- Must match teacher ID (RLS enforcement)
    t.teacher_id = p_teacher_id
    
    -- Subject filter (optional)
    AND (p_subject IS NULL OR p_subject = '' OR t.subject = p_subject)
    
    -- Status filter
    AND (
      p_status = 'all'
      OR (p_status = 'pending' AND t.due_date >= NOW())
      OR (p_status = 'overdue' AND t.due_date < NOW())
      -- Note: 'completed' status for teachers would require checking task_assignments
      -- For now, teachers see all tasks regardless of student completion
    )
    
    -- Search filter (case-insensitive partial match on title)
    AND (
      p_search IS NULL 
      OR p_search = '' 
      OR t.title ILIKE '%' || p_search || '%'
    )
  ORDER BY t.created_at DESC;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION filter_teacher_tasks IS 
'Server-side filtering for teacher tasks. Supports subject, status, and search filters with AND logic.';

-- ============================================================================
-- SECTION 3: RPC Function - Filter Student Task Assignments
-- ============================================================================
-- Purpose: Fetch filtered task assignments for students with server-side filtering
-- Parameters:
--   p_student_id: UUID - The student's user ID
--   p_subject: TEXT - Subject filter (NULL = all subjects)
--   p_status: TEXT - Status filter ('all', 'pending', 'completed', 'overdue')
--   p_search: TEXT - Search term for title (NULL or empty = no search)
-- Returns: Table of task_assignments with nested task data as JSONB

CREATE OR REPLACE FUNCTION filter_student_task_assignments(
  p_student_id UUID,
  p_subject TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'all',
  p_search TEXT DEFAULT NULL
)
RETURNS TABLE (
  id INTEGER,
  task_id UUID,
  student_id UUID,
  is_completed BOOLEAN,
  completed_at TIMESTAMPTZ,
  task JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ta.id,
    ta.task_id,
    ta.student_id,
    ta.is_completed,
    ta.completed_at,
    jsonb_build_object(
      'id', t.id,
      'title', t.title,
      'description', t.description,
      'subject', t.subject,
      'due_date', t.due_date,
      'coin_reward', t.coin_reward,
      'teacher_id', t.teacher_id,
      'created_at', t.created_at,
      'updated_at', t.updated_at
    ) as task
  FROM task_assignments ta
  INNER JOIN tasks t ON ta.task_id = t.id
  WHERE 
    -- Must match student ID (RLS enforcement)
    ta.student_id = p_student_id
    
    -- Subject filter (applied to joined tasks table)
    AND (p_subject IS NULL OR p_subject = '' OR t.subject = p_subject)
    
    -- Status filter (considers both completion and due date)
    AND (
      p_status = 'all'
      OR (p_status = 'pending' AND ta.is_completed = FALSE AND t.due_date >= NOW())
      OR (p_status = 'completed' AND ta.is_completed = TRUE)
      OR (p_status = 'overdue' AND ta.is_completed = FALSE AND t.due_date < NOW())
    )
    
    -- Search filter (case-insensitive partial match on task title)
    AND (
      p_search IS NULL 
      OR p_search = '' 
      OR t.title ILIKE '%' || p_search || '%'
    )
  ORDER BY ta.id DESC;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION filter_student_task_assignments IS 
'Server-side filtering for student task assignments. Supports subject, status, and search filters with AND logic. Returns task data as JSONB.';

-- ============================================================================
-- SECTION 4: Grant Permissions
-- ============================================================================
-- Allow authenticated users to execute these RPC functions

GRANT EXECUTE ON FUNCTION filter_teacher_tasks TO authenticated;
GRANT EXECUTE ON FUNCTION filter_student_task_assignments TO authenticated;

-- ============================================================================
-- SECTION 5: Verification Queries (For Testing)
-- ============================================================================
-- These queries can be run manually to verify the migration worked correctly

-- Test 1: Verify indexes were created
-- SELECT indexname FROM pg_indexes WHERE tablename IN ('tasks', 'task_assignments') ORDER BY indexname;

-- Test 2: Test filter_teacher_tasks (replace with actual teacher UUID)
-- SELECT * FROM filter_teacher_tasks(
--   'your-teacher-uuid-here',
--   NULL,  -- All subjects
--   'all', -- All statuses
--   NULL   -- No search
-- );

-- Test 3: Test filter_student_task_assignments (replace with actual student UUID)
-- SELECT * FROM filter_student_task_assignments(
--   'your-student-uuid-here',
--   'Fisika',  -- Filter by Fisika subject
--   'pending', -- Only pending tasks
--   'homework' -- Search for "homework"
-- );

-- Test 4: Verify functions exist
-- SELECT proname, pg_get_function_arguments(oid) 
-- FROM pg_proc 
-- WHERE proname IN ('filter_teacher_tasks', 'filter_student_task_assignments');

COMMIT;

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Next Steps:
-- 1. Apply this migration: npx supabase db push
-- 2. Test both RPC functions in Supabase SQL Editor
-- 3. Proceed to Phase 2: React Hooks Refactoring
-- ============================================================================
