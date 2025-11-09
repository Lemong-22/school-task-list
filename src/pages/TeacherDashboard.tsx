import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useTeacherTasks } from '../hooks/useTeacherTasks';
import { Layout } from '../components/Layout';
import { TaskFilters } from '../components/TaskFilters';
import { EmptyState } from '../components/EmptyState';

export const TeacherDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
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

  const { tasks, loading, error, deleteTask } = useTeacherTasks(user?.id || null, hookFilters);

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
  const totalStudents = 124; // Hardcoded for now
  const activeAssignments = tasks.length;
  const submissionsToGrade = 15; // Hardcoded for now
  const totalCoinsAwarded = profile?.total_coins || 0;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Layout>
      <main className="flex-1 py-8">
        {/* Page Header with Button */}
        <div className="flex flex-wrap justify-between items-center gap-4 px-4 pb-8">
          <p className="text-text-primary-dark text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
            Dashboard
          </p>
          <button 
            onClick={() => navigate('/tasks/create')}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="truncate">New Assignment</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
          <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-component-dark shadow-md">
            <p className="text-text-secondary-dark text-sm font-medium leading-normal">Total Students</p>
            <p className="text-text-primary-dark tracking-light text-3xl font-bold leading-tight">{totalStudents}</p>
          </div>
          <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-component-dark shadow-md">
            <p className="text-text-secondary-dark text-sm font-medium leading-normal">Active Assignments</p>
            <p className="text-text-primary-dark tracking-light text-3xl font-bold leading-tight">{activeAssignments}</p>
          </div>
          <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-component-dark shadow-md">
            <p className="text-text-secondary-dark text-sm font-medium leading-normal">Submissions to Grade</p>
            <p className="text-text-primary-dark tracking-light text-3xl font-bold leading-tight">{submissionsToGrade}</p>
          </div>
          <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-component-dark shadow-md">
            <p className="text-text-secondary-dark text-sm font-medium leading-normal">Total Coins Awarded</p>
            <p className="text-text-primary-dark tracking-light text-3xl font-bold leading-tight">{totalCoinsAwarded.toLocaleString()}</p>
          </div>
        </div>

        {/* Recent Assignments Section */}
        <h2 className="text-text-primary-dark text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-4 pt-10">
          Recent Assignments
        </h2>

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
                  <p className="text-text-secondary-dark">Loading assignments...</p>
                </div>
              </div>
          ) : error ? (
              <div className="p-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400">Error: {error}</p>
                </div>
              </div>
          ) : tasks.length === 0 ? (
            <>
              {filtersAreActive ? (
                <EmptyState onClearFilters={clearFilters} />
              ) : (
                <div className="bg-component-dark rounded-lg shadow-md p-12 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-text-primary-dark font-medium mb-2">
                    No tasks created yet
                  </p>
                  <p className="text-text-secondary-dark">
                    Create your first assignment to get started!
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-component-dark rounded-lg shadow-md overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-border-dark">
                  <tr>
                    <th className="p-4 text-xs font-bold text-text-secondary-dark uppercase tracking-wider">
                      Assignment Title
                    </th>
                    <th className="p-4 text-xs font-bold text-text-secondary-dark uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="p-4 text-xs font-bold text-text-secondary-dark uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="p-4 text-xs font-bold text-text-secondary-dark uppercase tracking-wider">
                      Status
                    </th>
                    <th className="p-4 text-xs font-bold text-text-secondary-dark uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-800/50 transition-colors group">
                      <td className="p-4 text-sm font-medium text-text-primary-dark whitespace-nowrap">
                        {task.title}
                      </td>
                      <td className="p-4 text-sm text-text-secondary-dark whitespace-nowrap">
                        {task.subject}
                      </td>
                      <td className="p-4 text-sm text-text-secondary-dark whitespace-nowrap">
                        {formatDate(task.due_date)}
                      </td>
                      <td className="p-4 text-sm text-text-secondary-dark whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300">
                          Pending
                        </span>
                      </td>
                      <td className="p-4 text-sm text-text-secondary-dark whitespace-nowrap text-right">
                        <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => navigate(`/tasks/edit/${task.id}`)}
                            className="p-2 rounded-full hover:bg-border-dark"
                            title="View"
                          >
                            <svg className="w-5 h-5 text-text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => navigate(`/tasks/edit/${task.id}`)}
                            className="p-2 rounded-full hover:bg-border-dark"
                            title="Edit"
                          >
                            <svg className="w-5 h-5 text-text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this task?')) {
                                deleteTask(task.id);
                              }
                            }}
                            className="p-2 rounded-full hover:bg-border-dark"
                            title="Delete"
                          >
                            <svg className="w-5 h-5 text-text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
};
