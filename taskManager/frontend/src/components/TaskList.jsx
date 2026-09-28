import TaskCard from './TaskCard';
import EmptyState from './EmptyState';

export default function TaskList({ tasks, loading, error, onRetry, onEdit, onDelete, onCreateTask, filter }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Loading tasks...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-red-600 mb-3">Unable to load tasks.</p>
        <p className="text-xs text-gray-500 mb-5">{error}</p>
        <button onClick={onRetry} className="btn-secondary" id="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return <EmptyState filter={filter} onCreateTask={onCreateTask} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
