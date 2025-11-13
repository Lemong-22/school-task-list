import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { StudentEngagement } from '../../types/analytics';

interface EngagementBarChartProps {
  data: StudentEngagement[];
}

export function EngagementBarChart({ data }: EngagementBarChartProps) {
  // Truncate long student names
  const truncateName = (name: string) => {
    return name.length > 15 ? name.substring(0, 15) + '...' : name;
  };

  // Transform data for chart
  const chartData = data.map(student => ({
    name: truncateName(student.student_name),
    fullName: student.student_name,
    'Engagement Score': student.engagement_score,
    'Completion Rate': student.completion_rate,
    'On-Time Rate': student.on_time_rate,
    totalAssigned: student.total_assigned,
    totalCompleted: student.total_completed
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-component-dark border border-border-dark rounded-lg p-3 shadow-lg">
          <p className="text-text-primary-dark font-semibold mb-2">{data.fullName}</p>
          <p className="text-text-secondary-dark text-sm">
            Engagement Score: <span className="text-primary font-semibold">{data['Engagement Score'].toFixed(1)}</span>
          </p>
          <p className="text-text-secondary-dark text-sm">
            Completion Rate: <span className="text-green-400 font-semibold">{data['Completion Rate'].toFixed(1)}%</span>
          </p>
          <p className="text-text-secondary-dark text-sm">
            On-Time Rate: <span className="text-blue-400 font-semibold">{data['On-Time Rate'].toFixed(1)}%</span>
          </p>
          <p className="text-text-secondary-dark text-sm mt-1">
            {data.totalCompleted}/{data.totalAssigned} tasks completed
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-component-dark border border-border-dark rounded-lg p-6">
      <h3 className="text-lg font-semibold text-text-primary-dark mb-4">
        Student Engagement
      </h3>
      
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-text-secondary-dark text-center">
            No student engagement data yet.<br />Students need to be assigned tasks.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis 
              dataKey="name" 
              stroke="#A0AEC0"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#A0AEC0"
              style={{ fontSize: '12px' }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ color: '#A0AEC0' }}
            />
            <Bar 
              dataKey="Engagement Score" 
              fill="#4F46E5" 
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
