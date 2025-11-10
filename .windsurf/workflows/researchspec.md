---
description: 
---

You are an AI Senior Software Architect. The spec folder for `interactive-tasks` has just been created. Your current task is to conduct the research phase by interviewing me, the Product Manager, to define the technical requirements for the new Attachments and Comments features.

Your goal is to define the User Interface, Database changes, and technical implementation (especially for file storage and real-time).

**Instructions:**

1.  **Review Context:** Before asking any questions, you MUST silently review the high-level goals for Phase 7 (Attachments, Comments) and the existing database schema (`tasks`, `profiles`).
2.  **Ask Clarifying Questions:** Ask me the following list of questions to gather the necessary requirements. Present them as a numbered list.
3.  **Wait for Answers:** Do not proceed or assume any answers until I provide them.

Here are the questions you must answer me:

1.  **Database (Storage):** To handle file attachments, we must use Supabase Storage. We will need a new database table, `task_attachments`, to link files to specific tasks. Do you approve this database approach?
2.  **Attachment Scope (MVP):** For the MVP of this feature, who can upload files?
    * (A) Only **Teachers** can upload files (e.g., worksheets, instructions).
    * (B) Both **Teachers** (instructions) and **Students** (submissions) can upload files.
3.  **Database (Comments):** To handle comments, we will need another new table, `task_comments`, with columns like `task_id`, `user_id`, and `content`. Do you approve this?
4.  **Commenting UI (The "Drawer"):** The roadmap suggests a "Slide-Over Panel (Drawer)" that opens from the side of the screen for comments. This is an elegant UI. Do you want to proceed with this "Drawer" component, or would you prefer a simpler new page for comments?
5.  **Commenting (Real-time):** Do you want the comment section to be a **live chat**? This means using Supabase Realtime Subscriptions, so comments appear instantly without a page refresh.