-- ============================================================================
-- Migration: 026_analytics_calendar_functions.sql
-- Description: Add analytics and calendar RPC functions for data visualization
-- Date: 2025-11-13
-- Phase: Phase 8 - Data Visualization
-- ============================================================================

BEGIN;

-- ============================================================================
-- SECTION 1: Performance Indexes (if not already exist)
-- ============================================================================

-- Ensure we have indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_task_assignments_task_id_completed 
ON task_assignments(task_id, is_completed);

CREATE INDEX IF NOT EXISTS idx_tasks_teacher_subject 
ON tasks(teacher_id, subject);

-- ============================================================================
-- SECTION 2: Analytics Functions (Teacher Only)
-- ============================================================================

-- Drop existing functions if they exist (to avoid conflicts)
-- Query pg_proc and drop each function by OID to avoid ambiguity
DO $$
DECLARE
  func_record RECORD;
BEGIN
  -- Drop all versions of get_task_completion_stats
  FOR func_record IN 
    SELECT oid::regprocedure AS func_signature
    FROM pg_proc
    WHERE proname = 'get_task_completion_stats'
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.func_signature || ' CASCADE';
    RAISE NOTICE 'Dropped function: %', func_record.func_signature;
  END LOOP;
  
  -- Drop all versions of get_student_engagement_stats
  FOR func_record IN 
    SELECT oid::regprocedure AS func_signature
    FROM pg_proc
    WHERE proname = 'get_student_engagement_stats'
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.func_signature || ' CASCADE';
    RAISE NOTICE 'Dropped function: %', func_record.func_signature;
  END LOOP;
  
  -- Drop all versions of get_subject_performance_stats
  FOR func_record IN 
    SELECT oid::regprocedure AS func_signature
    FROM pg_proc
    WHERE proname = 'get_subject_performance_stats'
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.func_signature || ' CASCADE';
    RAISE NOTICE 'Dropped function: %', func_record.func_signature;
  END LOOP;
  
  -- Drop all versions of get_all_tasks_for_calendar
  FOR func_record IN 
    SELECT oid::regprocedure AS func_signature
    FROM pg_proc
    WHERE proname = 'get_all_tasks_for_calendar'
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.func_signature || ' CASCADE';
    RAISE NOTICE 'Dropped function: %', func_record.func_signature;
  END LOOP;
  
  RAISE NOTICE 'Cleanup complete - ready to create new functions';
END $$;

-- ----------------------------------------------------------------------------
-- FUNCTION 1: get_task_completion_stats
-- Purpose: Calculate overall task completion statistics for pie chart
-- Returns: Completion rate breakdown (completed, pending, overdue)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_task_completion_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_teacher_id UUID;
  v_total_tasks INTEGER;
  v_completed_tasks INTEGER;
  v_pending_tasks INTEGER;
  v_overdue_tasks INTEGER;
  v_completion_percentage NUMERIC;
  v_result JSON;
BEGIN
  -- Get current user ID
  v_teacher_id := auth.uid();
  
  -- Security check: Only teachers can access analytics
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = v_teacher_id AND role = 'teacher'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only teachers can view analytics';
  END IF;
  
  -- Get total tasks created by this teacher
  SELECT COUNT(*)
  INTO v_total_tasks
  FROM tasks
  WHERE teacher_id = v_teacher_id;
  
  -- If no tasks, return empty stats
  IF v_total_tasks = 0 THEN
    RETURN json_build_object(
      'total_tasks', 0,
      'completed_tasks', 0,
      'pending_tasks', 0,
      'overdue_tasks', 0,
      'completion_percentage', 0
    );
  END IF;
  
  -- Count completed tasks (at least one student completed it)
  SELECT COUNT(DISTINCT t.id)
  INTO v_completed_tasks
  FROM tasks t
  INNER JOIN task_assignments ta ON ta.task_id = t.id
  WHERE t.teacher_id = v_teacher_id
    AND ta.is_completed = TRUE;
  
  -- Count overdue tasks (due date passed, not all students completed)
  SELECT COUNT(DISTINCT t.id)
  INTO v_overdue_tasks
  FROM tasks t
  WHERE t.teacher_id = v_teacher_id
    AND t.due_date < NOW()
    AND EXISTS (
      SELECT 1 FROM task_assignments ta
      WHERE ta.task_id = t.id AND ta.is_completed = FALSE
    );
  
  -- Pending tasks = total - completed - overdue
  v_pending_tasks := v_total_tasks - v_completed_tasks - v_overdue_tasks;
  
  -- Ensure no negative values
  IF v_pending_tasks < 0 THEN
    v_pending_tasks := 0;
  END IF;
  
  -- Calculate completion percentage
  v_completion_percentage := ROUND(
    (v_completed_tasks::NUMERIC / v_total_tasks::NUMERIC) * 100, 
    2
  );
  
  -- Build JSON result
  v_result := json_build_object(
    'total_tasks', v_total_tasks,
    'completed_tasks', v_completed_tasks,
    'pending_tasks', v_pending_tasks,
    'overdue_tasks', v_overdue_tasks,
    'completion_percentage', v_completion_percentage
  );
  
  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION get_task_completion_stats IS
'Returns task completion statistics for analytics pie chart (teachers only)';

-- ----------------------------------------------------------------------------
-- FUNCTION 2: get_student_engagement_stats
-- Purpose: Calculate engagement metrics per student for bar chart
-- Returns: Array of student engagement data
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_student_engagement_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_teacher_id UUID;
  v_result JSON;
BEGIN
  -- Get current user ID
  v_teacher_id := auth.uid();
  
  -- Security check: Only teachers can access analytics
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = v_teacher_id AND role = 'teacher'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only teachers can view analytics';
  END IF;
  
  -- Build student engagement data
  SELECT json_agg(
    json_build_object(
      'student_id', p.id,
      'student_name', p.full_name,
      'total_assigned', COALESCE(stats.total_assigned, 0),
      'total_completed', COALESCE(stats.total_completed, 0),
      'completion_rate', COALESCE(stats.completion_rate, 0),
      'on_time_rate', COALESCE(stats.on_time_rate, 0),
      'engagement_score', COALESCE(stats.engagement_score, 0)
    )
    ORDER BY stats.engagement_score DESC NULLS LAST, p.full_name
  )
  INTO v_result
  FROM profiles p
  LEFT JOIN (
    SELECT 
      ta.student_id,
      COUNT(*) as total_assigned,
      COUNT(*) FILTER (WHERE ta.is_completed = TRUE) as total_completed,
      ROUND(
        (COUNT(*) FILTER (WHERE ta.is_completed = TRUE)::NUMERIC / 
         NULLIF(COUNT(*)::NUMERIC, 0)) * 100, 
        2
      ) as completion_rate,
      ROUND(
        (COUNT(*) FILTER (WHERE ta.is_completed = TRUE AND ta.completed_at <= t.due_date)::NUMERIC / 
         NULLIF(COUNT(*) FILTER (WHERE ta.is_completed = TRUE)::NUMERIC, 0)) * 100,
        2
      ) as on_time_rate,
      -- Engagement score: weighted average of completion and timeliness
      ROUND(
        (
          (COUNT(*) FILTER (WHERE ta.is_completed = TRUE)::NUMERIC / 
           NULLIF(COUNT(*)::NUMERIC, 0)) * 0.6 +
          (COUNT(*) FILTER (WHERE ta.is_completed = TRUE AND ta.completed_at <= t.due_date)::NUMERIC / 
           NULLIF(COUNT(*) FILTER (WHERE ta.is_completed = TRUE)::NUMERIC, 0)) * 0.4
        ) * 100,
        2
      ) as engagement_score
    FROM task_assignments ta
    INNER JOIN tasks t ON t.id = ta.task_id
    WHERE t.teacher_id = v_teacher_id
    GROUP BY ta.student_id
  ) stats ON stats.student_id = p.id
  WHERE p.role = 'student'
    AND (stats.total_assigned > 0 OR stats.total_assigned IS NULL);
  
  RETURN COALESCE(v_result, '[]'::JSON);
END;
$$;

COMMENT ON FUNCTION get_student_engagement_stats IS
'Returns student engagement metrics for analytics bar chart (teachers only)';

-- ----------------------------------------------------------------------------
-- FUNCTION 3: get_subject_performance_stats
-- Purpose: Calculate performance metrics per subject for radar chart
-- Returns: Array of subject performance data
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_subject_performance_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_teacher_id UUID;
  v_result JSON;
BEGIN
  -- Get current user ID
  v_teacher_id := auth.uid();
  
  -- Security check: Only teachers can access analytics
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = v_teacher_id AND role = 'teacher'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only teachers can view analytics';
  END IF;
  
  -- Build subject performance data
  SELECT json_agg(
    json_build_object(
      'subject', subject,
      'total_tasks', total_tasks,
      'avg_completion_rate', avg_completion_rate,
      'avg_on_time_rate', avg_on_time_rate,
      'performance_score', performance_score
    )
    ORDER BY performance_score DESC
  )
  INTO v_result
  FROM (
    SELECT 
      t.subject,
      COUNT(DISTINCT t.id) as total_tasks,
      ROUND(
        AVG(
          (SELECT COUNT(*) FILTER (WHERE ta.is_completed = TRUE)::NUMERIC / 
           NULLIF(COUNT(*)::NUMERIC, 0)
           FROM task_assignments ta WHERE ta.task_id = t.id)
        ) * 100,
        2
      ) as avg_completion_rate,
      ROUND(
        AVG(
          (SELECT COUNT(*) FILTER (WHERE ta.is_completed = TRUE AND ta.completed_at <= t.due_date)::NUMERIC / 
           NULLIF(COUNT(*) FILTER (WHERE ta.is_completed = TRUE)::NUMERIC, 0)
           FROM task_assignments ta WHERE ta.task_id = t.id)
        ) * 100,
        2
      ) as avg_on_time_rate,
      -- Performance score: weighted average
      ROUND(
        (
          AVG(
            (SELECT COUNT(*) FILTER (WHERE ta.is_completed = TRUE)::NUMERIC / 
             NULLIF(COUNT(*)::NUMERIC, 0)
             FROM task_assignments ta WHERE ta.task_id = t.id)
          ) * 0.6 +
          AVG(
            (SELECT COUNT(*) FILTER (WHERE ta.is_completed = TRUE AND ta.completed_at <= t.due_date)::NUMERIC / 
             NULLIF(COUNT(*) FILTER (WHERE ta.is_completed = TRUE)::NUMERIC, 0)
             FROM task_assignments ta WHERE ta.task_id = t.id)
          ) * 0.4
        ) * 100,
        2
      ) as performance_score
    FROM tasks t
    WHERE t.teacher_id = v_teacher_id
    GROUP BY t.subject
    HAVING COUNT(DISTINCT t.id) > 0
  ) subject_stats;
  
  RETURN COALESCE(v_result, '[]'::JSON);
END;
$$;

COMMENT ON FUNCTION get_subject_performance_stats IS
'Returns subject performance metrics for analytics radar chart (teachers only)';

-- ============================================================================
-- SECTION 3: Calendar Function (All Users)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- FUNCTION 4: get_all_tasks_for_calendar
-- Purpose: Fetch all tasks formatted for react-big-calendar
-- Returns: Array of task events with start/end dates
-- ----------------------------------------------------------------------------

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
'Returns all tasks formatted for calendar display (role-based filtering)';

-- ============================================================================
-- SECTION 4: Grant Permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION get_task_completion_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_student_engagement_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_subject_performance_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_tasks_for_calendar() TO authenticated;

-- ============================================================================
-- SECTION 5: Verification
-- ============================================================================

-- Simple verification message (avoiding function name ambiguity issues)
DO $$ 
BEGIN
  RAISE NOTICE 'Analytics and calendar migration completed successfully';
  RAISE NOTICE 'Created functions: get_task_completion_stats, get_student_engagement_stats, get_subject_performance_stats, get_all_tasks_for_calendar';
END $$;

COMMIT;
