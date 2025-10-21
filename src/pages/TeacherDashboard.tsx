import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { TaskCard } from '../components/TaskCard';
import { TaskWithStats } from '../types/task';
import { useState, useEffect } from 'react';

export const TeacherDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { tasks, loading, deleteTask } = useTasks();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Show success message from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      // Clear location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleCreateTask = () => {
    navigate('/tasks/create');
  };

  const handleEditTask = (taskId: string) => {
    navigate(`/tasks/edit/${taskId}`);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tugas ini? Tugas akan dihapus untuk semua siswa yang ditugaskan.')) {
      try {
        await deleteTask(taskId);
        setSuccessMessage('Tugas berhasil dihapus!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error: any) {
        alert(error.message || 'Gagal menghapus tugas');
      }
    }
  };

  // Separate active and completed tasks
  const tasksWithStats = tasks as TaskWithStats[];
  const activeTasks = tasksWithStats.filter(
    (task) => task.total_assignments === 0 || task.completed_assignments < task.total_assignments
  );
  const completedTasks = tasksWithStats.filter(
    (task) => task.total_assignments > 0 && task.completed_assignments === task.total_assignments
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Guru</h1>
            <div className="flex gap-3">
              <button
                onClick={handleCreateTask}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                + Buat Tugas Baru
              </button>
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
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-800">{successMessage}</div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Selamat Datang, {profile?.full_name || 'Guru'}!
          </h2>
          <p className="text-gray-600 mt-1">{user?.email}</p>
        </div>

        {/* Active Tasks Section */}
        {loading ? (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat tugas...</p>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Daftar Tugas</h3>
            <div className="bg-gray-50 rounded-md p-8 text-center">
              <p className="text-gray-500">Anda belum membuat tugas apapun.</p>
              <p className="text-sm text-gray-400 mt-2">
                Klik tombol "Buat Tugas Baru" untuk memulai.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Active Tasks */}
            {activeTasks.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Tugas Aktif ({activeTasks.length})
                </h3>
                <div className="space-y-4">
                  {activeTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isTeacher={true}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Tasks History */}
            {completedTasks.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  📚 Riwayat Tugas Selesai ({completedTasks.length})
                </h3>
                <div className="space-y-4">
                  {completedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isTeacher={true}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
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
