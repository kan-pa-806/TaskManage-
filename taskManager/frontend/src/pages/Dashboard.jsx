import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  KanbanSquare,
  Plus,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { projectService } from '../services/projectService';
import { issueService } from '../services/issueService';
import { IssueTypeIcon, IssuePriorityIcon, IssueStatusBadge } from '../components/IssueBadge';
import ProjectModal from '../components/ProjectModal';
import CreateIssueModal from '../components/CreateIssueModal';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);

  const loadDashboard = () => {
    setLoading(true);
    setError('');

    Promise.all([projectService.getAll(), issueService.getAll()])
      .then(([pRes, iRes]) => {
        setProjects(pRes.data.data || []);
        setRecentIssues((iRes.data.data || []).slice(0, 8));
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Failed to load dashboard');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-gray-50/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-200 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Workspace Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Welcome back{user?.name ? `, ${user.name}` : ''}. Overview of your active projects and recent work.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setProjectModalOpen(true)}
            className="btn-secondary text-xs"
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
          <button
            onClick={() => setIssueModalOpen(true)}
            className="btn-primary text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Issue</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex items-center justify-center text-xs text-gray-500 gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading dashboard...</span>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {/* Projects Overview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-blue-600" />
                <span>Active Projects ({projects.length})</span>
              </h2>
              {projects.length > 0 && (
                <Link to="/projects" className="text-xs text-blue-600 hover:underline">
                  View all projects
                </Link>
              )}
            </div>

            {projects.length === 0 ? (
              <div className="card p-8 text-center bg-white">
                <FolderKanban className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-800 mb-1">No projects yet</p>
                <p className="text-xs text-gray-500 mb-4">
                  Create your first project to start organizing tasks, boards, and sprints.
                </p>
                <button
                  onClick={() => setProjectModalOpen(true)}
                  className="btn-primary inline-flex text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Project</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((p) => (
                  <div
                    key={p._id}
                    className="card p-4 bg-white hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                        {p.key}
                      </span>
                      <span className="text-xs text-gray-400">
                        {p.totalIssues || 0} issues
                      </span>
                    </div>

                    <Link
                      to={`/projects/${p._id}/board`}
                      className="text-sm font-bold text-gray-900 hover:text-blue-600 block mb-1"
                    >
                      {p.name}
                    </Link>

                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                      {p.description || 'No description provided.'}
                    </p>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                      <Link
                        to={`/projects/${p._id}`}
                        className="text-gray-500 hover:text-gray-800"
                      >
                        Overview
                      </Link>
                      <Link
                        to={`/projects/${p._id}/board`}
                        className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <KanbanSquare className="w-3 h-3" />
                        <span>Board</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Issues Across Projects */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>Recent Issues</span>
              </h2>
            </div>

            {recentIssues.length === 0 ? (
              <div className="card p-6 text-center bg-white text-xs text-gray-400">
                No issues created yet in this workspace.
              </div>
            ) : (
              <div className="card bg-white divide-y divide-gray-100 overflow-hidden shadow-sm">
                {recentIssues.map((issue) => (
                  <div
                    key={issue._id}
                    className="p-3 hover:bg-gray-50 flex items-center justify-between gap-3 text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <IssueTypeIcon type={issue.issueType} />
                      <Link
                        to={`/issues/${issue._id}`}
                        className="font-mono font-semibold text-blue-600 hover:underline flex-shrink-0"
                      >
                        {issue.issueKey}
                      </Link>
                      <Link
                        to={`/issues/${issue._id}`}
                        className="text-gray-800 font-medium truncate hover:text-blue-600"
                      >
                        {issue.title}
                      </Link>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <IssueStatusBadge status={issue.status} />
                      <IssuePriorityIcon priority={issue.priority} />
                      <span className="text-gray-500 w-24 truncate text-right">
                        {issue.assignee || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onCreated={() => loadDashboard()}
      />

      <CreateIssueModal
        isOpen={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        onCreated={() => loadDashboard()}
      />
    </div>
  );
}
