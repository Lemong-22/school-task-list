-- ============================================================================
-- Migration: 003_gamification_setup.sql
-- Description: Add gamification system with coin rewards and leaderboard
-- Date: 2025-10-28
-- Phase: Phase 3A - Database Setup
-- ============================================================================

-- ============================================================================
-- SECTION 1: Modify Existing Tables
-- ============================================================================

-- Add total_coins column to profiles table
-- This stores the denormalized total for fast leaderboard queries
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_coins INTEGER DEFAULT 0 NOT NULL 
CHECK (total_coins >= 0);

-- Create index for leaderboard performance (ORDER BY total_coins DESC)
CREATE INDEX IF NOT EXISTS idx_profiles_total_coins 
ON profiles(total_coins DESC);

COMMENT ON COLUMN profiles.total_coins IS 'Denormalized total coins earned by student. Updated via triggers/functions.';

-- Add completion tracking columns to task_assignments table
DO $$
BEGIN
  -- Add is_completed column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'task_assignments' AND column_name = 'is_completed'
  ) THEN
    ALTER TABLE task_assignments 
    ADD COLUMN is_completed BOOLEAN DEFAULT FALSE NOT NULL;
  END IF;
  
  -- Add completed_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'task_assignments' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE task_assignments 
    ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Clean up any existing data that might violate the constraint
-- Ensure all rows have is_completed = FALSE and completed_at = NULL initially
UPDATE task_assignments 
SET is_completed = FALSE, completed_at = NULL;

-- Add constraint: completed_at must be set when is_completed is true
DO $$ 
BEGIN
  -- Drop constraint if it exists (for re-running migration)
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_completed_at' 
    AND conrelid = 'task_assignments'::regclass
  ) THEN
    ALTER TABLE task_assignments DROP CONSTRAINT check_completed_at;
  END IF;
  
  -- Add the constraint
  ALTER TABLE task_assignments 
  ADD CONSTRAINT check_completed_at 
  CHECK (
    (is_completed = FALSE AND completed_at IS NULL) OR
    (is_completed = TRUE AND completed_at IS NOT NULL)
  );
END $$;

-- Create index for finding top 3 completions per task
CREATE INDEX IF NOT EXISTS idx_task_assignments_completed 
ON task_assignments(task_id, completed_at) 
WHERE is_completed = TRUE;

COMMENT ON COLUMN task_assignments.is_completed IS 'Whether the student has completed this task';
COMMENT ON COLUMN task_assignments.completed_at IS 'Timestamp when the task was completed';

-- ============================================================================
-- SECTION 2: Create New Tables
-- ============================================================================

-- Create coin_transactions table to track all coin awards
CREATE TABLE IF NOT EXISTS coin_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  coins_awarded INTEGER NOT NULL CHECK (coins_awarded >= 0),
  transaction_type VARCHAR(50) NOT NULL CHECK (
    transaction_type IN ('base_reward', 'bonus_reward', 'late_penalty')
  ),
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Ensure one transaction per student per task (prevent duplicates)
  CONSTRAINT unique_student_task UNIQUE(student_id, task_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_coin_transactions_student 
ON coin_transactions(student_id);

CREATE INDEX IF NOT EXISTS idx_coin_transactions_task 
ON coin_transactions(task_id);

CREATE INDEX IF NOT EXISTS idx_coin_transactions_created 
ON coin_transactions(created_at DESC);

-- Index for finding top 3 completions (used in bonus calculation)
CREATE INDEX IF NOT EXISTS idx_coin_transactions_task_completed 
ON coin_transactions(task_id, completed_at) 
WHERE coins_awarded > 0;

-- Add comments for documentation
COMMENT ON TABLE coin_transactions IS 'Audit trail of all coin transactions for students';
COMMENT ON COLUMN coin_transactions.student_id IS 'Student who earned the coins';
COMMENT ON COLUMN coin_transactions.task_id IS 'Task that was completed';
COMMENT ON COLUMN coin_transactions.coins_awarded IS 'Number of coins awarded (0, 1, or 3)';
COMMENT ON COLUMN coin_transactions.transaction_type IS 'Type: base_reward (1 coin), bonus_reward (3 coins), or late_penalty (0 coins)';
COMMENT ON COLUMN coin_transactions.completed_at IS 'When the task was completed (used for ranking)';

-- ============================================================================
-- SECTION 3: Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on coin_transactions table
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own coin transactions
CREATE POLICY "Students can view their own coin transactions"
ON coin_transactions
FOR SELECT
USING (auth.uid() = student_id);

-- Policy: Teachers can view all coin transactions
CREATE POLICY "Teachers can view all coin transactions"
ON coin_transactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'teacher'
  )
);

-- Note: No INSERT/UPDATE/DELETE policies - these operations only happen through functions
-- This prevents direct manipulation of coin data

-- Update RLS policy on task_assignments to allow students to update completion status
-- First, check if the policy exists and drop it if needed
DO $$ 
BEGIN
  -- Drop existing policy if it exists
  DROP POLICY IF EXISTS "Students can update their own task completion" ON task_assignments;
END $$;

-- Create new policy for task completion
CREATE POLICY "Students can update their own task completion"
ON task_assignments
FOR UPDATE
USING (auth.uid() = student_id)
WITH CHECK (
  auth.uid() = student_id 
  AND is_completed = TRUE 
  AND completed_at IS NOT NULL
);

-- Update profiles RLS to allow viewing total_coins for leaderboard
-- Students can view other students' names and coins (for leaderboard)
DO $$ 
BEGIN
  -- Drop existing policy if it exists
  DROP POLICY IF EXISTS "Public leaderboard data" ON profiles;
END $$;

CREATE POLICY "Public leaderboard data"
ON profiles
FOR SELECT
USING (
  role = 'student' OR auth.uid() = id
);

-- ============================================================================
-- SECTION 4: Verification Queries
-- ============================================================================

-- Verify tables exist
DO $$ 
BEGIN
  -- Check if coin_transactions table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'coin_transactions') THEN
    RAISE EXCEPTION 'coin_transactions table was not created';
  END IF;
  
  -- Check if total_coins column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'total_coins'
  ) THEN
    RAISE EXCEPTION 'total_coins column was not added to profiles';
  END IF;
  
  -- Check if is_completed column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'task_assignments' AND column_name = 'is_completed'
  ) THEN
    RAISE EXCEPTION 'is_completed column was not added to task_assignments';
  END IF;
  
  RAISE NOTICE 'Migration 003_gamification_setup completed successfully!';
END $$;

-- ============================================================================
-- SECTION 5: Grant Permissions
-- ============================================================================

-- Grant SELECT permission on coin_transactions to authenticated users
GRANT SELECT ON coin_transactions TO authenticated;

-- Grant SELECT permission on profiles (for leaderboard)
GRANT SELECT ON profiles TO authenticated;

-- Grant UPDATE permission on task_assignments (for completion)
GRANT UPDATE ON task_assignments TO authenticated;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

-- Summary of changes:
-- 1. Added total_coins column to profiles table
-- 2. Added is_completed and completed_at columns to task_assignments table
-- 3. Created coin_transactions table with proper constraints
-- 4. Created all necessary indexes for performance
-- 5. Set up RLS policies for security
-- 6. Granted appropriate permissions

-- Next steps:
-- - Run this migration in your Supabase project
-- - Proceed to Phase 3B: Create database functions
