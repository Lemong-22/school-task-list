/**
 * TaskList Component
 * Displays a list of task assignments grouped by completion status
 * Phase 3E: UI Components
 */

import React from 'react';
import { TaskAssignmentWithTask } from '../types/task';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  assignments: TaskAssignmentWithTask[];
  studentId: string;
  onTaskCompleted?: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({ assignments, studentId, onTaskCompleted }) => {
  // Separate completed and incomplete tasks
  const incompleteTasks = assignments.filter((a) => !a.is_completed);
  const completedTasks = assignments.filter((a) => a.is_completed);

  if (assignments.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">📚</div>
        <p className="text-gray-600 text-lg">No tasks assigned yet</p>
        <p className="text-gray-500 text-sm mt-2">
          Your teacher will assign tasks soon. Check back later!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Incomplete Tasks Section */}
      {incompleteTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-2">
              {incompleteTasks.length}
            </span>
            Pending Tasks
          </h3>
          <div className="space-y-4">
            {incompleteTasks.map((assignment) => (
              <TaskCard
                key={assignment.id}
                assignment={assignment}
                studentId={studentId}
                onTaskCompleted={onTaskCompleted}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm mr-2">
              {completedTasks.length}
            </span>
            Completed Tasks
          </h3>
          <div className="space-y-4">
            {completedTasks.map((assignment) => (
              <TaskCard
                key={assignment.id}
                assignment={assignment}
                studentId={studentId}
                onTaskCompleted={onTaskCompleted}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
