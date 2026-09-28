import {
  CheckSquare,
  Bug,
  Bookmark,
  Zap,
  ChevronsDown,
  ChevronDown,
  Minus,
  ChevronUp,
  ChevronsUp,
} from 'lucide-react';

export function IssueTypeIcon({ type, className = 'w-4 h-4' }) {
  switch (type) {
    case 'Bug':
      return <Bug className={`${className} text-red-600`} title="Bug" />;
    case 'Story':
      return <Bookmark className={`${className} text-emerald-600`} title="Story" />;
    case 'Epic':
      return <Zap className={`${className} text-purple-600`} title="Epic" />;
    case 'Task':
    default:
      return <CheckSquare className={`${className} text-blue-600`} title="Task" />;
  }
}

export function IssuePriorityIcon({ priority, className = 'w-4 h-4' }) {
  switch (priority) {
    case 'Highest':
      return <ChevronsUp className={`${className} text-red-600`} title="Highest Priority" />;
    case 'High':
      return <ChevronUp className={`${className} text-orange-600`} title="High Priority" />;
    case 'Lowest':
      return <ChevronsDown className={`${className} text-blue-400`} title="Lowest Priority" />;
    case 'Low':
      return <ChevronDown className={`${className} text-blue-600`} title="Low Priority" />;
    case 'Medium':
    default:
      return <Minus className={`${className} text-amber-500`} title="Medium Priority" />;
  }
}

export function IssueStatusBadge({ status }) {
  let color = 'bg-gray-100 text-gray-700 border-gray-200';
  if (status === 'IN PROGRESS') {
    color = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (status === 'IN REVIEW') {
    color = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (status === 'DONE') {
    color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border ${color}`}
    >
      {status}
    </span>
  );
}
