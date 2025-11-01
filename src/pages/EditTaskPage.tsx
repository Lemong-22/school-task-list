/**
 * EditTaskPage - Edit existing tasks with gamification support
 * Phase 3H: Teacher Task CRUD with Gamification
 */

import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTeacherTasks } from '../hooks/useTeacherTasks';
import { SUBJECT_LIST } from '../constants/subjects';

export const EditTaskPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const { user } = useAuth();
  const { updateTask, getTaskById } = useTeacherTasks(user?.id || null);
  const navigate = useNavigate();

  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [coinReward, setCoinReward] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingTask, setFetchingTask] = useState(true);

  useEffect(() => {
    const loadTask = async () => {
      if (!taskId) {
        setError('Task ID is missing');
        setFetchingTask(false);
        return;
      }

      try {
        const task = await getTaskById(taskId);
        if (!task) {
          setError('Task not found');
          return;
        }

        setTitle(task.title);
        setDescription(task.description || '');
        setSubject(task.subject);
        setDueDate(task.due_date.split('T')[0]);
        setCoinReward(task.coin_reward);
      } catch (err: any) {
        setError(err.message || 'Failed to load task');
      } finally {
        setFetchingTask(false);
      }
    };

    loadTask();
  }, [taskId, getTaskById]);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!taskId) {
      setError('Task ID is missing');
      return;
    }

    // Validation
    if (!subject) {
      setError('Subject is required');
      return;
    }

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (title.length > 200) {
      setError('Title must be 200 characters or less');
      return;
    }

    if (!dueDate) {
      setError('Due date is required');
      return;
    }

    if (description && description.length > 1000) {
      setError('Description must be 1000 characters or less');
      return;
    }

    if (coinReward < 0 || coinReward > 1000) {
      setError('Coin reward must be between 0 and 1000');
      return;
    }

    setLoading(true);

    try {
      await updateTask(taskId, {
        title: title.trim(),
        description: description.trim() || undefined,
        due_date: new Date(dueDate).toISOString(),
        subject: subject,
      });

      navigate('/dashboard/teacher', {
        state: { message: 'Task updated successfully!' },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingTask) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading task...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard/teacher')}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Edit Task</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

            {/* Subject Field */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                id="subject"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- Select Subject --</option>
                {SUBJECT_LIST.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                required
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Complete Math Homework Chapter 5"
              />
              <p className="mt-1 text-xs text-gray-500">{title.length}/200 characters</p>
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <textarea
                id="description"
                rows={4}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Provide detailed instructions about this task..."
              />
              <p className="mt-1 text-xs text-gray-500">{description.length}/1000 characters</p>
            </div>

            {/* Due Date Field */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dueDate"
                required
                min={getTodayDate()}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Coin Reward Field - READ ONLY */}
            <div>
              <label htmlFor="coinReward" className="block text-sm font-medium text-gray-700">
                Coin Reward 🪙
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  id="coinReward"
                  value={coinReward}
                  disabled
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Coin reward cannot be changed after task creation
              </p>
              <div className="mt-2 bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-xs text-blue-800">
                  ℹ️ <strong>Info:</strong> Top 3 students to complete get DOUBLE coins ({coinReward * 2}), others get {coinReward} coins. Late submissions get 0 coins.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating Task...' : '✓ Update Task'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/teacher')}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
