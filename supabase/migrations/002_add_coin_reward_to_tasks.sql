-- ============================================================================
-- Migration: 002_add_coin_reward_to_tasks.sql
-- Description: Add coin_reward and subject columns to tasks table for gamification
-- Date: 2025-10-28
-- ============================================================================

-- Add coin_reward column to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS coin_reward INTEGER DEFAULT 0 NOT NULL 
CHECK (coin_reward >= 0);

-- Add subject column to tasks table (if it doesn't exist)
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS subject TEXT;

-- Create index for querying tasks by coin reward
CREATE INDEX IF NOT EXISTS idx_tasks_coin_reward 
ON tasks(coin_reward DESC);

-- Add comments for documentation
COMMENT ON COLUMN tasks.coin_reward IS 'Number of coins awarded when student completes this task';
COMMENT ON COLUMN tasks.subject IS 'Subject/category of the task (e.g., Math, Science)';

-- Verify the columns were added
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'coin_reward'
  ) THEN
    RAISE EXCEPTION 'coin_reward column was not added to tasks table';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'subject'
  ) THEN
    RAISE EXCEPTION 'subject column was not added to tasks table';
  END IF;
  
  RAISE NOTICE 'Migration 002_add_coin_reward_to_tasks completed successfully!';
  RAISE NOTICE 'Added coin_reward and subject columns to tasks table';
END $$;
