import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import type { WorkDistribution } from '../../types/analytics';

interface WorkDistributionChartProps {
  data: WorkDistribution[];
}

export function WorkDistributionChart({ data }: WorkDistributionChartProps) {
  // Color palette for different subjects
  const COLORS = [
    '#4F46E5', // primary
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#84CC16', // lime
  ];

  // Transform data for chart
  const chartData = data.map((item, index) => ({
    subject: item.subject,
    tasks: item.task_count,
    color: COLORS[index % COLORS.length]
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-component-dark border border-border-dark rounded-lg p-3 shadow-lg">
          <p className="text-text-primary-dark font-semibold mb-1">{data.subject}</p>
          <p className="text-text-secondary-dark text-sm">
            Total Tasks: <span className="text-primary font-semibold">{data.tasks}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-component-dark border border-border-dark rounded-lg p-6">
      <h3 className="text-lg font-semibold text-text-primary-dark mb-4">
        📚 Work Distribution
      </h3>
      <p className="text-text-secondary-dark text-sm mb-4">
        How many tasks per subject?
      </p>
      
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-text-secondary-dark text-center">
            No tasks created yet.<br />Create tasks to see distribution across subjects.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis 
              dataKey="subject" 
              stroke="#A0AEC0"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#A0AEC0"
              style={{ fontSize: '12px' }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ color: '#A0AEC0' }}
            />
            <Bar 
              dataKey="tasks" 
              name="Task Count"
              radius={[8, 8, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
      
      <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p className="text-xs text-blue-300">
          💡 <strong>Tip:</strong> Balance workload across subjects to prevent student overload in any one area.
        </p>
      </div>
    </div>
  );
}
