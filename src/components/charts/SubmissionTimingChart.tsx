import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { SubmissionTiming } from '../../types/analytics';

interface SubmissionTimingChartProps {
  data: SubmissionTiming[];
}

export function SubmissionTimingChart({ data }: SubmissionTimingChartProps) {
  // Transform data for chart
  const chartData = data.map(item => ({
    category: item.timing_bucket,
    count: item.submission_count,
    fullName: item.timing_bucket
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-component-dark border border-border-dark rounded-lg p-3 shadow-lg">
          <p className="text-text-primary-dark font-semibold mb-1">{data.fullName}</p>
          <p className="text-text-secondary-dark text-sm">
            Submissions: <span className="text-primary font-semibold">{data.count}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-component-dark border border-border-dark rounded-lg p-6">
      <h3 className="text-lg font-semibold text-text-primary-dark mb-4">
        📊 Procrastination Meter
      </h3>
      <p className="text-text-secondary-dark text-sm mb-4">
        When do students submit their work?
      </p>
      
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-text-secondary-dark text-center">
            No submission data yet.<br />Data will appear as students complete tasks.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis 
              dataKey="category" 
              stroke="#A0AEC0"
              style={{ fontSize: '11px' }}
              angle={-15}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#A0AEC0"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ color: '#A0AEC0' }}
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              name="Submissions"
              stroke="#4F46E5" 
              strokeWidth={3}
              dot={{ fill: '#4F46E5', r: 6 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
      
      <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
        <p className="text-xs text-yellow-300">
          💡 <strong>Insight:</strong> High "On Due Date" or "Overdue" counts may indicate procrastination patterns. 
          Early submissions show good time management!
        </p>
      </div>
    </div>
  );
}
