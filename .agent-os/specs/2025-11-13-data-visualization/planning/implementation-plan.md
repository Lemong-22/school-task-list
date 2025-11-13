# Phase 8: Data Visualization - Implementation Plan

**Date:** 2025-11-13  
**Status:** Planning Phase  
**Feature:** Analytics Dashboard & Global Calendar

---

## Implementation Overview

This implementation plan follows a **bottom-up approach**: Database → Backend → Frontend.

**Total Estimated Time:** 6-8 hours  
**Risk Level:** Low (leveraging existing patterns and stable libraries)

---

## Phase A: Database Layer (1-2 hours)

### A.1 Create Migration File

**File:** `supabase/migrations/026_analytics_calendar_functions.sql`

**Tasks:**
1. Create the migration file with proper header comments
2. Add performance indexes (if not already exist)
3. Implement all four RPC functions:
   - `get_task_completion_stats()`
   - `get_student_engagement_stats()`
   - `get_subject_performance_stats()`
   - `get_all_tasks_for_calendar()`
4. Grant execute permissions to authenticated users
5. Add verification block to ensure functions are created

**Acceptance Criteria:**
- ✅ Migration file runs without errors
- ✅ All 4 functions are created successfully
- ✅ Functions return correct JSON structure
- ✅ Security checks work (teacher-only for analytics)
- ✅ Role-based filtering works for calendar

**Testing:**
```sql
-- Test as teacher
SELECT get_task_completion_stats();
SELECT get_student_engagement_stats();
SELECT get_subject_performance_stats();
SELECT get_all_tasks_for_calendar();

-- Test as student (should fail for analytics)
SELECT get_task_completion_stats(); -- Should raise exception
SELECT get_all_tasks_for_calendar(); -- Should succeed
```

---

## Phase B: Frontend Layer (4-6 hours)

### B.1 Install Dependencies (10 minutes)

**Tasks:**
1. Install required npm packages
2. Verify TypeScript types are available

**Commands:**
```bash
npm install recharts react-big-calendar date-fns
npm install --save-dev @types/react-big-calendar
```

**Acceptance Criteria:**
- ✅ All packages installed successfully
- ✅ No version conflicts
- ✅ TypeScript recognizes new types

---

### B.2 Create Type Definitions (20 minutes)

**Files to Create:**
1. `src/types/analytics.ts`
2. `src/types/calendar.ts`

**Tasks:**
1. Define `TaskCompletionStats` interface
2. Define `StudentEngagement` interface
3. Define `SubjectPerformance` interface
4. Define `AnalyticsData` interface
5. Define `CalendarEvent` interface
6. Export all types

**Acceptance Criteria:**
- ✅ All interfaces match database JSON structure
- ✅ TypeScript compilation succeeds
- ✅ Types are properly exported

---

### B.3 Create Services Layer (30 minutes)

**File:** `src/services/analyticsService.ts`

**Tasks:**
1. Create `getCompletionStats()` function
2. Create `getStudentEngagement()` function
3. Create `getSubjectPerformance()` function
4. Create `getAllAnalytics()` function (calls all 3 in parallel)
5. Add proper error handling
6. Transform JSON responses to TypeScript types

**Acceptance Criteria:**
- ✅ All service functions work correctly
- ✅ Error handling is robust
- ✅ Date strings are converted to Date objects
- ✅ Service follows existing patterns (e.g., `coinService.ts`)

**Example Implementation:**
```typescript
import { supabase } from '../lib/supabase';
import type { TaskCompletionStats, StudentEngagement, SubjectPerformance, AnalyticsData } from '../types/analytics';

export const analyticsService = {
  async getCompletionStats(): Promise<TaskCompletionStats> {
    const { data, error } = await supabase.rpc('get_task_completion_stats');
    if (error) throw error;
    return data;
  },

  async getStudentEngagement(): Promise<StudentEngagement[]> {
    const { data, error } = await supabase.rpc('get_student_engagement_stats');
    if (error) throw error;
    return data || [];
  },

  async getSubjectPerformance(): Promise<SubjectPerformance[]> {
    const { data, error } = await supabase.rpc('get_subject_performance_stats');
    if (error) throw error;
    return data || [];
  },

  async getAllAnalytics(): Promise<AnalyticsData> {
    const [completionStats, studentEngagement, subjectPerformance] = await Promise.all([
      this.getCompletionStats(),
      this.getStudentEngagement(),
      this.getSubjectPerformance()
    ]);

    return {
      completionStats,
      studentEngagement,
      subjectPerformance
    };
  }
};
```

---

### B.4 Create Custom Hooks (30 minutes)

**Files to Create:**
1. `src/hooks/useAnalytics.ts`
2. `src/hooks/useCalendarTasks.ts`

**Tasks:**

#### B.4.1 Create `useAnalytics` Hook
1. Set up state for data, loading, and error
2. Fetch analytics data on mount
3. Return data, loading state, error, and refetch function
4. Handle errors gracefully

#### B.4.2 Create `useCalendarTasks` Hook
1. Set up state for events, loading, and error
2. Fetch calendar tasks on mount
3. Transform date strings to Date objects
4. Return events, loading state, error, and refetch function

**Acceptance Criteria:**
- ✅ Hooks follow React best practices
- ✅ Loading states work correctly
- ✅ Errors are handled and displayed
- ✅ Data updates properly
- ✅ Hooks follow existing patterns (e.g., `useCoins.ts`, `useLeaderboard.ts`)

---

### B.5 Create Chart Components (1-1.5 hours)

**Directory:** `src/components/charts/`

**Files to Create:**
1. `CompletionPieChart.tsx`
2. `EngagementBarChart.tsx`
3. `SubjectRadarChart.tsx`

**Tasks for Each Chart:**

#### B.5.1 CompletionPieChart
1. Import recharts components: `PieChart`, `Pie`, `Cell`, `ResponsiveContainer`, `Legend`, `Tooltip`
2. Transform `TaskCompletionStats` to pie chart data format
3. Define colors: completed (green), pending (blue), overdue (red)
4. Implement custom labels with percentages
5. Make responsive with `ResponsiveContainer`
6. Style to match theme

**Data Format:**
```typescript
const pieData = [
  { name: 'Completed', value: data.completed_tasks, fill: '#10B981' },
  { name: 'Pending', value: data.pending_tasks, fill: '#4F46E5' },
  { name: 'Overdue', value: data.overdue_tasks, fill: '#EF4444' }
];
```

#### B.5.2 EngagementBarChart
1. Import recharts components: `BarChart`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend`, `ResponsiveContainer`
2. Use `StudentEngagement[]` as data
3. X-axis: student names (truncate if too long)
4. Y-axis: engagement_score (0-100)
5. Add tooltip showing all metrics
6. Style bars with theme colors

#### B.5.3 SubjectRadarChart
1. Import recharts components: `RadarChart`, `PolarGrid`, `PolarAngleAxis`, `PolarRadiusAxis`, `Radar`, `ResponsiveContainer`, `Legend`
2. Use `SubjectPerformance[]` as data
3. Configure radar with performance_score metric
4. Style with primary color and opacity
5. Add subject labels on axes

**Acceptance Criteria for All Charts:**
- ✅ Charts render correctly with mock data
- ✅ Charts render correctly with real data
- ✅ Responsive design works on all screen sizes
- ✅ Theme colors are used consistently
- ✅ Tooltips display helpful information
- ✅ Loading states are handled
- ✅ Empty data states are handled gracefully

---

### B.6 Create Analytics Dashboard Page (45 minutes)

**File:** `src/pages/AnalyticsDashboard.tsx`

**Tasks:**
1. Create page component structure
2. Use `useAnalytics()` hook to fetch data
3. Add loading spinner component
4. Add error message component
5. Display page header with title
6. Create responsive grid layout for 3 charts
7. Render all three chart components
8. Add auto-refresh option (optional)

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│  Analytics Dashboard                     │
│  [Last updated: timestamp]               │
├─────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────────┐  │
│  │  Pie Chart  │  │   Bar Chart      │  │
│  │ (Completion)│  │  (Engagement)    │  │
│  └─────────────┘  └──────────────────┘  │
│  ┌──────────────────────────────────┐   │
│  │      Radar Chart (Subjects)      │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Acceptance Criteria:**
- ✅ Page is accessible only to teachers
- ✅ Loading state displays spinner
- ✅ Error state displays error message
- ✅ All three charts render correctly
- ✅ Page is responsive (mobile, tablet, desktop)
- ✅ Styling matches existing design system
- ✅ Data updates when refetch is triggered

---

### B.7 Create Calendar Page (1 hour)

**File:** `src/pages/CalendarPage.tsx`

**Tasks:**
1. Import `react-big-calendar` and `date-fns`
2. Set up date-fns localizer
3. Create page component structure
4. Use `useCalendarTasks()` hook to fetch events
5. Configure calendar with views: month, week, day, agenda
6. Implement custom `eventPropGetter` for status-based colors
7. Add event click handler to open TaskDrawer
8. Import and use existing `TaskDrawer` component
9. Handle drawer open/close state
10. Add loading and error states

**Calendar Configuration:**
```typescript
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
});
```

**Event Styling:**
```typescript
const eventStyleGetter = (event: CalendarEvent) => {
  let backgroundColor = '#4F46E5'; // default: primary (pending)
  
  if (event.status === 'completed') {
    backgroundColor = '#10B981'; // green
  } else if (event.status === 'overdue') {
    backgroundColor = '#EF4444'; // red
  }
  
  return {
    style: {
      backgroundColor,
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    }
  };
};
```

**Acceptance Criteria:**
- ✅ Calendar renders with all events
- ✅ Events are color-coded by status
- ✅ Month, week, day, and agenda views work
- ✅ Clicking event opens TaskDrawer
- ✅ TaskDrawer displays correct task information
- ✅ Both teachers and students can use calendar
- ✅ Loading state works
- ✅ Error state works
- ✅ Page is responsive
- ✅ Custom CSS styling matches theme

---

### B.8 Update Layout Navigation (15 minutes)

**File:** `src/components/Layout.tsx`

**Tasks:**
1. Add "Analytics" NavLink (visible only to teachers)
2. Add "Calendar" NavLink (visible to all users)
3. Position links appropriately in navigation menu
4. Apply consistent styling with other nav links

**Implementation:**
```typescript
{profile?.role === 'teacher' && (
  <NavLink
    to="/analytics"
    className={({ isActive }) =>
      isActive 
        ? 'text-primary text-sm font-bold leading-normal' 
        : 'text-text-primary-dark hover:text-primary text-sm font-medium leading-normal transition-colors'
    }
  >
    Analytics
  </NavLink>
)}

<NavLink
  to="/calendar"
  className={({ isActive }) =>
    isActive 
      ? 'text-primary text-sm font-bold leading-normal' 
      : 'text-text-primary-dark hover:text-primary text-sm font-medium leading-normal transition-colors'
  }
>
  Calendar
</NavLink>
```

**Acceptance Criteria:**
- ✅ "Analytics" link only visible to teachers
- ✅ "Calendar" link visible to all authenticated users
- ✅ Active state styling works correctly
- ✅ Navigation is responsive
- ✅ Links work correctly

---

### B.9 Update Routing (10 minutes)

**File:** `src/App.tsx`

**Tasks:**
1. Import new page components
2. Add route for `/analytics` with teacher-only protection
3. Add route for `/calendar` with authentication protection
4. Test navigation

**Implementation:**
```typescript
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { CalendarPage } from './pages/CalendarPage';

// Inside Routes
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

**Acceptance Criteria:**
- ✅ Routes are properly configured
- ✅ Teacher-only protection works for `/analytics`
- ✅ Authentication protection works for `/calendar`
- ✅ Students redirected if accessing `/analytics`
- ✅ Navigation between pages works smoothly

---

## Phase C: Testing & Refinement (1 hour)

### C.1 Functional Testing

**Analytics Dashboard Tests:**
1. Test as teacher with tasks
2. Test as teacher with no tasks
3. Test that students cannot access (redirect)
4. Test all three charts render correctly
5. Test data accuracy
6. Test responsive design
7. Test error handling

**Calendar Page Tests:**
1. Test as teacher with multiple tasks
2. Test as student with assigned tasks
3. Test event click → TaskDrawer opens
4. Test TaskDrawer functionality (comments, attachments)
5. Test different calendar views (month, week, day, agenda)
6. Test event color coding
7. Test responsive design
8. Test error handling

### C.2 Visual Polish

**Tasks:**
1. Ensure all colors match theme
2. Add smooth transitions and animations
3. Improve loading states (skeleton screens)
4. Add empty states with helpful messages
5. Polish mobile responsive design
6. Test on different screen sizes
7. Cross-browser testing

### C.3 Performance Optimization

**Tasks:**
1. Verify database queries are efficient
2. Check for unnecessary re-renders
3. Add React.memo where appropriate
4. Test with large datasets (100+ students, 500+ tasks)
5. Optimize chart rendering performance
6. Consider code splitting for chart libraries

---

## Phase D: Documentation & Deployment (30 minutes)

### D.1 Code Documentation

**Tasks:**
1. Add JSDoc comments to all functions
2. Document complex logic
3. Add inline comments where helpful
4. Update README if needed

### D.2 Create User Documentation

**File:** `docs/features/DATA_VISUALIZATION.md`

**Content:**
1. Feature overview
2. How to access Analytics Dashboard
3. How to use Calendar
4. Chart explanations
5. Screenshots (optional)
6. FAQ

### D.3 Deployment

**Tasks:**
1. Push migration to Supabase
2. Run migration on production database
3. Deploy frontend changes
4. Verify production functionality
5. Monitor for errors

---

## Risk Mitigation

### Potential Issues & Solutions

1. **Issue:** Database migration fails
   - **Solution:** Test migration on local Supabase first, verify all SQL syntax

2. **Issue:** Charts render slowly with large datasets
   - **Solution:** Add pagination or limit to top N items, use React.memo

3. **Issue:** Calendar library conflicts with existing CSS
   - **Solution:** Scope calendar CSS, use CSS modules if needed

4. **Issue:** TaskDrawer doesn't work from calendar context
   - **Solution:** Ensure all required props are passed correctly

5. **Issue:** Date timezone issues
   - **Solution:** Use consistent timezone handling with date-fns

---

## Testing Checklist

### Database Layer
- [ ] All 4 RPC functions created successfully
- [ ] Functions return correct data structure
- [ ] Teacher-only security works
- [ ] Role-based filtering works
- [ ] Performance is acceptable

### Frontend - Analytics
- [ ] Page accessible only to teachers
- [ ] All three charts render
- [ ] Data is accurate
- [ ] Loading states work
- [ ] Error states work
- [ ] Responsive design works
- [ ] Empty states handled

### Frontend - Calendar
- [ ] Calendar renders for all users
- [ ] Events display correctly
- [ ] Color coding works
- [ ] All views work (month/week/day/agenda)
- [ ] Event click opens TaskDrawer
- [ ] TaskDrawer functions correctly
- [ ] Responsive design works
- [ ] Date formatting is correct

### Navigation
- [ ] Analytics link visible to teachers only
- [ ] Calendar link visible to all users
- [ ] Links navigate correctly
- [ ] Active states work
- [ ] Route protection works

---

## Rollout Plan

### Phase 1: Internal Testing
1. Deploy to staging environment
2. Test with real teacher/student accounts
3. Verify data accuracy
4. Collect feedback

### Phase 2: Beta Release
1. Release to subset of users
2. Monitor for bugs
3. Gather user feedback
4. Make adjustments

### Phase 3: Full Release
1. Deploy to production
2. Announce new features
3. Create user guide
4. Monitor usage and performance

---

## Success Metrics

### Technical Metrics
- Database query response time < 500ms
- Page load time < 2 seconds
- Zero critical bugs in first week
- 99.9% uptime

### User Metrics
- Teacher adoption rate > 80%
- Calendar usage > 90% of users
- Positive user feedback
- Task completion rate increases

---

**Implementation Plan Status:** ✅ Complete  
**Ready to Begin:** ✅ Yes  
**Estimated Completion:** 1-2 days
