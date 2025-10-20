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