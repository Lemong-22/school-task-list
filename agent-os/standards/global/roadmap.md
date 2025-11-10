The product vision is to launch a functional Minimum Viable Product (MVP) as quickly as possible, focusing on the core manual workflow.

**Phase 1: Foundation & User Authentication (Required)**
- Setup frontend project (Vite+React+TS) and backend (Supabase).
- Implement registration and login system for users (Students & Teachers).
- Create a simple role-based system (differentiating between 'student' and 'teacher').
- Create protected routes that can only be accessed after logging in.

**Phase 2: Core Task Management (CRUD)**
- Functionality for Teachers: Create, Read, Update, and Delete tasks.
- Functionality for Students: View the list of assigned tasks.

**Phase 3: Core Gamification Implementation**
- Functionality for Students: A "Complete Task" button for each task item.
- Backend Logic: When a task is completed, award points/coins to the student and record the completion time.
- Display the total points/coins on the student's dashboard.
- Create a Leaderboard page that displays student rankings based on total points.

**Phase 4: Refinement & UI/UX Polish**
- Implement a more advanced design system (e.g., a "Glassmorphism" theme with gradients and blur effects).
- Refine user flows and add animations/transitions for a better experience.

phase 5 : refactor design to be ELEGANT

🚀 Project Rank-Up: The Polished Product Roadmap (Phases 6-10)
Phase 6: Advanced QoL & Teacher Power-User Tools
Goal: To enhance the core task management loop, reducing friction for teachers and adding value for students.

Key Features:

Live Task Filtering:

Implement filters on both TeacherDashboard and StudentDashboard.

Filter by Subject (dropdown).

Filter by Status (Pending, Completed, Overdue).

Live Search:

Add a live search bar to search by Task Title.

Elegant Bulk Operations (Teacher):

On the TeacherDashboard task list, add a "Select" checkbox to each row.

When one or more tasks are selected, an elegant "contextual action bar" appears at the bottom of the screen (e.g., "3 tasks selected").

This bar will have buttons for: "Bulk Delete" and "Bulk Archive".

Simple Bulk Assignment:

In the CreateTaskPage, add a "Select All Students" button to the StudentSelector component.

Data Export:

Add a simple "Export as CSV" button to the TeacherDashboard that exports the current task list.

Elegant Implementation Notes:

Filtering: Filters must update the list in real-time without a page refresh (by modifying the useTasks hook).

Bulk Ops UI: The "contextual action bar" is a very clean and modern pattern. It's much more elegant than adding more buttons to the main UI.

Phase 7: Interactive Tasks (Attachments & Comments)
Goal: To evolve tasks from simple to-do items into rich, interactive assignments.

Key Features:

File Attachments (Supabase Storage):

Teacher: Allow teachers to upload one or more files (PDFs, images) when creating/editing a task.

Student: Students can view and download these attachments.

(V2 Feature): Allow students to upload their own submission files.

Task Commenting System:

Add a "Comment" icon/button to each TaskCard.

Clicking it opens an elegant "slide-over panel" (a Drawer component) from the side of the screen.

Inside this panel, teachers and students can have a real-time, threaded conversation about that specific task.

Elegant Implementation Notes:

Database: This requires two new tables: task_attachments (linking to Supabase Storage) and task_comments.

UI: Using a Slide-Over Panel (Drawer) is far more elegant than a separate page. It keeps the user in the context of their dashboard.

Real-time: The comment system must use Supabase Realtime Subscriptions so users can chat live.

Phase 8: Data Visualization (Analytics & Calendar)
Goal: To provide high-level insights for teachers and a new way for students to visualize their workload.

Key Features:

Teacher Analytics Dashboard:

Create a new, protected route: /analytics.

Display charts (using recharts or a similar library) for:

"Task Completion Rate" (Pie Chart: Completed vs. Overdue).

"Student Engagement" (Bar Chart: Top 5 students by tasks completed).

"Subject Performance" (Radar Chart: Which subjects have the most/least completed tasks).

Global Calendar View:

Create a new, protected route: /calendar.

Implement a full-page calendar (using react-big-calendar or similar).

All tasks (from all subjects) are plotted on this calendar by their due_date.

Clicking a task on the calendar opens a modal with its details.

Elegant Implementation Notes:

All charts and calendars must be "themed" to match our elegant UI (using primary colors, text-secondary-dark fonts, and bg-component-dark cards).

Phase 9: System Notifications & Administration
Goal: To make the application proactive and easier to manage.

Key Features:

In-App Notification Center:

Add a "Notification Bell" icon (like on GitHub/Figma) to the main Layout header.

Clicking it opens a dropdown showing a list of recent events.

Events: "A new task has been assigned," "Your task was marked 'Overdue'," "You received a new comment."

Email Notifications (Optional):

Implement Supabase Edge Functions to send emails via a service like Resend.

Events: Send an email for new assignments and a 24-hour due date reminder.

Elegant Touch: This must be an opt-in feature. Add a "Notification Settings" toggle in the ProfilePage.

Simple Admin Dashboard:

Create a new, hidden route (/admin) only accessible by a user with role ADMIN.

This page will have a simple UI for managing the Coin Shop.

It will allow an Admin to Create, Edit, or Delete items in the shop_items table without writing SQL.

Elegant Implementation Notes:

Database: Requires a new notifications table.

Backend: Requires backend logic (Supabase Functions) and cron jobs (pg_cron for reminders).

Phase 10: Gamification V2 & Advanced Cosmetics
Goal: To build upon the successful gamification loop and increase long-term engagement.

Key Features:

Tiered Coin Bonus (Your Idea):

Implement the 3x / 2.5x / 2x coin bonus logic.

Achievement System:

Create a new system where Badges are automatically unlocked (not just purchased) for completing specific milestones.

Examples: "First Task Completed," "Task Streak (5 in a row)," "Math Master (Complete 10 Math tasks)."

Namecards (Your Idea):

Add a new item type to the Shop: "Namecard."

This item, when equipped, changes the background/border of the user's ProfilePage card and their row on the Leaderboard. Also show their title next to their name to make it luxurious

Leaderboard Seasons:

Implement the "This Week" and "This Month" leaderboard filters, allowing for "seasons" of competition.

Elegant Implementation Notes:

Database: This requires a major migration. The total_coins and points_earned columns must be changed from INTEGER to NUMERIC to support decimal multipliers (2.5x).

Database: Requires new tables: achievements and user_achievements.