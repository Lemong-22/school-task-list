# Deprecated Task CRUD Pages

These pages have been moved here because they are incompatible with the new gamification system.

## Files:
- `CreateTaskPage.tsx` - Old task creation page
- `EditTaskPage.tsx` - Old task editing page

## Why deprecated?
These pages use methods (`createTask`, `updateTask`, `fetchTaskById`, `fetchTaskAssignments`) that don't exist in the new `useTasks` hook, which is designed for student task viewing with gamification support.

## TODO:
Re-implement these pages with:
1. Support for `coin_reward` field in tasks
2. Compatible with new task_assignments structure
3. Integration with gamification system
4. Updated to use proper task service/hooks

## Current Status:
- Routes are commented out in `App.tsx`
- Teacher dashboard simplified (no task creation buttons)
- Students can view and complete tasks (gamification works!)
- Leaderboard is fully functional

## Next Steps:
Create new task management pages that:
- Allow teachers to create tasks with coin rewards
- Allow teachers to edit tasks and update coin rewards
- Allow teachers to assign tasks to students
- Show task completion statistics
- Integrate with the gamification system
