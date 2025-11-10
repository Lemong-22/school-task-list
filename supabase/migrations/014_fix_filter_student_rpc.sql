-- ============================================================================
-- Migration: Fix filter_student_task_assignments RPC Function
-- Date: 2025-11-09
-- Fix: Correct the return type for id column to UUID (actual database schema)
-- ============================================================================

BEGIN;

-- Drop the old function
DROP FUNCTION IF EXISTS filter_student_task_assignments;

-- Recreate with correct return type (UUID for id - matches actual schema)
CREATE OR REPLACE FUNCTION filter_student_task_assignments(
  p_student_id UUID,
  p_subject TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'all',
  p_search TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,             -- Changed to UUID to match actual database schema
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION filter_student_task_assignments TO authenticated;

COMMIT;

-- ============================================================================
-- Migration Complete
-- Apply with: Copy this to Supabase SQL Editor and run
-- ============================================================================
