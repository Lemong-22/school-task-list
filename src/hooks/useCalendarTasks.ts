import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { CalendarEvent } from '../types/calendar';

export function useCalendarTasks() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendarTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: rpcError } = await supabase.rpc('get_all_tasks_for_calendar');
      
      if (rpcError) {
        throw new Error(rpcError.message);
      }
      
      // Transform date strings to Date objects
      // Show tasks only on their due date (not spanning multiple days)
      const transformedEvents: CalendarEvent[] = (data || []).map((event: any) => {
        const dueDate = new Date(event.due_date);
        // Set time to start of day for all-day event display
        dueDate.setHours(0, 0, 0, 0);
        
        return {
          ...event,
          start: dueDate,  // Show on due date only
          end: dueDate,    // Single day event
          due_date: new Date(event.due_date),
          completed_at: event.completed_at ? new Date(event.completed_at) : null
        };
      });
      
      setEvents(transformedEvents);
    } catch (err) {
      console.error('Error fetching calendar tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch calendar tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarTasks();
  }, []);

  return {
    events,
    isLoading,
    error,
    refetch: fetchCalendarTasks
  };
}
