import { Pencil, Trash2, Clock, Circle, CheckCircle2 } from 'lucide-react';

const STATUS_CONFIG = {
  Pending: {
    label: 'Pending',
    icon: Circle,
    className: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  'In Progress': {
    label: 'In Progress',
    icon: Clock,
    className: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  Completed: {
    label: 'Completed',
    icon: CheckCircle2,
    className: 'text-green-600 bg-green-50 border-green-200',
  },
};

const PRIORITY_CONFIG = {
  Low: { className: 'text-gray-600 bg-gray-100' },
  Medium: { className: 'text-yellow-700 bg-yellow-50 border border-yellow-200' },
  High: { className: 'text-red-600 bg-red-50 border border-red-200' },
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function TaskCard({ task, onEdit, onDelete }) {
  const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG['Pending'];
  const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG['Medium'];
  const StatusIcon = statusCfg.icon;

  return (
    <article className="card p-4 flex flex-col gap-3 hover:shadow-md transition-shadow duration-150">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug break-words flex-1">
          {task.title}
        </h3>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            aria-label={`Edit ${task.title}`}
            id={`edit-task-${task._id}`}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            aria-label={`Delete ${task.title}`}
            id={`delete-task-${task._id}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between flex-wrap gap-2 mt-auto pt-1">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded border ${statusCfg.className}`}
          >
            <StatusIcon className="w-3 h-3" />
            {statusCfg.label}
          </span>
          {/* Priority badge */}
          <span
            className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${priorityCfg.className}`}
          >
            {task.priority}
          </span>
        </div>
        {/* Created date */}
        <span className="text-xs text-gray-400">{formatDate(task.createdAt)}</span>
      </div>
    </article>
  );
}
