-- ============================================================================
-- Migration: 031_admin_user_management.sql
-- Description: Admin User Management - RLS policies and RPC functions
-- Date: 2025-11-13
-- Phase: Phase 9.2 - Admin User Management
-- ============================================================================

/**************************************************************
 * 1. Update RLS Policies for 'profiles'
 * Admins need to be able to SEE all users and UPDATE them.
 **************************************************************/

-- Ensure RLS is enabled on profiles (should already be enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admins can see EVERYONE
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.profiles;
CREATE POLICY "Admins can view all user profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy 2: Users can still see their own profile
-- (This might already exist, but we'll recreate it to be sure)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Policy 3: Users can see other student profiles (for leaderboard, etc.)
-- (Keep existing functionality)
DROP POLICY IF EXISTS "Users can view student profiles" ON public.profiles;
CREATE POLICY "Users can view student profiles"
ON public.profiles FOR SELECT
USING (role = 'student');

-- Policy 4: Admins can UPDATE user profiles (role and coins)
DROP POLICY IF EXISTS "Admins can update user profiles" ON public.profiles;
CREATE POLICY "Admins can update user profiles"
ON public.profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy 5: Users can update their own profile (for equipped items, etc.)
-- (Keep existing functionality)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


/**************************************************************
 * 2. New RPC Function: admin_adjust_user_coins
 * (Untuk "Edit User Gold" - Ini MENCATAT di 'coin_transactions')
 **************************************************************/
CREATE OR REPLACE FUNCTION admin_adjust_user_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT
)
RETURNS VOID
AS $$
DECLARE
  v_current_coins INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- 1. Pastikan yang memanggil adalah admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- 2. Get current balance
  SELECT total_coins INTO v_current_coins
  FROM public.profiles
  WHERE id = p_user_id;

  IF v_current_coins IS NULL THEN
    RAISE EXCEPTION 'User not found.';
  END IF;

  -- 3. Calculate new balance and ensure it doesn't go negative
  v_new_balance := v_current_coins + p_amount;
  IF v_new_balance < 0 THEN
    RAISE EXCEPTION 'Cannot reduce coins below zero. Current: %, Attempting to subtract: %', 
                    v_current_coins, ABS(p_amount);
  END IF;

  -- 4. Update total koin di profil
  UPDATE public.profiles
  SET total_coins = v_new_balance
  WHERE id = p_user_id;

  -- 5. Buat catatan audit di coin_transactions
  -- Note: Adjusting to match existing coin_transactions schema
  INSERT INTO public.coin_transactions (
    student_id, 
    task_id, 
    coins_awarded, 
    transaction_type, 
    completed_at
  )
  VALUES (
    p_user_id,
    NULL, -- No task associated with admin adjustment
    p_amount,
    'admin_adjustment', -- New transaction type
    NOW()
  );

  -- Log the reason in a comment (if you want to track it separately)
  -- For now, we'll just use the transaction_type to indicate admin action
  RAISE NOTICE 'Admin adjusted coins for user %: % (Reason: %)', p_user_id, p_amount, p_reason;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION admin_adjust_user_coins IS 
'Allows admins to adjust user coin balances (positive or negative). Records in coin_transactions.';


/**************************************************************
 * 3. New RPC Function: admin_change_user_role
 **************************************************************/
CREATE OR REPLACE FUNCTION admin_change_user_role(
  p_user_id UUID,
  p_new_role TEXT
)
RETURNS VOID
AS $$
BEGIN
  -- 1. Pastikan yang memanggil adalah admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- 2. Validate role
  IF p_new_role NOT IN ('student', 'teacher', 'admin') THEN
    RAISE EXCEPTION 'Invalid role. Must be: student, teacher, or admin';
  END IF;

  -- 3. Check user exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User not found.';
  END IF;

  -- 4. Update role
  UPDATE public.profiles
  SET role = p_new_role
  WHERE id = p_user_id;

  RAISE NOTICE 'Admin changed role for user % to %', p_user_id, p_new_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION admin_change_user_role IS 
'Allows admins to change user roles (student, teacher, admin).';


/**************************************************************
 * 4. Update coin_transactions constraint to allow admin adjustments
 **************************************************************/

-- Drop the old constraint that requires task_id
ALTER TABLE public.coin_transactions
DROP CONSTRAINT IF EXISTS coin_transactions_task_id_fkey;

-- Add it back but allow NULL for admin adjustments
ALTER TABLE public.coin_transactions
ADD CONSTRAINT coin_transactions_task_id_fkey
FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;

-- Update transaction_type constraint to include admin_adjustment
ALTER TABLE public.coin_transactions
DROP CONSTRAINT IF EXISTS coin_transactions_transaction_type_check;

ALTER TABLE public.coin_transactions
ADD CONSTRAINT coin_transactions_transaction_type_check
CHECK (transaction_type IN ('base_reward', 'bonus_reward', 'late_penalty', 'admin_adjustment'));

-- Update the unique constraint to allow multiple admin adjustments
ALTER TABLE public.coin_transactions
DROP CONSTRAINT IF EXISTS unique_student_task;

-- Create new unique constraint that only applies to task-based transactions
CREATE UNIQUE INDEX IF NOT EXISTS unique_student_task_transaction
ON public.coin_transactions (student_id, task_id)
WHERE task_id IS NOT NULL;

COMMENT ON CONSTRAINT coin_transactions_transaction_type_check ON public.coin_transactions IS
'Transaction types: base_reward, bonus_reward, late_penalty, admin_adjustment';


/**************************************************************
 * 5. Grant Permissions
 **************************************************************/

-- Grant execute permissions on new functions
GRANT EXECUTE ON FUNCTION admin_adjust_user_coins(UUID, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_change_user_role(UUID, TEXT) TO authenticated;


/**************************************************************
 * 6. Verification & Success Messages
 **************************************************************/

DO $$
DECLARE
  v_admin_count INTEGER;
BEGIN
  -- Count current admins
  SELECT COUNT(*) INTO v_admin_count
  FROM public.profiles
  WHERE role = 'admin';
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ Migration 031_admin_user_management.sql completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Current Statistics:';
  RAISE NOTICE '   - Admin users: %', v_admin_count;
  RAISE NOTICE '';
  RAISE NOTICE '🔧 New Capabilities:';
  RAISE NOTICE '   ✓ Admins can view all user profiles';
  RAISE NOTICE '   ✓ Admins can change user roles';
  RAISE NOTICE '   ✓ Admins can adjust user coin balances';
  RAISE NOTICE '   ✓ All admin actions are logged';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Available RPC Functions:';
  RAISE NOTICE '   - admin_change_user_role(user_id, new_role)';
  RAISE NOTICE '   - admin_adjust_user_coins(user_id, amount, reason)';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Next: Build the frontend at /admin/users';
END $$;
