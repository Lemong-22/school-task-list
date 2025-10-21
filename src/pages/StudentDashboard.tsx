import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { TaskCard } from '../components/TaskCard';
import { TaskAssignment } from '../types/task';

export const StudentDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { tasks, loading, completeTask } = useTasks();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleCompleteTask = async (assignmentId: string) => {
    try {
      await completeTask(assignmentId);
    } catch (error: any) {
      alert(error.message || 'Gagal menyelesaikan tugas');
    }
  };

  // Separate pending and completed tasks
  const assignments = tasks as TaskAssignment[];
  const pendingTasks = assignments.filter(a => a.status === 'pending');
  const completedTasks = assignments.filter(a => a.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Siswa</h1>
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
        {/* Welcome Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Selamat Datang, {profile?.full_name || 'Siswa'}!
          </h2>
          <p className="text-gray-600 mt-1">{user?.email}</p>
        </div>

        {/* Tasks Section */}
        {loading ? (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat tugas...</p>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tugas Saya</h3>
            <div className="bg-gray-50 rounded-md p-8 text-center">
              <p className="text-gray-500">Anda belum memiliki tugas yang ditugaskan.</p>
              <p className="text-sm text-gray-400 mt-2">
                Tugas yang ditugaskan oleh guru akan muncul di sini.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Tugas Tertunda ({pendingTasks.length})
                </h3>
                <div className="space-y-4">
                  {pendingTasks.map((assignment) => (
                    <TaskCard
                      key={assignment.id}
                      assignment={assignment}
                      isTeacher={false}
                      onComplete={handleCompleteTask}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Tugas Selesai ({completedTasks.length})
                </h3>
                <div className="space-y-4">
                  {completedTasks.map((assignment) => (
                    <TaskCard
                      key={assignment.id}
                      assignment={assignment}
                      isTeacher={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
