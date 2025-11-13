-- ============================================================================
-- Migration: 029_add_advanced_analytics_rpc.sql
-- Description: Add Procrastination Meter and Work Distribution analytics
-- Date: 2025-11-13
-- Phase: Phase 8 - Advanced Analytics
-- ============================================================================

BEGIN;

/**************************************************************
 * 1. RPC for "Procrastination Chart" (Submission Timing)
 **************************************************************/
CREATE OR REPLACE FUNCTION get_submission_timing_stats(p_teacher_id UUID)
RETURNS TABLE (
  timing_bucket TEXT,
  submission_count BIGINT
)
AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN a.completed_at IS NULL THEN 'Pending'
      WHEN a.completed_at > t.due_date THEN 'Overdue'
      WHEN a.completed_at <= t.due_date AND a.completed_at >= (t.due_date - INTERVAL '1 day') THEN 'On Due Date'
      WHEN a.completed_at < (t.due_date - INTERVAL '1 day') AND a.completed_at >= (t.due_date - INTERVAL '3 days') THEN '1-3 Days Before'
      WHEN a.completed_at < (t.due_date - INTERVAL '3 days') THEN '4+ Days Before'
      ELSE 'Other'
    END AS timing_bucket,
    COUNT(a.id) AS submission_count
  FROM
    public.task_assignments a
  JOIN
    public.tasks t ON a.task_id = t.id
  WHERE
    t.teacher_id = p_teacher_id
  GROUP BY
    timing_bucket
  ORDER BY
    CASE timing_bucket
      WHEN '4+ Days Before' THEN 1
      WHEN '1-3 Days Before' THEN 2
      WHEN 'On Due Date' THEN 3
      WHEN 'Overdue' THEN 4
      WHEN 'Pending' THEN 5
      ELSE 6
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_submission_timing_stats IS
'Returns submission timing statistics for procrastination analysis (teachers only)';

/**************************************************************
 * 2. RPC for "Work Distribution Chart" (Task Count by Subject)
 **************************************************************/
CREATE OR REPLACE FUNCTION get_task_count_by_subject(p_teacher_id UUID)
RETURNS TABLE (
  subject TEXT,
  task_count BIGINT
)
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.subject,
    COUNT(t.id) AS task_count
  FROM
    public.tasks t
  WHERE
    t.teacher_id = p_teacher_id
  GROUP BY
    t.subject
  ORDER BY
    task_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_task_count_by_subject IS
'Returns task count per subject for work distribution analysis (teachers only)';

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_submission_timing_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_task_count_by_subject TO authenticated;

COMMIT;
