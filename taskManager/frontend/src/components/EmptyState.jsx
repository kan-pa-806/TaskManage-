import { ClipboardList, Plus } from 'lucide-react';

export default function EmptyState({ filter, onCreateTask }) {
  const isFiltered = filter && filter !== 'all';
  const message = isFiltered
    ? `No ${filter.toLowerCase()} tasks found.`
    : 'No tasks yet.';
  const subMessage = isFiltered
    ? 'Try a different filter or create a new task.'
    : 'Create a task to start managing your work.';

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
        <ClipboardList className="w-6 h-6 text-gray-400" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{message}</h3>
      <p className="text-sm text-gray-500 mb-5">{subMessage}</p>
      {!isFiltered && (
        <button onClick={onCreateTask} className="btn-primary" id="empty-create-task-btn">
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      )}
    </div>
  );
}
