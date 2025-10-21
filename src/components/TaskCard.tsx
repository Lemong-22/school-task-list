import { Task, TaskAssignment, TaskWithStats } from '../types/task';

interface TaskCardProps {
  task?: Task | TaskWithStats;
  assignment?: TaskAssignment;
  isTeacher: boolean;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onComplete?: (assignmentId: string) => void;
}

export const TaskCard = ({
  task,
  assignment,
  isTeacher,
  onEdit,
  onDelete,
  onComplete,
}: TaskCardProps) => {
  // Determine the actual task data
  const taskData = task || assignment?.task;
  if (!taskData) return null;

  // Check if task is overdue
  const dueDate = new Date(taskData.due_date);
  const today = new Date();
  const isOverdue = dueDate < today && (!assignment || assignment.status === 'pending');

  // Check if completed
  const isCompleted = assignment?.status === 'completed';
  
  // Check if all students have completed (for teachers)
  const taskWithStats = task as TaskWithStats | undefined;
  const isFullyCompleted = isTeacher && 
    taskWithStats && 
    'total_assignments' in taskWithStats && 
    taskWithStats.total_assignments > 0 && 
    taskWithStats.completed_assignments === taskWithStats.total_assignments;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
        isCompleted || isFullyCompleted
          ? 'border-green-500 opacity-75'
          : isOverdue
          ? 'border-red-500'
          : 'border-indigo-500'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          {/* Subject Badge */}
          <div className="mb-2">
            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
              {taskData.subject}
            </span>
          </div>
          <h3
            className={`text-lg font-semibold ${
              isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
            }`}
          >
            {taskData.title}
          </h3>
          {taskData.description && (
            <p className="text-gray-600 text-sm mt-1">{taskData.description}</p>
          )}
        </div>

        {/* Status Badge */}
        {!isTeacher && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              isCompleted
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {isCompleted ? 'Selesai' : 'Tertunda'}
          </span>
        )}
        {isTeacher && isFullyCompleted && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✓ Semua Selesai
          </span>
        )}
      </div>

      {/* Due Date */}
      <div className="flex items-center text-sm mb-4">
        <svg
          className="w-4 h-4 mr-2 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className={isOverdue && !isCompleted ? 'text-red-600 font-medium' : 'text-gray-600'}>
          Jatuh Tempo: {formatDate(taskData.due_date)}
          {isOverdue && !isCompleted && (
            <span className="ml-2 text-red-600 font-semibold">(Terlambat)</span>
          )}
        </span>
      </div>

      {/* Teacher View - Progress Statistics */}
      {isTeacher && taskWithStats && 'total_assignments' in taskWithStats && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Progress Penyelesaian:</span>
            <span className="font-medium text-gray-900">
              {taskWithStats.completed_assignments} dari {taskWithStats.total_assignments} siswa
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  taskWithStats.total_assignments > 0
                    ? (taskWithStats.completed_assignments / taskWithStats.total_assignments) * 100
                    : 0
                }%`,
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        {/* Student - Complete Button */}
        {!isTeacher && assignment && !isCompleted && (
          <button
            onClick={() => onComplete?.(assignment.id)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            ✓ Selesaikan Tugas
          </button>
        )}

        {/* Student - Completed Label */}
        {!isTeacher && isCompleted && assignment?.completed_at && (() => {
          const date = new Date(assignment.completed_at);
          const dateStr = date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });
          const timeStr = date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }).replace('.', ':'); // Replace period with colon
          return (
            <div className="flex-1 text-center text-sm text-gray-500">
              Diselesaikan pada {dateStr}, {timeStr}
            </div>
          );
        })()}

        {/* Teacher - Edit Button (only if not fully completed) */}
        {isTeacher && onEdit && !isFullyCompleted && (
          <button
            onClick={() => onEdit(taskData.id)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            ✏️ Edit
          </button>
        )}

        {/* Teacher - Delete Button (only if not fully completed) */}
        {isTeacher && onDelete && !isFullyCompleted && (
          <button
            onClick={() => onDelete(taskData.id)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            🗑️ Hapus
          </button>
        )}
        
        {/* Teacher - Completed Message */}
        {isTeacher && isFullyCompleted && (
          <div className="flex-1 text-center text-sm text-green-600 font-medium">
            ✓ Tugas ini telah diselesaikan oleh semua siswa
          </div>
        )}
      </div>
    </div>
  );
};
