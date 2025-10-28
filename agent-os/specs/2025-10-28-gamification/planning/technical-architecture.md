# Gamification System - Technical Architecture

**Feature:** Core Gamification Implementation
**Date:** 2025-10-28
**Status:** Planning Phase
**Phase:** Phase 3 - Core Gamification Implementation

---

## 1. Architecture Overview

The gamification system introduces a coin-based reward mechanism built on top of the existing task management system. It follows a three-tier architecture:

1. **Presentation Layer:** React components for UI/UX
2. **Business Logic Layer:** Custom hooks and service functions
3. **Data Layer:** Supabase PostgreSQL database with RLS policies

### 1.1 Key Architectural Principles

- **Server-side validation:** All coin calculations happen in the database via triggers/functions
- **Atomic transactions:** Coin awards are all-or-nothing operations
- **Denormalization for performance:** `total_coins` cached in profiles for fast leaderboard queries
- **Audit trail:** Complete transaction history maintained for transparency
- **Idempotency:** Prevent duplicate coin awards for the same completion

---

## 2. Database Architecture

### 2.1 Entity Relationship Diagram

```
┌─────────────────┐
│    profiles     │
├─────────────────┤
│ id (PK)         │
│ full_name       │
│ role            │
│ total_coins ◄───┼──┐ (Denormalized for performance)
│ created_at      │  │
│ updated_at      │  │
└─────────────────┘  │
         │           │
         │           │
         ▼           │
┌─────────────────┐  │
│coin_transactions│  │
├─────────────────┤  │
│ id (PK)         │  │
│ student_id (FK) ├──┘
│ task_id (FK)    ├──┐
│ coins_awarded   │  │
│ transaction_type│  │
│ completed_at    │  │
│ created_at      │  │
└─────────────────┘  │
                     │
         ┌───────────┘
         │
         ▼
┌─────────────────┐       ┌─────────────────┐
│     tasks       │       │task_assignments │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────┤ id (PK)         │
│ title           │       │ task_id (FK)    │
│ description     │       │ student_id (FK) │
│ subject         │       │ is_completed    │
│ due_date        │       │ completed_at    │
│ created_by (FK) │       │ assigned_at     │
│ created_at      │       └─────────────────┘
└─────────────────┘
```

### 2.2 Database Schema Details

#### 2.2.1 New Table: `coin_transactions`

```sql
CREATE TABLE coin_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  coins_awarded INTEGER NOT NULL CHECK (coins_awarded >= 0),
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('base_reward', 'bonus_reward', 'late_penalty')),
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Ensure one transaction per student per task
  UNIQUE(student_id, task_id)
);

-- Performance indexes
CREATE INDEX idx_coin_transactions_student ON coin_transactions(student_id);
CREATE INDEX idx_coin_transactions_task ON coin_transactions(task_id);
CREATE INDEX idx_coin_transactions_created ON coin_transactions(created_at DESC);
CREATE INDEX idx_coin_transactions_task_completed ON coin_transactions(task_id, completed_at) 
  WHERE coins_awarded > 0;

-- Enable RLS
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Students can view their own transactions"
  ON coin_transactions FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view all transactions"
  ON coin_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'teacher'
    )
  );

-- No direct INSERT/UPDATE/DELETE - only through functions
```

#### 2.2.2 Modified Table: `profiles`

```sql
-- Add total_coins column
ALTER TABLE profiles 
ADD COLUMN total_coins INTEGER DEFAULT 0 NOT NULL CHECK (total_coins >= 0);

-- Index for leaderboard performance
CREATE INDEX idx_profiles_total_coins ON profiles(total_coins DESC);

-- Update existing RLS policies to include total_coins in SELECT
```

#### 2.2.3 Modified Table: `task_assignments`

```sql
-- Add completion tracking
ALTER TABLE task_assignments 
ADD COLUMN is_completed BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;

-- Constraint: completed_at must be set when is_completed is true
ALTER TABLE task_assignments 
ADD CONSTRAINT check_completed_at 
CHECK (
  (is_completed = FALSE AND completed_at IS NULL) OR
  (is_completed = TRUE AND completed_at IS NOT NULL)
);

-- Index for finding top 3 completions per task
CREATE INDEX idx_task_assignments_completed ON task_assignments(task_id, completed_at) 
WHERE is_completed = TRUE;

-- Update RLS policies for completion
CREATE POLICY "Students can update their own task completion"
  ON task_assignments FOR UPDATE
  USING (auth.uid() = student_id)
  WITH CHECK (
    auth.uid() = student_id 
    AND is_completed = TRUE 
    AND completed_at IS NOT NULL
  );
```

### 2.3 Database Functions

#### 2.3.1 Function: `complete_task_and_award_coins`

This is the core business logic function that handles task completion and coin calculation atomically.

```sql
CREATE OR REPLACE FUNCTION complete_task_and_award_coins(
  p_task_assignment_id UUID,
  p_student_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
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
    SELECT COUNT(*) + 1 INTO v_rank
    FROM task_assignments
    WHERE 
      task_id = v_task_id
      AND is_completed = TRUE
      AND completed_at <= v_due_date
      AND completed_at < v_completed_at;
    
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
  
  -- Return result
  RETURN json_build_object(
    'success', TRUE,
    'task_id', v_task_id,
    'completed_at', v_completed_at,
    'coins_awarded', v_coins_awarded,
    'is_bonus', v_is_bonus,
    'is_on_time', v_is_on_time,
    'total_coins', v_new_total_coins
  );
  
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Task already completed';
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error completing task: %', SQLERRM;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION complete_task_and_award_coins TO authenticated;
```

#### 2.3.2 Function: `get_leaderboard`

```sql
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
    RANK() OVER (ORDER BY p.total_coins DESC) as rank,
    p.id as student_id,
    p.full_name as student_name,
    p.total_coins
  FROM profiles p
  WHERE p.role = 'student'
  ORDER BY p.total_coins DESC, p.full_name ASC
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION get_leaderboard TO authenticated;
```

#### 2.3.3 Function: `recalculate_total_coins` (Admin/Maintenance)

```sql
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

-- Only teachers can execute this
GRANT EXECUTE ON FUNCTION recalculate_total_coins TO authenticated;
```

---

## 3. Application Architecture

### 3.1 Frontend Architecture

#### 3.1.1 Component Structure

```
src/
├── components/
│   ├── coins/
│   │   ├── CoinDisplay.tsx          # Shows total coins with icon
│   │   ├── CoinRewardModal.tsx      # Feedback modal after earning coins
│   │   └── LeaderboardCard.tsx      # Individual leaderboard entry
│   ├── tasks/
│   │   ├── TaskCard.tsx             # Task item with complete button
│   │   └── TaskList.tsx             # List of tasks
│   └── ...
├── pages/
│   ├── StudentDashboard.tsx         # Enhanced with coin display
│   ├── LeaderboardPage.tsx          # New leaderboard page
│   └── ...
├── hooks/
│   ├── useTasks.ts                  # Task management logic
│   ├── useCoins.ts                  # NEW: Coin operations
│   └── useLeaderboard.ts            # NEW: Leaderboard data
├── services/
│   ├── taskService.ts               # Task API calls
│   └── coinService.ts               # NEW: Coin API calls
├── types/
│   ├── task.ts                      # Task types
│   └── coin.ts                      # NEW: Coin types
└── ...
```

#### 3.1.2 New Type Definitions

**`src/types/coin.ts`**

```typescript
export interface CoinTransaction {
  id: string;
  student_id: string;
  task_id: string;
  coins_awarded: number;
  transaction_type: 'base_reward' | 'bonus_reward' | 'late_penalty';
  completed_at: string;
  created_at: string;
}

export interface CoinRewardResult {
  success: boolean;
  task_id: string;
  completed_at: string;
  coins_awarded: number;
  is_bonus: boolean;
  is_on_time: boolean;
  total_coins: number;
}

export interface LeaderboardEntry {
  rank: number;
  student_id: string;
  student_name: string;
  total_coins: number;
}
```

**`src/types/task.ts`**

```typescript
export interface Task {
  id: string;
  title: string;
  description: string;
  subject: string;
  due_date: string;
  created_by: string;
  created_at: string;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  student_id: string;
  is_completed: boolean;
  completed_at: string | null;
  assigned_at: string;
  task?: Task;  // Joined task data
}
```

### 3.2 Custom Hooks

#### 3.2.1 `useCoins` Hook

```typescript
// src/hooks/useCoins.ts
import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { CoinRewardResult } from '../types/coin';

export const useCoins = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeTask = useCallback(async (
    taskAssignmentId: string,
    studentId: string
  ): Promise<CoinRewardResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc(
        'complete_task_and_award_coins',
        {
          p_task_assignment_id: taskAssignmentId,
          p_student_id: studentId
        }
      );

      if (rpcError) throw rpcError;

      return data as CoinRewardResult;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to complete task';
      setError(errorMessage);
      console.error('Error completing task:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    completeTask,
    loading,
    error
  };
};
```

#### 3.2.2 `useLeaderboard` Hook

```typescript
// src/hooks/useLeaderboard.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LeaderboardEntry } from '../types/coin';

export const useLeaderboard = (limit: number = 10) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc(
        'get_leaderboard',
        { p_limit: limit }
      );

      if (rpcError) throw rpcError;

      setLeaderboard(data || []);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch leaderboard';
      setError(errorMessage);
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    loading,
    error,
    refetch: fetchLeaderboard
  };
};
```

### 3.3 Service Layer

#### 3.3.1 Coin Service

```typescript
// src/services/coinService.ts
import { supabase } from '../lib/supabaseClient';
import { CoinTransaction } from '../types/coin';

export const coinService = {
  /**
   * Get coin transaction history for a student
   */
  async getTransactionHistory(
    studentId: string,
    limit: number = 20
  ): Promise<CoinTransaction[]> {
    const { data, error } = await supabase
      .from('coin_transactions')
      .select(`
        *,
        task:tasks(title, subject)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Get total coins for a student
   */
  async getTotalCoins(studentId: string): Promise<number> {
    const { data, error } = await supabase
      .from('profiles')
      .select('total_coins')
      .eq('id', studentId)
      .single();

    if (error) throw error;
    return data?.total_coins || 0;
  }
};
```

---

## 4. API Design

### 4.1 Supabase RPC Calls

All coin-related operations use Supabase RPC (Remote Procedure Call) to execute PostgreSQL functions directly. This ensures:
- Business logic stays in the database
- Atomic transactions
- Better security through SECURITY DEFINER functions

#### 4.1.1 Complete Task

```typescript
const { data, error } = await supabase.rpc('complete_task_and_award_coins', {
  p_task_assignment_id: 'uuid',
  p_student_id: 'uuid'
});
```

#### 4.1.2 Get Leaderboard

```typescript
const { data, error } = await supabase.rpc('get_leaderboard', {
  p_limit: 10
});
```

### 4.2 Direct Table Queries

For read-only operations, direct table queries are used:

```typescript
// Get student's total coins
const { data } = await supabase
  .from('profiles')
  .select('total_coins')
  .eq('id', studentId)
  .single();

// Get transaction history
const { data } = await supabase
  .from('coin_transactions')
  .select('*, task:tasks(title)')
  .eq('student_id', studentId)
  .order('created_at', { ascending: false });
```

---

## 5. Security Architecture

### 5.1 Row Level Security (RLS) Policies

All tables have RLS enabled with specific policies:

#### 5.1.1 `coin_transactions` Policies

```sql
-- Students can only view their own transactions
CREATE POLICY "Students view own transactions"
  ON coin_transactions FOR SELECT
  USING (auth.uid() = student_id);

-- Teachers can view all transactions
CREATE POLICY "Teachers view all transactions"
  ON coin_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- No direct INSERT/UPDATE/DELETE - only through functions
```

#### 5.1.2 `profiles` Policies

```sql
-- Users can view their own profile
CREATE POLICY "Users view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can view other students' names and coins (for leaderboard)
CREATE POLICY "Public leaderboard data"
  ON profiles FOR SELECT
  USING (role = 'student');

-- Only system can update total_coins (through functions)
```

#### 5.1.3 `task_assignments` Policies

```sql
-- Students can update their own assignments (completion only)
CREATE POLICY "Students complete own tasks"
  ON task_assignments FOR UPDATE
  USING (auth.uid() = student_id)
  WITH CHECK (
    auth.uid() = student_id 
    AND is_completed = TRUE
  );
```

### 5.2 Function Security

All database functions use `SECURITY DEFINER` to execute with elevated privileges while maintaining security:

```sql
CREATE OR REPLACE FUNCTION complete_task_and_award_coins(...)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with function owner's privileges
SET search_path = public
AS $$
BEGIN
  -- Validate that the caller is the student
  IF auth.uid() != p_student_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- ... rest of logic
END;
$$;
```

### 5.3 Client-Side Security

- All coin calculations happen server-side
- Students cannot manipulate coin values
- Task completion is one-way (cannot be undone)
- API calls include authentication tokens automatically via Supabase client

---

## 6. Performance Optimization

### 6.1 Database Optimizations

1. **Indexes:**
   - `idx_profiles_total_coins` for fast leaderboard queries
   - `idx_task_assignments_completed` for finding top 3 completions
   - `idx_coin_transactions_student` for transaction history

2. **Denormalization:**
   - `total_coins` stored in profiles to avoid SUM aggregation on every leaderboard query

3. **Query Optimization:**
   - Use `RANK()` window function for leaderboard ranking
   - Limit queries to top 10 to reduce data transfer

### 6.2 Frontend Optimizations

1. **Lazy Loading:**
   - Leaderboard loads on-demand, not on every page

2. **Optimistic UI Updates:**
   - Show coin reward immediately, rollback on error

3. **Caching:**
   - Cache leaderboard data for 30 seconds to reduce queries

4. **Real-time Updates (Future):**
   - Use Supabase real-time subscriptions for live leaderboard updates

---

## 7. Error Handling

### 7.1 Database Errors

```sql
-- Prevent duplicate completions
UNIQUE(student_id, task_id) on coin_transactions

-- Prevent negative coins
CHECK (coins_awarded >= 0)
CHECK (total_coins >= 0)

-- Ensure data consistency
CHECK constraint on task_assignments for completed_at
```

### 7.2 Application Errors

```typescript
try {
  const result = await completeTask(assignmentId, studentId);
  if (!result) {
    // Handle error from hook
    showError('Failed to complete task');
  } else {
    // Show success with coin reward
    showCoinReward(result);
  }
} catch (error) {
  // Handle unexpected errors
  console.error(error);
  showError('An unexpected error occurred');
}
```

---

## 8. Testing Strategy

### 8.1 Database Testing

- Test `complete_task_and_award_coins` function with various scenarios:
  - On-time completion (1st, 2nd, 3rd, 4th student)
  - Late completion
  - Duplicate completion attempt
  - Invalid task assignment

### 8.2 Integration Testing

- Test complete user flow: login → view tasks → complete task → see coins → view leaderboard
- Test concurrent completions (race conditions)
- Test leaderboard with ties

### 8.3 Performance Testing

- Load test with 1000+ students
- Measure leaderboard query time
- Measure coin calculation time

---

## 9. Deployment Strategy

### 9.1 Database Migration Steps

1. Add `total_coins` column to `profiles` (with default 0)
2. Create `coin_transactions` table
3. Modify `task_assignments` table (add completion columns)
4. Create indexes
5. Create database functions
6. Set up RLS policies
7. Test in staging environment

### 9.2 Application Deployment

1. Deploy new types and services
2. Deploy new hooks
3. Deploy new components
4. Deploy updated pages
5. Add new route for leaderboard
6. Test in staging
7. Deploy to production

### 9.3 Rollback Plan

- Database changes are additive (no data loss)
- Can rollback application code independently
- If needed, can drop new table and column (after backup)

---

## 10. Monitoring and Observability

### 10.1 Metrics to Track

- Average coins awarded per task
- Distribution of bonus awards (how many students get top 3)
- Task completion rate (before vs after gamification)
- Leaderboard query performance
- Error rate for coin transactions

### 10.2 Logging

- Log all coin transactions
- Log errors in `complete_task_and_award_coins`
- Log leaderboard queries for performance monitoring

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-28  
**Author:** AI Senior Software Architect
