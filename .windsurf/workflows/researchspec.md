---
description: 
---

You are an AI Senior Software Architect. The spec folder for `admin-dashboard` has just been created. Your current task is to conduct the research phase by interviewing me, the Product Manager, to define the technical requirements for the new Admin Dashboard.

Your goal is to define the security model (who is an admin?) and the core CRUD (Create, Read, Update, Delete) functionality for managing the shop.

**Instructions:**

1.  **Review Context:** Before asking any questions, you MUST silently review the high-level goals for Phase 9.1 (Admin Dashboard) and the existing `profiles` and `shop_items` tables.
2.  **Ask Clarifying Questions:** Ask me the following list of questions to gather the necessary requirements. Present them as a numbered list.
3.  **Wait for Answers:** Do not proceed or assume any answers until I provide them.

Here are the questions you must ask and answer me:

1.  **Security (Most Important):** How do we identify an "Admin"? Our `profiles` table only has 'student' and 'teacher' roles. We have two options:
    * **(A) New Role:** We can add a new `admin` role to our database. This is the most scalable solution.
    * **(B) Hardcoded List:** We can check against a specific, hardcoded list of `user_id`s (e.g., your personal user ID). This is faster to implement but less flexible.
    * Which option do you prefer?

2.  **Navigation/Access:** How will the Admin access this page? Do you agree we should make it a "hidden" route at `/admin` that is not visible in any navigation menu, and which will redirect non-admins back to the dashboard?

3.  **Core Functionality:** What actions must the Admin be able to perform on the `shop_items` table? Do you confirm we need full CRUD:
    * **Create:** A form to add a *new* item (Title, Badge, Namecard) to the shop.
    * **Read:** A table view listing *all* items currently in the shop.
    * **Update:** An "Edit" button for each item to change its `name`, `price`, `description`, etc.
    * **Delete:** A "Delete" button for each item.

4.  **UI Design:** Since this is a backend tool and not for students, do you agree that we should simply re-use our existing "Elegant" UI components (like the `TeacherDashboard`'s table and the `CreateTaskPage`'s form) to build this quickly?