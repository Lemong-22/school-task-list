# Interactive Tasks - Implementation Plan

**Feature:** Phase 7 - Interactive Tasks (Attachments & Comments)  
**Date:** 2025-11-10  
**Status:** Ready for Implementation  
**Estimated Duration:** 3-5 days

---

## 1. Implementation Overview

This plan breaks down the Interactive Tasks feature into sequential phases, each with specific tasks, acceptance criteria, and testing requirements.

### 1.1 Implementation Phases

```
Phase A: Database & Storage Setup (Day 1)
  └─> Create tables, RLS policies, storage bucket

Phase B: File Attachments (Days 1-2)
  └─> Upload, download, delete functionality

Phase C: Comments System (Days 2-3)
  └─> Post, edit, delete comments

Phase D: Real-time Integration (Day 3)
  └─> Supabase Realtime subscriptions

Phase E: UI Polish & Testing (Days 4-5)
  └─> Design system integration, error handling, testing
```

---

## 2. Phase A: Database & Storage Setup

**Duration:** 4-6 hours  
**Priority:** Critical (Blocking)

### 2.1 Tasks

#### A1: Create Migration File
**File:** `supabase/migrations/015_interactive_tasks_setup.sql`

**Content:**
- Create `task_attachments` table with all columns and constraints
- Create `task_comments` table with all columns and constraints
- Create indexes for performance
- Add RLS policies for both tables
- Create Supabase Storage bucket `task-attachments`
- Add Storage RLS policies

**Acceptance Criteria:**
- [ ] Migration file runs without errors
- [ ] All tables created successfully
- [ ] All indexes created
- [ ] RLS enabled on both tables
- [ ] Storage bucket created
- [ ] Storage policies applied

#### A2: Apply Migration
**Command:** Run migration against Supabase

**Acceptance Criteria:**
- [ ] Migration applied to development database
- [ ] Verify tables exist in Supabase dashboard
- [ ] Verify RLS policies are active
- [ ] Verify storage bucket is visible

#### A3: Test RLS Policies
**Method:** Manual testing with different user roles

**Test Cases:**
- [ ] Teacher can view all attachments on their tasks
- [ ] Student can view teacher materials on assigned tasks
- [ ] Student cannot view other students' submissions
- [ ] Teacher can upload to their tasks
- [ ] Student can upload submissions to assigned tasks
- [ ] Users can only delete their own uploads

### 2.2 Deliverables
- ✅ Database tables created
- ✅ RLS policies configured
- ✅ Storage bucket configured
- ✅ Manual RLS testing passed

---

## 3. Phase B: File Attachments

**Duration:** 8-12 hours  
**Priority:** High

### 3.1 Tasks

#### B1: Create useTaskAttachments Hook
**File:** `src/hooks/useTaskAttachments.ts`

**Implementation:**
- `fetchAttachments()` - Query task_attachments with joins
- `uploadFile()` - Upload to storage + create DB record
- `deleteFile()` - Remove from storage + DB
- `downloadFile()` - Generate signed URL + trigger download
- Error handling for all operations
- Loading states

**Acceptance Criteria:**
- [ ] Hook fetches attachments on mount
- [ ] Upload creates storage file and DB record atomically
- [ ] Delete removes both storage and DB entry
- [ ] Download generates working signed URL
- [ ] Errors are caught and returned to caller
- [ ] Loading states update correctly

#### B2: Create FileUploadButton Component
**File:** `src/components/FileUploadButton.tsx`

**Features:**
- File input with type restrictions
- File size validation (max 10 MB)
- Upload progress indicator
- Success/error toast messages
- Elegant design (primary button style)

**Acceptance Criteria:**
- [ ] Button opens file picker
- [ ] File type validation works
- [ ] File size validation works
- [ ] Progress indicator shows during upload
- [ ] Success message on completion
- [ ] Error message on failure

#### B3: Create AttachmentItem Component
**File:** `src/components/AttachmentItem.tsx`

**Features:**
- Display file name, type icon, size, uploader, date
- Download button
- Delete button (conditional)
- Responsive layout
- Elegant card design

**Acceptance Criteria:**
- [ ] All file metadata displayed correctly
- [ ] File type icon matches file type
- [ ] File size formatted (e.g., "2.5 MB")
- [ ] Download button works
- [ ] Delete button only visible to owner
- [ ] Delete confirmation dialog works

#### B4: Create AttachmentsSection Component
**File:** `src/components/AttachmentsSection.tsx`

**Features:**
- Separate teacher materials and student submissions
- Conditional upload buttons based on role
- Empty states
- Collapsible sections (optional)

**Acceptance Criteria:**
- [ ] Teacher materials section always visible
- [ ] Student submissions section visible to teachers only
- [ ] Upload button visible based on user role
- [ ] Empty state messages display correctly
- [ ] Attachments list updates after upload/delete

#### B5: Test File Upload/Download Flow
**Method:** Manual testing

**Test Cases:**
- [ ] Teacher uploads PDF to task
- [ ] Student downloads teacher's PDF
- [ ] Student uploads submission
- [ ] Teacher sees student submission
- [ ] Teacher downloads student submission
- [ ] User deletes their own file
- [ ] File > 10 MB is rejected
- [ ] Invalid file type is rejected

### 3.2 Deliverables
- ✅ useTaskAttachments hook functional
- ✅ File upload component working
- ✅ File download working
- ✅ File deletion working
- ✅ All validation working

---

## 4. Phase C: Comments System

**Duration:** 8-12 hours  
**Priority:** High

### 4.1 Tasks

#### C1: Create useTaskComments Hook
**File:** `src/hooks/useTaskComments.ts`

**Implementation:**
- `fetchComments()` - Query task_comments with user joins
- `postComment()` - Insert new comment
- `editComment()` - Update existing comment
- `deleteComment()` - Delete comment
- `canEditComment()` - Check 5-minute edit window
- Error handling

**Acceptance Criteria:**
- [ ] Hook fetches comments on mount
- [ ] Comments sorted by created_at ASC
- [ ] Post comment creates DB record
- [ ] Edit comment updates content and is_edited flag
- [ ] Delete comment removes DB record
- [ ] Edit time validation works (5 minutes)

#### C2: Create CommentItem Component
**File:** `src/components/CommentItem.tsx`

**Features:**
- Display author name, role badge, timestamp, content
- Edit/Delete buttons (conditional)
- Inline edit mode
- "Edited" indicator
- Elegant card design

**Acceptance Criteria:**
- [ ] All comment data displayed correctly
- [ ] Role badge shows (Teacher/Student)
- [ ] Relative timestamp (e.g., "5 minutes ago")
- [ ] Edit button visible within 5 minutes
- [ ] Delete button visible to author + task creator
- [ ] Edit mode works correctly
- [ ] "Edited" label appears after edit

#### C3: Create CommentInput Component
**File:** `src/components/CommentInput.tsx`

**Features:**
- Textarea with auto-expand
- Character counter (max 1000)
- Post button (disabled when empty/over limit)
- Enter to submit (Shift+Enter for new line)
- Clear on successful post

**Acceptance Criteria:**
- [ ] Textarea expands as user types
- [ ] Character counter updates correctly
- [ ] Post button disabled when invalid
- [ ] Enter submits comment
- [ ] Shift+Enter adds line break
- [ ] Input clears after successful post
- [ ] Error handling works

#### C4: Create CommentsSection Component
**File:** `src/components/CommentsSection.tsx`

**Features:**
- Comments feed (scrollable)
- Comment input at bottom (fixed)
- Loading state
- Empty state ("No comments yet")
- Auto-scroll to bottom on new comment

**Acceptance Criteria:**
- [ ] Comments render in correct order
- [ ] Feed is scrollable
- [ ] Input stays at bottom
- [ ] Loading spinner shows initially
- [ ] Empty state displays when no comments
- [ ] Auto-scroll works on new comment

#### C5: Test Comment CRUD Operations
**Method:** Manual testing

**Test Cases:**
- [ ] User posts comment
- [ ] Comment appears immediately
- [ ] User edits comment within 5 minutes
- [ ] Edit button disappears after 5 minutes
- [ ] User deletes own comment
- [ ] Teacher deletes student comment on their task
- [ ] Character limit validation works
- [ ] Empty comment is rejected

### 4.2 Deliverables
- ✅ useTaskComments hook functional
- ✅ Comment posting working
- ✅ Comment editing working
- ✅ Comment deletion working
- ✅ All UI components working

---

## 5. Phase D: Real-time Integration

**Duration:** 4-6 hours  
**Priority:** High

### 5.1 Tasks

#### D1: Add Realtime Subscription to useTaskComments
**File:** `src/hooks/useTaskComments.ts`

**Implementation:**
- Create Supabase Realtime channel for task
- Subscribe to INSERT, UPDATE, DELETE events
- Handle payload and update state optimistically
- Auto-reconnect on disconnection
- Cleanup subscription on unmount

**Acceptance Criteria:**
- [ ] Subscription created on mount
- [ ] INSERT events add new comments instantly
- [ ] UPDATE events update existing comments
- [ ] DELETE events remove comments
- [ ] Subscription cleanup on unmount
- [ ] Auto-reconnect on network issues

#### D2: Test Real-time Updates
**Method:** Multi-user testing (2 browser windows)

**Test Cases:**
- [ ] User A posts comment, User B sees it instantly
- [ ] User A edits comment, User B sees update
- [ ] User A deletes comment, User B sees removal
- [ ] Latency < 500ms for all operations
- [ ] No duplicate comments appear
- [ ] Comments stay sorted after real-time updates

#### D3: Add Optimistic UI Updates
**Implementation:**
- Show comment immediately on post (before server confirms)
- Rollback if server rejects
- Show loading indicator during operation

**Acceptance Criteria:**
- [ ] Comment appears instantly on post
- [ ] Comment removed if server rejects
- [ ] Loading states don't block UI
- [ ] User can continue interacting during operations

### 5.2 Deliverables
- ✅ Real-time subscriptions working
- ✅ Multi-user testing passed
- ✅ Optimistic updates implemented
- ✅ Error handling for real-time failures

---

## 6. Phase E: TaskDrawer & Integration

**Duration:** 6-8 hours  
**Priority:** High

### 6.1 Tasks

#### E1: Create TaskDrawer Component
**File:** `src/components/TaskDrawer.tsx`

**Features:**
- Slide-in animation from right (300ms)
- Semi-transparent backdrop
- Fixed width on desktop (500px), full-width on mobile
- Close button + backdrop click + ESC key
- Header with task title
- Container for AttachmentsSection and CommentsSection

**Acceptance Criteria:**
- [ ] Drawer slides in smoothly
- [ ] Backdrop appears correctly
- [ ] Close methods all work
- [ ] Responsive sizing works
- [ ] Keyboard navigation works
- [ ] No scroll on body when drawer open

#### E2: Add Comments Button to Task Cards
**Files:** `src/components/TaskCard.tsx`, `src/pages/TeacherDashboard.tsx`, `src/pages/StudentDashboard.tsx`

**Features:**
- "Comments" button with MessageCircle icon
- Comment count badge (e.g., "3")
- Attachment indicator if task has attachments
- onClick opens drawer with task ID

**Acceptance Criteria:**
- [ ] Button appears on all task cards
- [ ] Comment count displays correctly
- [ ] Attachment icon appears when applicable
- [ ] Clicking opens drawer with correct task
- [ ] Button styling matches design system

#### E3: Integrate AttachmentsSection + CommentsSection
**File:** `src/components/TaskDrawer.tsx`

**Implementation:**
- Render AttachmentsSection at top
- Render CommentsSection below
- Pass taskId to both sections
- Handle loading states

**Acceptance Criteria:**
- [ ] Both sections render correctly
- [ ] Attachments section collapsible (optional)
- [ ] Comments section takes remaining height
- [ ] Scrolling works independently for each section

#### E4: Design System Polish
**Files:** All new components

**Tasks:**
- Apply Elegant Stitch color palette
- Use correct typography (text sizes, weights)
- Apply consistent spacing (padding, margins)
- Add hover states to interactive elements
- Add focus states for accessibility
- Ensure all icons from Lucide React

**Acceptance Criteria:**
- [ ] Colors match design system
- [ ] Typography consistent
- [ ] Spacing consistent
- [ ] Hover states work
- [ ] Focus states work
- [ ] Icons consistent

### 6.2 Deliverables
- ✅ TaskDrawer component complete
- ✅ Drawer integration with dashboards
- ✅ Design system applied consistently
- ✅ Responsive design working

---

## 7. Phase F: Testing & Refinement

**Duration:** 4-6 hours  
**Priority:** Medium

### 7.1 Tasks

#### F1: End-to-End Testing
**Method:** Manual testing of complete user flows

**Teacher Flow:**
1. [ ] Create new task
2. [ ] Open task drawer
3. [ ] Upload PDF worksheet
4. [ ] Post comment with instructions
5. [ ] Wait for student submission
6. [ ] View student submission
7. [ ] Download student file
8. [ ] Reply to student comment

**Student Flow:**
1. [ ] View assigned task
2. [ ] Open task drawer
3. [ ] Download teacher's worksheet
4. [ ] Upload completed homework
5. [ ] Post question in comments
6. [ ] See teacher's reply in real-time
7. [ ] Edit comment to add clarification

#### F2: Error Scenario Testing

**Test Cases:**
- [ ] Network disconnection during file upload
- [ ] Network disconnection during comment post
- [ ] Real-time subscription failure
- [ ] File too large error
- [ ] Invalid file type error
- [ ] Duplicate file name handling
- [ ] Comment over character limit
- [ ] Edit after 5-minute window

#### F3: Performance Testing

**Metrics:**
- [ ] Drawer opens in < 300ms
- [ ] Attachments load in < 1 second
- [ ] Comments load in < 1 second
- [ ] Real-time updates in < 500ms
- [ ] File upload progress indicator appears
- [ ] No UI blocking during async operations

#### F4: Accessibility Testing

**Checks:**
- [ ] Drawer keyboard navigable (Tab, ESC)
- [ ] All buttons have aria-labels
- [ ] File input has accessible label
- [ ] Error messages announced to screen readers
- [ ] Focus management on drawer open/close
- [ ] Color contrast meets WCAG AA

#### F5: Mobile Responsiveness Testing

**Test on:**
- [ ] Mobile (< 768px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (> 1024px)

**Checks:**
- [ ] Drawer full-width on mobile
- [ ] Touch targets minimum 44x44px
- [ ] Scrolling works smoothly
- [ ] No horizontal overflow
- [ ] Text readable on small screens

### 7.2 Deliverables
- ✅ All user flows tested
- ✅ Error scenarios handled
- ✅ Performance metrics met
- ✅ Accessibility requirements met
- ✅ Mobile responsiveness verified

---

## 8. Deployment Checklist

### 8.1 Pre-Deployment

- [ ] All unit tests passing (if applicable)
- [ ] Manual testing complete
- [ ] Code review completed
- [ ] Migration tested on staging
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Build succeeds

### 8.2 Deployment Steps

1. [ ] Run migration on production database
2. [ ] Verify migration success
3. [ ] Deploy frontend changes
4. [ ] Verify real-time subscriptions work in production
5. [ ] Test file upload/download in production
6. [ ] Monitor Supabase logs for errors
7. [ ] Monitor browser console for errors

### 8.3 Post-Deployment

- [ ] Test teacher flow in production
- [ ] Test student flow in production
- [ ] Verify real-time updates working
- [ ] Check performance metrics
- [ ] Announce feature to users
- [ ] Monitor for bug reports

### 8.4 Rollback Plan

If critical issues occur:
1. Revert frontend deployment
2. Keep database migration (data is safe)
3. Investigate issues in development
4. Fix and redeploy

---

## 9. File Checklist

### 9.1 New Files to Create

**Database:**
- [ ] `supabase/migrations/015_interactive_tasks_setup.sql`

**Hooks:**
- [ ] `src/hooks/useTaskAttachments.ts`
- [ ] `src/hooks/useTaskComments.ts`

**Components:**
- [ ] `src/components/TaskDrawer.tsx`
- [ ] `src/components/AttachmentsSection.tsx`
- [ ] `src/components/AttachmentItem.tsx`
- [ ] `src/components/FileUploadButton.tsx`
- [ ] `src/components/CommentsSection.tsx`
- [ ] `src/components/CommentItem.tsx`
- [ ] `src/components/CommentInput.tsx`

**Types (optional):**
- [ ] `src/types/attachments.ts`
- [ ] `src/types/comments.ts`

### 9.2 Files to Modify

**Task Cards:**
- [ ] `src/components/TaskCard.tsx` - Add comments button

**Dashboards:**
- [ ] `src/pages/TeacherDashboard.tsx` - Add drawer state
- [ ] `src/pages/StudentDashboard.tsx` - Add drawer state

**Utilities (if needed):**
- [ ] `src/utils/fileHelpers.ts` - File validation, formatting
- [ ] `src/utils/dateHelpers.ts` - Relative time formatting

---

## 10. Success Criteria

The implementation is considered complete when:

1. **Functionality:**
   - [ ] Teachers can upload files to tasks
   - [ ] Students can upload submissions
   - [ ] Users can download files
   - [ ] Users can delete their own files
   - [ ] Users can post comments
   - [ ] Users can edit comments (within 5 minutes)
   - [ ] Users can delete comments
   - [ ] Real-time updates work reliably

2. **User Experience:**
   - [ ] Drawer animation is smooth
   - [ ] Design system consistency maintained
   - [ ] Error messages are helpful
   - [ ] Loading states are clear
   - [ ] Mobile experience is excellent

3. **Performance:**
   - [ ] All operations meet performance targets
   - [ ] No UI blocking
   - [ ] Real-time updates are fast

4. **Security:**
   - [ ] RLS policies prevent unauthorized access
   - [ ] Students cannot view other students' submissions
   - [ ] File uploads are validated

5. **Testing:**
   - [ ] All manual test cases passed
   - [ ] Multi-user testing successful
   - [ ] Error scenarios handled gracefully
   - [ ] Accessibility requirements met

---

## 11. Risk Mitigation

### 11.1 Technical Risks

**Risk:** Real-time subscriptions fail intermittently  
**Mitigation:** Implement fallback polling, auto-reconnect logic, user notification

**Risk:** File uploads fail for large files  
**Mitigation:** Clear error messages, suggest file compression, implement chunked uploads (future)

**Risk:** Storage costs increase significantly  
**Mitigation:** Monitor usage, set file size limits, implement cleanup policy (future)

### 11.2 User Experience Risks

**Risk:** Drawer feels slow or clunky  
**Mitigation:** Optimize animations, lazy load content, implement skeleton loaders

**Risk:** Users confused about attachment types  
**Mitigation:** Clear labels, helpful empty states, onboarding tooltips

**Risk:** Comment threads become overwhelming  
**Mitigation:** Implement pagination, collapsible older comments, future threaded replies

---

## 12. Future Enhancements

Features to consider after MVP launch:

1. **Rich Text Comments** - Markdown support, formatting toolbar
2. **@Mentions** - Notify specific users in comments
3. **File Preview** - Inline PDF viewer, image lightbox
4. **Drag & Drop Upload** - More intuitive file upload
5. **Notifications** - Email/in-app for new comments
6. **Comment Reactions** - Like/emoji reactions
7. **Threaded Replies** - Reply to specific comments
8. **File Versioning** - Replace old submissions
9. **Bulk Download** - Download all attachments at once
10. **Private Comments** - Teacher-only notes

---

**Implementation Plan Status:** ✅ Complete  
**Ready to Begin:** Phase A - Database & Storage Setup  
**Estimated Completion:** 3-5 days from start  
**Next Action:** Create migration file  
**Date:** 2025-11-10
