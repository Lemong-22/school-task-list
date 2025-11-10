/**
 * EditTaskPage - Edit existing tasks with gamification support
 * Phase 3H: Teacher Task CRUD with Gamification
 */

import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
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

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
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
            <h1 className="text-text-primary-dark text-4xl font-black leading-tight tracking-[-0.033em]">Edit Task</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-component-dark shadow-md rounded-lg border border-border-dark p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4">
                <div className="text-sm text-red-400 font-medium">{error}</div>
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
                className="mt-1 block w-full px-3 py-2.5 bg-background-dark border border-border-dark text-text-primary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
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
                className="mt-1 block w-full px-3 py-2.5 bg-background-dark border border-border-dark text-text-primary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
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
                className="mt-1 block w-full px-3 py-2.5 bg-background-dark border border-border-dark text-text-primary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
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
                className="mt-1 block w-full px-3 py-2.5 bg-background-dark border border-border-dark text-text-primary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            {/* Coin Reward Field - READ ONLY */}
            <div>
              <label htmlFor="coinReward" className="block text-sm font-medium text-gray-700">
                Coin Reward 🪙
              </label>
              <div className="mt-1 relative rounded-none-none shadow-sm">
                <input
                  type="number"
                  id="coinReward"
                  value={coinReward}
                  disabled
                  className="block w-full px-3 py-2 border border-gray-300 rounded-none-none shadow-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Coin reward cannot be changed after task creation
              </p>
              <div className="mt-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-xs text-yellow-300 font-medium">
                  ℹ️ <strong>Info:</strong> Top 3 students to complete get DOUBLE coins ({coinReward * 2}), others get {coinReward} coins. Late submissions get 0 coins.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating Task...' : '✓ Update Task'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/teacher')}
                className="flex-1 bg-gray-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </Layout>
  );
};
