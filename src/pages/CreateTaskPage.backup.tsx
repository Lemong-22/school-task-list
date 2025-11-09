/**
 * CreateTaskPage - Create new tasks with gamification support
 * Phase 3H: Teacher Task CRUD with Gamification
 */

import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTeacherTasks } from '../hooks/useTeacherTasks';
import { StudentSelector } from '../components/StudentSelector';
import { SUBJECT_LIST } from '../constants/subjects';

export const CreateTaskPage = () => {
  const { user } = useAuth();
  const { createTask } = useTeacherTasks(user?.id || null);
  const navigate = useNavigate();

  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [coinReward, setCoinReward] = useState(10);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

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

    if (new Date(dueDate) < new Date(getTodayDate())) {
      setError('Due date cannot be in the past');
      return;
    }

    if (selectedStudents.length === 0) {
      setError('Please select at least one student');
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
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        due_date: new Date(dueDate).toISOString(),
        subject: subject,
        coin_reward: coinReward,
        student_ids: selectedStudents,
      });

      navigate('/dashboard/teacher', {
        state: { message: 'Task created successfully!' },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-codedex-dark">
      {/* Header */}
      <header className="bg-codedex-navy border-b-2 border-codedex-slate">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard/teacher')}
              className="mr-4 text-gray-300 hover:text-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-pixel text-gray-100">Create New Task</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-codedex-slate shadow-brutal-lg rounded-none border-2 border-codedex-slate p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="rounded-none bg-codedex-pink/20 border-2 border-codedex-pink p-4">
                <div className="text-sm text-codedex-pink font-medium">{error}</div>
              </div>
            )}

            {/* Subject Field */}
            <div>
              <label htmlFor="subject" className="block text-sm font-bold text-gray-100">
                Subject <span className="text-codedex-pink">*</span>
              </label>
              <select
                id="subject"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-codedex-navy border-2 border-gray-600 text-gray-100 rounded-none focus:outline-none focus:ring-2 focus:ring-codedex-cyan focus:border-codedex-cyan"
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
              <label htmlFor="title" className="block text-sm font-bold text-codedex-cyan">
                Task Title <span className="text-codedex-pink">*</span>
              </label>
              <input
                type="text"
                id="title"
                required
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-codedex-navy border-2 border-codedex-cyan text-codedex-cyan rounded-none focus:outline-none focus:ring-2 focus:ring-codedex-cyan focus:border-codedex-cyan"
                placeholder="e.g., Read Chapter 5 and answer questions"
              />
              <p className="mt-1 text-xs text-codedex-cyan">{title.length}/200 characters</p>
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-bold text-codedex-cyan">
                Description (Optional)
              </label>
              <textarea
                id="description"
                rows={4}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-codedex-navy border-2 border-gray-600 text-gray-100 rounded-none focus:outline-none focus:ring-2 focus:ring-codedex-cyan focus:border-codedex-cyan"
                placeholder="Provide detailed instructions about this task..."
              />
              <p className="mt-1 text-xs text-gray-400">{description.length}/1000 characters</p>
            </div>

            {/* Due Date and Coin Reward - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Due Date Field */}
              <div>
                <label htmlFor="dueDate" className="block text-sm font-bold text-gray-100">
                  Due Date <span className="text-codedex-pink">*</span>
                </label>
                <input
                  type="date"
                  id="dueDate"
                  required
                  min={getTodayDate()}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-codedex-navy border-2 border-gray-600 text-gray-100 rounded-none focus:outline-none focus:ring-2 focus:ring-codedex-cyan focus:border-codedex-cyan"
                />
              </div>

              {/* Coin Reward Field */}
              <div>
                <label htmlFor="coinReward" className="block text-sm font-bold text-gray-100">
                  Coin Reward 🪙 <span className="text-codedex-pink">*</span>
                </label>
                <input
                  type="number"
                  id="coinReward"
                  required
                  min={0}
                  max={1000}
                  value={coinReward}
                  onChange={(e) => setCoinReward(parseInt(e.target.value) || 0)}
                  className="mt-1 block w-full px-3 py-2 bg-codedex-navy border-2 border-gray-600 text-gray-100 rounded-none focus:outline-none focus:ring-2 focus:ring-codedex-cyan focus:border-codedex-cyan"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Base coins (0-1000)
                </p>
              </div>
            </div>

            {/* Gamification Tip */}
            <div className="bg-codedex-yellow/20 border-2 border-codedex-yellow rounded-none p-3">
              <p className="text-xs text-codedex-yellow font-medium">
                💡 <strong>Gamification Tip:</strong> Top 3 students to complete get DOUBLE coins! Others get the base amount. Late submissions get 0 coins.
              </p>
            </div>

            {/* Student Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-100 mb-2">
                Assign to Students <span className="text-codedex-pink">*</span>
              </label>
              <StudentSelector
                selectedStudentIds={selectedStudents}
                onChange={setSelectedStudents}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-codedex-green text-black font-bold py-3 px-4 rounded-none shadow-brutal hover:shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Task...' : '✓ Create Task'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/teacher')}
                className="flex-1 bg-codedex-navy border-2 border-gray-600 text-gray-100 font-bold py-3 px-4 rounded-none hover:bg-gray-700 transition-colors"
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
