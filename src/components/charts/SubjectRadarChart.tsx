import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { SubjectPerformance } from '../../types/analytics';

interface SubjectRadarChartProps {
  data: SubjectPerformance[];
}

export function SubjectRadarChart({ data }: SubjectRadarChartProps) {
  // Transform data for radar chart
  const chartData = data.map(subject => ({
    subject: subject.subject,
    performance: subject.performance_score || 0,
    completionRate: subject.avg_completion_rate || 0,
    onTimeRate: subject.avg_on_time_rate || 0,
    totalTasks: subject.total_tasks
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-component-dark border border-border-dark rounded-lg p-3 shadow-lg">
          <p className="text-text-primary-dark font-semibold mb-2">{data.subject}</p>
          <p className="text-text-secondary-dark text-sm">
            Performance: <span className="text-primary font-semibold">{data.performance.toFixed(1)}</span>
          </p>
          <p className="text-text-secondary-dark text-sm">
            Completion Rate: <span className="text-green-400 font-semibold">{data.completionRate.toFixed(1)}%</span>
          </p>
          <p className="text-text-secondary-dark text-sm">
            On-Time Rate: <span className="text-blue-400 font-semibold">{data.onTimeRate.toFixed(1)}%</span>
          </p>
          <p className="text-text-secondary-dark text-sm mt-1">
            Total Tasks: {data.totalTasks}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-component-dark border border-border-dark rounded-lg p-6">
      <h3 className="text-lg font-semibold text-text-primary-dark mb-4">
        Subject Performance
      </h3>
      
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-text-secondary-dark text-center">
            No subject performance data yet.<br />Create tasks across different subjects to see analytics.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid stroke="#4A5568" />
            <PolarAngleAxis 
              dataKey="subject" 
              stroke="#A0AEC0"
              style={{ fontSize: '12px' }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              stroke="#A0AEC0"
              style={{ fontSize: '10px' }}
            />
            <Radar 
              name="Performance Score" 
              dataKey="performance" 
              stroke="#4F46E5" 
              fill="#4F46E5" 
              fillOpacity={0.6}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ color: '#A0AEC0' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
