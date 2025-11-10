import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { Layout } from '../components/Layout';
import { TaskCard } from '../components/TaskCard';
import { CoinRewardModal } from '../components/CoinRewardModal';
import { CoinRewardResult } from '../types/coin';
import { supabase } from '../lib/supabaseClient';
import { TaskFilters } from '../components/TaskFilters';
import { EmptyState } from '../components/EmptyState';
import { RefreshCw } from 'lucide-react';

export const StudentDashboard = () => {
  const { user, profile, refreshProfile } = useAuth();
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    subject: 'all',
  });

  // Convert filter state to hook format
  const hookFilters = {
    subject: filters.subject === 'all' ? null : filters.subject,
    status: filters.status as 'all' | 'pending' | 'completed' | 'overdue',
    search: filters.search,
  };

  const { tasks, loading, error, refetch, newTaskCount, clearNotification } = useTasks(user?.id || null, hookFilters);
  const [currentCoins, setCurrentCoins] = useState(profile?.total_coins || 0);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardData, setRewardData] = useState<CoinRewardResult | null>(null);
  const [completedTaskTitle, setCompletedTaskTitle] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update coins when profile changes
  useEffect(() => {
    setCurrentCoins(profile?.total_coins || 0);
  }, [profile?.total_coins]);

  // Handle refresh with animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    clearNotification();
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
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

  // Clear filters function
  const clearFilters = () => {
    setFilters({ search: '', status: 'all', subject: 'all' });
  };

  // Check if any filters are active
  const filtersAreActive = 
    filters.search !== '' || 
    filters.status !== 'all' || 
    filters.subject !== 'all';

  // Calculate stats
  const pendingTasks = tasks.filter(t => !t.is_completed).length;

  return (
    <Layout>
      <main className="flex-1 py-8">
        {/* Page Header */}
        <div className="px-4 pb-8">
          <p className="text-text-primary-dark text-4xl font-black leading-tight tracking-[-0.033em]">
            {profile?.full_name?.toUpperCase() || 'STUDENT'} DASHBOARD
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {/* Total Coins */}
          <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-component-dark shadow-md">
            <p className="text-text-secondary-dark text-sm font-medium leading-normal">Total Coins</p>
            <p className="text-text-primary-dark tracking-light text-3xl font-bold leading-tight">{currentCoins}</p>
          </div>

          {/* Tasks Pending */}
          <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-component-dark shadow-md">
            <p className="text-text-secondary-dark text-sm font-medium leading-normal">Tasks Pending</p>
            <p className="text-text-primary-dark tracking-light text-3xl font-bold leading-tight">{pendingTasks}</p>
          </div>

          {/* Tasks Completed */}
          <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-component-dark shadow-md">
            <p className="text-text-secondary-dark text-sm font-medium leading-normal">Tasks Completed</p>
            <p className="text-text-primary-dark tracking-light text-3xl font-bold leading-tight">{tasks.length - pendingTasks}</p>
          </div>
        </div>

        {/* Section Header */}
        <h2 className="text-text-primary-dark text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-4 pt-10">
          My Tasks
        </h2>

        {/* New Task Notification */}
        {newTaskCount > 0 && (
          <div key={`notification-${newTaskCount}`} className="px-4 mb-6 animate-slide-down">
            <div className="bg-primary/20 border border-primary/50 rounded-lg p-4 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                <p className="text-primary font-medium">
                  {newTaskCount === 1 
                    ? '1 new task assigned!' 
                    : `${newTaskCount} new tasks assigned!`}
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Task Filters */}
        <div className="px-4">
          <TaskFilters onFilterChange={setFilters} />
        </div>

        {/* Task List */}
        <div className="px-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <svg className="animate-spin h-12 w-12 text-primary mx-auto mb-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-text-secondary-dark">Loading tasks...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400">Error: {error}</p>
              <button
                onClick={refetch}
                className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
              >
                Try again
              </button>
            </div>
          ) : tasks.length === 0 ? (
            <>
              {filtersAreActive ? (
                <EmptyState onClearFilters={clearFilters} />
              ) : (
                <div className="bg-component-dark rounded-lg shadow-md p-12 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-text-primary-dark font-medium mb-2">
                    No tasks assigned yet
                  </p>
                  <p className="text-text-secondary-dark">
                    Check back later for new assignments from your teacher!
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tasks.map((assignment) => (
                <TaskCard
                  key={assignment.id}
                  assignment={assignment}
                  studentId={user?.id || ''}
                  onTaskCompleted={handleTaskCompleted}
                />
              ))}
            </div>
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
    </Layout>
  );
};
