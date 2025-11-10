-- Migration: Fix Teacher Task Assignment Status
-- Updates filter_teacher_tasks to return accurate status based on student submissions

-- Drop the old function
DROP FUNCTION IF EXISTS filter_teacher_tasks(UUID, TEXT, TEXT, TEXT);

-- Recreate with status field
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
  updated_at TIMESTAMPTZ,
  status TEXT
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
    t.updated_at,
    -- Calculate status based on assignment completion
    CASE
      WHEN COUNT(ta.id) = 0 THEN 'Pending'::TEXT
      WHEN COUNT(ta.id) = COUNT(ta.id) FILTER (WHERE ta.is_completed = true) THEN 'Graded'::TEXT
      ELSE 'Pending'::TEXT
    END as status
  FROM tasks t
  LEFT JOIN task_assignments ta ON ta.task_id = t.id
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
    )
    
    -- Search filter (case-insensitive partial match on title)
    AND (
      p_search IS NULL 
      OR p_search = '' 
      OR t.title ILIKE '%' || p_search || '%'
    )
  GROUP BY t.id, t.title, t.description, t.subject, t.due_date, t.coin_reward, t.teacher_id, t.created_at, t.updated_at
  ORDER BY t.created_at DESC;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION filter_teacher_tasks IS 
'Server-side filtering for teacher tasks with accurate status based on student submissions. Returns Graded when all students have completed, otherwise Pending.';

-- Grant execute permission
GRANT EXECUTE ON FUNCTION filter_teacher_tasks TO authenticated;
