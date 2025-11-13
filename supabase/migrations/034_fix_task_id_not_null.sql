-- ============================================================================
-- Migration: 034_fix_task_id_not_null.sql
-- Description: Remove NOT NULL constraint from coin_transactions.task_id
-- Date: 2025-11-13
-- Phase: Hotfix - Allow admin coin adjustments
-- ============================================================================

-- The issue: task_id is still NOT NULL, which prevents admin adjustments
-- Solution: Make task_id nullable

/**************************************************************
 * 1. Make task_id nullable in coin_transactions
 **************************************************************/

-- Drop the NOT NULL constraint
ALTER TABLE public.coin_transactions
ALTER COLUMN task_id DROP NOT NULL;

-- Verify the change
DO $$
BEGIN
  RAISE NOTICE '✅ task_id is now nullable in coin_transactions';
  RAISE NOTICE '   Admin coin adjustments can now be recorded with task_id = NULL';
END $$;


/**************************************************************
 * 2. Update the unique constraint to handle NULL task_id
 **************************************************************/

-- Drop the old unique constraint if it exists
ALTER TABLE public.coin_transactions
DROP CONSTRAINT IF EXISTS unique_student_task;

-- Create a unique index that only applies when task_id is NOT NULL
-- This allows multiple admin adjustments for the same student
DROP INDEX IF EXISTS unique_student_task_transaction;

CREATE UNIQUE INDEX unique_student_task_transaction
ON public.coin_transactions (student_id, task_id)
WHERE task_id IS NOT NULL;

COMMENT ON INDEX unique_student_task_transaction IS
'Ensures one transaction per student per task. NULL task_id (admin adjustments) excluded.';


/**************************************************************
 * 3. Verification Query
 **************************************************************/

DO $$
DECLARE
  v_is_nullable TEXT;
BEGIN
  -- Check if task_id is now nullable
  SELECT is_nullable INTO v_is_nullable
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'coin_transactions'
    AND column_name = 'task_id';
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ Migration 034 completed!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Verification:';
  RAISE NOTICE '   task_id is_nullable: %', v_is_nullable;
  RAISE NOTICE '';
  
  IF v_is_nullable = 'YES' THEN
    RAISE NOTICE '✅ SUCCESS: task_id can now be NULL';
    RAISE NOTICE '   Admin coin adjustments will now work!';
  ELSE
    RAISE NOTICE '❌ ERROR: task_id is still NOT NULL';
    RAISE NOTICE '   Please check column constraints';
  END IF;
END $$;
