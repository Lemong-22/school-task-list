# Gamification System - Implementation Plan

**Feature:** Core Gamification Implementation
**Date:** 2025-10-28
**Status:** Planning Phase
**Phase:** Phase 3 - Core Gamification Implementation

---

## 1. Overview

This document outlines the step-by-step implementation plan for the gamification system. The implementation is divided into phases to ensure systematic development and testing.

---

## 2. Prerequisites

Before starting implementation, ensure:

- ✅ Phase 1 (User Authentication) is complete
- ✅ Phase 2 (Task Management CRUD) is complete
- ✅ The following tables exist:
  - `profiles` (with user data)
  - `tasks` (with task data)
  - `task_assignments` (linking students to tasks)
- ✅ Development environment is set up
- ✅ Supabase project is configured

---

## 3. Implementation Phases

### Phase 3A: Database Setup (Day 1)

**Estimated Time:** 4 hours

#### Tasks:

1. **Create Database Migration Script**
   - Create SQL file: `migrations/003_gamification_setup.sql`
   - Include all table modifications and new tables
   - Include indexes and constraints
   - Include RLS policies

2. **Modify `profiles` Table**
   ```sql
   ALTER TABLE profiles 
   ADD COLUMN total_coins INTEGER DEFAULT 0 NOT NULL CHECK (total_coins >= 0);
   
   CREATE INDEX idx_profiles_total_coins ON profiles(total_coins DESC);
   ```

3. **Modify `task_assignments` Table**
   ```sql
   ALTER TABLE task_assignments 
   ADD COLUMN is_completed BOOLEAN DEFAULT FALSE NOT NULL,
   ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
   
   ALTER TABLE task_assignments 
   ADD CONSTRAINT check_completed_at 
   CHECK (
     (is_completed = FALSE AND completed_at IS NULL) OR
     (is_completed = TRUE AND completed_at IS NOT NULL)
   );
   
   CREATE INDEX idx_task_assignments_completed 
   ON task_assignments(task_id, completed_at) 
   WHERE is_completed = TRUE;
   ```

4. **Create `coin_transactions` Table**
   ```sql
   CREATE TABLE coin_transactions (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
     task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
     coins_awarded INTEGER NOT NULL CHECK (coins_awarded >= 0),
     transaction_type VARCHAR(50) NOT NULL CHECK (
       transaction_type IN ('base_reward', 'bonus_reward', 'late_penalty')
     ),
     completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
     UNIQUE(student_id, task_id)
   );
   
   CREATE INDEX idx_coin_transactions_student ON coin_transactions(student_id);
   CREATE INDEX idx_coin_transactions_task ON coin_transactions(task_id);
   CREATE INDEX idx_coin_transactions_created ON coin_transactions(created_at DESC);
   ```

5. **Set Up RLS Policies**
   - Enable RLS on `coin_transactions`
   - Create policies for student and teacher access
   - Update policies on `task_assignments` for completion

6. **Test Database Changes**
   - Run migration in development environment
   - Verify all tables and indexes are created
   - Test RLS policies with test users
   - Verify constraints work correctly

**Deliverables:**
- ✅ Migration SQL file
- ✅ All tables modified/created
- ✅ Indexes created
- ✅ RLS policies active
- ✅ Database tested and verified

---

### Phase 3B: Database Functions (Day 1-2)

**Estimated Time:** 6 hours

#### Tasks:

1. **Create `complete_task_and_award_coins` Function**
   - Implement core business logic
   - Handle on-time vs late completion
   - Calculate bonus for top 3
   - Update `task_assignments`
   - Insert into `coin_transactions`
   - Update `profiles.total_coins`
   - Return JSON result
   - Add error handling

2. **Create `get_leaderboard` Function**
   - Query top 10 students by total_coins
   - Use RANK() for ties
   - Return structured data
   - Optimize for performance

3. **Create `recalculate_total_coins` Function** (Admin utility)
   - Recalculate from transaction history
   - Update profile
   - For maintenance/debugging

4. **Test Database Functions**
   - Test with various scenarios:
     - First student completion (bonus)
     - Second student completion (bonus)
     - Third student completion (bonus)
     - Fourth student completion (no bonus)
     - Late completion (0 coins)
     - Duplicate completion attempt (should fail)
   - Test leaderboard with sample data
   - Test edge cases (concurrent completions)

5. **Grant Permissions**
   - Grant EXECUTE on functions to authenticated users
   - Verify permissions work correctly

**Deliverables:**
- ✅ `complete_task_and_award_coins` function
- ✅ `get_leaderboard` function
- ✅ `recalculate_total_coins` function
- ✅ All functions tested
- ✅ Permissions configured

---

### Phase 3C: TypeScript Types and Services (Day 2)

**Estimated Time:** 3 hours

#### Tasks:

1. **Create Type Definitions**
   - Create `src/types/coin.ts`:
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

2. **Update Task Types**
   - Create/update `src/types/task.ts`:
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
       task?: Task;
     }
     ```

3. **Update Profile Types**
   - Update `src/types/auth.ts`:
     ```typescript
     export interface UserProfile {
       id: string;
       full_name: string;
       role: UserRole;
       total_coins: number;  // NEW
       created_at: string;
       updated_at: string;
     }
     ```

4. **Create Coin Service**
   - Create `src/services/coinService.ts`
   - Implement `getTransactionHistory()`
   - Implement `getTotalCoins()`

**Deliverables:**
- ✅ Type definitions created
- ✅ Coin service implemented
- ✅ Types exported and available

---

### Phase 3D: Custom Hooks (Day 2-3)

**Estimated Time:** 4 hours

#### Tasks:

1. **Create `useCoins` Hook**
   - Create `src/hooks/useCoins.ts`
   - Implement `completeTask()` function
   - Handle loading and error states
   - Call Supabase RPC function
   - Return result with proper typing

2. **Create `useLeaderboard` Hook**
   - Create `src/hooks/useLeaderboard.ts`
   - Fetch leaderboard data on mount
   - Implement `refetch()` function
   - Handle loading and error states
   - Accept `limit` parameter (default 10)

3. **Update `useTasks` Hook** (if exists)
   - Add support for completion status
   - Fetch tasks with `is_completed` and `completed_at`
   - Filter completed vs incomplete tasks

4. **Test Hooks**
   - Create test components to verify hooks work
   - Test error handling
   - Test loading states

**Deliverables:**
- ✅ `useCoins` hook
- ✅ `useLeaderboard` hook
- ✅ `useTasks` hook updated
- ✅ Hooks tested

---

### Phase 3E: UI Components (Day 3-4)

**Estimated Time:** 6 hours

#### Tasks:

1. **Create `CoinDisplay` Component**
   - Create `src/components/coins/CoinDisplay.tsx`
   - Display total coins with icon
   - Props: `totalCoins: number`
   - Styling: prominent but not distracting
   - Responsive design

2. **Create `CoinRewardModal` Component**
   - Create `src/components/coins/CoinRewardModal.tsx`
   - Show after task completion
   - Display coins earned, bonus status, new total
   - Auto-dismiss after 5 seconds
   - Manual close button
   - Celebratory animation for bonus

3. **Create `LeaderboardCard` Component**
   - Create `src/components/coins/LeaderboardCard.tsx`
   - Display single leaderboard entry
   - Props: `entry: LeaderboardEntry`, `isCurrentUser: boolean`
   - Show rank, name, coins
   - Highlight current user
   - Special styling for top 3 (🥇🥈🥉)

4. **Create/Update `TaskCard` Component**
   - Create `src/components/tasks/TaskCard.tsx`
   - Display task information
   - Show "Complete Task" button if not completed
   - Show completion status if completed
   - Show coins earned if completed
   - Handle click to complete task
   - Disable button while loading

5. **Create `TaskList` Component**
   - Create `src/components/tasks/TaskList.tsx`
   - Display list of tasks
   - Group by completed/incomplete
   - Show empty state if no tasks

**Deliverables:**
- ✅ `CoinDisplay` component
- ✅ `CoinRewardModal` component
- ✅ `LeaderboardCard` component
- ✅ `TaskCard` component
- ✅ `TaskList` component
- ✅ All components styled and responsive

---

### Phase 3F: Student Dashboard Updates (Day 4)

**Estimated Time:** 4 hours

#### Tasks:

1. **Update `StudentDashboard` Page**
   - Update `src/pages/StudentDashboard.tsx`
   - Add `CoinDisplay` to header
   - Fetch student's total coins
   - Display task list with completion buttons
   - Integrate `useCoins` hook
   - Handle task completion
   - Show `CoinRewardModal` after completion
   - Add link to leaderboard

2. **Implement Task Completion Flow**
   ```typescript
   const handleCompleteTask = async (assignmentId: string) => {
     const result = await completeTask(assignmentId, user.id);
     if (result) {
       setShowRewardModal(true);
       setRewardData(result);
       refetchTasks(); // Refresh task list
     }
   };
   ```

3. **Add Info Section**
   - Add "How to Earn Coins" info section
   - Explain the coin system
   - Link to leaderboard

4. **Test Student Dashboard**
   - Test task completion flow
   - Test coin display updates
   - Test modal appears correctly
   - Test error handling

**Deliverables:**
- ✅ Updated `StudentDashboard`
- ✅ Task completion working
- ✅ Coin display working
- ✅ Reward modal working
- ✅ Info section added

---

### Phase 3G: Leaderboard Page (Day 5)

**Estimated Time:** 4 hours

#### Tasks:

1. **Create `LeaderboardPage` Component**
   - Create `src/pages/LeaderboardPage.tsx`
   - Use `useLeaderboard` hook
   - Display top 10 students
   - Show loading state
   - Show error state
   - Show empty state
   - Highlight current user if in top 10
   - Show current user's rank if not in top 10

2. **Style Leaderboard**
   - Use card or table layout
   - Add podium icons for top 3
   - Responsive design
   - Add subtle animations
   - Match app theme

3. **Add Navigation**
   - Update navigation menu to include "Leaderboard" link
   - Add route in `App.tsx`:
     ```typescript
     <Route path="/leaderboard" element={
       <ProtectedRoute>
         <LeaderboardPage />
       </ProtectedRoute>
     } />
     ```

4. **Test Leaderboard**
   - Test with various data scenarios
   - Test with ties
   - Test with < 10 students
   - Test loading and error states
   - Test navigation

**Deliverables:**
- ✅ `LeaderboardPage` created
- ✅ Leaderboard styled
- ✅ Navigation updated
- ✅ Route added
- ✅ Page tested

---

### Phase 3H: Teacher Dashboard Updates (Day 5)

**Estimated Time:** 2 hours

#### Tasks:

1. **Update `TeacherDashboard` Page**
   - Update `src/pages/TeacherDashboard.tsx`
   - Add link to leaderboard
   - (Optional) Show quick stats on coin distribution

2. **Add Leaderboard Link**
   - Add prominent link to view leaderboard
   - Teachers can see student engagement

**Note:** Full teacher analytics (US-7, US-8) are future enhancements.

**Deliverables:**
- ✅ `TeacherDashboard` updated
- ✅ Leaderboard link added

---

### Phase 3I: Testing and Bug Fixes (Day 6)

**Estimated Time:** 6 hours

#### Tasks:

1. **Integration Testing**
   - Test complete user flow:
     - Student logs in
     - Views tasks
     - Completes task on time
     - Sees coin reward
     - Views updated total coins
     - Navigates to leaderboard
     - Sees their ranking
   - Test with multiple students
   - Test concurrent completions
   - Test late completions
   - Test duplicate attempts

2. **Edge Case Testing**
   - Test with 0 tasks
   - Test with 0 coins
   - Test with empty leaderboard
   - Test with exactly 10 students
   - Test with ties in leaderboard
   - Test with very long student names

3. **Performance Testing**
   - Measure leaderboard query time
   - Measure task completion time
   - Test with 100+ students (if possible)
   - Verify indexes are being used

4. **Cross-Browser Testing**
   - Test on Chrome, Firefox, Safari
   - Test on mobile devices
   - Verify responsive design

5. **Accessibility Testing**
   - Test with screen reader
   - Test keyboard navigation
   - Verify ARIA labels
   - Check color contrast

6. **Bug Fixes**
   - Fix any issues found during testing
   - Update documentation if needed

**Deliverables:**
- ✅ All tests passing
- ✅ Bugs fixed
- ✅ Performance verified
- ✅ Accessibility verified

---

### Phase 3J: Documentation and Deployment (Day 6-7)

**Estimated Time:** 4 hours

#### Tasks:

1. **Update README**
   - Document new gamification features
   - Update setup instructions
   - Add screenshots

2. **Create User Guide**
   - Write guide for students on how to earn coins
   - Write guide for teachers on viewing leaderboard

3. **Database Migration Documentation**
   - Document migration steps
   - Create rollback plan
   - Document any manual steps needed

4. **Deploy to Staging**
   - Run database migrations on staging
   - Deploy frontend to staging
   - Test in staging environment
   - Get stakeholder approval

5. **Deploy to Production**
   - Schedule deployment window
   - Run database migrations on production
   - Deploy frontend to production
   - Monitor for errors
   - Verify functionality

6. **Post-Deployment Verification**
   - Test production environment
   - Monitor error logs
   - Check performance metrics
   - Gather initial user feedback

**Deliverables:**
- ✅ Documentation updated
- ✅ Deployed to staging
- ✅ Deployed to production
- ✅ Production verified
- ✅ Monitoring in place

---

## 4. Timeline Summary

| Phase | Description | Duration | Days |
|-------|-------------|----------|------|
| 3A | Database Setup | 4 hours | Day 1 |
| 3B | Database Functions | 6 hours | Day 1-2 |
| 3C | Types and Services | 3 hours | Day 2 |
| 3D | Custom Hooks | 4 hours | Day 2-3 |
| 3E | UI Components | 6 hours | Day 3-4 |
| 3F | Student Dashboard | 4 hours | Day 4 |
| 3G | Leaderboard Page | 4 hours | Day 5 |
| 3H | Teacher Dashboard | 2 hours | Day 5 |
| 3I | Testing & Bugs | 6 hours | Day 6 |
| 3J | Documentation & Deploy | 4 hours | Day 6-7 |
| **Total** | | **43 hours** | **6-7 days** |

**Note:** Timeline assumes one developer working full-time. Adjust based on team size and availability.

---

## 5. Development Checklist

### Pre-Development
- [ ] Review all specification documents
- [ ] Set up development branch: `feature/gamification`
- [ ] Create Jira/GitHub issues for each phase
- [ ] Set up local development environment
- [ ] Verify Supabase access

### Phase 3A: Database Setup
- [ ] Create migration SQL file
- [ ] Modify `profiles` table
- [ ] Modify `task_assignments` table
- [ ] Create `coin_transactions` table
- [ ] Create indexes
- [ ] Set up RLS policies
- [ ] Test migration in dev environment
- [ ] Commit and push database changes

### Phase 3B: Database Functions
- [ ] Create `complete_task_and_award_coins` function
- [ ] Create `get_leaderboard` function
- [ ] Create `recalculate_total_coins` function
- [ ] Test all functions with sample data
- [ ] Grant permissions
- [ ] Document function usage
- [ ] Commit and push

### Phase 3C: Types and Services
- [ ] Create `coin.ts` types
- [ ] Update `task.ts` types
- [ ] Update `auth.ts` types
- [ ] Create `coinService.ts`
- [ ] Test service functions
- [ ] Commit and push

### Phase 3D: Custom Hooks
- [ ] Create `useCoins` hook
- [ ] Create `useLeaderboard` hook
- [ ] Update `useTasks` hook
- [ ] Test hooks
- [ ] Commit and push

### Phase 3E: UI Components
- [ ] Create `CoinDisplay` component
- [ ] Create `CoinRewardModal` component
- [ ] Create `LeaderboardCard` component
- [ ] Create `TaskCard` component
- [ ] Create `TaskList` component
- [ ] Style all components
- [ ] Test components in isolation
- [ ] Commit and push

### Phase 3F: Student Dashboard
- [ ] Update `StudentDashboard` page
- [ ] Integrate coin display
- [ ] Implement task completion flow
- [ ] Add reward modal
- [ ] Add info section
- [ ] Test complete flow
- [ ] Commit and push

### Phase 3G: Leaderboard Page
- [ ] Create `LeaderboardPage` component
- [ ] Style leaderboard
- [ ] Add navigation link
- [ ] Add route to App.tsx
- [ ] Test leaderboard
- [ ] Commit and push

### Phase 3H: Teacher Dashboard
- [ ] Update `TeacherDashboard` page
- [ ] Add leaderboard link
- [ ] Test teacher view
- [ ] Commit and push

### Phase 3I: Testing
- [ ] Run integration tests
- [ ] Test edge cases
- [ ] Performance testing
- [ ] Cross-browser testing
- [ ] Accessibility testing
- [ ] Fix all bugs
- [ ] Commit and push fixes

### Phase 3J: Documentation & Deployment
- [ ] Update README
- [ ] Create user guide
- [ ] Document migrations
- [ ] Deploy to staging
- [ ] Test staging
- [ ] Get approval
- [ ] Deploy to production
- [ ] Verify production
- [ ] Monitor metrics

### Post-Deployment
- [ ] Gather user feedback
- [ ] Monitor error logs
- [ ] Track success metrics
- [ ] Plan next iteration

---

## 6. Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| Database migration fails | Test thoroughly in dev/staging; have rollback plan |
| Race condition in bonus calculation | Use database transactions and row locking; test concurrency |
| Performance issues with large data | Implement proper indexes; test with large datasets |
| User confusion about coin system | Provide clear UI feedback and help documentation |
| Bugs in production | Thorough testing; staged rollout; monitoring |

---

## 7. Success Criteria

The implementation is considered successful when:

- ✅ All database tables and functions are created and working
- ✅ Students can complete tasks and earn coins
- ✅ Bonus coins are awarded correctly to top 3 students
- ✅ Late submissions receive 0 coins
- ✅ Total coins display correctly on student dashboard
- ✅ Leaderboard shows top 10 students accurately
- ✅ No duplicate coin awards possible
- ✅ All UI components are responsive and accessible
- ✅ Performance meets requirements (< 1s for leaderboard)
- ✅ No critical bugs in production
- ✅ User feedback is positive

---

## 8. Post-Implementation Tasks

After successful deployment:

1. **Monitor Metrics**
   - Track task completion rates
   - Monitor coin distribution
   - Measure leaderboard engagement

2. **Gather Feedback**
   - Survey students and teachers
   - Identify pain points
   - Collect feature requests

3. **Plan Enhancements**
   - Prioritize future features (US-7, US-8)
   - Consider additional gamification elements
   - Plan Phase 4 features

4. **Optimize Performance**
   - Analyze slow queries
   - Optimize if needed
   - Consider caching strategies

---

## 9. Rollback Plan

If critical issues are found in production:

1. **Immediate Actions**
   - Disable task completion feature (if needed)
   - Roll back frontend to previous version
   - Keep database changes (they're additive)

2. **Database Rollback** (only if absolutely necessary)
   ```sql
   -- Remove new columns (data will be lost!)
   ALTER TABLE profiles DROP COLUMN total_coins;
   ALTER TABLE task_assignments DROP COLUMN is_completed;
   ALTER TABLE task_assignments DROP COLUMN completed_at;
   DROP TABLE coin_transactions;
   ```

3. **Communication**
   - Notify users of the issue
   - Provide timeline for fix
   - Apologize for inconvenience

---

## 10. Team Assignments

**Backend Developer:**
- Phase 3A: Database Setup
- Phase 3B: Database Functions

**Frontend Developer:**
- Phase 3C: Types and Services
- Phase 3D: Custom Hooks
- Phase 3E: UI Components
- Phase 3F: Student Dashboard
- Phase 3G: Leaderboard Page
- Phase 3H: Teacher Dashboard

**QA Engineer:**
- Phase 3I: Testing and Bug Fixes

**DevOps:**
- Phase 3J: Deployment

**Product Manager:**
- Review and approval at each phase
- User acceptance testing
- Documentation review

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-28  
**Author:** AI Senior Software Architect
