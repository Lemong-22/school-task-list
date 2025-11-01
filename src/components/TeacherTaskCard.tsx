/**
 * TeacherTaskCard Component
 * Displays a task card with Edit and Delete actions for teachers
 * Phase 3H: Teacher Task CRUD
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task } from '../types/task';

interface TeacherTaskCardProps {
  task: Task;
  onDelete: (taskId: string) => Promise<void>;
}

export const TeacherTaskCard: React.FC<TeacherTaskCardProps> = ({ task, onDelete }) => {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const dueDate = new Date(task.due_date);
  const now = new Date();
  const isOverdue = dueDate < now;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(task.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
        isOverdue ? 'border-red-500' : 'border-blue-500'
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800">
              {task.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-medium">
                {task.subject}
              </span>
              <span className="inline-flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                🪙 {task.coin_reward} coins
              </span>
            </div>
          </div>

          {/* Status Badge */}
          {isOverdue && (
            <span className="inline-flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
              ⏰ Overdue
            </span>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-gray-700 mb-4">{task.description}</p>
        )}

        {/* Due Date */}
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <span className="mr-2">📅</span>
          <span>
            Due: <span className={isOverdue ? 'text-red-600 font-semibold' : 'font-medium'}>
              {formatDate(task.due_date)}
            </span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/tasks/edit/${task.id}`)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => !deleting && setShowDeleteConfirm(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Task?
              </h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete "<strong>{task.title}</strong>"? This will also remove all student assignments for this task. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
