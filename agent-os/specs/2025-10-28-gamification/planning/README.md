# Gamification System - Specification Overview

**Feature:** Core Gamification Implementation  
**Date:** 2025-10-28  
**Status:** Planning Phase Complete ✅  
**Phase:** Phase 3 - Core Gamification Implementation

---

## 📋 Quick Summary

This specification defines a **coin-based gamification system** that rewards students for completing tasks on time. The system includes:

- **Coin Rewards:** Students earn 1 coin for on-time completion, 3 coins for being in the top 3 fastest
- **Leaderboard:** Public ranking of top 10 students by total coins
- **Transaction History:** Complete audit trail of all coin awards
- **Dual Storage:** Fast leaderboard queries with denormalized `total_coins` + complete transaction history

---

## 📁 Specification Documents

This specification consists of the following documents:

### 1. **requirements.md** - Business Requirements
- Complete functional and non-functional requirements
- Business rules for coin calculation
- Database schema requirements
- API endpoint specifications
- Success metrics and risk analysis

**Key Sections:**
- Core Business Rules (coin award logic)
- Functional Requirements (FR-1 to FR-6)
- Database Schema Requirements
- User Stories

### 2. **technical-architecture.md** - Technical Design
- Detailed database architecture with ERD
- Complete SQL schemas for all tables
- PostgreSQL functions for business logic
- Frontend architecture and component structure
- TypeScript type definitions
- Custom React hooks design
- Security architecture (RLS policies)
- Performance optimization strategies

**Key Sections:**
- Database Functions (`complete_task_and_award_coins`, `get_leaderboard`)
- Component Structure
- Custom Hooks (`useCoins`, `useLeaderboard`)
- Security (RLS policies)

### 3. **user-stories.md** - User Stories
- 16 detailed user stories with acceptance criteria
- Stories for students, teachers, and both roles
- Edge cases and error handling stories
- Non-functional stories (performance, accessibility)
- Story dependencies and prioritization

**Key Stories:**
- US-1: Complete Task and Earn Coins
- US-2: View Total Coins on Dashboard
- US-9: Access Leaderboard
- US-11: Handle Concurrent Completions

### 4. **implementation-plan.md** - Development Plan
- Step-by-step implementation guide
- 10 phases from database setup to deployment
- Detailed task breakdown for each phase
- Timeline: 6-7 days (43 hours)
- Development checklist
- Risk mitigation strategies
- Rollback plan

**Key Phases:**
- Phase 3A: Database Setup (4 hours)
- Phase 3B: Database Functions (6 hours)
- Phase 3C-3H: Frontend Development (23 hours)
- Phase 3I: Testing (6 hours)
- Phase 3J: Deployment (4 hours)

### 5. **README.md** - This Document
- Overview of the specification
- Quick reference guide
- Document navigation

---

## 🎯 Core Business Logic

### Coin Award Rules

```
IF completed_at <= due_date THEN
  base_coins = 1
  
  IF student is in top 3 fastest THEN
    bonus_coins = 2
    total_coins = 3
  ELSE
    total_coins = 1
  END IF
ELSE
  total_coins = 0  (late penalty)
END IF
```

### Top 3 Determination

Students are ranked by `completed_at` timestamp (earliest first). Only students who complete tasks **on time** are eligible for bonus coins.

---

## 🗄️ Database Schema Summary

### New Table: `coin_transactions`
```sql
CREATE TABLE coin_transactions (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES profiles(id),
  task_id UUID REFERENCES tasks(id),
  coins_awarded INTEGER,
  transaction_type VARCHAR(50),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(student_id, task_id)
);
```

### Modified Table: `profiles`
```sql
ALTER TABLE profiles 
ADD COLUMN total_coins INTEGER DEFAULT 0 NOT NULL;
```

### Modified Table: `task_assignments`
```sql
ALTER TABLE task_assignments 
ADD COLUMN is_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
```

---

## 🔧 Key Technical Components

### Database Functions
1. **`complete_task_and_award_coins(p_task_assignment_id, p_student_id)`**
   - Core business logic
   - Handles task completion and coin calculation atomically
   - Returns JSON with coins awarded and new total

2. **`get_leaderboard(p_limit)`**
   - Returns top N students by total coins
   - Uses RANK() for ties
   - Optimized with indexes

### Frontend Hooks
1. **`useCoins`** - Handles task completion and coin operations
2. **`useLeaderboard`** - Fetches and manages leaderboard data
3. **`useTasks`** - Manages task list with completion status

### UI Components
1. **`CoinDisplay`** - Shows total coins in dashboard
2. **`CoinRewardModal`** - Feedback after earning coins
3. **`LeaderboardCard`** - Individual leaderboard entry
4. **`TaskCard`** - Task item with complete button
5. **`LeaderboardPage`** - Full leaderboard view

---

## 🚀 Implementation Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| 3A | 4 hours | Database Setup |
| 3B | 6 hours | Database Functions |
| 3C | 3 hours | Types and Services |
| 3D | 4 hours | Custom Hooks |
| 3E | 6 hours | UI Components |
| 3F | 4 hours | Student Dashboard |
| 3G | 4 hours | Leaderboard Page |
| 3H | 2 hours | Teacher Dashboard |
| 3I | 6 hours | Testing & Bug Fixes |
| 3J | 4 hours | Documentation & Deploy |
| **Total** | **43 hours** | **6-7 days** |

---

## ✅ Success Criteria

The feature is complete when:

- ✅ Students can complete tasks and earn coins
- ✅ Bonus coins awarded correctly to top 3 students
- ✅ Late submissions receive 0 coins
- ✅ Total coins display on student dashboard
- ✅ Leaderboard shows top 10 students
- ✅ No duplicate coin awards possible
- ✅ Performance < 1s for leaderboard queries
- ✅ All UI components responsive and accessible
- ✅ Zero critical bugs in production

---

## 📊 Key Metrics to Track

Post-deployment, monitor:

- Task completion rate (before vs after gamification)
- Percentage of on-time vs late completions
- Distribution of bonus awards (how many students get top 3)
- Leaderboard engagement (page views, time spent)
- Student satisfaction scores
- System performance (query times, error rates)

---

## 🔐 Security Considerations

- All coin calculations happen **server-side** (in PostgreSQL functions)
- Students cannot manipulate coin values directly
- Row Level Security (RLS) enforces data access rules
- Students can only complete their own assigned tasks
- Transaction history is immutable (no updates/deletes)
- UNIQUE constraint prevents duplicate coin awards

---

## 🎨 UX Principles

1. **Immediate Feedback:** Show coin reward instantly after task completion
2. **Clear Communication:** Explain why students earned specific coin amounts
3. **Positive Reinforcement:** Even late completions are acknowledged positively
4. **Transparency:** Students can see their ranking and understand the system
5. **Accessibility:** All features work with keyboard and screen readers

---

## 📦 Dependencies

This feature requires:

- ✅ **Phase 1:** User Authentication (complete)
- ✅ **Phase 2:** Task Management CRUD (must be complete before starting)
- Existing tables: `profiles`, `tasks`, `task_assignments`
- Supabase PostgreSQL database
- React + TypeScript frontend
- Tailwind CSS for styling

---

## 🔄 Future Enhancements (Out of Scope for MVP)

The following features are **NOT** included in Phase 3:

- Coin redemption/spending system
- Detailed transaction history view for students
- Weekly/monthly leaderboard variants
- Achievement badges or milestones
- Teacher ability to manually award/deduct coins
- Notification system for achievements
- Variable coin values per task difficulty
- Team-based competitions
- Coin penalties for other behaviors

These may be considered for Phase 4 or later iterations.

---

## 📖 How to Use This Specification

### For Developers:
1. Start with **requirements.md** to understand business logic
2. Review **technical-architecture.md** for implementation details
3. Follow **implementation-plan.md** step-by-step
4. Reference **user-stories.md** for acceptance criteria

### For Product Managers:
1. Review **requirements.md** for business rules and success metrics
2. Check **user-stories.md** for feature scope and prioritization
3. Use **implementation-plan.md** for timeline and resource planning

### For QA Engineers:
1. Use **user-stories.md** for test scenarios and acceptance criteria
2. Reference **requirements.md** for edge cases and error handling
3. Follow **implementation-plan.md** Phase 3I for testing checklist

### For Designers:
1. Review **user-stories.md** for UX requirements
2. Check **technical-architecture.md** for component structure
3. Reference **requirements.md** for UI specifications

---

## 🤝 Approval Status

- [ ] Product Manager Review
- [ ] Technical Lead Review
- [ ] Security Review
- [ ] UX/Design Review
- [ ] Ready for Implementation

---

## 📞 Questions or Clarifications?

If you have questions about this specification:

1. Check if the answer is in one of the four main documents
2. Review the business rules in **requirements.md**
3. Check the technical details in **technical-architecture.md**
4. Consult the implementation plan for process questions

---

## 📝 Document Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-28 | AI Senior Software Architect | Initial specification created |

---

## 🎓 Learning Resources

For team members new to the tech stack:

- **Supabase RLS:** [Supabase Row Level Security Docs](https://supabase.com/docs/guides/auth/row-level-security)
- **PostgreSQL Functions:** [PostgreSQL Function Documentation](https://www.postgresql.org/docs/current/sql-createfunction.html)
- **React Hooks:** [React Hooks Documentation](https://react.dev/reference/react)
- **TypeScript:** [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

**Ready to implement? Start with Phase 3A in `implementation-plan.md`!** 🚀

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-28  
**Author:** AI Senior Software Architect
