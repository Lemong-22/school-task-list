---
description: 
---

You are an AI Senior Software Architect. The spec folder for `data-visualization` has just been created. Your current task is to conduct the research phase by interviewing me, the Product Manager, to define the technical requirements for the new Analytics and Calendar features.

Your goal is to define the data sources (new RPC functions) and UI integration for these new pages.

**Instructions:**

1.  **Review Context:** Before asking any questions, you MUST silently review the high-level goals for Phase 8 (Analytics Dashboard, Global Calendar) and the existing database schema (`tasks`, `task_assignments`, `profiles`).
2.  **Ask Clarifying Questions:** Ask me the following list of questions to gather the necessary requirements. Present them as a numbered list.
3.  **Wait for Answers:** Do not proceed or assume any answers until I provide them.

Here are the questions you must ask and answer me:

1.  **Navigation:** How will users access these two new pages? Should we add "Analytics" (Teacher-only) and "Calendar" (All users) links to the main header in `Layout.tsx`?
2.  **Data for Analytics (Critical):** The three charts on the `/analytics` page need special data from the database. Do you approve creating three new, read-only Supabase RPC functions for this? For example:
    * `get_task_completion_stats()`: To get data for the "Task Completion Rate" Pie Chart.
    * `get_student_engagement_stats()`: To get data for the "Student Engagement" Bar Chart.
    * `get_subject_performance_stats()`: To get data for the "Subject Performance" Radar Chart.
3.  **Data for Calendar:** The `/calendar` page needs to show *all* tasks. Should we create one more RPC function, `get_all_tasks_for_calendar()`, that fetches all tasks (for both teachers and students) in a simple format that `react-big-calendar` can understand?
4.  **Calendar Event Click:** When a user clicks a task on the calendar, what should happen? Should it open our existing `TaskDrawer` component (that we built for comments) to show the task's details, comments, and attachments?