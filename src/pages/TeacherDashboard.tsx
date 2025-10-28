import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const TeacherDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

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
              {/* Leaderboard Link */}
              <button
                onClick={() => navigate('/leaderboard')}
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
              >
                🏆 Leaderboard
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

          {/* Leaderboard Info */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">🏆 View Leaderboard</h3>
                <p className="text-sm opacity-90">
                  Check student rankings and engagement
                </p>
                <button
                  onClick={() => navigate('/leaderboard')}
                  className="mt-3 bg-white text-indigo-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Open Leaderboard
                </button>
              </div>
              <div className="text-5xl">📊</div>
            </div>
          </div>
        </div>

        {/* Task Management Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Task Management</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <div className="text-5xl mb-3">📝</div>
            <p className="text-gray-700 font-medium mb-2">
              Task CRUD features coming soon!
            </p>
            <p className="text-sm text-gray-600">
              You'll be able to create, edit, and assign tasks to students.
            </p>
            <p className="text-xs text-gray-500 mt-3">
              For now, you can view the leaderboard to see student engagement.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
