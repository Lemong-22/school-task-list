import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const StudentDashboard = () => {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Welcome, {profile?.full_name || 'Student'}!
            </h2>
            <p className="text-gray-600 mt-1">{user?.email}</p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">My Tasks</h3>
            <div className="bg-gray-50 rounded-md p-8 text-center">
              <p className="text-gray-500">
                Task management features coming soon! 📚
              </p>
              <p className="text-sm text-gray-400 mt-2">
                You'll be able to view and complete tasks assigned by your teachers.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
