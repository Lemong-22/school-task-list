/**
 * TaskFilters Component
 * Phase 6: Advanced QoL & Teacher Power-User Tools
 * 
 * Main filter bar component with search, subject dropdown, and status filter.
 * Features:
 * - Manages its own internal state
 * - Live search with 300ms debounce
 * - Subject dropdown from SUBJECT_LIST
 * - Status segmented control
 * - Responsive layout (horizontal on desktop, vertical on mobile)
 */

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { SUBJECT_LIST } from '../constants/subjects';
import { SegmentedControl } from './SegmentedControl';
import { useDebounce } from '../hooks/useDebounce';

interface TaskFiltersProps {
  onFilterChange: (filters: { search: string; status: string; subject: string }) => void;
}

export const TaskFilters = ({ onFilterChange }: TaskFiltersProps) => {
  // Internal state management
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [subject, setSubject] = useState('all');

  // Debounce search term (300ms delay)
  const debouncedSearch = useDebounce(search, 300);

  // Watch for changes and call onFilterChange
  useEffect(() => {
    onFilterChange({
      search: debouncedSearch,
      status,
      subject,
    });
  }, [debouncedSearch, status, subject, onFilterChange]);

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-6">
      {/* Search Input - Left side on desktop */}
      <div className="relative flex-1 w-full">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary-dark" />
        <input
          type="text"
          placeholder="Search tasks by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-full pl-10 py-2 
            bg-background-dark border border-border-dark rounded-lg
            text-text-primary-dark placeholder-text-secondary-dark
            focus:outline-none focus:ring-2 focus:ring-primary
          "
        />
      </div>

      {/* Filters Container - Right side on desktop */}
      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        {/* Subject Dropdown */}
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="
            px-4 py-2 
            bg-background-dark border border-border-dark rounded-lg
            text-text-primary-dark
            focus:outline-none focus:ring-2 focus:ring-primary
            cursor-pointer
          "
        >
          <option value="all">All Subjects</option>
          {SUBJECT_LIST.map((subjectOption) => (
            <option key={subjectOption} value={subjectOption}>
              {subjectOption}
            </option>
          ))}
        </select>

        {/* Status Segmented Control */}
        <SegmentedControl
          options={[
            { label: 'All', value: 'all' },
            { label: 'Pending', value: 'pending' },
            { label: 'Completed', value: 'completed' },
            { label: 'Overdue', value: 'overdue' },
          ]}
          value={status}
          onChange={setStatus}
        />
      </div>
    </div>
  );
};
