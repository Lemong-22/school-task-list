-- Migration: Get Total Coins Awarded by Teacher
-- Creates RPC function to calculate total coins awarded by a specific teacher

-- Drop function if exists
DROP FUNCTION IF EXISTS get_total_coins_awarded(uuid);

-- Create function to get total coins awarded by a teacher
CREATE OR REPLACE FUNCTION get_total_coins_awarded(p_teacher_id uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_coins bigint;
BEGIN
  -- Sum all points_earned from coin_transactions for tasks created by this teacher
  SELECT COALESCE(SUM(ct.points_earned), 0)
  INTO total_coins
  FROM coin_transactions ct
  INNER JOIN tasks t ON ct.task_id = t.id
  WHERE t.teacher_id = p_teacher_id;
  
  RETURN total_coins;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_total_coins_awarded(uuid) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_total_coins_awarded(uuid) IS 'Returns the total coins awarded by a specific teacher';
