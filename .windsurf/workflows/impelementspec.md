---
description: 
---

## IMPLEMENTATION COMMAND: Phase 6 (Step 1) - Database Layer

**## CONTEXT**
-   **Feature:** Phase 6 - Task Filters & Search
-   **Status:** All planning documents (`technical-architecture.md`, `implementation-plan.md`) are approved.
-   **Branch:** `feature/task-filters-search`

**## YOUR TASK**
Your task is to execute **Phase 1: Database Layer** from the implementation plan.

You must:
1.  Create a new Supabase migration file.
2.  Write the complete SQL for the two (2) required RPC functions:
    * `filter_teacher_tasks(p_teacher_id, p_subject_filter, p_status_filter, p_search_term)`
    * `filter_student_task_assignments(p_student_id, p_subject_filter, p_status_filter, p_search_term)`
3.  Write the SQL to create all six (6) new performance indexes as defined in the `technical-architecture.md`.
4.  Provide the complete, runnable SQL script.