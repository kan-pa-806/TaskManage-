import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Layers,
  Search,
  Filter,
  Plus,
  RefreshCw,
  AlertCircle,
  X,
} from 'lucide-react';
import { projectService } from '../services/projectService';
import { issueService } from '../services/issueService';
import { IssueTypeIcon, IssuePriorityIcon, IssueStatusBadge } from '../components/IssueBadge';
import CreateIssueModal from '../components/CreateIssueModal';

export default function ProjectIssues() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    setError('');

    const params = {
      projectId,
      search: search.trim() || undefined,
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
      issueType: typeFilter || undefined,
      assignee: assigneeFilter.trim() || undefined,
    };

    Promise.all([
      projectService.getById(projectId),
      issueService.getAll(params),
    ])
      .then(([projRes, issuesRes]) => {
        setProject(projRes.data.data);
        setIssues(issuesRes.data.data || []);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Failed to load issues');
      })
      .finally(() => setLoading(false));
  }, [projectId, search, statusFilter, priorityFilter, typeFilter, assigneeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadData]);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setTypeFilter('');
    setAssigneeFilter('');
  };

  const hasActiveFilters = search || statusFilter || priorityFilter || typeFilter || assigneeFilter;

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link to="/projects" className="hover:underline">Projects</Link>
            <span>/</span>
            <Link to={`/projects/${projectId}`} className="hover:underline font-medium text-gray-700">
              {project?.name}
            </Link>
          </div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            <span>{project?.name} Issues</span>
          </h1>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="btn-primary text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Issue</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search key or summary..."
              className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white w-52"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="TO DO">TO DO</option>
            <option value="IN PROGRESS">IN PROGRESS</option>
            <option value="IN REVIEW">IN REVIEW</option>
            <option value="DONE">DONE</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="py-1.5 px-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="Lowest">Lowest</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Highest">Highest</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="py-1.5 px-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="Task">Task</option>
            <option value="Bug">Bug</option>
            <option value="Story">Story</option>
            <option value="Epic">Epic</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100"
            >
              <X className="w-3 h-3" />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        <div className="text-xs text-gray-500">
          {issues.length} {issues.length === 1 ? 'issue' : 'issues'} found
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <div className="py-12 flex items-center justify-center text-xs text-gray-500 gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span>Loading issues...</span>
          </div>
        ) : issues.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-gray-700 mb-1">No issues match the selected criteria</p>
            <p className="text-xs text-gray-500 mb-4">Try clearing filters or create a new issue.</p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="btn-primary inline-flex text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Issue</span>
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-xs border border-gray-200 rounded-md overflow-hidden">
            <thead className="bg-gray-50 text-gray-600 uppercase font-semibold border-b border-gray-200 tracking-wider">
              <tr>
                <th className="py-2.5 px-3 w-12">Type</th>
                <th className="py-2.5 px-3 w-24">Key</th>
                <th className="py-2.5 px-3">Summary</th>
                <th className="py-2.5 px-3 w-28">Status</th>
                <th className="py-2.5 px-3 w-24">Priority</th>
                <th className="py-2.5 px-3 w-32">Assignee</th>
                <th className="py-2.5 px-3 w-28">Sprint</th>
                <th className="py-2.5 px-3 w-24">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {issues.map((issue) => (
                <tr key={issue._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 px-3 text-center">
                    <IssueTypeIcon type={issue.issueType} />
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-blue-600">
                    <Link to={`/issues/${issue._id}`} className="hover:underline">
                      {issue.issueKey}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-gray-900">
                    <Link to={`/issues/${issue._id}`} className="hover:text-blue-600 block truncate max-w-md">
                      {issue.title}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3">
                    <IssueStatusBadge status={issue.status} />
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <IssuePriorityIcon priority={issue.priority} />
                      <span className="text-gray-700">{issue.priority}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-gray-600 truncate max-w-[120px]">
                    {issue.assignee || 'Unassigned'}
                  </td>
                  <td className="py-2.5 px-3 text-gray-500 truncate max-w-[110px]">
                    {issue.sprintId?.name || 'Backlog'}
                  </td>
                  <td className="py-2.5 px-3 text-gray-400">
                    {new Date(issue.updatedAt || issue.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CreateIssueModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        initialProjectId={projectId}
        onCreated={(newIssue) => {
          setIssues((prev) => [newIssue, ...prev]);
        }}
      />
    </div>
  );
}
