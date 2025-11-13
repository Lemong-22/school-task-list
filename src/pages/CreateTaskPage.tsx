/**
 * CreateTaskPage - Create new tasks with gamification support
 * Phase 3H: Teacher Task CRUD with Gamification
 */

import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { SUBJECT_LIST } from '../constants/subjects';
import { useTeacherTasks } from '../hooks/useTeacherTasks';
import { StudentSelector } from '../components/StudentSelector';

export const CreateTaskPage = () => {
  const { user } = useAuth();
  const { createTask } = useTeacherTasks(user?.id || null);
  const navigate = useNavigate();

  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59'); // Default to end of day
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(30);
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

    if (!dueTime) {
      setError('Due time is required');
      return;
    }

    // Combine date and time
    const dueDateTimeString = `${dueDate}T${dueTime}:00`;
    const dueDateTime = new Date(dueDateTimeString);
    
    if (dueDateTime < new Date()) {
      setError('Due date and time cannot be in the past');
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
      // Combine date and time for accurate deadline
      const dueDateTimeString = `${dueDate}T${dueTime}:00`;
      const dueDateTime = new Date(dueDateTimeString);
      
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        due_date: dueDateTime.toISOString(),
        subject: subject,
        coin_reward: coinReward,
        priority: priority,
        estimated_minutes: estimatedMinutes,
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
    <Layout>
      {/* Header */}
      <header className="mb-6">
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
            <h1 className="text-text-primary-dark text-4xl font-black leading-tight tracking-[-0.033em]">Create New Task</h1>
          </div>
        </div>
      </header>

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
              <label htmlFor="subject" className="block text-sm font-bold text-gray-100">
                Subject <span className="text-red-400">*</span>
              </label>
              <select
                id="subject"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-background-dark border border-border-dark text-text-primary-dark rounded-lg focus:outline-none focus:ring-0 focus:border-primary transition-colors"
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
              <label htmlFor="title" className="block text-sm font-bold text-text-secondary-dark">
                Task Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="title"
                required
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-background-dark border border-primary text-text-primary-dark rounded-lg focus:outline-none focus:ring-0 focus:border-primary transition-colors"
                placeholder="e.g., Read Chapter 5 and answer questions"
              />
              <p className="mt-1 text-xs text-text-secondary-dark">{title.length}/200 characters</p>
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-bold text-text-secondary-dark">
                Description (Optional)
              </label>
              <textarea
                id="description"
                rows={4}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-background-dark border border-border-dark text-text-primary-dark rounded-lg focus:outline-none focus:ring-0 focus:border-primary transition-colors"
                placeholder="Provide detailed instructions about this task..."
              />
              <p className="mt-1 text-xs text-gray-400">{description.length}/1000 characters</p>
            </div>

            {/* Due Date & Time Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-bold text-text-secondary-dark mb-2">
                    📅 Due Date <span className="text-red-400">*</span>
                  </label>
                  <div className="relative cursor-pointer" onClick={() => {
                    const input = document.getElementById('dueDate') as HTMLInputElement | null;
                    if (input && 'showPicker' in input) {
                      (input as any).showPicker();
                    }
                  }}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="date"
                      id="dueDate"
                      required
                      min={getTodayDate()}
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="mt-1 block w-full pl-10 pr-3 py-2.5 bg-background-dark border border-border-dark text-text-primary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all cursor-pointer hover:bg-background-dark/80"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="dueTime" className="block text-sm font-bold text-text-secondary-dark mb-2">
                    🕐 Due Time <span className="text-red-400">*</span>
                  </label>
                  <div className="relative cursor-pointer" onClick={() => {
                    const input = document.getElementById('dueTime') as HTMLInputElement | null;
                    if (input && 'showPicker' in input) {
                      (input as any).showPicker();
                    }
                  }}>
                    <input
                      type="time"
                      id="dueTime"
                      required
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      className="mt-1 block w-full px-4 py-2.5 bg-background-dark border border-border-dark text-text-primary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all cursor-pointer hover:bg-background-dark/80 text-center font-semibold text-lg"
                    />
                  </div>
                  <p className="mt-1 text-xs text-text-secondary-dark text-center">Default: 11:59 PM</p>
                </div>
              </div>

            {/* Priority Level */}
            <div>
                <label className="block text-sm font-bold text-text-secondary-dark mb-2">
                  ⭐ Priority Level <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPriority('low')}
                    className={`py-3 px-4 rounded-lg font-medium transition-all ${
                      priority === 'low'
                        ? 'bg-green-500/20 border-2 border-green-500 text-green-300'
                        : 'bg-background-dark border border-border-dark text-text-secondary-dark hover:bg-background-dark/80'
                    }`}
                  >
                    🟢 Low
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('medium')}
                    className={`py-3 px-4 rounded-lg font-medium transition-all ${
                      priority === 'medium'
                        ? 'bg-yellow-500/20 border-2 border-yellow-500 text-yellow-300'
                        : 'bg-background-dark border border-border-dark text-text-secondary-dark hover:bg-background-dark/80'
                    }`}
                  >
                    🟡 Medium
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('high')}
                    className={`py-3 px-4 rounded-lg font-medium transition-all ${
                      priority === 'high'
                        ? 'bg-red-500/20 border-2 border-red-500 text-red-300'
                        : 'bg-background-dark border border-border-dark text-text-secondary-dark hover:bg-background-dark/80'
                    }`}
                  >
                    🔴 High
                  </button>
                </div>
              </div>

            {/* Estimated Time */}
            <div>
                <label htmlFor="estimatedMinutes" className="block text-sm font-bold text-text-secondary-dark mb-2">
                  ⏱️ Estimated Time (Optional)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[15, 30, 45, 60, 90, 120, 180, 240].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setEstimatedMinutes(mins)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        estimatedMinutes === mins
                          ? 'bg-primary/20 border-2 border-primary text-primary'
                          : 'bg-background-dark border border-border-dark text-text-secondary-dark hover:bg-background-dark/80'
                      }`}
                    >
                      {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-text-secondary-dark">
                  Help students plan their time better
                </p>
              </div>

            {/* Coin Reward Field */}
            <div>
                <label htmlFor="coinReward" className="block text-sm font-bold text-text-secondary-dark mb-2">
                  🪙 Coin Reward <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  id="coinReward"
                  required
                  min={0}
                  max={1000}
                  value={coinReward}
                  onChange={(e) => setCoinReward(parseInt(e.target.value) || 0)}
                  className="mt-1 block w-full px-3 py-2 bg-background-dark border border-border-dark text-text-primary-dark rounded-lg focus:outline-none focus:ring-0 focus:border-primary transition-colors"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Base coins (0-1000)
                </p>
              </div>

            {/* Gamification Tip */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-xs text-yellow-300 font-medium">
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
                className="flex-1 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Task...' : '✓ Create Task'}
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
