/**
 * EmptyState Component
 * Phase 6: Advanced QoL & Teacher Power-User Tools
 * 
 * Displays a friendly message when no tasks match the current filters.
 * Includes a "Clear Filters" button to reset the filter state.
 */

interface EmptyStateProps {
  icon?: string;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  showClearFilters?: boolean;
  onClearFilters?: () => void;
}

export const EmptyState = ({ 
  icon = '🔍',
  title = 'No tasks found',
  message = 'Try adjusting your filters or search query to find what you\'re looking for.',
  actionLabel,
  onAction,
  showClearFilters = false,
  onClearFilters
}: EmptyStateProps) => {
  return (
    <div className="bg-component-dark rounded-lg border border-border-dark p-12">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="text-6xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-text-primary-dark mb-2">
          {title}
        </h3>
        <p className="text-text-secondary-dark mb-6 max-w-md">
          {message}
        </p>
        <div className="flex gap-3">
          {showClearFilters && onClearFilters && (
            <button
              onClick={onClearFilters}
              className="px-6 py-2 bg-component-dark border border-border-dark text-text-primary-dark rounded-lg hover:bg-background-dark transition-colors font-medium"
            >
              Clear Filters
            </button>
          )}
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
