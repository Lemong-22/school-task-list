import { useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CalendarIcon, ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Layout } from '../components/Layout';
import { useCalendarTasks } from '../hooks/useCalendarTasks';
import { TaskDrawer } from '../components/TaskDrawer';
import type { CalendarEvent } from '../types/calendar';

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
});

export function CalendarPage() {
  const { events, isLoading, error } = useCalendarTasks();
  const [selectedTask, setSelectedTask] = useState<CalendarEvent | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Handle event click
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedTask(event);
    setIsDrawerOpen(true);
  };

  // Close drawer
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedTask(null);
  };

  // Custom event styling based on status and priority
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#4F46E5';
    let borderLeft = '4px solid #6366F1';
    
    // Status color
    if (event.status === 'completed') {
      backgroundColor = '#059669';
      borderLeft = '4px solid #10B981';
    } else if (event.status === 'overdue') {
      backgroundColor = '#DC2626';
      borderLeft = '4px solid #EF4444';
    }
    
    // Priority border width
    let borderWidth = '4px';
    if (event.priority === 'high') {
      borderWidth = '6px';
    } else if (event.priority === 'low') {
      borderWidth = '2px';
    }
    
    borderLeft = borderLeft.replace('4px', borderWidth);
    
    return {
      style: {
        backgroundColor,
        borderLeft,
        borderRadius: '6px',
        opacity: 1,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '0.8125rem',
        fontWeight: event.priority === 'high' ? '700' : '500',
        padding: '4px 8px',
        boxShadow: event.priority === 'high' ? '0 4px 8px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.2s ease'
      }
    };
  };

  // Custom event title formatter to show priority emoji
  const eventTitleAccessor = (event: CalendarEvent) => {
    const priorityEmoji = event.priority === 'high' ? '🔴 ' : event.priority === 'low' ? '🟢 ' : '🟡 ';
    return `${priorityEmoji}${event.title}`;
  };

  // Calculate stats
  const stats = {
    total: events.length,
    completed: events.filter(e => e.status === 'completed').length,
    pending: events.filter(e => e.status === 'pending').length,
    overdue: events.filter(e => e.status === 'overdue').length
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background-dark py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with Stats */}
          <div className="mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-8 h-8 text-primary" />
                  <h1 className="text-3xl font-bold text-text-primary-dark">Task Calendar</h1>
                </div>
                <p className="text-text-secondary-dark mt-2">Visualize and manage your tasks across time</p>
              </div>
              
              {/* Quick Stats */}
              {!isLoading && !error && (
                <div className="flex gap-3">
                  <div className="bg-component-dark border border-border-dark rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      <ChartBarIcon className="w-4 h-4 text-text-secondary-dark" />
                      <span className="text-text-secondary-dark text-sm">Total:</span>
                      <span className="text-text-primary-dark font-semibold">{stats.total}</span>
                    </div>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span className="text-green-300 text-sm font-medium">{stats.completed} Done</span>
                    </div>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-red-400" />
                      <span className="text-red-300 text-sm font-medium">{stats.overdue} Overdue</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-text-secondary-dark mt-4">Loading calendar...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6">
              <p className="text-red-400 font-semibold">Error loading calendar</p>
              <p className="text-text-secondary-dark text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Calendar */}
          {!isLoading && !error && (
            <>
              <div className="bg-component-dark border border-border-dark rounded-xl shadow-lg overflow-hidden calendar-container">
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  titleAccessor={eventTitleAccessor}
                  style={{ height: 700 }}
                  onSelectEvent={handleSelectEvent}
                  eventPropGetter={eventStyleGetter}
                  views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                  defaultView={Views.MONTH}
                  popup
                  tooltipAccessor={(event: CalendarEvent) => {
                    const priority = event.priority === 'high' ? 'High Priority' : event.priority === 'low' ? 'Low Priority' : 'Medium Priority';
                    const time = event.estimated_minutes ? ` • ~${event.estimated_minutes}min` : '';
                    return `${event.subject} - ${event.title}\n${priority}${time}`;
                  }}
                />
              </div>

              {/* Legend - Improved */}
              <div className="mt-6 bg-component-dark border border-border-dark rounded-lg p-4">
                <h3 className="text-sm font-semibold text-text-primary-dark mb-3">Event Status Legend</h3>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md" style={{ backgroundColor: '#059669', borderLeft: '4px solid #10B981' }}></div>
                    <div>
                      <p className="text-text-primary-dark text-sm font-medium">Completed</p>
                      <p className="text-text-secondary-dark text-xs">{stats.completed} tasks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md" style={{ backgroundColor: '#4F46E5', borderLeft: '4px solid #6366F1' }}></div>
                    <div>
                      <p className="text-text-primary-dark text-sm font-medium">Pending</p>
                      <p className="text-text-secondary-dark text-xs">{stats.pending} tasks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md" style={{ backgroundColor: '#DC2626', borderLeft: '4px solid #EF4444' }}></div>
                    <div>
                      <p className="text-text-primary-dark text-sm font-medium">Overdue</p>
                      <p className="text-text-secondary-dark text-xs">{stats.overdue} tasks</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Empty State */}
              {events.length === 0 && (
                <div className="mt-8 text-center py-12 bg-component-dark border border-border-dark rounded-lg">
                  <CalendarIcon className="w-16 h-16 text-text-secondary-dark mx-auto mb-4 opacity-50" />
                  <p className="text-text-primary-dark font-semibold text-lg">No tasks yet</p>
                  <p className="text-text-secondary-dark mt-2">Tasks will appear here once they are created or assigned to you.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Task Drawer */}
      {selectedTask && (
        <TaskDrawer
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          taskId={selectedTask.id}
          taskTitle={selectedTask.title}
          taskTeacherId={selectedTask.teacher_id}
        />
      )}

      {/* Custom CSS for Calendar - Enhanced Elegant Design */}
      <style>{`
        .calendar-container .rbc-calendar {
          color: #F7FAFC;
          font-family: 'Inter', sans-serif;
          padding: 1.5rem;
        }
        
        /* Header - Days of Week */
        .calendar-container .rbc-header {
          background: linear-gradient(135deg, #1a1f35 0%, #222842 100%);
          color: #E2E8F0;
          padding: 16px 12px;
          border: none;
          font-weight: 600;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid #4F46E5;
        }
        
        .calendar-container .rbc-header + .rbc-header {
          border-left: 1px solid rgba(79, 70, 229, 0.2);
        }
        
        /* Today's Date Highlight */
        .calendar-container .rbc-today {
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%);
          border: 2px solid rgba(79, 70, 229, 0.4);
        }
        
        /* Off-range days (previous/next month) */
        .calendar-container .rbc-off-range-bg {
          background-color: rgba(10, 13, 26, 0.5);
        }
        
        /* Date cells */
        .calendar-container .rbc-date-cell {
          color: #CBD5E0;
          padding: 8px;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .calendar-container .rbc-date-cell:hover {
          background-color: rgba(79, 70, 229, 0.1);
          border-radius: 6px;
        }
        
        /* Current day number styling */
        .calendar-container .rbc-date-cell.rbc-now {
          color: #FFFFFF;
          background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
          border-radius: 8px;
          font-weight: 700;
          padding: 4px 8px;
          display: inline-block;
          min-width: 32px;
          text-align: center;
          box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3);
        }
        
        /* Month/Week/Day View backgrounds */
        .calendar-container .rbc-month-view,
        .calendar-container .rbc-time-view {
          background-color: transparent;
          border: none;
        }
        
        /* Day cell backgrounds */
        .calendar-container .rbc-day-bg {
          border-color: rgba(74, 85, 104, 0.3);
          transition: background-color 0.2s ease;
        }
        
        .calendar-container .rbc-day-bg:hover {
          background-color: rgba(79, 70, 229, 0.05);
        }
        
        /* Events */
        .calendar-container .rbc-event {
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .calendar-container .rbc-event:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4) !important;
          z-index: 10;
        }
        
        .calendar-container .rbc-event:focus {
          outline: 2px solid #4F46E5;
          outline-offset: 2px;
        }
        
        /* Toolbar - Navigation */
        .calendar-container .rbc-toolbar {
          color: #F7FAFC;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 2px solid rgba(74, 85, 104, 0.3);
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .calendar-container .rbc-toolbar-label {
          font-size: 1.25rem;
          font-weight: 700;
          color: #F7FAFC;
          letter-spacing: -0.01em;
        }
        
        /* Toolbar Buttons */
        .calendar-container .rbc-toolbar button {
          color: #E2E8F0;
          background: linear-gradient(135deg, #1a1f35 0%, #222842 100%);
          border: 1px solid rgba(79, 70, 229, 0.3);
          border-radius: 8px;
          padding: 10px 18px;
          font-weight: 500;
          font-size: 0.875rem;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .calendar-container .rbc-toolbar button:hover {
          background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
          border-color: #6366F1;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(79, 70, 229, 0.3);
          color: #FFFFFF;
        }
        
        .calendar-container .rbc-toolbar button.rbc-active {
          background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
          border-color: #6366F1;
          color: #FFFFFF;
          box-shadow: 0 4px 8px rgba(79, 70, 229, 0.4);
        }
        
        /* Agenda View */
        .calendar-container .rbc-agenda-view {
          background-color: transparent;
        }
        
        .calendar-container .rbc-agenda-view table {
          border-color: rgba(74, 85, 104, 0.3);
        }
        
        .calendar-container .rbc-agenda-view table tbody > tr > td {
          border-color: rgba(74, 85, 104, 0.3);
          color: #F7FAFC;
          padding: 12px;
        }
        
        .calendar-container .rbc-agenda-view table tbody > tr:hover {
          background-color: rgba(79, 70, 229, 0.1);
        }
        
        .calendar-container .rbc-agenda-date-cell,
        .calendar-container .rbc-agenda-time-cell {
          color: #CBD5E0;
          font-weight: 500;
        }
        
        .calendar-container .rbc-agenda-event-cell {
          color: #F7FAFC;
        }
        
        /* Show More button */
        .calendar-container .rbc-show-more {
          background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
          color: #FFFFFF;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 6px;
          margin-top: 4px;
          transition: all 0.2s ease;
        }
        
        .calendar-container .rbc-show-more:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(79, 70, 229, 0.4);
        }
        
        /* Month row */
        .calendar-container .rbc-month-row {
          border-color: rgba(74, 85, 104, 0.3);
          overflow: visible;
        }
        
        /* Selected slot */
        .calendar-container .rbc-selected-cell {
          background-color: rgba(79, 70, 229, 0.2);
        }
        
        /* Event wrapper */
        .calendar-container .rbc-event-content {
          font-weight: 500;
        }
        
        /* Overlay/Popup */
        .calendar-container .rbc-overlay {
          background-color: #1a1f35;
          border: 1px solid rgba(79, 70, 229, 0.5);
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
          padding: 8px;
        }
        
        .calendar-container .rbc-overlay-header {
          color: #E2E8F0;
          font-weight: 600;
          border-bottom: 1px solid rgba(74, 85, 104, 0.3);
          padding-bottom: 8px;
          margin-bottom: 8px;
        }
      `}</style>
    </Layout>
  );
}
