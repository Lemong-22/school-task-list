-- ============================================================================
-- Migration: 033_fix_admin_emails_and_coins.sql
-- Description: Fix email fetching and coin adjustment issues
-- Date: 2025-11-13
-- Phase: Hotfix - Admin User Management
-- ============================================================================

/**************************************************************
 * 1. Create RPC to get users WITH emails from auth.users
 **************************************************************/

-- Drop old function
DROP FUNCTION IF EXISTS public.admin_get_all_users();

-- Create new function that returns emails too
CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  role TEXT,
  total_coins INTEGER,
  created_at TIMESTAMPTZ,
  active_title_id UUID,
  equipped_badges JSONB,
  email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Return all users with emails from auth.users
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.role,
    p.total_coins,
    p.created_at,
    p.active_title_id,
    p.equipped_badges,
    COALESCE(au.email, 'N/A') as email
  FROM public.profiles p
  LEFT JOIN auth.users au ON p.id = au.id
  ORDER BY p.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_all_users() TO authenticated;

COMMENT ON FUNCTION public.admin_get_all_users() IS
'Returns all users with emails for admin dashboard. Requires admin role.';


/**************************************************************
 * 2. Fix admin_adjust_user_coins to match coin_transactions schema
 **************************************************************/

DROP FUNCTION IF EXISTS public.admin_adjust_user_coins(UUID, INTEGER, TEXT);

CREATE OR REPLACE FUNCTION public.admin_adjust_user_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_coins INTEGER;
  v_new_balance INTEGER;
  v_user_name TEXT;
BEGIN
  -- 1. Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- 2. Get current balance and user name
  SELECT total_coins, full_name INTO v_current_coins, v_user_name
  FROM public.profiles
  WHERE id = p_user_id;

  IF v_current_coins IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- 3. Calculate new balance and ensure it doesn't go negative
  v_new_balance := v_current_coins + p_amount;
  
  IF v_new_balance < 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format('Cannot reduce coins below zero. Current balance: %s, attempting to subtract: %s', 
                     v_current_coins, ABS(p_amount))
    );
  END IF;

  -- 4. Update total coins in profile
  UPDATE public.profiles
  SET total_coins = v_new_balance
  WHERE id = p_user_id;

  -- 5. Record transaction in coin_transactions
  -- Note: coin_transactions has these columns:
  -- id, student_id, task_id, coins_awarded, transaction_type, completed_at, created_at
  INSERT INTO public.coin_transactions (
    student_id,
    task_id,
    coins_awarded,
    transaction_type,
    completed_at
  )
  VALUES (
    p_user_id,
    NULL, -- No task for admin adjustments
    p_amount, -- Can be positive or negative
    'admin_adjustment',
    NOW()
  );

  -- 6. Return success
  RETURN jsonb_build_object(
    'success', true,
    'user_name', v_user_name,
    'old_balance', v_current_coins,
    'adjustment', p_amount,
    'new_balance', v_new_balance,
    'reason', p_reason
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_adjust_user_coins(UUID, INTEGER, TEXT) TO authenticated;

COMMENT ON FUNCTION public.admin_adjust_user_coins IS
'Allows admins to adjust user coin balances. Returns success/error. Logs to coin_transactions.';


/**************************************************************
 * 3. Ensure coin_transactions allows NULL task_id
 **************************************************************/

-- Make sure task_id can be NULL for admin adjustments
ALTER TABLE public.coin_transactions
ALTER COLUMN task_id DROP NOT NULL;

-- Update constraint to allow admin_adjustment type
DO $$
BEGIN
  -- Drop old constraint if exists
  ALTER TABLE public.coin_transactions
  DROP CONSTRAINT IF EXISTS coin_transactions_transaction_type_check;
  
  -- Add new constraint with admin_adjustment
  ALTER TABLE public.coin_transactions
  ADD CONSTRAINT coin_transactions_transaction_type_check
  CHECK (transaction_type IN ('base_reward', 'bonus_reward', 'late_penalty', 'admin_adjustment'));
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Constraint already exists, ignore
END $$;

-- Update coins_awarded to allow negative values for admin adjustments
ALTER TABLE public.coin_transactions
DROP CONSTRAINT IF EXISTS coin_transactions_coins_awarded_check;

-- Don't add a constraint - allow any integer value (positive or negative)


/**************************************************************
 * 4. Verification
 **************************************************************/

DO $$
DECLARE
  v_admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_admin_count
  FROM public.profiles
  WHERE role = 'admin';
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ Migration 033 completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Fixed Issues:';
  RAISE NOTICE '   ✓ Admins can now see user emails';
  RAISE NOTICE '   ✓ Coin adjustment function fixed';
  RAISE NOTICE '   ✓ coin_transactions allows NULL task_id';
  RAISE NOTICE '   ✓ Negative coin adjustments supported';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Current admin users: %', v_admin_count;
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Test Commands:';
  RAISE NOTICE '   SELECT * FROM admin_get_all_users();';
  RAISE NOTICE '   SELECT admin_adjust_user_coins(''<user_id>'', 100, ''Test bonus'');';
  RAISE NOTICE '   SELECT admin_adjust_user_coins(''<user_id>'', -50, ''Test deduction'');';
END $$;
