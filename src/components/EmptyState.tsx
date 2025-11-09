/**
 * EmptyState Component
 * Phase 6: Advanced QoL & Teacher Power-User Tools
 * 
 * Displays a friendly message when no tasks match the current filters.
 * Includes a "Clear Filters" button to reset the filter state.
 */

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  onClearFilters: () => void;
}

export const EmptyState = ({ onClearFilters }: EmptyStateProps) => {
  return (
    <div className="bg-component-dark rounded-lg border border-border-dark p-12">
      <div className="flex flex-col items-center justify-center text-center">
        <MagnifyingGlassIcon className="w-16 h-16 text-text-secondary-dark mb-4 opacity-50" />
        <h3 className="text-xl font-semibold text-text-primary-dark mb-2">
          No tasks found
        </h3>
        <p className="text-text-secondary-dark mb-6 max-w-md">
          Try adjusting your filters or search query to find what you're looking for.
        </p>
        <button
          onClick={onClearFilters}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};
