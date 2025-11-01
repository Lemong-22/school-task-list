-- ============================================================================
-- Migration: 005_fix_coin_reward_logic.sql
-- Description: Fix coin award logic to use teacher's coin_reward value
-- Date: 2025-11-01
-- ============================================================================

-- Drop the old function
DROP FUNCTION IF EXISTS complete_task_and_award_coins(UUID, UUID);

-- Recreate with correct logic
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
  v_base_coin_reward INTEGER;
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
  RETURNING ta.task_id, t.due_date, t.coin_reward INTO v_task_id, v_due_date, v_base_coin_reward;
  
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
    -- On-time submission: use teacher's coin_reward value
    v_coins_awarded := v_base_coin_reward;
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
    
    -- Award bonus if in top 3 (double the coins!)
    IF v_rank <= 3 THEN
      v_coins_awarded := v_base_coin_reward * 2;  -- Double coins for top 3!
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
'Completes a task assignment and awards coins based on teacher''s coin_reward setting.
Top 3 students get DOUBLE coins. Late submissions get 0 coins.';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION complete_task_and_award_coins TO authenticated;

-- Verification
DO $$ 
BEGIN
  RAISE NOTICE 'Migration 005_fix_coin_reward_logic completed successfully!';
  RAISE NOTICE 'Coin award logic now uses teacher''s coin_reward value';
  RAISE NOTICE 'Top 3 students get DOUBLE coins, others get base amount';
END $$;
