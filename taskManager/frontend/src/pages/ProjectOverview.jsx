import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FolderKanban,
  KanbanSquare,
  ListTodo,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { projectService } from '../services/projectService';
import CreateIssueModal from '../components/CreateIssueModal';

export default function ProjectOverview() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const loadProject = useCallback(() => {
    setLoading(true);
    setError('');
    projectService
      .getById(projectId)
      .then((res) => {
        setProject(res.data.data);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Failed to load project details');
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading project overview...</span>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex-1 p-6">
        <div className="card p-6 text-center max-w-md mx-auto">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-900 mb-1">Project not found</p>
          <p className="text-xs text-gray-500 mb-4">{error}</p>
          <Link to="/projects" className="btn-secondary inline-flex">
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  const metrics = project.metrics || {
    total: 0,
    todo: 0,
    inProgress: 0,
    inReview: 0,
    done: 0,
    completionPercentage: 0,
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-gray-50/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-200 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link to="/projects" className="hover:underline">Projects</Link>
            <span>/</span>
            <span className="font-mono text-gray-700">{project.key}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <FolderKanban className="w-6 h-6 text-blue-600" />
            <span>{project.name}</span>
          </h1>
          {project.description && (
            <p className="text-xs text-gray-500 mt-1 max-w-2xl">{project.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="btn-primary text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Issue</span>
          </button>
        </div>
      </div>

      {/* Real Metrics Cards */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 bg-white">
          <span className="text-xs text-gray-500 font-medium">Total Issues</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.total}</p>
        </div>
        <div className="card p-4 bg-white">
          <span className="text-xs text-blue-600 font-medium">In Progress</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">{metrics.inProgress}</p>
        </div>
        <div className="card p-4 bg-white">
          <span className="text-xs text-amber-600 font-medium">In Review</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{metrics.inReview}</p>
        </div>
        <div className="card p-4 bg-white">
          <span className="text-xs text-emerald-600 font-medium">Completed</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{metrics.done}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 card p-4 bg-white">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-gray-700">Project Completion</span>
          <span className="font-bold text-blue-600">{metrics.completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${metrics.completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Project Navigation Hub */}
      <div className="mt-8">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Project Workspaces</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to={`/projects/${projectId}/board`}
            className="card p-5 bg-white hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <KanbanSquare className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Kanban Board</h3>
            <p className="text-xs text-gray-500">
              Interactive drag & drop board across TO DO, IN PROGRESS, IN REVIEW, and DONE.
            </p>
          </Link>

          <Link
            to={`/projects/${projectId}/backlog`}
            className="card p-5 bg-white hover:border-emerald-300 hover:shadow-sm transition-all group"
          >
            <div className="w-9 h-9 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <ListTodo className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Backlog</h3>
            <p className="text-xs text-gray-500">
              Plan iterations, manage unassigned issues, and organize upcoming sprints.
            </p>
          </Link>

          <Link
            to={`/projects/${projectId}/sprints`}
            className="card p-5 bg-white hover:border-purple-300 hover:shadow-sm transition-all group"
          >
            <div className="w-9 h-9 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Sprints</h3>
            <p className="text-xs text-gray-500">
              Active and planned sprints, goals, start and completion milestones.
            </p>
          </Link>

          <Link
            to={`/projects/${projectId}/issues`}
            className="card p-5 bg-white hover:border-amber-300 hover:shadow-sm transition-all group"
          >
            <div className="w-9 h-9 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">All Issues</h3>
            <p className="text-xs text-gray-500">
              Comprehensive table with type, status, priority, and assignee filters.
            </p>
          </Link>
        </div>
      </div>

      <CreateIssueModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        initialProjectId={projectId}
        onCreated={() => loadProject()}
      />
    </div>
  );
}
