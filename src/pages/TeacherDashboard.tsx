import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTeacherTasks } from '../hooks/useTeacherTasks';
import { TeacherTaskCard } from '../components/TeacherTaskCard';

export const TeacherDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { tasks, loading, error, deleteTask } = useTeacherTasks(user?.id || null);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
            
            <div className="flex items-center gap-4">
              {/* Create Task Button */}
              <button
                onClick={() => navigate('/tasks/create')}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
              >
                ➕ Create New Task
              </button>

              {/* Leaderboard Link */}
              <button
                onClick={() => navigate('/leaderboard')}
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
              >
                🏆 Leaderboard
              </button>
              
              {/* My Profile Link */}
              <button
                onClick={() => navigate('/profile/me')}
                className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
              >
                👤 My Profile
              </button>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Welcome, {profile?.full_name || 'Teacher'}!
          </h2>
          <p className="text-gray-600 mt-1">{user?.email}</p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Gamification Info */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">🪙 Gamification Active</h3>
                <p className="text-sm opacity-90">
                  Students earn coins by completing tasks on time
                </p>
                <p className="text-xs opacity-75 mt-2">
                  Top 3 fastest students get bonus coins!
                </p>
              </div>
              <div className="text-5xl">🎮</div>
            </div>
          </div>

          {/* Task Stats */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">📊 Your Tasks</h3>
                <p className="text-3xl font-bold">{tasks.length}</p>
                <p className="text-sm opacity-90 mt-1">
                  Total tasks created
                </p>
              </div>
              <div className="text-5xl">📝</div>
            </div>
          </div>
        </div>

        {/* Task Management Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">My Tasks</h3>
            <button
              onClick={() => navigate('/tasks/create')}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
            >
              ➕ Create New Task
            </button>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <svg className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-gray-600">Loading tasks...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">Error: {error}</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <div className="text-5xl mb-3">📝</div>
              <p className="text-gray-700 font-medium mb-2">
                No tasks created yet
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Create your first task to assign to students and start the gamification!
              </p>
              <button
                onClick={() => navigate('/tasks/create')}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
              >
                ➕ Create Your First Task
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <TeacherTaskCard
                  key={task.id}
                  task={task}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
