import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { TaskCompletionStats } from '../../types/analytics';

interface CompletionPieChartProps {
  data: TaskCompletionStats;
}

export function CompletionPieChart({ data }: CompletionPieChartProps) {
  const pieData = [
    { name: 'Completed', value: data.completed_tasks, fill: '#10B981' },
    { name: 'Pending', value: data.pending_tasks, fill: '#4F46E5' },
    { name: 'Overdue', value: data.overdue_tasks, fill: '#EF4444' }
  ].filter(item => item.value > 0); // Only show non-zero values

  // Custom label to show percentages
  const renderLabel = (entry: any) => {
    const percent = ((entry.value / data.total_tasks) * 100).toFixed(1);
    return `${percent}%`;
  };

  return (
    <div className="bg-component-dark border border-border-dark rounded-lg p-6">
      <h3 className="text-lg font-semibold text-text-primary-dark mb-4">
        Task Completion Rate
      </h3>
      
      {data.total_tasks === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-text-secondary-dark text-center">
            No tasks yet.<br />Create your first task to see statistics.
          </p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1f35', 
                  border: '1px solid #4A5568',
                  borderRadius: '0.5rem',
                  color: '#FFFFFF'
                }}
                itemStyle={{
                  color: '#FFFFFF'
                }}
                labelStyle={{
                  color: '#FFFFFF'
                }}
              />
              <Legend 
                wrapperStyle={{ color: '#A0AEC0' }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="mt-4 text-center">
            <p className="text-text-secondary-dark text-sm">
              Total Tasks: <span className="text-text-primary-dark font-semibold">{data.total_tasks}</span>
            </p>
            <p className="text-text-secondary-dark text-sm mt-1">
              Completion Rate: <span className="text-primary font-semibold">{data.completion_percentage}%</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
