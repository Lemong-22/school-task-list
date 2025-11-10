# Interactive Tasks (Attachments & Comments) - Requirements Document

**Feature:** Phase 7 - Interactive Tasks (Attachments & Comments)  
**Date:** 2025-11-10  
**Status:** Research Complete  
**Phase:** Phase 7 - Advanced Collaboration Features

---

## 1. Overview

This document defines all functional and non-functional requirements for the Interactive Tasks feature, which enables rich collaboration between teachers and students through file attachments and real-time commenting on tasks.

## 2. Business Context

The Interactive Tasks system aims to:
- Enable teachers to attach instructional materials (worksheets, documents, images) to tasks
- Allow students to submit their work by uploading files to task assignments
- Facilitate communication through a real-time commenting system on tasks
- Create a more interactive and collaborative learning environment
- Reduce friction in assignment submission and feedback workflows

## 3. Core Business Rules

### 3.1 File Attachments

**Storage Architecture:**
- Files are stored in **Supabase Storage** buckets
- File metadata and task associations are tracked in the `task_attachments` table
- Storage uses row-level security (RLS) for access control

**Attachment Permissions:**
- **Teachers** can upload files to any task they create
- **Students** can upload files to tasks they are assigned to
- Teachers can view all attachments on their tasks (both their uploads and student submissions)
- Students can only view:
  - Teacher-uploaded files (instructional materials)
  - Their own uploaded files (submissions)
  - Students CANNOT view other students' submissions

**File Upload Rules:**
- Maximum file size: **10 MB per file** (configurable)
- Allowed file types: PDF, DOC, DOCX, JPG, PNG, GIF, TXT, ZIP
- Maximum attachments per task: **Unlimited** (but UI may paginate)
- Files cannot be edited after upload, only deleted
- File names must be unique per task (append timestamp if duplicate)

**Attachment Types:**
- **Teacher Attachments:** Instructional materials, worksheets, reference documents
- **Student Submissions:** Completed work, homework files, project files

### 3.2 Comments System

**Comment Structure:**
- Comments are stored in the `task_comments` table
- Each comment belongs to a specific task
- Each comment is authored by a user (teacher or student)
- Comments are displayed in chronological order (oldest first)

**Commenting Permissions:**
- **Teachers** can comment on any task they created
- **Students** can comment on tasks they are assigned to
- All participants can view all comments on tasks they have access to
- Comments can be edited by their author within 5 minutes of posting
- Comments can be deleted by their author or by the task creator (teacher)

**Real-time Requirements:**
- Comments must appear instantly using **Supabase Realtime Subscriptions**
- No page refresh required to see new comments
- Visual indicator when new comments arrive (e.g., "New comment" badge)
- Typing indicators are NOT included in MVP

### 3.3 UI Component Rules

**Drawer (Slide-Over Panel):**
- The commenting interface uses a **Drawer component** that slides in from the right side
- Drawer is triggered by a "Comments" button on task cards
- Drawer overlays the main content with a semi-transparent backdrop
- Clicking backdrop or "Close" button closes the drawer
- Drawer contains:
  - Task title and basic info header
  - Attachments section (collapsible)
  - Comments feed (scrollable)
  - Comment input area (bottom)

**Attachments Section:**
- Located at the top of the drawer
- Shows teacher attachments first, then student submissions (if applicable)
- Each attachment shows: file name, file type icon, file size, uploader name, upload date
- Download button for each file
- Delete button (only visible to file owner)
- Upload button (visible to users with permission)

**Comments Feed:**
- Chronologically ordered comments (oldest to newest)
- Each comment shows: author name, author role badge, timestamp, comment content
- Author's own comments have distinct styling (e.g., highlighted border)
- Edit/Delete buttons (only visible to comment author within allowed timeframe)

## 4. Functional Requirements

### FR-1: View Task Attachments
**Priority:** High  
**Description:** Users must be able to view attachments associated with a task.

**Acceptance Criteria:**
- Task cards show an attachment icon/badge if the task has attachments
- Clicking "View Details" or "Comments" opens the drawer
- Drawer displays all attachments the user has permission to view
- Teacher attachments are clearly labeled and displayed first
- Student submissions are displayed below teacher attachments (teachers only)
- Each attachment shows: file name, type icon, size, uploader, upload date
- Attachments are downloadable via a "Download" button

### FR-2: Upload Attachments (Teacher)
**Priority:** High  
**Description:** Teachers must be able to upload instructional files to tasks they create.

**Acceptance Criteria:**
- "Upload File" button is visible in the attachments section (teacher view only)
- Clicking button opens file picker dialog
- User can select one or multiple files
- Files are validated for type and size before upload
- Upload progress indicator is shown during upload
- Successful upload:
  - File appears in the attachments list immediately
  - Success message: "File uploaded successfully"
  - All students assigned to the task can now see the file
- Failed upload:
  - Error message specifies the reason (file too large, invalid type, etc.)
  - No file is added to the task

### FR-3: Upload Attachments (Student Submission)
**Priority:** High  
**Description:** Students must be able to upload their completed work to tasks they are assigned.

**Acceptance Criteria:**
- "Upload Submission" button is visible in the attachments section (student view only)
- Same upload flow as FR-2
- Student can upload multiple files as their submission
- Student can only see their own submissions in the attachments list
- Teacher can see all student submissions (with student name labels)
- Submission uploads are logged with timestamp for grading reference

### FR-4: Delete Attachments
**Priority:** Medium  
**Description:** Users must be able to delete their own uploaded files.

**Acceptance Criteria:**
- Delete button (trash icon) appears next to attachments uploaded by current user
- Clicking delete shows confirmation dialog: "Are you sure you want to delete [filename]?"
- Successful deletion:
  - File is removed from storage
  - File entry is removed from database
  - UI updates immediately (file disappears from list)
  - Success message: "File deleted successfully"
- Failed deletion:
  - Error message is shown
  - File remains in the list

### FR-5: Download Attachments
**Priority:** High  
**Description:** Users must be able to download attachments they have access to.

**Acceptance Criteria:**
- Download button (download icon) appears on all attachments the user can view
- Clicking download initiates browser download
- Downloaded file has its original filename
- Download works for all supported file types

### FR-6: View Comments Feed
**Priority:** High  
**Description:** Users must be able to view all comments on a task in real-time.

**Acceptance Criteria:**
- Comments feed is displayed in the drawer below the attachments section
- Comments are sorted chronologically (oldest first)
- Each comment displays:
  - Author name and role badge (Teacher/Student)
  - Timestamp (relative time, e.g., "2 minutes ago")
  - Comment content (supports line breaks)
  - Edit/Delete buttons (if author and within 5 minutes)
- New comments appear automatically without refresh (real-time)
- Visual indicator when new comments arrive (badge or highlight)
- Feed is scrollable if comments exceed drawer height

### FR-7: Post New Comment
**Priority:** High  
**Description:** Users must be able to post comments on tasks they have access to.

**Acceptance Criteria:**
- Comment input area is fixed at the bottom of the drawer
- Textarea for comment content (supports multi-line)
- Character limit: 1000 characters
- Character counter shows remaining characters
- "Post Comment" button (disabled if empty or over limit)
- Clicking "Post Comment":
  - Comment is saved to database
  - Comment appears in the feed immediately (real-time)
  - Input area is cleared
  - Success feedback (brief flash or message)
  - Other users viewing the task see the new comment instantly
- Failed post:
  - Error message is shown
  - Comment remains in input area (not lost)

### FR-8: Edit Comment
**Priority:** Medium  
**Description:** Users must be able to edit their own comments within 5 minutes of posting.

**Acceptance Criteria:**
- "Edit" button appears on user's own comments (only within 5 minutes)
- Clicking "Edit" replaces comment text with an editable textarea
- Textarea is pre-filled with current comment content
- "Save" and "Cancel" buttons appear
- Clicking "Save":
  - Updated comment is saved to database
  - Comment display updates immediately
  - "Edited" label appears next to timestamp
  - Real-time update for all viewers
- Clicking "Cancel":
  - Returns to display mode without changes
- After 5 minutes, "Edit" button disappears

### FR-9: Delete Comment
**Priority:** Medium  
**Description:** Users must be able to delete their own comments. Teachers can delete any comment on their tasks.

**Acceptance Criteria:**
- "Delete" button appears on:
  - User's own comments (always)
  - All comments (teacher on their own tasks)
- Clicking "Delete" shows confirmation dialog: "Delete this comment?"
- Successful deletion:
  - Comment is removed from database
  - Comment disappears from feed immediately
  - Real-time removal for all viewers
  - Success message: "Comment deleted"
- Failed deletion:
  - Error message is shown
  - Comment remains visible

### FR-10: Open/Close Drawer
**Priority:** High  
**Description:** Users must be able to open and close the comments/attachments drawer.

**Acceptance Criteria:**
- "Comments" button appears on each task card
- Button shows comment count badge (e.g., "5 comments")
- Button shows attachment icon if task has attachments
- Clicking button opens drawer from right side of screen
- Drawer animation is smooth (300ms slide-in)
- Semi-transparent backdrop appears behind drawer
- Clicking backdrop closes drawer
- "X" close button at top of drawer also closes it
- ESC key closes drawer
- Drawer is responsive (full-width on mobile, fixed width on desktop)

## 5. Non-Functional Requirements

### NFR-1: Performance
- Drawer must open in under 300ms
- Attachments list must load in under 1 second
- Comments feed must load in under 1 second
- Real-time comment updates must appear within 500ms of posting
- File uploads must show progress indicator for uploads > 1 second
- File downloads must initiate immediately on click

### NFR-2: Real-time Reliability
- Real-time comment subscriptions must auto-reconnect on network interruption
- Missed comments during offline period must sync when reconnecting
- Optimistic UI updates (show comment immediately before server confirms)
- Rollback optimistic updates if server rejects the operation

### NFR-3: Security
- All file uploads must be virus-scanned (future enhancement)
- Files must be stored with access control via Supabase RLS
- Students cannot access other students' submission files
- File URLs must be signed/temporary to prevent unauthorized access
- Comment content must be sanitized to prevent XSS attacks

### NFR-4: Accessibility
- Drawer is keyboard navigable (Tab, Shift+Tab, ESC)
- All interactive elements have proper ARIA labels
- Screen reader announces new comments
- File upload has accessible labels and error messages
- Color contrast meets WCAG AA standards

### NFR-5: User Experience
- Elegant Stitch design system consistency (as per UI refactoring memory)
- Use `bg-component-dark`, `bg-background-dark` for backgrounds
- Use `border-border-dark` for borders
- Use `text-text-primary-dark`, `text-text-secondary-dark` for text
- Buttons use `bg-primary text-white rounded-lg hover:bg-primary/90`
- Smooth animations and transitions (drawer slide, comment fade-in)
- Loading states for all async operations
- Empty states with helpful messages ("No comments yet. Be the first!")

### NFR-6: Mobile Responsiveness
- Drawer is full-width on mobile screens (< 768px)
- Drawer is fixed-width (400-500px) on desktop
- Comment input textarea is mobile-friendly (not too small)
- File upload button is touch-friendly (minimum 44x44px)
- Scrolling works smoothly on mobile devices

## 6. Data Model Requirements

### 6.1 Database Tables

**task_attachments:**
```sql
CREATE TABLE task_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL, -- Supabase Storage path
  file_size INTEGER NOT NULL, -- in bytes
  file_type VARCHAR(50) NOT NULL, -- MIME type
  attachment_type VARCHAR(20) NOT NULL CHECK (attachment_type IN ('teacher_material', 'student_submission')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Indexes
  INDEX idx_task_attachments_task_id (task_id),
  INDEX idx_task_attachments_uploaded_by (uploaded_by)
);
```

**task_comments:**
```sql
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (LENGTH(content) <= 1000),
  is_edited BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Indexes
  INDEX idx_task_comments_task_id (task_id, created_at),
  INDEX idx_task_comments_user_id (user_id)
);
```

### 6.2 Supabase Storage Buckets

**Bucket: task-attachments**
- Public: false (private, requires authentication)
- File size limit: 10 MB
- Allowed MIME types: 
  - application/pdf
  - application/msword
  - application/vnd.openxmlformats-officedocument.wordprocessingml.document
  - image/jpeg, image/png, image/gif
  - text/plain
  - application/zip

**Storage Structure:**
```
task-attachments/
  {task_id}/
    teacher/
      {timestamp}_{filename}
    student/
      {student_id}/
        {timestamp}_{filename}
```

### 6.3 Row-Level Security (RLS) Policies

**task_attachments RLS:**
- Teachers can INSERT/SELECT attachments on their own tasks
- Students can INSERT/SELECT attachments on their assigned tasks
- Students can only SELECT attachments they uploaded or teacher-uploaded attachments
- DELETE allowed only for attachment owner

**task_comments RLS:**
- Teachers can INSERT/SELECT/DELETE comments on their own tasks
- Students can INSERT/SELECT comments on their assigned tasks
- Users can UPDATE/DELETE only their own comments (within 5-minute window)

**Storage Bucket RLS:**
- Teachers can read all files in their task folders
- Students can read teacher materials and their own submissions
- Students cannot read other students' submission folders

## 7. Technical Dependencies

### 7.1 External Libraries
- **Supabase Storage SDK:** For file upload/download operations
- **Supabase Realtime:** For real-time comment subscriptions
- **Lucide React Icons:** For attachment, comment, upload, download icons
- **React Hook Form:** For comment input validation (optional)
- **Date-fns or Day.js:** For relative timestamp formatting ("2 minutes ago")

### 7.2 New React Components
- `TaskDrawer.tsx` - Main drawer container
- `AttachmentsSection.tsx` - File attachments display and upload
- `AttachmentItem.tsx` - Individual attachment card
- `CommentsSection.tsx` - Comments feed and real-time updates
- `CommentItem.tsx` - Individual comment display
- `CommentInput.tsx` - Comment textarea and post button
- `FileUploadButton.tsx` - Reusable file upload component

### 7.3 New Hooks
- `useTaskAttachments.ts` - Fetch and manage attachments
- `useTaskComments.ts` - Fetch comments and subscribe to real-time updates
- `useFileUpload.ts` - Handle file upload logic and progress
- `useCommentActions.ts` - Post, edit, delete comment actions
- `useDrawer.ts` - Drawer open/close state management

## 8. User Stories

### 8.1 Teacher Stories

**US-T1:** As a teacher, I want to upload a PDF worksheet to a task so that students can download and complete it.

**US-T2:** As a teacher, I want to see all student submissions on a task so that I can review and grade their work.

**US-T3:** As a teacher, I want to comment on a task to provide clarification or feedback visible to all students.

**US-T4:** As a teacher, I want to delete inappropriate comments on my tasks to maintain a respectful environment.

**US-T5:** As a teacher, I want to see comments in real-time so that I can respond immediately to student questions.

### 8.2 Student Stories

**US-S1:** As a student, I want to download the teacher's attached worksheet so that I can complete my assignment.

**US-S2:** As a student, I want to upload my completed homework file so that my teacher can review it.

**US-S3:** As a student, I want to ask a question in the comments so that my teacher can help me.

**US-S4:** As a student, I want to see other students' questions and the teacher's answers in real-time so that I can learn from the discussion.

**US-S5:** As a student, I want to edit my comment within a few minutes so that I can fix typos or clarify my question.

## 9. Success Metrics

### 9.1 Adoption Metrics
- 70%+ of tasks have at least one attachment within 2 weeks of launch
- 50%+ of tasks have at least one comment within 2 weeks of launch
- 80%+ of students upload at least one submission within 1 month of launch

### 9.2 Engagement Metrics
- Average comments per task: 3-5
- Average student submissions per task: 1-2
- Average teacher attachments per task: 1-2

### 9.3 Performance Metrics
- Drawer load time: < 1 second (p95)
- Real-time comment latency: < 500ms (p95)
- File upload success rate: > 95%

### 9.4 User Satisfaction
- Positive feedback from teachers on submission workflow
- Reduced email communication for assignment clarification (inferred from comment usage)
- Student satisfaction with file submission process

## 10. Out of Scope (Future Enhancements)

The following features are explicitly OUT OF SCOPE for Phase 7 MVP:

- **Rich text editor** for comments (plain text only in MVP)
- **@mentions** in comments to notify specific users
- **Reactions/Likes** on comments
- **Nested replies** (threaded comments)
- **Comment notifications** (email or in-app)
- **File preview** (inline PDF viewer, image lightbox)
- **Multiple file selection** in one upload action
- **Drag-and-drop** file upload
- **File versioning** (replacing old submissions)
- **Virus scanning** for uploaded files
- **Teacher grading** directly on submissions
- **Private comments** (teacher-only or student-only)
- **Comment moderation** (flagging, reporting)

These features may be considered for Phase 8 or later based on user feedback and adoption metrics.

---

**Document Status:** ✅ Complete  
**Next Step:** Create Technical Architecture Document  
**Approved By:** Product Manager  
**Date:** 2025-11-10
