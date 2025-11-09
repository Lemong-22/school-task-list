/**
 * TaskCard Component
 * Displays a task with completion button and status
 * Phase 3E: UI Components
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { TaskAssignmentWithTask } from '../types/task';
import { CoinRewardResult } from '../types/coin';
import { useCoins } from '../hooks/useCoins';

interface TaskCardProps {
  assignment: TaskAssignmentWithTask;
  studentId: string;
  onTaskCompleted?: (reward: CoinRewardResult, taskTitle: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ assignment, studentId, onTaskCompleted }) => {
  const { completeTask, loading, error } = useCoins();

  const { task, is_completed, completed_at } = assignment;
  const dueDate = new Date(task.due_date);
  const now = new Date();
  const isOverdue = !is_completed && dueDate < now;

  const handleCompleteTask = async () => {
    const result = await completeTask(assignment.id, studentId);
    
    if (result && onTaskCompleted) {
      // Pass reward data to parent component
      onTaskCompleted(result, task.title);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <div className="bg-component-dark rounded-lg shadow-md border border-border-dark p-6 h-full flex flex-col">
        {/* Header with Subject Badge */}
        <div className="flex items-start justify-between mb-4">
          <span className="bg-primary/20 text-primary rounded-full px-3 py-1 text-xs font-medium">
            {task.subject}
          </span>
          
          {/* Status Badge */}
          {is_completed && (
            <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded-full px-3 py-1 text-xs font-medium">
              <CheckCircleIcon className="w-4 h-4" />
              Completed
            </span>
          )}
          {!is_completed && isOverdue && (
            <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-full px-3 py-1 text-xs font-medium">
              <ClockIcon className="w-4 h-4" />
              Overdue
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className={`text-lg font-bold mb-3 ${
          is_completed ? 'text-text-secondary-dark line-through' : 'text-text-primary-dark'
        }`}>
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-text-secondary-dark text-sm mb-4 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Due Date and Coins */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center gap-2 text-text-secondary-dark">
            <ClockIcon className="w-4 h-4" />
            <span className={isOverdue && !is_completed ? 'text-red-400 font-medium' : ''}>
              {formatDate(task.due_date)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-text-primary-dark font-medium">
            <span>🪙</span>
            <span>{task.coin_reward}</span>
          </div>
        </div>

        {/* Spacer to push button to bottom */}
        <div className="flex-grow"></div>

        {/* Completion Info or Action Button */}
        {is_completed ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <p className="text-sm text-green-300 flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4" />
              <span>Completed on {formatDate(completed_at!)}</span>
            </p>
          </div>
        ) : (
          <div>
            {error && (
              <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
            <button
              onClick={handleCompleteTask}
              disabled={loading}
              className={`flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 gap-2 text-sm font-bold leading-normal tracking-[0.015em] transition-colors ${
                loading
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="truncate">Completing...</span>
                </>
              ) : (
                <span className="truncate">Complete Task</span>
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
