# Phase 8: Data Visualization - Requirements Document

**Date:** 2025-11-13  
**Status:** Planning Phase Complete  
**Approved By:** Product Manager

---

## Overview

This document captures the approved requirements for Phase 8: Data Visualization, which includes two major features:
1. **Analytics Dashboard** (Teacher-only page)
2. **Global Calendar** (All users)

---

## 1. Navigation Requirements

### Approved Solution
Add two new navigation links to the main header in `Layout.tsx`:

- **"Analytics"** link
  - Visibility: Teachers only
  - Route: `/analytics`
  - Position: In main navigation menu

- **"Calendar"** link
  - Visibility: All users (Teachers and Students)
  - Route: `/calendar`
  - Position: In main navigation menu

---

## 2. Analytics Dashboard - Data Requirements

### Overview
The `/analytics` page will display three data visualizations for teachers to monitor class performance.

### Approved Architecture
Create **three dedicated Supabase RPC functions** to provide optimized, aggregated data:

#### 2.1 Task Completion Rate (Pie Chart)
- **Function Name:** `get_task_completion_stats()`
- **Purpose:** Calculate overall task completion statistics
- **Expected Output:**
  - Number of completed tasks
  - Number of pending tasks
  - Number of overdue tasks
  - Completion percentage

#### 2.2 Student Engagement (Bar Chart)
- **Function Name:** `get_student_engagement_stats()`
- **Purpose:** Show engagement metrics per student
- **Expected Output:**
  - Student name
  - Total tasks assigned
  - Tasks completed
  - Average completion time
  - Engagement score

#### 2.3 Subject Performance (Radar Chart)
- **Function Name:** `get_subject_performance_stats()`
- **Purpose:** Visualize performance across different subjects
- **Expected Output:**
  - Subject name
  - Average completion rate per subject
  - Number of tasks per subject
  - Performance score per subject

### Technical Notes
- All RPC functions are **read-only** (SELECT operations only)
- Functions will implement proper RLS (Row Level Security)
- Functions will be optimized for performance with proper indexing
- Data aggregation happens on the database side for efficiency

---

## 3. Global Calendar - Data Requirements

### Overview
The `/calendar` page will display all tasks in a calendar view using `react-big-calendar`.

### Approved Architecture
Create **one dedicated Supabase RPC function**:

#### 3.1 Calendar Data Function
- **Function Name:** `get_all_tasks_for_calendar()`
- **Purpose:** Fetch all tasks formatted for calendar display
- **Expected Output Format:**
  ```typescript
  {
    id: string;           // task_id
    title: string;        // task title
    start: Date;          // task created_at or start date
    end: Date;            // task due_date
    subject: string;      // task subject
    status: string;       // task status (pending/completed/overdue)
    description: string;  // task description
  }
  ```

### Behavior
- **For Teachers:** Show all tasks they created
- **For Students:** Show all tasks assigned to them
- Data pre-formatted on server side for `react-big-calendar` compatibility

---

## 4. Calendar Interaction Requirements

### Event Click Behavior
When a user clicks on a task event in the calendar:

- **Action:** Open the existing `TaskDrawer` component
- **Purpose:** Display task details, comments, and attachments
- **Benefits:**
  - Consistent UX across the application
  - Code reuse (no duplicate components)
  - Familiar interface for users

### Technical Implementation
- Pass selected task ID to `TaskDrawer`
- `TaskDrawer` will fetch and display complete task information
- Maintain existing functionality: view details, add comments, manage attachments

---

## 5. Technology Stack

### Frontend Libraries (New Dependencies)
- **Chart Library:** `recharts` (for Pie, Bar, and Radar charts)
- **Calendar Library:** `react-big-calendar`
- **Date Utilities:** `date-fns` (for date formatting)

### Backend
- **Database Functions:** PostgreSQL RPC functions
- **API:** Supabase client with RLS policies

---

## 6. User Permissions

### Analytics Page (`/analytics`)
- **Access:** Teachers only
- **Authorization:** Check `profile.role === 'teacher'`
- **Redirect:** Students attempting to access will be redirected

### Calendar Page (`/calendar`)
- **Access:** All authenticated users
- **Data Filtering:** 
  - Teachers see all their created tasks
  - Students see only assigned tasks

---

## 7. Success Criteria

### Analytics Dashboard
- ✅ Three charts render with real-time data
- ✅ Data updates automatically when tasks change
- ✅ Teachers can view performance metrics at a glance
- ✅ Page is responsive and performant

### Global Calendar
- ✅ All tasks display correctly on calendar
- ✅ Tasks are color-coded by status
- ✅ Clicking a task opens the TaskDrawer
- ✅ Calendar is interactive and user-friendly
- ✅ Both teachers and students can use it effectively

---

## Next Steps

1. Create technical specification document
2. Design UI mockups for Analytics and Calendar pages
3. Implement database RPC functions
4. Build React components
5. Integrate with existing codebase
6. Test and verify functionality

---

**Requirements Approval:** ✅ Approved  
**Ready for Implementation Planning:** ✅ Yes
