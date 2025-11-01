import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { CoinDisplay } from '../components/CoinDisplay';
import { TaskList } from '../components/TaskList';
import { CoinRewardModal } from '../components/CoinRewardModal';
import { CoinRewardResult } from '../types/coin';
import { supabase } from '../lib/supabaseClient';

export const StudentDashboard = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { tasks, loading, error, refetch } = useTasks(user?.id || null);
  const [currentCoins, setCurrentCoins] = useState(profile?.total_coins || 0);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardData, setRewardData] = useState<CoinRewardResult | null>(null);
  const [completedTaskTitle, setCompletedTaskTitle] = useState<string>('');

  // Update coins when profile changes
  useEffect(() => {
    setCurrentCoins(profile?.total_coins || 0);
  }, [profile?.total_coins]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleTaskCompleted = async (reward: CoinRewardResult, taskTitle: string) => {
    // Show the reward modal FIRST before refetching
    setRewardData(reward);
    setCompletedTaskTitle(taskTitle);
    setShowRewardModal(true);
    
    // Then refetch tasks and coins
    await refetch();
    
    // Refresh profile in AuthContext for real-time coin updates across all components
    await refreshProfile();
    
    // Update local state as well
    if (user?.id) {
      const { data } = await supabase
        .from('profiles')
        .select('total_coins')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setCurrentCoins(data.total_coins);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
            
            <div className="flex items-center gap-4">
              {/* Coin Display */}
              <CoinDisplay totalCoins={currentCoins} />
              
              {/* Shop Link */}
              <button
                onClick={() => navigate('/shop')}
                className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
              >
                🛒 Shop
              </button>
              
              {/* Inventory Link */}
              <button
                onClick={() => navigate('/inventory')}
                className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors"
              >
                🎒 Inventory
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
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Welcome, {profile?.full_name || 'Student'}!
              </h2>
              <p className="text-gray-600 mt-1">{user?.email}</p>
            </div>
            
            {/* Info Section */}
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Complete tasks on time to earn coins! 🪙
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Be in the top 3 to get bonus coins
              </p>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">My Tasks</h3>
          
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
              <button
                onClick={refetch}
                className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <TaskList
              assignments={tasks}
              studentId={user?.id || ''}
              onTaskCompleted={handleTaskCompleted}
            />
          )}
        </div>
      </main>

      {/* Coin Reward Modal */}
      <CoinRewardModal
        isOpen={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        rewardData={rewardData}
        taskTitle={completedTaskTitle}
      />
    </div>
  );
};
