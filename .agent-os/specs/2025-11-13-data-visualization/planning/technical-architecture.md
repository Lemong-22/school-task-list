# Phase 8: Data Visualization - Technical Architecture

**Date:** 2025-11-13  
**Status:** Planning Phase  
**Feature:** Analytics Dashboard & Global Calendar

---

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Database Layer](#database-layer)
3. [Frontend Layer](#frontend-layer)
4. [Data Flow](#data-flow)
5. [Security & Permissions](#security--permissions)

---

## System Architecture Overview

This feature introduces two new pages with distinct data requirements:

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
├──────────────────────┬──────────────────────────────────────┤
│  /analytics          │  /calendar                           │
│  (Teachers Only)     │  (All Users)                         │
│                      │                                      │
│  - Pie Chart         │  - react-big-calendar                │
│  - Bar Chart         │  - Task Event Display                │
│  - Radar Chart       │  - TaskDrawer Integration            │
└──────────┬───────────┴────────────┬─────────────────────────┘
           │                        │
           │    Supabase Client     │
           │                        │
┌──────────┴────────────────────────┴─────────────────────────┐
│                  Database Layer (PostgreSQL)                 │
├──────────────────────────────────────────────────────────────┤
│  RPC Functions:                                              │
│  1. get_task_completion_stats()                              │
│  2. get_student_engagement_stats()                           │
│  3. get_subject_performance_stats()                          │
│  4. get_all_tasks_for_calendar()                             │
└──────────────────────────────────────────────────────────────┘
```

---

## Database Layer

### Migration File: `026_analytics_calendar_functions.sql`

Complete SQL implementation for all four RPC functions:

```sql
-- ============================================================================
-- Migration: 026_analytics_calendar_functions.sql
-- Description: Add analytics and calendar RPC functions for data visualization
-- Date: 2025-11-13
-- Phase: Phase 8 - Data Visualization
-- ============================================================================

BEGIN;

-- ============================================================================
-- SECTION 1: Performance Indexes (if not already exist)
-- ============================================================================

-- Ensure we have indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_task_assignments_task_id_completed 
ON task_assignments(task_id, is_completed);

CREATE INDEX IF NOT EXISTS idx_tasks_teacher_subject 
ON tasks(teacher_id, subject);

-- ============================================================================
-- SECTION 2: Analytics Functions (Teacher Only)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- FUNCTION 1: get_task_completion_stats
-- Purpose: Calculate overall task completion statistics for pie chart
-- Returns: Completion rate breakdown (completed, pending, overdue)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_task_completion_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_teacher_id UUID;
  v_total_tasks INTEGER;
  v_completed_tasks INTEGER;
  v_pending_tasks INTEGER;
  v_overdue_tasks INTEGER;
  v_completion_percentage NUMERIC;
  v_result JSON;
BEGIN
  -- Get current user ID
  v_teacher_id := auth.uid();
  
  -- Security check: Only teachers can access analytics
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = v_teacher_id AND role = 'teacher'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only teachers can view analytics';
  END IF;
  
  -- Get total tasks created by this teacher
  SELECT COUNT(*)
  INTO v_total_tasks
  FROM tasks
  WHERE teacher_id = v_teacher_id;
  
  -- If no tasks, return empty stats
  IF v_total_tasks = 0 THEN
    RETURN json_build_object(
      'total_tasks', 0,
      'completed_tasks', 0,
      'pending_tasks', 0,
      'overdue_tasks', 0,
      'completion_percentage', 0
    );
  END IF;
  
  -- Count completed tasks (at least one student completed it)
  SELECT COUNT(DISTINCT t.id)
  INTO v_completed_tasks
  FROM tasks t
  INNER JOIN task_assignments ta ON ta.task_id = t.id
  WHERE t.teacher_id = v_teacher_id
    AND ta.is_completed = TRUE;
  
  -- Count overdue tasks (due date passed, not all students completed)
  SELECT COUNT(DISTINCT t.id)
  INTO v_overdue_tasks
  FROM tasks t
  WHERE t.teacher_id = v_teacher_id
    AND t.due_date < NOW()
    AND EXISTS (
      SELECT 1 FROM task_assignments ta
      WHERE ta.task_id = t.id AND ta.is_completed = FALSE
    );
  
  -- Pending tasks = total - completed - overdue
  v_pending_tasks := v_total_tasks - v_completed_tasks - v_overdue_tasks;
  
  -- Ensure no negative values
  IF v_pending_tasks < 0 THEN
    v_pending_tasks := 0;
  END IF;
  
  -- Calculate completion percentage
  v_completion_percentage := ROUND(
    (v_completed_tasks::NUMERIC / v_total_tasks::NUMERIC) * 100, 
    2
  );
  
  -- Build JSON result
  v_result := json_build_object(
    'total_tasks', v_total_tasks,
    'completed_tasks', v_completed_tasks,
    'pending_tasks', v_pending_tasks,
    'overdue_tasks', v_overdue_tasks,
    'completion_percentage', v_completion_percentage
  );
  
  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION get_task_completion_stats IS
'Returns task completion statistics for analytics pie chart (teachers only)';

-- ----------------------------------------------------------------------------
-- FUNCTION 2: get_student_engagement_stats
-- Purpose: Calculate engagement metrics per student for bar chart
-- Returns: Array of student engagement data
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_student_engagement_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_teacher_id UUID;
  v_result JSON;
BEGIN
  -- Get current user ID
  v_teacher_id := auth.uid();
  
  -- Security check: Only teachers can access analytics
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = v_teacher_id AND role = 'teacher'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only teachers can view analytics';
  END IF;
  
  -- Build student engagement data
  SELECT json_agg(
    json_build_object(
      'student_id', p.id,
      'student_name', p.full_name,
      'total_assigned', COALESCE(stats.total_assigned, 0),
      'total_completed', COALESCE(stats.total_completed, 0),
      'completion_rate', COALESCE(stats.completion_rate, 0),
      'on_time_rate', COALESCE(stats.on_time_rate, 0),
      'engagement_score', COALESCE(stats.engagement_score, 0)
    )
    ORDER BY stats.engagement_score DESC NULLS LAST, p.full_name
  )
  INTO v_result
  FROM profiles p
  LEFT JOIN (
    SELECT 
      ta.student_id,
      COUNT(*) as total_assigned,
      COUNT(*) FILTER (WHERE ta.is_completed = TRUE) as total_completed,
      ROUND(
        (COUNT(*) FILTER (WHERE ta.is_completed = TRUE)::NUMERIC / 
         NULLIF(COUNT(*)::NUMERIC, 0)) * 100, 
        2
      ) as completion_rate,
      ROUND(
        (COUNT(*) FILTER (WHERE ta.is_completed = TRUE AND ta.completed_at <= t.due_date)::NUMERIC / 
         NULLIF(COUNT(*) FILTER (WHERE ta.is_completed = TRUE)::NUMERIC, 0)) * 100,
        2
      ) as on_time_rate,
      -- Engagement score: weighted average of completion and timeliness
      ROUND(
        (
          (COUNT(*) FILTER (WHERE ta.is_completed = TRUE)::NUMERIC / 
           NULLIF(COUNT(*)::NUMERIC, 0)) * 0.6 +
          (COUNT(*) FILTER (WHERE ta.is_completed = TRUE AND ta.completed_at <= t.due_date)::NUMERIC / 
           NULLIF(COUNT(*) FILTER (WHERE ta.is_completed = TRUE)::NUMERIC, 0)) * 0.4
        ) * 100,
        2
      ) as engagement_score
    FROM task_assignments ta
    INNER JOIN tasks t ON t.id = ta.task_id
    WHERE t.teacher_id = v_teacher_id
    GROUP BY ta.student_id
  ) stats ON stats.student_id = p.id
  WHERE p.role = 'student'
    AND (stats.total_assigned > 0 OR stats.total_assigned IS NULL);
  
  RETURN COALESCE(v_result, '[]'::JSON);
END;
$$;

COMMENT ON FUNCTION get_student_engagement_stats IS
'Returns student engagement metrics for analytics bar chart (teachers only)';

-- ----------------------------------------------------------------------------
-- FUNCTION 3: get_subject_performance_stats
-- Purpose: Calculate performance metrics per subject for radar chart
-- Returns: Array of subject performance data
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_subject_performance_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_teacher_id UUID;
  v_result JSON;
BEGIN
  -- Get current user ID
  v_teacher_id := auth.uid();
  
  -- Security check: Only teachers can access analytics
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = v_teacher_id AND role = 'teacher'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only teachers can view analytics';
  END IF;
  
  -- Build subject performance data
  SELECT json_agg(
    json_build_object(
      'subject', subject,
      'total_tasks', total_tasks,
      'avg_completion_rate', avg_completion_rate,
      'avg_on_time_rate', avg_on_time_rate,
      'performance_score', performance_score
    )
    ORDER BY performance_score DESC
  )
  INTO v_result
  FROM (
    SELECT 
      t.subject,
      COUNT(DISTINCT t.id) as total_tasks,
      ROUND(
        AVG(
          (SELECT COUNT(*) FILTER (WHERE ta.is_completed = TRUE)::NUMERIC / 
           NULLIF(COUNT(*)::NUMERIC, 0)
           FROM task_assignments ta WHERE ta.task_id = t.id)
        ) * 100,
        2
      ) as avg_completion_rate,
      ROUND(
        AVG(
          (SELECT COUNT(*) FILTER (WHERE ta.is_completed = TRUE AND ta.completed_at <= t.due_date)::NUMERIC / 
           NULLIF(COUNT(*) FILTER (WHERE ta.is_completed = TRUE)::NUMERIC, 0)
           FROM task_assignments ta WHERE ta.task_id = t.id)
        ) * 100,
        2
      ) as avg_on_time_rate,
      -- Performance score: weighted average
      ROUND(
        (
          AVG(
            (SELECT COUNT(*) FILTER (WHERE ta.is_completed = TRUE)::NUMERIC / 
             NULLIF(COUNT(*)::NUMERIC, 0)
             FROM task_assignments ta WHERE ta.task_id = t.id)
          ) * 0.6 +
          AVG(
            (SELECT COUNT(*) FILTER (WHERE ta.is_completed = TRUE AND ta.completed_at <= t.due_date)::NUMERIC / 
             NULLIF(COUNT(*) FILTER (WHERE ta.is_completed = TRUE)::NUMERIC, 0)
             FROM task_assignments ta WHERE ta.task_id = t.id)
          ) * 0.4
        ) * 100,
        2
      ) as performance_score
    FROM tasks t
    WHERE t.teacher_id = v_teacher_id
    GROUP BY t.subject
    HAVING COUNT(DISTINCT t.id) > 0
  ) subject_stats;
  
  RETURN COALESCE(v_result, '[]'::JSON);
END;
$$;

COMMENT ON FUNCTION get_subject_performance_stats IS
'Returns subject performance metrics for analytics radar chart (teachers only)';

-- ============================================================================
-- SECTION 3: Calendar Function (All Users)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- FUNCTION 4: get_all_tasks_for_calendar
-- Purpose: Fetch all tasks formatted for react-big-calendar
-- Returns: Array of task events with start/end dates
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_all_tasks_for_calendar()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_user_role TEXT;
  v_result JSON;
BEGIN
  -- Get current user ID and role
  v_user_id := auth.uid();
  
  SELECT role INTO v_user_role
  FROM profiles
  WHERE id = v_user_id;
  
  IF v_user_role IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  -- Teachers: Get all tasks they created
  IF v_user_role = 'teacher' THEN
    SELECT json_agg(
      json_build_object(
        'id', t.id,
        'title', t.title,
        'description', t.description,
        'subject', t.subject,
        'start', t.created_at,
        'end', t.due_date,
        'due_date', t.due_date,
        'coin_reward', t.coin_reward,
        'teacher_id', t.teacher_id,
        'status', CASE
          WHEN t.due_date < NOW() THEN 'overdue'
          WHEN EXISTS (
            SELECT 1 FROM task_assignments ta 
            WHERE ta.task_id = t.id AND ta.is_completed = TRUE
          ) THEN 'completed'
          ELSE 'pending'
        END,
        'completion_count', (
          SELECT COUNT(*) FROM task_assignments ta
          WHERE ta.task_id = t.id AND ta.is_completed = TRUE
        ),
        'total_assigned', (
          SELECT COUNT(*) FROM task_assignments ta
          WHERE ta.task_id = t.id
        )
      )
      ORDER BY t.due_date DESC
    )
    INTO v_result
    FROM tasks t
    WHERE t.teacher_id = v_user_id;
    
  -- Students: Get all tasks assigned to them
  ELSE
    SELECT json_agg(
      json_build_object(
        'id', t.id,
        'title', t.title,
        'description', t.description,
        'subject', t.subject,
        'start', t.created_at,
        'end', t.due_date,
        'due_date', t.due_date,
        'coin_reward', t.coin_reward,
        'teacher_id', t.teacher_id,
        'status', CASE
          WHEN ta.is_completed = TRUE THEN 'completed'
          WHEN t.due_date < NOW() THEN 'overdue'
          ELSE 'pending'
        END,
        'is_completed', ta.is_completed,
        'completed_at', ta.completed_at,
        'assignment_id', ta.id
      )
      ORDER BY t.due_date DESC
    )
    INTO v_result
    FROM task_assignments ta
    INNER JOIN tasks t ON t.id = ta.task_id
    WHERE ta.student_id = v_user_id;
  END IF;
  
  RETURN COALESCE(v_result, '[]'::JSON);
END;
$$;

COMMENT ON FUNCTION get_all_tasks_for_calendar IS
'Returns all tasks formatted for calendar display (role-based filtering)';

-- ============================================================================
-- SECTION 4: Grant Permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION get_task_completion_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_student_engagement_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_subject_performance_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_tasks_for_calendar TO authenticated;

-- ============================================================================
-- SECTION 5: Verification
-- ============================================================================

DO $$ 
BEGIN
  -- Verify all functions were created
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_task_completion_stats') THEN
    RAISE EXCEPTION 'Function get_task_completion_stats was not created';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_student_engagement_stats') THEN
    RAISE EXCEPTION 'Function get_student_engagement_stats was not created';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_subject_performance_stats') THEN
    RAISE EXCEPTION 'Function get_subject_performance_stats was not created';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_all_tasks_for_calendar') THEN
    RAISE EXCEPTION 'Function get_all_tasks_for_calendar was not created';
  END IF;
  
  RAISE NOTICE 'All analytics and calendar functions created successfully';
END $$;

COMMIT;
```

---

## Frontend Layer

### Component Architecture

```
src/
├── pages/
│   ├── AnalyticsDashboard.tsx          # Main analytics page (Teacher only)
│   └── CalendarPage.tsx                 # Calendar view page (All users)
├── components/
│   ├── charts/
│   │   ├── CompletionPieChart.tsx       # Task completion pie chart
│   │   ├── EngagementBarChart.tsx       # Student engagement bar chart
│   │   └── SubjectRadarChart.tsx        # Subject performance radar chart
│   └── Layout.tsx                       # Updated with new nav links
├── hooks/
│   ├── useAnalytics.ts                  # Hook for analytics data
│   └── useCalendarTasks.ts              # Hook for calendar events
├── services/
│   └── analyticsService.ts              # Analytics API calls
└── types/
    ├── analytics.ts                     # Analytics type definitions
    └── calendar.ts                      # Calendar event types
```

### Type Definitions

#### `src/types/analytics.ts`

```typescript
export interface TaskCompletionStats {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  completion_percentage: number;
}

export interface StudentEngagement {
  student_id: string;
  student_name: string;
  total_assigned: number;
  total_completed: number;
  completion_rate: number;
  on_time_rate: number;
  engagement_score: number;
}

export interface SubjectPerformance {
  subject: string;
  total_tasks: number;
  avg_completion_rate: number;
  avg_on_time_rate: number;
  performance_score: number;
}

export interface AnalyticsData {
  completionStats: TaskCompletionStats;
  studentEngagement: StudentEngagement[];
  subjectPerformance: SubjectPerformance[];
}
```

#### `src/types/calendar.ts`

```typescript
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  subject: string;
  start: Date;
  end: Date;
  due_date: Date;
  coin_reward: number;
  teacher_id: string;
  status: 'pending' | 'completed' | 'overdue';
  
  // Teacher-specific fields
  completion_count?: number;
  total_assigned?: number;
  
  // Student-specific fields
  is_completed?: boolean;
  completed_at?: Date | null;
  assignment_id?: string;
}
```

### React Components

#### `src/pages/AnalyticsDashboard.tsx`

```typescript
interface AnalyticsDashboardProps {}

export function AnalyticsDashboard(): JSX.Element {
  // Props: None (uses auth context for teacher ID)
  // State:
  //   - analyticsData: AnalyticsData | null
  //   - isLoading: boolean
  //   - error: string | null
  
  // Hooks:
  //   - useAnalytics() - Custom hook to fetch analytics data
  //   - useAuth() - Get current teacher context
  
  // Behavior:
  //   - Fetch analytics data on mount
  //   - Show loading spinner while fetching
  //   - Display error message if fetch fails
  //   - Render three charts when data is available
  //   - Auto-refresh data every 30 seconds (optional)
}
```

#### `src/pages/CalendarPage.tsx`

```typescript
interface CalendarPageProps {}

export function CalendarPage(): JSX.Element {
  // Props: None (uses auth context for user ID/role)
  // State:
  //   - events: CalendarEvent[]
  //   - selectedTask: CalendarEvent | null
  //   - isDrawerOpen: boolean
  //   - isLoading: boolean
  
  // Hooks:
  //   - useCalendarTasks() - Custom hook to fetch calendar events
  //   - useAuth() - Get current user context
  
  // Calendar Configuration:
  //   - localizer: dateFnsLocalizer
  //   - views: ['month', 'week', 'day', 'agenda']
  //   - defaultView: 'month'
  //   - eventPropGetter: Custom styling based on status
  
  // Behavior:
  //   - Fetch calendar events on mount
  //   - Handle event click → open TaskDrawer with selected task
  //   - Color-code events by status:
  //     * completed: green
  //     * pending: blue (primary)
  //     * overdue: red
  //   - Pass to TaskDrawer: taskId, taskTitle, taskTeacherId
}
```

#### `src/components/charts/CompletionPieChart.tsx`

```typescript
interface CompletionPieChartProps {
  data: TaskCompletionStats;
}

export function CompletionPieChart({ data }: CompletionPieChartProps): JSX.Element {
  // Library: recharts
  // Chart Type: PieChart with custom labels
  
  // Data transformation:
  //   - Convert TaskCompletionStats to pie chart format
  //   - [
  //       { name: 'Completed', value: data.completed_tasks, fill: '#10B981' },
  //       { name: 'Pending', value: data.pending_tasks, fill: '#4F46E5' },
  //       { name: 'Overdue', value: data.overdue_tasks, fill: '#EF4444' }
  //     ]
  
  // Styling:
  //   - Theme colors from tailwind.config.js
  //   - Custom labels with percentages
  //   - Responsive container (width: 100%, height: 300px)
}
```

#### `src/components/charts/EngagementBarChart.tsx`

```typescript
interface EngagementBarChartProps {
  data: StudentEngagement[];
}

export function EngagementBarChart({ data }: EngagementBarChartProps): JSX.Element {
  // Library: recharts
  // Chart Type: BarChart with stacked bars
  
  // Data: StudentEngagement[] (sorted by engagement_score DESC)
  // X-axis: student_name (truncate if > 15 chars)
  // Y-axis: engagement_score (0-100)
  
  // Bars:
  //   - Completion rate (gradient blue)
  //   - On-time rate (gradient green)
  
  // Tooltip: Show all metrics on hover
  // Styling: Match theme colors, responsive
}
```

#### `src/components/charts/SubjectRadarChart.tsx`

```typescript
interface SubjectRadarChartProps {
  data: SubjectPerformance[];
}

export function SubjectRadarChart({ data }: SubjectRadarChartProps): JSX.Element {
  // Library: recharts
  // Chart Type: RadarChart
  
  // Data: SubjectPerformance[] 
  // Axes: One per subject (360° / n_subjects)
  // Metric: performance_score (0-100)
  
  // Styling:
  //   - Fill: primary color with opacity
  //   - Stroke: primary color
  //   - Grid: light gray
  //   - Labels: subject names
}
```

### Custom Hooks

#### `src/hooks/useAnalytics.ts`

```typescript
export function useAnalytics() {
  // Returns:
  //   - data: AnalyticsData | null
  //   - isLoading: boolean
  //   - error: string | null
  //   - refetch: () => Promise<void>
  
  // Implementation:
  //   - Fetch all 3 analytics functions in parallel using Promise.all
  //   - Handle errors gracefully
  //   - Cache results (optional: React Query)
}
```

#### `src/hooks/useCalendarTasks.ts`

```typescript
export function useCalendarTasks() {
  // Returns:
  //   - events: CalendarEvent[]
  //   - isLoading: boolean
  //   - error: string | null
  //   - refetch: () => Promise<void>
  
  // Implementation:
  //   - Call get_all_tasks_for_calendar RPC
  //   - Transform dates from ISO strings to Date objects
  //   - Handle role-based data differences
}
```

### Services

#### `src/services/analyticsService.ts`

```typescript
export const analyticsService = {
  async getCompletionStats(): Promise<TaskCompletionStats>,
  async getStudentEngagement(): Promise<StudentEngagement[]>,
  async getSubjectPerformance(): Promise<SubjectPerformance[]>,
  async getAllAnalytics(): Promise<AnalyticsData>
};
```

---

## Data Flow

### Analytics Dashboard Flow

```
1. User navigates to /analytics
   └─> Route guard checks if user is teacher
       └─> If not teacher: redirect to /dashboard
       └─> If teacher: render AnalyticsDashboard

2. AnalyticsDashboard mounts
   └─> useAnalytics() hook initializes
       └─> Calls analyticsService.getAllAnalytics()
           └─> Promise.all([
                 supabase.rpc('get_task_completion_stats'),
                 supabase.rpc('get_student_engagement_stats'),
                 supabase.rpc('get_subject_performance_stats')
               ])
           └─> Database executes RPC functions with RLS
               └─> Returns aggregated JSON data
           └─> Service transforms JSON to TypeScript types
           └─> Hook updates state with data

3. Charts render with data
   └─> CompletionPieChart displays task breakdown
   └─> EngagementBarChart shows student performance
   └─> SubjectRadarChart visualizes subject metrics
```

### Calendar Page Flow

```
1. User navigates to /calendar
   └─> Route allows both teachers and students
       └─> Render CalendarPage

2. CalendarPage mounts
   └─> useCalendarTasks() hook initializes
       └─> Calls supabase.rpc('get_all_tasks_for_calendar')
           └─> Database checks user role (auth.uid())
               └─> If teacher: SELECT from tasks WHERE teacher_id = user
               └─> If student: SELECT from task_assignments WHERE student_id = user
           └─> Returns JSON array of formatted events
       └─> Hook transforms dates and updates state

3. Calendar renders with events
   └─> react-big-calendar displays events
   └─> Events color-coded by status
   └─> User clicks event
       └─> onSelectEvent handler triggered
           └─> Sets selectedTask state
           └─> Opens TaskDrawer with:
               * taskId: event.id
               * taskTitle: event.title
               * taskTeacherId: event.teacher_id

4. TaskDrawer displays task details
   └─> User can view/add comments and attachments
   └─> User closes drawer
       └─> Calendar remains visible
```

---

## Security & Permissions

### RLS Policies

All RPC functions use `SECURITY DEFINER` to run with elevated privileges, but implement role-based checks:

1. **Analytics Functions** (Teacher Only)
   - Check: `auth.uid()` must have `role = 'teacher'` in profiles
   - Error: Raise exception if unauthorized
   - Data: Only return data for tasks created by the calling teacher

2. **Calendar Function** (All Users)
   - Check: `auth.uid()` must be authenticated
   - Teachers: Return only tasks they created
   - Students: Return only tasks assigned to them
   - Data isolation via role-based WHERE clauses

### Route Protection

Frontend route guards in `App.tsx`:

```typescript
<Route 
  path="/analytics" 
  element={
    <ProtectedRoute requiredRole="teacher">
      <AnalyticsDashboard />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/calendar" 
  element={
    <ProtectedRoute>
      <CalendarPage />
    </ProtectedRoute>
  } 
/>
```

---

## Performance Considerations

1. **Database Indexes**
   - Existing indexes on `task_assignments(task_id, is_completed)`
   - Existing indexes on `tasks(teacher_id, subject)`
   - Aggregation queries optimized with proper JOINs

2. **Caching Strategy**
   - Analytics data refreshed every 30 seconds (optional)
   - Calendar events cached until user performs action
   - Use React Query or SWR for optimal caching

3. **Chart Rendering**
   - Recharts uses canvas for better performance
   - Limit student engagement chart to top 20 students (if needed)
   - Lazy load chart library (code splitting)

---

## Technology Dependencies

### New NPM Packages Required

```json
{
  "dependencies": {
    "recharts": "^2.10.0",
    "react-big-calendar": "^1.8.5",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@types/react-big-calendar": "^1.8.5"
  }
}
```

---

**Architecture Status:** ✅ Complete  
**Ready for Implementation:** ✅ Yes
