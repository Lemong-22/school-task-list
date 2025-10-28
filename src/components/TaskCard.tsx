/**
 * TaskCard Component
 * Displays a task with completion button and status
 * Phase 3E: UI Components
 */

import React, { useState } from 'react';
import { TaskAssignmentWithTask } from '../types/task';
import { CoinRewardResult } from '../types/coin';
import { useCoins } from '../hooks/useCoins';
import { CoinRewardModal } from './CoinRewardModal';

interface TaskCardProps {
  assignment: TaskAssignmentWithTask;
  studentId: string;
  onTaskCompleted?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ assignment, studentId, onTaskCompleted }) => {
  const { completeTask, loading, error } = useCoins();
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardData, setRewardData] = useState<CoinRewardResult | null>(null);

  const { task, is_completed, completed_at } = assignment;
  const dueDate = new Date(task.due_date);
  const now = new Date();
  const isOverdue = !is_completed && dueDate < now;

  const handleCompleteTask = async () => {
    const result = await completeTask(assignment.id, studentId);
    
    if (result) {
      setRewardData(result);
      setShowRewardModal(true);
      
      // Callback to refresh task list
      if (onTaskCompleted) {
        onTaskCompleted();
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
        is_completed 
          ? 'border-green-500' 
          : isOverdue 
          ? 'border-red-500' 
          : 'border-blue-500'
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className={`text-xl font-semibold ${
              is_completed ? 'text-gray-500 line-through' : 'text-gray-800'
            }`}>
              {task.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              <span className="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-medium">
                {task.subject}
              </span>
            </p>
          </div>

          {/* Status Badge */}
          {is_completed && (
            <span className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              ✓ Completed
            </span>
          )}
          {!is_completed && isOverdue && (
            <span className="inline-flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
              ⏰ Overdue
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-4">{task.description}</p>

        {/* Due Date */}
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <span className="mr-2">📅</span>
          <span>
            Due: <span className={isOverdue && !is_completed ? 'text-red-600 font-semibold' : 'font-medium'}>
              {formatDate(task.due_date)}
            </span>
          </span>
        </div>

        {/* Completion Info or Action Button */}
        {is_completed ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              Completed on: <span className="font-medium">{formatDate(completed_at!)}</span>
            </p>
          </div>
        ) : (
          <div>
            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <button
              onClick={handleCompleteTask}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Completing...
                </span>
              ) : (
                '✓ Complete Task'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Coin Reward Modal */}
      <CoinRewardModal
        isOpen={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        rewardData={rewardData}
        taskTitle={task.title}
      />
    </>
  );
};
