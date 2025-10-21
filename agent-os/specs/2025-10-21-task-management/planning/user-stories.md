# Task Management - User Stories

**Feature:** Core Task Management (CRUD)  
**Date:** 2025-10-21  
**Status:** Planning Phase  

---

## Epic: Task Management System

As a school using this application, we want Teachers to be able to create and manage tasks, and Students to be able to view and complete their assigned tasks, so that the learning process is organized and trackable.

---

## Teacher User Stories

### US-T1: Create a New Task
**As a** Teacher  
**I want to** create a new task with a title, description, and due date  
**So that** I can assign work to my students  

**Acceptance Criteria:**
- [ ] I can access a "Create New Task" button from my dashboard
- [ ] I see a form with fields: Task Title, Description, Due Date, and Student Selection
- [ ] Task Title field is required and limited to 200 characters
- [ ] Description field is optional and limited to 1000 characters
- [ ] Due Date field is required and uses a date picker
- [ ] I cannot select a past date as the due date
- [ ] I must select at least one student to assign the task to
- [ ] I can select multiple students from a list of all registered students
- [ ] The student list is easy to navigate (searchable or scrollable)
- [ ] I receive a success message when the task is created
- [ ] After creation, I am redirected to my task list
- [ ] The newly created task appears in my task list immediately

**Priority:** High  
**Story Points:** 8  
**Dependencies:** Phase 1 Authentication completed

---

### US-T2: View All My Tasks
**As a** Teacher  
**I want to** view a list of all tasks I have created  
**So that** I can track what assignments I have given to students  

**Acceptance Criteria:**
- [ ] I see a list of all tasks I have created on my dashboard
- [ ] Each task displays: Title, Due Date, and Completion Progress
- [ ] Completion Progress shows "X of Y students completed" format
- [ ] Tasks are sorted by due date (nearest due date first)
- [ ] Overdue tasks are visually highlighted (e.g., red text or warning icon)
- [ ] I see an empty state message if I haven't created any tasks yet
- [ ] The list loads within 2 seconds
- [ ] Each task has "Edit" and "Delete" action buttons

**Priority:** High  
**Story Points:** 5  
**Dependencies:** US-T1 completed

---

### US-T3: Edit an Existing Task
**As a** Teacher  
**I want to** edit a task I have created  
**So that** I can update the details or correct mistakes  

**Acceptance Criteria:**
- [ ] I can click an "Edit" button on any task in my list
- [ ] I see an edit form pre-filled with the current task data
- [ ] I can modify the Task Title, Description, Due Date, and Assigned Students
- [ ] I can add new students to the task assignment
- [ ] I can remove students from the task assignment
- [ ] Form validation is the same as the create form
- [ ] I receive a success message when changes are saved
- [ ] Changes are immediately visible in my task list
- [ ] Changes are immediately visible to all assigned students
- [ ] If I remove a student who has already completed the task, their completion is deleted

**Priority:** High  
**Story Points:** 5  
**Dependencies:** US-T1, US-T2 completed

---

### US-T4: Delete a Task
**As a** Teacher  
**I want to** delete a task I have created  
**So that** I can remove assignments that are no longer needed  

**Acceptance Criteria:**
- [ ] I can click a "Delete" button on any task in my list
- [ ] I see a confirmation dialog before deletion
- [ ] The confirmation warns me that the task will be deleted for all students
- [ ] I can cancel the deletion
- [ ] Upon confirmation, the task is permanently deleted
- [ ] The task is removed from my task list immediately
- [ ] The task is removed from all assigned students' lists immediately
- [ ] All completion records for that task are deleted
- [ ] I receive a success message confirming deletion

**Priority:** High  
**Story Points:** 3  
**Dependencies:** US-T2 completed

---

### US-T5: View Task Completion Statistics
**As a** Teacher  
**I want to** see how many students have completed each task  
**So that** I can track student progress and engagement  

**Acceptance Criteria:**
- [ ] Each task in my list shows completion statistics
- [ ] Statistics show "X of Y students completed" where:
  - X = number of students who marked the task as complete
  - Y = total number of students assigned to the task
- [ ] Statistics update immediately when a student completes a task (after page refresh)
- [ ] If a task has 0 assignments, it shows "0 of 0 students completed"
- [ ] The statistics are accurate and match the actual completion data

**Priority:** Medium  
**Story Points:** 3  
**Dependencies:** US-T2, US-S2 completed

---

## Student User Stories

### US-S1: View My Assigned Tasks
**As a** Student  
**I want to** view all tasks assigned to me  
**So that** I know what work I need to complete  

**Acceptance Criteria:**
- [ ] I see a list of all tasks assigned to me on my dashboard
- [ ] Each task displays: Title, Due Date, and Status
- [ ] Status shows either "Tertunda" (Pending) or "Selesai" (Completed)
- [ ] Tasks are sorted by due date (nearest due date first)
- [ ] Completed tasks are visually distinct (e.g., greyed out or separate section)
- [ ] Overdue tasks (past due date and still pending) are highlighted
- [ ] I see an empty state message if I have no assigned tasks
- [ ] The list loads within 2 seconds
- [ ] I only see tasks assigned to me (not other students' tasks)

**Priority:** High  
**Story Points:** 5  
**Dependencies:** US-T1 completed

---

### US-S2: Mark a Task as Complete
**As a** Student  
**I want to** mark a task as complete when I finish it  
**So that** my teacher knows I have completed the assignment  

**Acceptance Criteria:**
- [ ] Each pending task has a "Selesaikan Tugas" (Complete Task) button
- [ ] When I click the button, the task is marked as complete
- [ ] The button is replaced with a "Selesai" (Completed) label or checkmark icon
- [ ] The task status changes from "Tertunda" to "Selesai"
- [ ] The task moves to the completed section or is visually updated
- [ ] The completion timestamp is recorded
- [ ] My teacher sees the updated completion statistics immediately (after refresh)
- [ ] I cannot "uncomplete" a task (button doesn't appear again)
- [ ] Completed tasks remain visible in my task list

**Priority:** High  
**Story Points:** 5  
**Dependencies:** US-S1 completed

**Note for Phase 3:** This action will trigger point/coin rewards in the gamification phase.

---

### US-S3: View Task Details
**As a** Student  
**I want to** see the full details of a task  
**So that** I understand what I need to do  

**Acceptance Criteria:**
- [ ] I can click on a task to view its full details
- [ ] I see the complete task description (if provided by teacher)
- [ ] I see the due date clearly displayed
- [ ] I see who created the task (teacher's name)
- [ ] I can return to the task list easily (back button or navigation)
- [ ] The layout is clear and easy to read

**Priority:** Medium  
**Story Points:** 3  
**Dependencies:** US-S1 completed

---

### US-S4: Identify Overdue Tasks
**As a** Student  
**I want to** easily identify tasks that are past their due date  
**So that** I can prioritize completing them  

**Acceptance Criteria:**
- [ ] Tasks past their due date have a visual indicator (e.g., red text, warning icon)
- [ ] Overdue tasks that are still pending are clearly marked
- [ ] Completed tasks that were completed late still show they are completed
- [ ] The most overdue tasks appear at the top of my pending list
- [ ] I can easily distinguish between:
  - Pending tasks not yet due
  - Pending tasks that are overdue
  - Completed tasks (regardless of when completed)

**Priority:** Low  
**Story Points:** 2  
**Dependencies:** US-S1 completed

---

## System Stories (Technical)

### US-SYS1: Enforce Role-Based Access
**As the** System  
**I need to** enforce role-based access control for all task operations  
**So that** users can only perform authorized actions  

**Acceptance Criteria:**
- [ ] Teachers can only view, edit, and delete tasks they created
- [ ] Students can only view tasks assigned to them
- [ ] Students can only mark their own assignments as complete
- [ ] Row Level Security (RLS) policies are implemented in database
- [ ] Unauthorized access attempts return proper error messages
- [ ] Frontend hides actions users aren't authorized to perform

**Priority:** High  
**Story Points:** 5  
**Dependencies:** Database schema created

---

### US-SYS2: Handle Task Assignment Relations
**As the** System  
**I need to** properly manage the many-to-many relationship between tasks and students  
**So that** tasks can be assigned to multiple students correctly  

**Acceptance Criteria:**
- [ ] When a task is created, assignment records are created for each selected student
- [ ] Each assignment record tracks the student, task, status, and completion timestamp
- [ ] When a task is deleted, all assignment records are deleted (cascade)
- [ ] When a task is edited and students are removed, their assignments are deleted
- [ ] When a task is edited and students are added, new assignments are created
- [ ] Assignment queries are efficient (proper database indexes)

**Priority:** High  
**Story Points:** 3  
**Dependencies:** Database schema created

---

### US-SYS3: Validate Task Data
**As the** System  
**I need to** validate all task data on both client and server side  
**So that** data integrity is maintained  

**Acceptance Criteria:**
- [ ] Task title is required and max 200 characters
- [ ] Due date is required and cannot be in the past (for new tasks)
- [ ] At least one student must be assigned to a task
- [ ] All validation errors show clear, helpful messages
- [ ] Client-side validation provides immediate feedback
- [ ] Server-side validation prevents invalid data storage
- [ ] Form cannot be submitted with validation errors

**Priority:** High  
**Story Points:** 3  
**Dependencies:** None

---

## Story Mapping

### Phase 2 - Sprint 1 (Core CRUD)
**Focus:** Teacher can create and manage tasks
- US-T1: Create a New Task
- US-T2: View All My Tasks
- US-SYS1: Enforce Role-Based Access
- US-SYS2: Handle Task Assignment Relations
- US-SYS3: Validate Task Data

**Total Story Points:** 24

---

### Phase 2 - Sprint 2 (Student Features)
**Focus:** Students can view and complete tasks
- US-S1: View My Assigned Tasks
- US-S2: Mark a Task as Complete
- US-T5: View Task Completion Statistics

**Total Story Points:** 13

---

### Phase 2 - Sprint 3 (Edit & Delete)
**Focus:** Teachers can update and remove tasks
- US-T3: Edit an Existing Task
- US-T4: Delete a Task
- US-S3: View Task Details
- US-S4: Identify Overdue Tasks

**Total Story Points:** 13

---

## Definition of Done

A user story is considered "Done" when:

1. ✅ All acceptance criteria are met
2. ✅ Code is written following TypeScript and React best practices
3. ✅ Code is committed with clear commit messages
4. ✅ UI is styled with Tailwind CSS and matches existing design
5. ✅ Feature works on both desktop and mobile devices
6. ✅ All error cases are handled with user-friendly messages
7. ✅ Database RLS policies are properly configured
8. ✅ Feature has been manually tested by developer
9. ✅ No console errors or warnings
10. ✅ Feature has been demonstrated to Product Manager (optional)

---

**Total User Stories:** 13  
**Total Story Points:** 50  
**Estimated Duration:** 3 sprints (assuming 1-2 weeks per sprint)  

**Last Updated:** 2025-10-21
