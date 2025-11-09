/**
 * Shared Filter Types
 * Phase 6: Advanced QoL & Teacher Power-User Tools
 * 
 * These types define the filter structure used across the application
 * for filtering and searching tasks.
 */

export interface TaskFilters {
  subject: string | null;
  status: 'all' | 'pending' | 'completed' | 'overdue';
  search: string;
}

export const DEFAULT_FILTERS: TaskFilters = {
  subject: null,
  status: 'all',
  search: '',
};
