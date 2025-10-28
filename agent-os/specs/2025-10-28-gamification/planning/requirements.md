# Gamification System - Requirements Document

**Feature:** Core Gamification Implementation
**Date:** 2025-10-28
**Status:** Planning Phase
**Phase:** Phase 3 - Core Gamification Implementation

---

## 1. Overview

This document defines all functional and non-functional requirements for the Gamification System feature, which introduces a coin-based reward system to incentivize timely task completion and create healthy competition among students.

## 2. Business Context

The gamification system aims to:
- Motivate students to complete tasks on time
- Reward early completion with bonus coins
- Create a competitive yet educational environment through leaderboards
- Track student engagement and performance through coin transactions

## 3. Core Business Rules

### 3.1 Coin Award System

**Base Reward:**
- Students receive **1 Coin** for completing a task on time (`completed_at <= due_date`)

**Bonus Reward:**
- The **first 3 students** who complete a task on time receive an additional **+2 Coins** (total = 3 Coins)
- Bonus is only awarded for on-time submissions
- Ranking is determined by `completed_at` timestamp (earliest first)

**Penalty:**
- Students who complete a task late (`completed_at > due_date`) receive **0 Coins**
- Late completion is still recorded but does not contribute to total coins

### 3.2 Coin Storage Strategy

**Dual Storage Approach:**
1. **Transaction History:** `coin_transactions` table records every coin award/transaction
2. **Total Accumulation:** `total_coins` column in `profiles` table stores the running total

This approach provides:
- Complete audit trail of all coin transactions
- Fast leaderboard queries using the denormalized `total_coins` field
- Ability to recalculate totals if needed from transaction history

## 4. Functional Requirements

### FR-1: Task Completion Button
**Priority:** High  
**Description:** Students must be able to mark tasks as complete from their dashboard.

**Acceptance Criteria:**
- Each task in the student's task list displays a "Complete Task" button
- Button is only visible for tasks that are not yet completed
- Clicking the button marks the task as complete and records the completion timestamp
- The completion action triggers the coin calculation logic
- UI provides immediate feedback on coin award (e.g., "You earned 3 coins!")
- Completed tasks are visually distinguished from incomplete tasks

### FR-2: Coin Calculation Logic
**Priority:** High  
**Description:** System must automatically calculate and award coins based on completion time and ranking.

**Acceptance Criteria:**
- System checks if `completed_at <= due_date` (on-time check)
- For on-time completions:
  - Award base 1 coin
  - Check if student is in top 3 fastest completions for this task
  - If in top 3, award additional 2 coins (total = 3 coins)
- For late completions:
  - Award 0 coins
  - Still record the completion in `task_assignments`
- Create a record in `coin_transactions` table with:
  - Student ID
  - Task ID
  - Coins awarded
  - Completion timestamp
  - Whether it was a bonus award
- Update `total_coins` in student's profile atomically

### FR-3: Coin Transaction History
**Priority:** High  
**Description:** System must maintain a complete history of all coin transactions.

**Acceptance Criteria:**
- Every coin award creates a record in `coin_transactions` table
- Transaction records include:
  - Unique transaction ID
  - Student ID (foreign key to profiles)
  - Task ID (foreign key to tasks)
  - Coins awarded (integer)
  - Transaction type (e.g., "task_completion", "bonus")
  - Timestamp
- Transaction history is immutable (no updates or deletes)
- Students can view their transaction history (future enhancement)

### FR-4: Student Dashboard Coin Display
**Priority:** High  
**Description:** Students must see their total coins on their dashboard.

**Acceptance Criteria:**
- Student dashboard prominently displays total coins
- Display format: "Total Coins: [number] 🪙" or similar
- Coin count updates immediately after task completion
- Display is visible on all student dashboard views

### FR-5: Leaderboard Page
**Priority:** High  
**Description:** A public leaderboard displays top-performing students based on total coins.

**Acceptance Criteria:**
- New route `/leaderboard` is accessible to all authenticated users
- Leaderboard displays **Top 10 students** ranked by `total_coins`
- Each leaderboard entry shows:
  - Rank (1-10)
  - Student Name (from `profiles.full_name`)
  - Total Coins
- Leaderboard is sorted in descending order by total coins
- In case of tie, students with same coins share the same rank
- Leaderboard updates in real-time or on page refresh
- Empty state message if fewer than 10 students exist

### FR-6: Task Assignment Completion Tracking
**Priority:** High  
**Description:** System must track which students have completed which tasks.

**Acceptance Criteria:**
- `task_assignments` table includes:
  - `completed_at` timestamp (nullable)
  - `is_completed` boolean flag
- Completion status is updated when student clicks "Complete Task"
- Completion cannot be undone (one-way action)
- Teachers can view completion status for all students

## 5. Non-Functional Requirements

### NFR-1: Performance
- Coin calculation must complete within 500ms
- Leaderboard query must execute within 1 second
- Dashboard coin display must load within 2 seconds

### NFR-2: Data Integrity
- Coin transactions must be atomic (all-or-nothing)
- No duplicate coin awards for the same task completion
- `total_coins` must always match sum of `coin_transactions`

### NFR-3: Scalability
- System must handle 1000+ students without performance degradation
- Transaction table must support 100,000+ records efficiently

### NFR-4: Security
- Students can only complete their own assigned tasks
- Students cannot manipulate coin values directly
- All coin calculations happen server-side

### NFR-5: Usability
- Coin award feedback is clear and immediate
- Leaderboard is easy to understand at a glance
- UI is responsive on mobile and desktop devices

## 6. Database Schema Requirements

### 6.1 New Table: `coin_transactions`

```sql
CREATE TABLE coin_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  coins_awarded INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL, -- 'base_reward', 'bonus_reward', 'penalty'
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_coin_transactions_student ON coin_transactions(student_id);
CREATE INDEX idx_coin_transactions_task ON coin_transactions(task_id);
CREATE INDEX idx_coin_transactions_created ON coin_transactions(created_at DESC);
```

### 6.2 Modified Table: `profiles`

```sql
-- Add new column
ALTER TABLE profiles 
ADD COLUMN total_coins INTEGER DEFAULT 0 NOT NULL;

-- Index for leaderboard queries
CREATE INDEX idx_profiles_total_coins ON profiles(total_coins DESC);
```

### 6.3 Modified Table: `task_assignments`

```sql
-- Add completion tracking columns
ALTER TABLE task_assignments 
ADD COLUMN is_completed BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;

-- Index for completion queries
CREATE INDEX idx_task_assignments_completed ON task_assignments(task_id, completed_at) 
WHERE is_completed = TRUE;
```

## 7. API Endpoints Requirements

### 7.1 Complete Task
**Endpoint:** `POST /api/tasks/:taskId/complete`  
**Authentication:** Required (Student only)  
**Description:** Marks a task as complete and awards coins

**Request Body:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "task_id": "uuid",
    "completed_at": "2025-10-28T14:20:00Z",
    "coins_awarded": 3,
    "is_bonus": true,
    "total_coins": 45
  }
}
```

### 7.2 Get Leaderboard
**Endpoint:** `GET /api/leaderboard`  
**Authentication:** Required  
**Description:** Returns top 10 students by total coins

**Query Parameters:** None

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "student_id": "uuid",
      "student_name": "John Doe",
      "total_coins": 150
    },
    ...
  ]
}
```

### 7.3 Get Student Coin Summary
**Endpoint:** `GET /api/students/:studentId/coins`  
**Authentication:** Required  
**Description:** Returns coin summary for a specific student

**Response:**
```json
{
  "success": true,
  "data": {
    "student_id": "uuid",
    "total_coins": 45,
    "recent_transactions": [
      {
        "task_title": "Math Homework",
        "coins_awarded": 3,
        "completed_at": "2025-10-28T14:20:00Z",
        "is_bonus": true
      }
    ]
  }
}
```

## 8. User Stories

### US-1: Complete Task and Earn Coins
**As a** student  
**I want to** mark tasks as complete and earn coins  
**So that** I can be rewarded for completing my work on time

### US-2: View My Total Coins
**As a** student  
**I want to** see my total coins on my dashboard  
**So that** I can track my progress and achievements

### US-3: View Leaderboard
**As a** student or teacher  
**I want to** view the leaderboard of top students  
**So that** I can see who is performing well and stay motivated

### US-4: Earn Bonus for Fast Completion
**As a** student  
**I want to** earn bonus coins for being among the first 3 to complete a task  
**So that** I am incentivized to complete tasks quickly

### US-5: Understand Coin Awards
**As a** student  
**I want to** receive clear feedback on how many coins I earned  
**So that** I understand the reward system

## 9. Out of Scope (Future Enhancements)

The following features are NOT included in this phase:
- Coin redemption or spending system
- Detailed transaction history view for students
- Weekly/monthly leaderboard variants
- Achievement badges or milestones
- Coin penalties for other behaviors
- Teacher ability to manually award/deduct coins
- Notification system for bonus achievements

## 10. Dependencies

This feature depends on:
- **Phase 2: Task Management CRUD** must be completed first
  - `tasks` table must exist
  - `task_assignments` table must exist
  - Teachers can create and assign tasks
  - Students can view assigned tasks

## 11. Success Metrics

- 80%+ of students complete at least one task within first week
- Average task completion rate increases by 30%
- 90%+ of tasks are completed on time (vs late)
- Leaderboard page receives regular visits from students
- Student engagement increases measurably

## 12. Risks and Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Students game the system by completing easy tasks only | Medium | Medium | Future: Implement variable coin values per task difficulty |
| Race condition in bonus calculation | High | Low | Use database transactions and row locking |
| Leaderboard creates negative competition | Medium | Low | Monitor student feedback; consider adding collaborative elements |
| Performance issues with large transaction history | Medium | Low | Implement proper indexing and archival strategy |

## 13. Approval

- [ ] Product Manager Approval
- [ ] Technical Lead Approval
- [ ] Security Review
- [ ] Ready for Implementation Planning

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-28  
**Author:** AI Senior Software Architect
