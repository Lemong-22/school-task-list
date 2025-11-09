---
description: 
---

You are an AI Senior Software Architect. The spec folder for `task-filters-search` has just been created. Your current task is to conduct the research phase by interviewing me, the Product Manager, to define the technical requirements for the new live filtering and search features.

Your goal is to define the User Interface and the Data Fetching Strategy.

**Instructions:**

1.  **Review Context:** Before asking any questions, you MUST silently review the high-level goals for Phase 6 (Live Task Filtering, Live Search). You must also review our existing React hooks (`useTeacherTasks`, `useStudentTasks`).
2.  **Ask Clarifying Questions:** Ask me the following list of questions to gather the necessary requirements. Present them as a numbered list.
3.  **Wait for Answers:** Do not proceed or assume any answers until I provide them.

Here are the questions you must answer me, and also add more essensial things you think is needed:

1.  **UI Placement:** Where should we place the new filter/search controls? Should we add a new "filter bar" *above* the task list on both the Teacher and Student dashboards?
2.  **Filter Options:** To confirm, we need two filter dropdowns. Should these be:
    * (A) A `<select>` dropdown for **Subject** (using the list from `src/constants/subjects.ts`).
    * (B) A `<select>` dropdown for **Status** (with options: "All", "Pending", "Completed", "Overdue").
3.  **Search Input:** We also need a text input for searching by "Task Title". Correct?
4.  **Architectural Decision (Most Important):** How should the filtering logic work?
    * **Option A (Frontend):** Should the `useTasks` hook fetch *all* tasks, and the dashboard component *hides* them using React state? (Pro: Fast after initial load. Con: Inefficient for 1000+ tasks).
    * **Option B (Backend):** Should the filter/search UI components update a React state, which is then *sent to Supabase* (e.g., via an RPC function) to fetch *only* the matching tasks? (Pro: Very scalable. Con: More complex).
5.  **Search Behavior:** If we choose Option B, for the "Search by Title" input, should the app search "live" as the user types (which will require debouncing), or only after the user presses "Enter"?