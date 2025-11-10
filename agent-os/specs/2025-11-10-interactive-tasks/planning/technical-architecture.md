# Interactive Tasks - Technical Architecture

**Feature:** Phase 7 - Interactive Tasks (Attachments & Comments)  
**Date:** 2025-11-10  
**Status:** Architecture Design  
**Version:** 1.0

---

## 1. System Architecture Overview

This document defines the technical architecture for implementing file attachments and real-time commenting on tasks. The system integrates with Supabase Storage for file management and Supabase Realtime for live comment updates.

### 1.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
├─────────────────────────────────────────────────────────────┤
│  Task Card (Dashboard)                                      │
│    └─> "Comments" Button → Opens TaskDrawer                │
│                                                              │
│  TaskDrawer Component (Slide-over Panel)                    │
│    ├─> AttachmentsSection                                   │
│    │     ├─> Teacher Materials List                         │
│    │     ├─> Student Submissions List (if teacher)          │
│    │     └─> FileUploadButton                               │
│    └─> CommentsSection                                      │
│          ├─> CommentsFeed (Real-time)                       │
│          └─> CommentInput                                   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   Supabase Backend                          │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL Database                                        │
│    ├─> task_attachments table                              │
│    └─> task_comments table                                 │
│                                                              │
│  Supabase Storage                                           │
│    └─> task-attachments bucket                             │
│          └─> {task_id}/teacher/{files}                     │
│          └─> {task_id}/student/{student_id}/{files}        │
│                                                              │
│  Realtime Subscriptions                                     │
│    └─> task_comments:{task_id}                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Database Design

### 2.1 New Tables

**task_attachments**
```sql
CREATE TABLE task_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  attachment_type VARCHAR(20) NOT NULL CHECK (attachment_type IN ('teacher_material', 'student_submission')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX idx_task_attachments_uploaded_by ON task_attachments(uploaded_by);
```

**task_comments**
```sql
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (LENGTH(content) <= 1000),
  is_edited BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_task_comments_task_id_created ON task_comments(task_id, created_at);
CREATE INDEX idx_task_comments_user_id ON task_comments(user_id);
```

### 2.2 Row-Level Security (RLS) Policies

**task_attachments policies:**
```sql
-- Teachers can view all attachments on their tasks
CREATE POLICY "teachers_view_task_attachments"
ON task_attachments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = task_attachments.task_id
    AND tasks.teacher_id = auth.uid()
  )
);

-- Students can view teacher materials + their own submissions
CREATE POLICY "students_view_attachments"
ON task_attachments FOR SELECT
USING (
  attachment_type = 'teacher_material'
  AND EXISTS (
    SELECT 1 FROM task_assignments
    WHERE task_assignments.task_id = task_attachments.task_id
    AND task_assignments.student_id = auth.uid()
  )
  OR
  (uploaded_by = auth.uid())
);

-- Teachers can upload to their tasks
CREATE POLICY "teachers_upload_attachments"
ON task_attachments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = task_attachments.task_id
    AND tasks.teacher_id = auth.uid()
  )
);

-- Students can upload submissions to assigned tasks
CREATE POLICY "students_upload_submissions"
ON task_attachments FOR INSERT
WITH CHECK (
  attachment_type = 'student_submission'
  AND uploaded_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM task_assignments
    WHERE task_assignments.task_id = task_attachments.task_id
    AND task_assignments.student_id = auth.uid()
  )
);

-- Users can delete their own attachments
CREATE POLICY "users_delete_own_attachments"
ON task_attachments FOR DELETE
USING (uploaded_by = auth.uid());
```

**task_comments policies:**
```sql
-- Teachers can view comments on their tasks
CREATE POLICY "teachers_view_comments"
ON task_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = task_comments.task_id
    AND tasks.teacher_id = auth.uid()
  )
);

-- Students can view comments on assigned tasks
CREATE POLICY "students_view_comments"
ON task_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM task_assignments
    WHERE task_assignments.task_id = task_comments.task_id
    AND task_assignments.student_id = auth.uid()
  )
);

-- Users can post comments if they have access
CREATE POLICY "users_post_comments"
ON task_comments FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND (
    -- Teacher can comment on their tasks
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_comments.task_id
      AND tasks.teacher_id = auth.uid()
    )
    OR
    -- Student can comment on assigned tasks
    EXISTS (
      SELECT 1 FROM task_assignments
      WHERE task_assignments.task_id = task_comments.task_id
      AND task_assignments.student_id = auth.uid()
    )
  )
);

-- Users can update their own comments within 5 minutes
CREATE POLICY "users_edit_own_comments"
ON task_comments FOR UPDATE
USING (
  user_id = auth.uid()
  AND created_at > NOW() - INTERVAL '5 minutes'
);

-- Users can delete their own comments, or teachers can delete any on their tasks
CREATE POLICY "users_delete_comments"
ON task_comments FOR DELETE
USING (
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM tasks
    WHERE tasks.id = task_comments.task_id
    AND tasks.teacher_id = auth.uid()
  )
);
```

---

## 3. Supabase Storage Configuration

### 3.1 Bucket Setup

**Bucket Name:** `task-attachments`
- **Public:** false (requires authentication)
- **File size limit:** 10485760 bytes (10 MB)
- **Allowed MIME types:**
  - `application/pdf`
  - `application/msword`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - `image/jpeg`
  - `image/png`
  - `image/gif`
  - `text/plain`
  - `application/zip`

### 3.2 Storage Structure

```
task-attachments/
  {task_id}/
    teacher/
      {timestamp}_{filename}
    student/
      {student_id}/
        {timestamp}_{filename}
```

### 3.3 Storage RLS Policies

```sql
-- Teachers can read all files in their task folders
CREATE POLICY "teachers_read_task_files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'task-attachments'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM tasks WHERE teacher_id = auth.uid()
  )
);

-- Students can read teacher materials and their own submissions
CREATE POLICY "students_read_files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'task-attachments'
  AND (
    -- Teacher materials
    (storage.foldername(name))[2] = 'teacher'
    OR
    -- Own submissions
    (storage.foldername(name))[3] = auth.uid()::text
  )
  AND (storage.foldername(name))[1] IN (
    SELECT task_id::text FROM task_assignments WHERE student_id = auth.uid()
  )
);

-- Teachers can upload to their task folders
CREATE POLICY "teachers_upload_files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'task-attachments'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM tasks WHERE teacher_id = auth.uid()
  )
);

-- Students can upload to their submission folders
CREATE POLICY "students_upload_files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'task-attachments'
  AND (storage.foldername(name))[2] = 'student'
  AND (storage.foldername(name))[3] = auth.uid()::text
  AND (storage.foldername(name))[1] IN (
    SELECT task_id::text FROM task_assignments WHERE student_id = auth.uid()
  )
);

-- Users can delete their own files
CREATE POLICY "users_delete_own_files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'task-attachments'
  AND (
    -- Teacher owns the task
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM tasks WHERE teacher_id = auth.uid()
    )
    AND (storage.foldername(name))[2] = 'teacher'
    OR
    -- Student owns the submission
    (storage.foldername(name))[3] = auth.uid()::text
  )
);
```

---

## 4. Frontend Components

### 4.1 Component Hierarchy

```
TaskCard.tsx (existing)
  └─> Button onClick={() => setDrawerOpen(true)}

TaskDrawer.tsx (new)
  ├─> Header
  │     ├─> Task Title
  │     └─> Close Button
  ├─> AttachmentsSection.tsx (new)
  │     ├─> FileUploadButton.tsx (new) [conditional]
  │     └─> AttachmentItem.tsx (new) [list]
  └─> CommentsSection.tsx (new)
        ├─> CommentsFeed
        │     └─> CommentItem.tsx (new) [list]
        └─> CommentInput.tsx (new)
```

### 4.2 Component Specifications

**TaskDrawer.tsx**
```typescript
interface TaskDrawerProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDrawer({ taskId, isOpen, onClose }: TaskDrawerProps) {
  const { task } = useTask(taskId);
  const { user, profile } = useAuth();

  return (
    <Drawer isOpen={isOpen} onClose={onClose} position="right">
      <DrawerHeader>
        <h2>{task?.title}</h2>
        <button onClick={onClose}>×</button>
      </DrawerHeader>
      
      <AttachmentsSection taskId={taskId} />
      <CommentsSection taskId={taskId} />
    </Drawer>
  );
}
```

**AttachmentsSection.tsx**
```typescript
interface AttachmentsSectionProps {
  taskId: string;
}

export function AttachmentsSection({ taskId }: AttachmentsSectionProps) {
  const { attachments, loading, uploadFile, deleteFile } = useTaskAttachments(taskId);
  const { profile } = useAuth();

  const teacherAttachments = attachments.filter(
    a => a.attachment_type === 'teacher_material'
  );
  const studentSubmissions = attachments.filter(
    a => a.attachment_type === 'student_submission'
  );

  return (
    <div className="attachments-section">
      <h3>Attachments</h3>
      
      {/* Teacher Materials */}
      <div>
        <h4>Teacher Materials</h4>
        {teacherAttachments.map(attachment => (
          <AttachmentItem key={attachment.id} attachment={attachment} />
        ))}
        {profile?.role === 'teacher' && (
          <FileUploadButton onUpload={uploadFile} type="teacher_material" />
        )}
      </div>

      {/* Student Submissions */}
      {profile?.role === 'teacher' && studentSubmissions.length > 0 && (
        <div>
          <h4>Student Submissions</h4>
          {studentSubmissions.map(attachment => (
            <AttachmentItem key={attachment.id} attachment={attachment} />
          ))}
        </div>
      )}

      {/* Student Upload */}
      {profile?.role === 'student' && (
        <div>
          <h4>My Submission</h4>
          {studentSubmissions
            .filter(a => a.uploaded_by === profile.id)
            .map(attachment => (
              <AttachmentItem key={attachment.id} attachment={attachment} />
            ))}
          <FileUploadButton onUpload={uploadFile} type="student_submission" />
        </div>
      )}
    </div>
  );
}
```

**CommentsSection.tsx**
```typescript
interface CommentsSectionProps {
  taskId: string;
}

export function CommentsSection({ taskId }: CommentsSectionProps) {
  const {
    comments,
    loading,
    postComment,
    editComment,
    deleteComment
  } = useTaskComments(taskId);

  return (
    <div className="comments-section">
      <h3>Comments</h3>
      
      <CommentsFeed comments={comments} loading={loading} />
      
      <CommentInput onSubmit={postComment} />
    </div>
  );
}
```

---

## 5. Custom Hooks

### 5.1 useTaskAttachments

```typescript
interface Attachment {
  id: string;
  task_id: string;
  uploaded_by: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  attachment_type: 'teacher_material' | 'student_submission';
  created_at: string;
  uploader?: Profile;
}

export function useTaskAttachments(taskId: string) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Fetch attachments
  useEffect(() => {
    fetchAttachments();
  }, [taskId]);

  const fetchAttachments = async () => {
    const { data, error } = await supabase
      .from('task_attachments')
      .select('*, uploader:profiles(*)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (data) setAttachments(data);
    setLoading(false);
  };

  const uploadFile = async (file: File, type: 'teacher_material' | 'student_submission') => {
    setUploading(true);
    const timestamp = Date.now();
    const filePath = generateFilePath(taskId, type, file.name, timestamp);

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('task-attachments')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Create database record
    const { error: dbError } = await supabase
      .from('task_attachments')
      .insert({
        task_id: taskId,
        uploaded_by: user.id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        attachment_type: type
      });

    if (dbError) throw dbError;

    await fetchAttachments();
    setUploading(false);
  };

  const deleteFile = async (attachmentId: string, filePath: string) => {
    // Delete from storage
    await supabase.storage
      .from('task-attachments')
      .remove([filePath]);

    // Delete from database
    await supabase
      .from('task_attachments')
      .delete()
      .eq('id', attachmentId);

    await fetchAttachments();
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    const { data } = await supabase.storage
      .from('task-attachments')
      .download(filePath);

    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
  };

  return {
    attachments,
    loading,
    uploading,
    uploadFile,
    deleteFile,
    downloadFile
  };
}
```

### 5.2 useTaskComments

```typescript
interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  user?: Profile;
}

export function useTaskComments(taskId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial comments
  useEffect(() => {
    fetchComments();
    subscribeToComments();
  }, [taskId]);

  const fetchComments = async () => {
    const { data } = await supabase
      .from('task_comments')
      .select('*, user:profiles(*)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (data) setComments(data);
    setLoading(false);
  };

  // Real-time subscription
  const subscribeToComments = () => {
    const subscription = supabase
      .channel(`task_comments:${taskId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_comments',
          filter: `task_id=eq.${taskId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            fetchComments(); // Refetch to get user data
          } else if (payload.eventType === 'UPDATE') {
            setComments(prev =>
              prev.map(c => c.id === payload.new.id ? { ...c, ...payload.new } : c)
            );
          } else if (payload.eventType === 'DELETE') {
            setComments(prev => prev.filter(c => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const postComment = async (content: string) => {
    const { error } = await supabase
      .from('task_comments')
      .insert({
        task_id: taskId,
        user_id: user.id,
        content
      });

    if (error) throw error;
  };

  const editComment = async (commentId: string, newContent: string) => {
    const { error } = await supabase
      .from('task_comments')
      .update({
        content: newContent,
        is_edited: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId);

    if (error) throw error;
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('task_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  };

  return {
    comments,
    loading,
    postComment,
    editComment,
    deleteComment
  };
}
```

---

## 6. Design System Integration

All components must follow the **Elegant Stitch** design system as defined in the UI refactoring memory:

### 6.1 Color Palette
- Background: `bg-background-dark`, `bg-component-dark`
- Text: `text-text-primary-dark`, `text-text-secondary-dark`
- Borders: `border-border-dark`
- Primary: `bg-primary text-white`
- Success: `bg-green-500/20 text-green-300`
- Error: `bg-red-500/20 text-red-300`

### 6.2 Component Styling
- Buttons: `bg-primary text-white rounded-lg hover:bg-primary/90`
- Cards: `bg-component-dark rounded-lg shadow-md border border-border-dark`
- Inputs: `bg-background-dark border border-border-dark rounded-lg`
- Drawer: Full-height, fixed position, smooth slide animation (300ms)

### 6.3 Icons
Use **Lucide React** icons:
- Upload: `Upload`
- Download: `Download`
- Delete: `Trash2`
- Comment: `MessageCircle`
- Attachment: `Paperclip`
- Close: `X`
- Edit: `Edit`

---

## 7. Error Handling

### 7.1 File Upload Errors
- **File too large:** "File size exceeds 10 MB limit"
- **Invalid file type:** "File type not allowed. Supported: PDF, DOC, DOCX, images, TXT, ZIP"
- **Upload failed:** "Failed to upload file. Please try again."
- **Permission denied:** "You don't have permission to upload files to this task"

### 7.2 Comment Errors
- **Post failed:** "Failed to post comment. Please try again."
- **Edit timeout:** "Comments can only be edited within 5 minutes of posting"
- **Delete failed:** "Failed to delete comment"
- **Permission denied:** "You don't have permission to perform this action"

### 7.3 Real-time Errors
- **Connection lost:** Show reconnection indicator
- **Subscription failed:** Fall back to polling (refresh every 10 seconds)

---

## 8. Performance Optimization

### 8.1 Frontend Optimization
- Lazy load drawer component (only load when opened)
- Virtualize comments list if > 50 comments
- Debounce comment input validation (300ms)
- Cache attachment download URLs (5 minutes)
- Optimistic UI updates for comments

### 8.2 Database Optimization
- Index on `task_id` for fast attachment/comment queries
- Compound index on `task_id, created_at` for sorted comment queries
- Limit comment fetch to most recent 100 (pagination for older)

### 8.3 Storage Optimization
- Generate signed URLs for private file access
- Cache signed URLs on frontend (1 hour expiry)
- Use progressive file upload for large files (future)

---

**Architecture Status:** ✅ Complete  
**Next Step:** Create Implementation Plan  
**Reviewed By:** Senior Architect  
**Date:** 2025-11-10
