---
description: 
---

## IMPLEMENTATION COMMAND: Phase 8 (Step 1) - Database Layer

**## CONTEXT**
-   **Feature:** Phase 8 - Data Visualization (Analytics & Calendar)
-   **Status:** All planning documents (`technical-architecture.md`, `implementation-plan.md`) are approved.
-   **Branch:** `feature/data-visualization`

**## YOUR TASK**
Your task is to execute **Phase A: Database Layer** from the implementation plan.

You must:
1.  Create a new Supabase migration file (e.g., `019_add_analytics_rpc.sql`).
2.  Write the **complete, runnable SQL** for all **four (4) new RPC functions** as defined in the `technical-architecture.md`:
    * `get_task_completion_stats()` (for the Pie Chart)
    * `get_student_engagement_stats()` (for the Bar Chart)
    * `get_subject_performance_stats()` (for the Radar Chart)
    * `get_all_tasks_for_calendar()` (for the Calendar Page)
3.  Ensure the functions have the correct permissions (e.g., `SECURITY DEFINER`) and are callable by authenticated users.
4.  Provide the complete SQL script.