# Gamification System - User Stories

**Feature:** Core Gamification Implementation
**Date:** 2025-10-28
**Status:** Planning Phase
**Phase:** Phase 3 - Core Gamification Implementation

---

## 1. Overview

This document contains detailed user stories with acceptance criteria for the gamification system. Each story follows the format:

**As a** [user role]  
**I want to** [action]  
**So that** [benefit]

---

## 2. Student User Stories

### US-1: Complete Task and Earn Coins

**As a** student  
**I want to** mark my assigned tasks as complete  
**So that** I can earn coins and track my progress

**Priority:** High  
**Story Points:** 5

**Acceptance Criteria:**
- [ ] I can see a "Complete Task" button on each incomplete task in my task list
- [ ] When I click the button, a confirmation dialog appears (optional, for UX)
- [ ] After confirmation, the task is marked as complete
- [ ] I immediately see how many coins I earned (1 or 3)
- [ ] If I earned bonus coins, I see a special indicator (e.g., "🎉 Bonus! +3 coins")
- [ ] The button disappears or changes to "Completed" after clicking
- [ ] I cannot complete the same task twice
- [ ] If I complete a task late, I see "Task completed (0 coins - late submission)"
- [ ] My total coin count updates immediately in the dashboard header

**Technical Notes:**
- Calls `complete_task_and_award_coins` RPC function
- Updates `task_assignments.is_completed` and `completed_at`
- Creates record in `coin_transactions`
- Updates `profiles.total_coins`

---

### US-2: View Total Coins on Dashboard

**As a** student  
**I want to** see my total coins prominently displayed on my dashboard  
**So that** I can quickly know my current coin balance

**Priority:** High  
**Story Points:** 2

**Acceptance Criteria:**
- [ ] My total coins are displayed in the dashboard header or top section
- [ ] Display format includes a coin icon (e.g., "🪙 45 Coins" or "Total Coins: 45")
- [ ] The coin count is visible on all pages of the student dashboard
- [ ] The count updates in real-time after completing a task
- [ ] If I have 0 coins, it shows "0 Coins" (not hidden)

**Design Notes:**
- Should be eye-catching but not distracting
- Consider using a badge or highlighted card
- Color scheme should match the app's theme

---

### US-3: Receive Feedback on Coin Awards

**As a** student  
**I want to** receive clear, immediate feedback when I earn coins  
**So that** I understand the reward system and feel motivated

**Priority:** Medium  
**Story Points:** 3

**Acceptance Criteria:**
- [ ] After completing a task, a modal or toast notification appears
- [ ] The notification shows:
  - Task title
  - Coins earned (with animation if possible)
  - Whether it was a bonus reward
  - My new total coin count
- [ ] For bonus rewards, special messaging appears (e.g., "🎉 Amazing! You're in the Top 3!")
- [ ] For on-time (non-bonus) completions: "✅ Great job! +1 coin"
- [ ] For late completions: "Task completed, but no coins awarded (late submission)"
- [ ] The notification auto-dismisses after 5 seconds or can be manually closed
- [ ] The notification is accessible and screen-reader friendly

**Design Notes:**
- Use celebratory colors/animations for bonus rewards
- Keep messaging positive even for late submissions
- Consider sound effects (optional, with mute option)

---

### US-4: Understand Bonus Coin System

**As a** student  
**I want to** understand how to earn bonus coins  
**So that** I can strategize and complete tasks early

**Priority:** Medium  
**Story Points:** 2

**Acceptance Criteria:**
- [ ] There is an info icon or help section explaining the coin system
- [ ] The explanation clearly states:
  - "Complete tasks on time: +1 coin"
  - "Be in the top 3 fastest: +3 coins total"
  - "Late submissions: 0 coins"
- [ ] The explanation is accessible from the student dashboard
- [ ] First-time users see a welcome modal explaining the system (optional)
- [ ] The explanation uses simple, clear language

**Content:**
```
🪙 How to Earn Coins

• Complete any task before the due date: +1 coin
• Be one of the first 3 students to complete a task: +3 coins (bonus!)
• Late submissions earn 0 coins, but still count as completed

Compete with your classmates and climb the leaderboard! 🏆
```

---

### US-5: View My Ranking

**As a** student  
**I want to** see where I rank compared to other students  
**So that** I can gauge my performance and stay motivated

**Priority:** Medium  
**Story Points:** 3

**Acceptance Criteria:**
- [ ] I can navigate to a "Leaderboard" page from my dashboard
- [ ] The leaderboard shows the top 10 students
- [ ] If I'm in the top 10, my entry is highlighted
- [ ] If I'm not in the top 10, I see my current rank below the leaderboard (e.g., "Your rank: #15")
- [ ] Each leaderboard entry shows: Rank, Student Name, Total Coins
- [ ] The leaderboard updates when I refresh the page
- [ ] Ties are handled gracefully (students with same coins share the same rank)

**Design Notes:**
- Use podium icons for top 3 (🥇🥈🥉)
- Highlight my own entry with a different background color
- Consider showing avatars or initials for students

---

### US-6: View Task Completion Status

**As a** student  
**I want to** easily distinguish between completed and incomplete tasks  
**So that** I know what I still need to do

**Priority:** High  
**Story Points:** 2

**Acceptance Criteria:**
- [ ] Completed tasks have a visual indicator (e.g., checkmark, strikethrough, different color)
- [ ] Completed tasks show the completion date/time
- [ ] Completed tasks show how many coins I earned
- [ ] I can filter to show only incomplete tasks or only completed tasks
- [ ] The task list is sorted with incomplete tasks first (by default)
- [ ] Late-completed tasks are marked differently (e.g., "Completed Late")

---

## 3. Teacher User Stories

### US-7: View Student Coin Statistics

**As a** teacher  
**I want to** see how many coins each student has earned  
**So that** I can monitor engagement and identify struggling students

**Priority:** Low (Future Enhancement)  
**Story Points:** 5

**Acceptance Criteria:**
- [ ] I can view a list of all students with their total coins
- [ ] I can see which students have earned the most/least coins
- [ ] I can view coin transaction history for individual students
- [ ] I can export coin data to CSV for analysis

**Note:** This is a future enhancement and not part of the initial MVP.

---

### US-8: View Task Completion Rates

**As a** teacher  
**I want to** see completion statistics for each task I create  
**So that** I can understand which tasks are engaging and which are challenging

**Priority:** Low (Future Enhancement)  
**Story Points:** 5

**Acceptance Criteria:**
- [ ] For each task, I see:
  - Total students assigned
  - Number completed on time
  - Number completed late
  - Number not yet completed
  - Average coins earned per student
- [ ] I can see who earned bonus coins for each task
- [ ] I can identify the top 3 students who completed each task first

**Note:** This is a future enhancement and not part of the initial MVP.

---

## 4. Both Roles (Student & Teacher)

### US-9: Access Leaderboard

**As a** student or teacher  
**I want to** view the leaderboard  
**So that** I can see top-performing students

**Priority:** High  
**Story Points:** 3

**Acceptance Criteria:**
- [ ] There is a "Leaderboard" link in the navigation menu
- [ ] The leaderboard page is accessible to both students and teachers
- [ ] The leaderboard loads within 2 seconds
- [ ] The leaderboard shows exactly 10 students (or fewer if less than 10 exist)
- [ ] Students are ranked by total coins (descending)
- [ ] In case of ties, students are sorted alphabetically by name
- [ ] The page has a title "🏆 Leaderboard" or similar
- [ ] The page is responsive on mobile and desktop

**Design Notes:**
- Use a card or table layout
- Consider adding subtle animations
- Show "No data yet" message if no students have coins

---

### US-10: Navigate to Leaderboard

**As a** user (student or teacher)  
**I want to** easily navigate to the leaderboard from any page  
**So that** I can quickly check rankings

**Priority:** Medium  
**Story Points:** 1

**Acceptance Criteria:**
- [ ] There is a "Leaderboard" link in the main navigation menu
- [ ] The link is visible on all authenticated pages
- [ ] Clicking the link navigates to `/leaderboard`
- [ ] The current page is highlighted in the navigation
- [ ] The navigation is responsive on mobile devices

---

## 5. Edge Cases and Error Handling

### US-11: Handle Concurrent Task Completions

**As a** student  
**I want to** the system to handle it correctly if multiple students complete a task at the same time  
**So that** bonus coins are awarded fairly

**Priority:** High  
**Story Points:** 3

**Acceptance Criteria:**
- [ ] If two students complete a task within milliseconds of each other, the system determines ranking by exact timestamp
- [ ] The database transaction ensures no race conditions
- [ ] Only the first 3 students (by timestamp) receive bonus coins
- [ ] The 4th student receives only 1 coin, even if they completed it very quickly

**Technical Notes:**
- Use database-level timestamp comparison
- Ensure atomic transactions
- Test with concurrent requests

---

### US-12: Handle Duplicate Completion Attempts

**As a** student  
**I want to** be prevented from completing the same task twice  
**So that** I don't accidentally earn duplicate coins

**Priority:** High  
**Story Points:** 2

**Acceptance Criteria:**
- [ ] If I try to complete an already-completed task, I see an error message
- [ ] The error message is clear: "You have already completed this task"
- [ ] No duplicate coin transactions are created
- [ ] The UI prevents me from clicking the complete button twice in quick succession

**Technical Notes:**
- UNIQUE constraint on `coin_transactions(student_id, task_id)`
- Check `is_completed` flag before allowing completion
- Disable button after first click

---

### US-13: Handle Late Task Completion

**As a** student  
**I want to** still be able to complete tasks after the due date  
**So that** I can finish my work even if I'm late

**Priority:** High  
**Story Points:** 2

**Acceptance Criteria:**
- [ ] I can complete tasks even after the due date has passed
- [ ] Late completions are clearly marked as "Late"
- [ ] I receive 0 coins for late completions
- [ ] The task still shows as completed in my task list
- [ ] I see a message: "Task completed, but no coins awarded (submitted after due date)"

---

### US-14: Handle Empty Leaderboard

**As a** user  
**I want to** see a helpful message if the leaderboard is empty  
**So that** I understand why no data is shown

**Priority:** Low  
**Story Points:** 1

**Acceptance Criteria:**
- [ ] If no students have earned coins yet, the leaderboard shows an empty state
- [ ] The empty state message is encouraging (e.g., "Be the first to earn coins! Complete tasks to appear on the leaderboard.")
- [ ] The empty state includes an illustration or icon
- [ ] The page still renders correctly (no errors)

---

## 6. Non-Functional Stories

### US-15: Fast Leaderboard Loading

**As a** user  
**I want to** the leaderboard to load quickly  
**So that** I don't have to wait to see rankings

**Priority:** Medium  
**Story Points:** 3

**Acceptance Criteria:**
- [ ] Leaderboard data loads in under 1 second (on average)
- [ ] Loading state is shown while data is being fetched
- [ ] If loading takes longer than 3 seconds, an error message appears
- [ ] The query is optimized with proper database indexes

**Technical Notes:**
- Use `idx_profiles_total_coins` index
- Limit query to 10 rows
- Consider caching for 30 seconds

---

### US-16: Accessible Coin Display

**As a** user with disabilities  
**I want to** the coin system to be accessible  
**So that** I can fully participate regardless of my abilities

**Priority:** Medium  
**Story Points:** 2

**Acceptance Criteria:**
- [ ] All coin-related UI elements have proper ARIA labels
- [ ] Screen readers can announce coin awards
- [ ] Keyboard navigation works for all coin-related actions
- [ ] Color is not the only indicator of success/failure
- [ ] Text has sufficient contrast ratio (WCAG AA)

---

## 7. Story Dependencies

```
US-1 (Complete Task) 
  ↓
US-2 (View Total Coins)
  ↓
US-3 (Receive Feedback)
  ↓
US-9 (Access Leaderboard)

US-4 (Understand Bonus) can be developed in parallel

US-5 (View My Ranking) depends on US-9

US-6 (Task Status) depends on US-1
```

---

## 8. Story Prioritization

### Must Have (MVP)
- US-1: Complete Task and Earn Coins
- US-2: View Total Coins on Dashboard
- US-6: View Task Completion Status
- US-9: Access Leaderboard
- US-11: Handle Concurrent Completions
- US-12: Handle Duplicate Attempts
- US-13: Handle Late Completion

### Should Have
- US-3: Receive Feedback on Coin Awards
- US-4: Understand Bonus System
- US-5: View My Ranking
- US-10: Navigate to Leaderboard
- US-15: Fast Leaderboard Loading

### Nice to Have
- US-14: Handle Empty Leaderboard
- US-16: Accessible Coin Display

### Future Enhancements
- US-7: View Student Coin Statistics (Teacher)
- US-8: View Task Completion Rates (Teacher)

---

## 9. Definition of Done

A user story is considered "Done" when:

- [ ] All acceptance criteria are met
- [ ] Code is written and follows project standards
- [ ] Unit tests are written and passing
- [ ] Integration tests are written and passing
- [ ] Code is reviewed and approved
- [ ] Feature is tested in staging environment
- [ ] Documentation is updated
- [ ] Feature is deployed to production
- [ ] Product Owner has accepted the story

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-28  
**Author:** AI Senior Software Architect
