-- ============================================================================
-- Migration: 004_gamification_functions.sql
-- Description: Create database functions for gamification system
-- Date: 2025-10-28
-- Phase: Phase 3B - Database Functions
-- ============================================================================

-- ============================================================================
-- FUNCTION 1: complete_task_and_award_coins
-- Description: Core business logic for task completion and coin calculation
-- ============================================================================

CREATE OR REPLACE FUNCTION complete_task_and_award_coins(
  p_task_assignment_id UUID,
  p_student_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task_id UUID;
  v_due_date TIMESTAMP WITH TIME ZONE;
  v_completed_at TIMESTAMP WITH TIME ZONE;
  v_is_on_time BOOLEAN;
  v_coins_awarded INTEGER;
  v_transaction_type VARCHAR(50);
  v_is_bonus BOOLEAN := FALSE;
  v_rank INTEGER;
  v_new_total_coins INTEGER;
BEGIN
  -- Validate that the caller is the student (security check)
  IF auth.uid() != p_student_id THEN
    RAISE EXCEPTION 'Unauthorized: You can only complete your own tasks';
  END IF;
  
  -- Set completion timestamp
  v_completed_at := NOW();
  
  -- Get task details and update assignment
  UPDATE task_assignments ta
  SET 
    is_completed = TRUE,
    completed_at = v_completed_at
  FROM tasks t
  WHERE 
    ta.id = p_task_assignment_id
    AND ta.student_id = p_student_id
    AND ta.is_completed = FALSE  -- Prevent duplicate completions
    AND ta.task_id = t.id
  RETURNING ta.task_id, t.due_date INTO v_task_id, v_due_date;
  
  -- Check if update was successful
  IF v_task_id IS NULL THEN
    RAISE EXCEPTION 'Task assignment not found or already completed';
  END IF;
  
  -- Check if submission is on time
  v_is_on_time := v_completed_at <= v_due_date;
  
  IF NOT v_is_on_time THEN
    -- Late submission: 0 coins
    v_coins_awarded := 0;
    v_transaction_type := 'late_penalty';
  ELSE
    -- On-time submission: at least 1 coin
    v_coins_awarded := 1;
    v_transaction_type := 'base_reward';
    
    -- Check if student is in top 3
    -- Count how many students completed this task on time before this student
    SELECT COUNT(*) INTO v_rank
    FROM task_assignments
    WHERE 
      task_id = v_task_id
      AND is_completed = TRUE
      AND completed_at <= v_due_date
      AND completed_at < v_completed_at;
    
    -- Rank is count + 1 (1st place = 0 before them, 2nd = 1 before them, etc.)
    v_rank := v_rank + 1;
    
    -- Award bonus if in top 3
    IF v_rank <= 3 THEN
      v_coins_awarded := 3;  -- 1 base + 2 bonus
      v_transaction_type := 'bonus_reward';
      v_is_bonus := TRUE;
    END IF;
  END IF;
  
  -- Record transaction (UNIQUE constraint prevents duplicates)
  INSERT INTO coin_transactions (
    student_id,
    task_id,
    coins_awarded,
    transaction_type,
    completed_at
  ) VALUES (
    p_student_id,
    v_task_id,
    v_coins_awarded,
    v_transaction_type,
    v_completed_at
  );
  
  -- Update total_coins in profile
  UPDATE profiles
  SET total_coins = total_coins + v_coins_awarded
  WHERE id = p_student_id
  RETURNING total_coins INTO v_new_total_coins;
  
  -- Return result as JSON
  RETURN json_build_object(
    'success', TRUE,
    'task_id', v_task_id,
    'completed_at', v_completed_at,
    'coins_awarded', v_coins_awarded,
    'is_bonus', v_is_bonus,
    'is_on_time', v_is_on_time,
    'total_coins', v_new_total_coins,
    'rank', v_rank
  );
  
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Task already completed';
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error completing task: %', SQLERRM;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION complete_task_and_award_coins IS 
'Completes a task assignment and awards coins based on timing and ranking. 
Returns JSON with coins awarded and updated total.';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION complete_task_and_award_coins TO authenticated;

-- ============================================================================
-- FUNCTION 2: get_leaderboard
-- Description: Returns top N students ranked by total coins
-- ============================================================================

CREATE OR REPLACE FUNCTION get_leaderboard(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  rank BIGINT,
  student_id UUID,
  student_name TEXT,
  total_coins INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    RANK() OVER (ORDER BY p.total_coins DESC, p.full_name ASC) as rank,
    p.id as student_id,
    p.full_name as student_name,
    p.total_coins
  FROM profiles p
  WHERE p.role = 'student'
  ORDER BY p.total_coins DESC, p.full_name ASC
  LIMIT p_limit;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION get_leaderboard IS 
'Returns top N students ranked by total coins. Ties are handled with RANK().';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_leaderboard TO authenticated;

-- ============================================================================
-- FUNCTION 3: get_student_rank
-- Description: Returns a specific student's rank and stats
-- ============================================================================

CREATE OR REPLACE FUNCTION get_student_rank(p_student_id UUID)
RETURNS TABLE (
  rank BIGINT,
  student_id UUID,
  student_name TEXT,
  total_coins INTEGER,
  total_students BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH ranked_students AS (
    SELECT 
      RANK() OVER (ORDER BY p.total_coins DESC, p.full_name ASC) as rank,
      p.id as student_id,
      p.full_name as student_name,
      p.total_coins
    FROM profiles p
    WHERE p.role = 'student'
  ),
  student_count AS (
    SELECT COUNT(*) as total
    FROM profiles
    WHERE role = 'student'
  )
  SELECT 
    rs.rank,
    rs.student_id,
    rs.student_name,
    rs.total_coins,
    sc.total as total_students
  FROM ranked_students rs
  CROSS JOIN student_count sc
  WHERE rs.student_id = p_student_id;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION get_student_rank IS 
'Returns a specific student''s rank, coins, and total number of students.';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_student_rank TO authenticated;

-- ============================================================================
-- FUNCTION 4: recalculate_total_coins (Admin/Maintenance)
-- Description: Recalculates total_coins from transaction history
-- ============================================================================

CREATE OR REPLACE FUNCTION recalculate_total_coins(p_student_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_calculated_total INTEGER;
BEGIN
  -- Calculate total from transactions
  SELECT COALESCE(SUM(coins_awarded), 0)
  INTO v_calculated_total
  FROM coin_transactions
  WHERE student_id = p_student_id;
  
  -- Update profile
  UPDATE profiles
  SET total_coins = v_calculated_total
  WHERE id = p_student_id;
  
  RETURN v_calculated_total;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION recalculate_total_coins IS 
'Recalculates total_coins from transaction history. For maintenance/debugging.';

-- Grant execute permission to authenticated users (teachers can use this)
GRANT EXECUTE ON FUNCTION recalculate_total_coins TO authenticated;

-- ============================================================================
-- FUNCTION 5: get_task_completion_stats
-- Description: Returns completion statistics for a specific task
-- ============================================================================

CREATE OR REPLACE FUNCTION get_task_completion_stats(p_task_id UUID)
RETURNS TABLE (
  task_id UUID,
  total_assigned BIGINT,
  completed_on_time BIGINT,
  completed_late BIGINT,
  not_completed BIGINT,
  top_3_students JSON
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_task_id UUID := p_task_id;
  v_due_date TIMESTAMP WITH TIME ZONE;
  v_top_3 JSON;
BEGIN
  -- Get task due date
  SELECT due_date INTO v_due_date
  FROM tasks
  WHERE id = v_task_id;
  
  IF v_due_date IS NULL THEN
    RAISE EXCEPTION 'Task not found';
  END IF;
  
  -- Get top 3 students who completed on time
  SELECT json_agg(
    json_build_object(
      'student_id', p.id,
      'student_name', p.full_name,
      'completed_at', ta.completed_at,
      'coins_awarded', ct.coins_awarded
    )
    ORDER BY ta.completed_at ASC
  )
  INTO v_top_3
  FROM task_assignments ta
  JOIN profiles p ON ta.student_id = p.id
  LEFT JOIN coin_transactions ct ON ct.student_id = ta.student_id AND ct.task_id = ta.task_id
  WHERE ta.task_id = v_task_id
    AND ta.is_completed = TRUE
    AND ta.completed_at <= v_due_date
  LIMIT 3;
  
  -- Return statistics
  RETURN QUERY
  SELECT 
    v_task_id,
    COUNT(*) as total_assigned,
    COUNT(*) FILTER (WHERE is_completed = TRUE AND completed_at <= v_due_date) as completed_on_time,
    COUNT(*) FILTER (WHERE is_completed = TRUE AND completed_at > v_due_date) as completed_late,
    COUNT(*) FILTER (WHERE is_completed = FALSE) as not_completed,
    v_top_3 as top_3_students
  FROM task_assignments
  WHERE task_id = v_task_id;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION get_task_completion_stats IS 
'Returns completion statistics for a task including top 3 students.';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_task_completion_stats TO authenticated;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$ 
BEGIN
  -- Verify all functions were created
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'complete_task_and_award_coins'
  ) THEN
    RAISE EXCEPTION 'Function complete_task_and_award_coins was not created';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'get_leaderboard'
  ) THEN
    RAISE EXCEPTION 'Function get_leaderboard was not created';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'get_student_rank'
  ) THEN
    RAISE EXCEPTION 'Function get_student_rank was not created';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'recalculate_total_coins'
  ) THEN
    RAISE EXCEPTION 'Function recalculate_total_coins was not created';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'get_task_completion_stats'
  ) THEN
    RAISE EXCEPTION 'Function get_task_completion_stats was not created';
  END IF;
  
  RAISE NOTICE 'Migration 004_gamification_functions completed successfully!';
  RAISE NOTICE 'Created 5 functions: complete_task_and_award_coins, get_leaderboard, get_student_rank, recalculate_total_coins, get_task_completion_stats';
END $$;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

-- Summary of functions created:
-- 1. complete_task_and_award_coins - Core task completion and coin award logic
-- 2. get_leaderboard - Returns top N students by coins
-- 3. get_student_rank - Returns specific student's rank and stats
-- 4. recalculate_total_coins - Maintenance function to recalculate totals
-- 5. get_task_completion_stats - Returns task completion statistics

-- Next steps:
-- - Run this migration in your Supabase project
-- - Test the functions with sample data
-- - Proceed to Phase 3C: TypeScript Types and Services
