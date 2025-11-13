-- ============================================================================
-- Migration: 027_add_task_priority.sql
-- Description: Add priority level and estimated time to tasks
-- Date: 2025-11-13
-- Phase: Phase 8 - Task Enhancements
-- ============================================================================

BEGIN;

-- Add priority column to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' 
CHECK (priority IN ('low', 'medium', 'high'));

-- Add estimated minutes column
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT 30
CHECK (estimated_minutes >= 0 AND estimated_minutes <= 480);

-- Add index for priority filtering
CREATE INDEX IF NOT EXISTS idx_tasks_priority 
ON tasks(priority);

-- Update existing tasks to have default priority
UPDATE tasks 
SET priority = 'medium' 
WHERE priority IS NULL;

-- Update existing tasks to have default estimated time
UPDATE tasks
SET estimated_minutes = 30
WHERE estimated_minutes IS NULL;

COMMENT ON COLUMN tasks.priority IS 'Task priority level: low, medium, or high';
COMMENT ON COLUMN tasks.estimated_minutes IS 'Estimated time to complete task in minutes (0-480)';

-- Update the get_all_tasks_for_calendar function to include priority
DROP FUNCTION IF EXISTS get_all_tasks_for_calendar();

CREATE OR REPLACE FUNCTION get_all_tasks_for_calendar()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_user_role TEXT;
  v_result JSON;
BEGIN
  -- Get current user ID and role
  v_user_id := auth.uid();
  
  SELECT role INTO v_user_role
  FROM profiles
  WHERE id = v_user_id;
  
  IF v_user_role IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  -- Teachers: Get all tasks they created
  IF v_user_role = 'teacher' THEN
    SELECT json_agg(
      json_build_object(
        'id', t.id,
        'title', t.title,
        'description', t.description,
        'subject', t.subject,
        'start', t.created_at,
        'end', t.due_date,
        'due_date', t.due_date,
        'coin_reward', t.coin_reward,
        'teacher_id', t.teacher_id,
        'priority', t.priority,
        'estimated_minutes', t.estimated_minutes,
        'status', CASE
          WHEN t.due_date < NOW() THEN 'overdue'
          WHEN EXISTS (
            SELECT 1 FROM task_assignments ta 
            WHERE ta.task_id = t.id AND ta.is_completed = TRUE
          ) THEN 'completed'
          ELSE 'pending'
        END,
        'completion_count', (
          SELECT COUNT(*) FROM task_assignments ta
          WHERE ta.task_id = t.id AND ta.is_completed = TRUE
        ),
        'total_assigned', (
          SELECT COUNT(*) FROM task_assignments ta
          WHERE ta.task_id = t.id
        )
      )
      ORDER BY t.due_date DESC
    )
    INTO v_result
    FROM tasks t
    WHERE t.teacher_id = v_user_id;
    
  -- Students: Get all tasks assigned to them
  ELSE
    SELECT json_agg(
      json_build_object(
        'id', t.id,
        'title', t.title,
        'description', t.description,
        'subject', t.subject,
        'start', t.created_at,
        'end', t.due_date,
        'due_date', t.due_date,
        'coin_reward', t.coin_reward,
        'teacher_id', t.teacher_id,
        'priority', t.priority,
        'estimated_minutes', t.estimated_minutes,
        'status', CASE
          WHEN ta.is_completed = TRUE THEN 'completed'
          WHEN t.due_date < NOW() THEN 'overdue'
          ELSE 'pending'
        END,
        'is_completed', ta.is_completed,
        'completed_at', ta.completed_at,
        'assignment_id', ta.id
      )
      ORDER BY t.due_date DESC
    )
    INTO v_result
    FROM task_assignments ta
    INNER JOIN tasks t ON t.id = ta.task_id
    WHERE ta.student_id = v_user_id;
  END IF;
  
  RETURN COALESCE(v_result, '[]'::JSON);
END;
$$;

COMMENT ON FUNCTION get_all_tasks_for_calendar IS
'Returns all tasks formatted for calendar display with priority (role-based filtering)';

GRANT EXECUTE ON FUNCTION get_all_tasks_for_calendar() TO authenticated;

COMMIT;
