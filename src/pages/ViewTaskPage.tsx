/**
 * ViewTaskPage Component
 * View task details in read-only mode
 * Elegant Design Implementation
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useTeacherTasks } from '../hooks/useTeacherTasks';
import { useAuth } from '../contexts/AuthContext';

export const ViewTaskPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { tasks, loading } = useTeacherTasks(user?.id || null);

  const task = tasks.find(t => t.id === taskId);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-primary mx-auto mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-text-secondary-dark">Loading task...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!task) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="bg-component-dark rounded-lg shadow-md border border-border-dark p-8 max-w-md">
            <div className="text-center">
              <span className="text-6xl mb-4 block">📝</span>
              <h2 className="text-2xl font-bold text-text-primary-dark mb-2">Task Not Found</h2>
              <p className="text-text-secondary-dark mb-6">This task does not exist or has been deleted.</p>
              <button
                onClick={() => navigate(-1)}
                className="bg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const isTeacher = role === 'teacher';

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-text-primary-dark text-4xl font-black leading-tight tracking-[-0.033em]">
            Task Details
          </h1>
          <p className="text-text-secondary-dark mt-1">View task information</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <span>←</span>
            <span>Back</span>
          </button>
          {isTeacher && (
            <button
              onClick={() => navigate(`/tasks/edit/${taskId}`)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <span>✎</span>
              <span>Edit Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Task Information Card */}
      <div className="bg-component-dark rounded-lg shadow-md border border-border-dark overflow-hidden">
        {/* Task Header */}
        <div className="bg-primary/10 border-b border-border-dark p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-text-primary-dark text-2xl font-bold mb-2">{task.title}</h2>
              <div className="flex flex-wrap gap-3">
                {/* Subject Badge */}
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                  <span>📚</span>
                  <span>{task.subject}</span>
                </span>
                {/* Coins Badge */}
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-medium">
                  <span>🪙</span>
                  <span>{task.coin_reward} Coins</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Task Details */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-text-primary-dark text-lg font-bold mb-3">Description</h3>
            <div className="bg-background-dark rounded-lg border border-border-dark p-4">
              <p className="text-text-secondary-dark whitespace-pre-wrap">
                {task.description || 'No description provided.'}
              </p>
            </div>
          </div>

          {/* Due Date */}
          {task.due_date && (
            <div>
              <h3 className="text-text-primary-dark text-lg font-bold mb-3">Due Date</h3>
              <div className="bg-background-dark rounded-lg border border-border-dark p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <p className="text-text-primary-dark font-medium">
                      {new Date(task.due_date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-text-secondary-dark text-sm">
                      {new Date(task.due_date).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Note: Assigned students info would require a separate query */}
          {/* Removed for now to avoid type errors */}

          {/* Created Info */}
          <div className="pt-4 border-t border-border-dark">
            <div className="flex items-center justify-between text-sm text-text-secondary-dark">
              <span>Created {new Date(task.created_at).toLocaleDateString('id-ID')}</span>
              {task.updated_at && task.updated_at !== task.created_at && (
                <span>Last updated {new Date(task.updated_at).toLocaleDateString('id-ID')}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
