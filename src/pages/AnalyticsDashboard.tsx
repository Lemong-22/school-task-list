import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { CompletionPieChart } from '../components/charts/CompletionPieChart';
import { EngagementBarChart } from '../components/charts/EngagementBarChart';
import { SubjectRadarChart } from '../components/charts/SubjectRadarChart';
import { SubmissionTimingChart } from '../components/charts/SubmissionTimingChart';
import { WorkDistributionChart } from '../components/charts/WorkDistributionChart';
import { Layout } from '../components/Layout';

export function AnalyticsDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useAnalytics();

  // Redirect if not a teacher
  if (profile?.role !== 'teacher') {
    navigate('/dashboard/student');
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background-dark py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary-dark">Analytics Dashboard</h1>
              <p className="text-text-secondary-dark mt-1">Monitor class performance and student engagement</p>
            </div>
            <button
              onClick={refetch}
              disabled={isLoading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-text-secondary-dark mt-4">Loading analytics...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 mb-6">
              <p className="text-red-400 font-semibold">Error loading analytics</p>
              <p className="text-text-secondary-dark text-sm mt-1">{error}</p>
              <button
                onClick={refetch}
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Analytics Content */}
          {!isLoading && !error && data && (
            <div className="space-y-6">
              {/* Top Row: Pie Chart + Bar Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CompletionPieChart data={data.completionStats} />
                <EngagementBarChart data={data.studentEngagement} />
              </div>

              {/* Bottom Row: Radar Chart (Full Width) */}
              <div className="grid grid-cols-1">
                <SubjectRadarChart data={data.subjectPerformance} />
              </div>

              {/* New Row: Procrastination Meter + Work Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SubmissionTimingChart data={data.submissionTiming} />
                <WorkDistributionChart data={data.workDistribution} />
              </div>

              {/* Stats Summary */}
              <div className="bg-component-dark border border-border-dark rounded-lg p-6">
                <h3 className="text-lg font-semibold text-text-primary-dark mb-4">Quick Stats</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{data.completionStats.total_tasks}</p>
                    <p className="text-text-secondary-dark text-sm mt-1">Total Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-400">{data.completionStats.completed_tasks}</p>
                    <p className="text-text-secondary-dark text-sm mt-1">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-400">{data.completionStats.overdue_tasks}</p>
                    <p className="text-text-secondary-dark text-sm mt-1">Overdue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-400">{data.studentEngagement.length}</p>
                    <p className="text-text-secondary-dark text-sm mt-1">Active Students</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
