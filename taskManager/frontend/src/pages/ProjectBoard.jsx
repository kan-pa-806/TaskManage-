import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  KanbanSquare,
  Plus,
  Filter,
  Search,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { projectService } from '../services/projectService';
import { issueService } from '../services/issueService';
import { sprintService } from '../services/sprintService';
import { IssueTypeIcon, IssuePriorityIcon } from '../components/IssueBadge';
import CreateIssueModal from '../components/CreateIssueModal';

const COLUMNS = ['TO DO', 'IN PROGRESS', 'IN REVIEW', 'DONE'];

export default function ProjectBoard() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [activeSprintId, setActiveSprintId] = useState('all');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Local search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Dragging state
  const [draggedIssueId, setDraggedIssueId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  // Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadData = useCallback(() => {
    setLoading(true);
    setError('');

    Promise.all([
      projectService.getById(projectId),
      sprintService.getAll({ projectId }),
      issueService.getAll({ projectId }),
    ])
      .then(([projRes, sprintsRes, issuesRes]) => {
        setProject(projRes.data.data);
        const sprintList = sprintsRes.data.data || [];
        setSprints(sprintList);

        // If there's an active sprint, default filter to it
        const active = sprintList.find((s) => s.status === 'ACTIVE');
        if (active && activeSprintId === 'all') {
          setActiveSprintId(active._id);
        }

        setIssues(issuesRes.data.data || []);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Failed to load project board');
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Drag and Drop handlers
  const handleDragStart = (e, issueId) => {
    e.dataTransfer.setData('text/plain', issueId);
    setDraggedIssueId(issueId);
  };

  const handleDragOver = (e, col) => {
    e.preventDefault();
    if (dragOverCol !== col) {
      setDragOverCol(col);
    }
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const issueId = e.dataTransfer.getData('text/plain') || draggedIssueId;
    setDraggedIssueId(null);

    if (!issueId) return;

    const currentIssue = issues.find((i) => i._id === issueId);
    if (!currentIssue || currentIssue.status === targetStatus) return;

    // Optimistic update
    const previousIssues = [...issues];
    setIssues((prev) =>
      prev.map((i) => (i._id === issueId ? { ...i, status: targetStatus } : i))
    );

    try {
      await issueService.update(issueId, { status: targetStatus });
      showToast(`Moved ${currentIssue.issueKey} to ${targetStatus}`);
    } catch (err) {
      // Rollback on failure
      setIssues(previousIssues);
      setError('Failed to update status. Rolled back changes.');
    }
  };

  // Filter issues based on sprint and search
  const filteredIssues = issues.filter((issue) => {
    if (activeSprintId !== 'all') {
      if (activeSprintId === 'backlog') {
        if (issue.sprintId) return false;
      } else {
        const issueSprint = issue.sprintId?._id || issue.sprintId;
        if (issueSprint !== activeSprintId) return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchKey = issue.issueKey?.toLowerCase().includes(q);
      const matchTitle = issue.title?.toLowerCase().includes(q);
      const matchAssignee = issue.assignee?.toLowerCase().includes(q);
      if (!matchKey && !matchTitle && !matchAssignee) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading project board...</span>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="flex-1 p-6">
        <div className="card p-6 text-center max-w-md mx-auto">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-900 mb-1">Failed to load board</p>
          <p className="text-xs text-gray-500 mb-4">{error}</p>
          <button onClick={loadData} className="btn-primary inline-flex">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 px-3 py-2 bg-gray-900 text-white text-xs rounded-md shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-150">
          {toast}
        </div>
      )}

      {/* Board Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Link to="/projects" className="hover:underline">Projects</Link>
              <span>/</span>
              <Link to={`/projects/${projectId}`} className="hover:underline font-medium text-gray-700">
                {project?.name}
              </Link>
            </div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <KanbanSquare className="w-5 h-5 text-blue-600" />
              <span>{project?.name} Board</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="btn-primary py-1 px-3 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Issue</span>
            </button>
          </div>
        </div>

        {/* Board Filters */}
        <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {/* Sprint Filter */}
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <span className="font-medium">Sprint:</span>
              <select
                value={activeSprintId}
                onChange={(e) => setActiveSprintId(e.target.value)}
                className="py-1 px-2 bg-gray-50 border border-gray-200 rounded text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Issues ({issues.length})</option>
                {sprints.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.status})
                  </option>
                ))}
                <option value="backlog">Backlog only</option>
              </select>
            </div>

            {/* Quick search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter board..."
                className="pl-8 pr-3 py-1 text-xs bg-gray-50 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Showing {filteredIssues.length} of {issues.length} issues
          </div>
        </div>
      </div>

      {/* Kanban Columns Canvas */}
      <div className="flex-1 p-6 overflow-x-auto overflow-y-hidden bg-gray-50/50">
        <div className="flex gap-4 h-full min-w-[960px]">
          {COLUMNS.map((col) => {
            const colIssues = filteredIssues.filter((i) => i.status === col);
            const isOver = dragOverCol === col;

            return (
              <div
                key={col}
                onDragOver={(e) => handleDragOver(e, col)}
                onDrop={(e) => handleDrop(e, col)}
                className={`flex-1 flex flex-col rounded-lg bg-gray-100/80 border transition-colors ${
                  isOver ? 'border-blue-400 bg-blue-50/30' : 'border-gray-200'
                }`}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {col}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 text-[11px] font-semibold flex items-center justify-center">
                      {colIssues.length}
                    </span>
                  </div>
                </div>

                {/* Issues Drop List */}
                <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                  {colIssues.length === 0 ? (
                    <div className="h-24 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-md text-xs text-gray-400">
                      Drag issues here
                    </div>
                  ) : (
                    colIssues.map((issue) => (
                      <div
                        key={issue._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, issue._id)}
                        className={`card p-3 bg-white hover:border-gray-300 hover:shadow-sm transition-all cursor-grab active:cursor-grabbing group ${
                          draggedIssueId === issue._id ? 'opacity-40' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <Link
                            to={`/issues/${issue._id}`}
                            className="font-mono text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <span>{issue.issueKey}</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity" />
                          </Link>
                          <div className="flex items-center gap-1.5">
                            <IssuePriorityIcon priority={issue.priority} />
                            <IssueTypeIcon type={issue.issueType} />
                          </div>
                        </div>

                        <Link
                          to={`/issues/${issue._id}`}
                          className="text-xs font-medium text-gray-900 block line-clamp-2 hover:text-blue-600 mb-2"
                        >
                          {issue.title}
                        </Link>

                        {/* Labels */}
                        {issue.labels?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {issue.labels.slice(0, 3).map((l, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium"
                              >
                                {l}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Card Footer: Assignee */}
                        <div className="flex items-center justify-between pt-1 border-t border-gray-50 text-[11px] text-gray-500">
                          <span className="truncate max-w-[140px]">
                            {issue.assignee || 'Unassigned'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      <CreateIssueModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        initialProjectId={projectId}
        onCreated={(newIssue) => {
          setIssues((prev) => [newIssue, ...prev]);
          showToast(`Issue ${newIssue.issueKey} created`);
        }}
      />
    </div>
  );
}
