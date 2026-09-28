import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ListTodo,
  Plus,
  Play,
  CheckCircle2,
  Calendar,
  AlertCircle,
  RefreshCw,
  Trash2,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { projectService } from '../services/projectService';
import { issueService } from '../services/issueService';
import { sprintService } from '../services/sprintService';
import { IssueTypeIcon, IssuePriorityIcon, IssueStatusBadge } from '../components/IssueBadge';
import CreateIssueModal from '../components/CreateIssueModal';

export default function ProjectBacklog() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [issues, setIssues] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Sprint Creation Modal
  const [sprintModalOpen, setSprintModalOpen] = useState(false);
  const [newSprintName, setNewSprintName] = useState('');
  const [newSprintGoal, setNewSprintGoal] = useState('');
  const [sprintSubmitting, setSprintSubmitting] = useState(false);

  // Issue Creation Modal
  const [issueModalOpen, setIssueModalOpen] = useState(false);

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
        setSprints(sprintsRes.data.data || []);
        setIssues(issuesRes.data.data || []);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Failed to load backlog data');
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create sprint handler
  const handleCreateSprint = async (e) => {
    e.preventDefault();
    if (!newSprintName.trim()) return;

    setSprintSubmitting(true);
    try {
      const res = await sprintService.create({
        projectId,
        name: newSprintName.trim(),
        goal: newSprintGoal.trim(),
      });
      setSprints((prev) => [res.data.data, ...prev]);
      setNewSprintName('');
      setNewSprintGoal('');
      setSprintModalOpen(false);
      showToast(`Created ${res.data.data.name}`);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create sprint');
    } finally {
      setSprintSubmitting(false);
    }
  };

  // Move issue to sprint or backlog
  const handleMoveIssue = async (issueId, targetSprintId) => {
    try {
      await issueService.update(issueId, { sprintId: targetSprintId || null });
      setIssues((prev) =>
        prev.map((i) =>
          i._id === issueId
            ? {
                ...i,
                sprintId: targetSprintId
                  ? sprints.find((s) => s._id === targetSprintId) || targetSprintId
                  : null,
              }
            : i
        )
      );
      showToast(targetSprintId ? 'Moved issue to sprint' : 'Moved issue to backlog');
    } catch (err) {
      showToast('Failed to move issue');
    }
  };

  // Sprint status update (Start or Complete)
  const handleSprintStatusChange = async (sprintId, nextStatus) => {
    try {
      const res = await sprintService.update(sprintId, { status: nextStatus });
      setSprints((prev) =>
        prev.map((s) => (s._id === sprintId ? res.data.data : s))
      );
      showToast(`Sprint status updated to ${nextStatus}`);
    } catch (err) {
      showToast('Failed to update sprint status');
    }
  };

  // Delete sprint
  const handleDeleteSprint = async (sprintId) => {
    if (!window.confirm('Delete this sprint? Assigned issues will be returned to the backlog.')) {
      return;
    }
    try {
      await sprintService.remove(sprintId);
      setSprints((prev) => prev.filter((s) => s._id !== sprintId));
      setIssues((prev) =>
        prev.map((i) =>
          (i.sprintId?._id || i.sprintId) === sprintId ? { ...i, sprintId: null } : i
        )
      );
      showToast('Sprint deleted');
    } catch (err) {
      showToast('Failed to delete sprint');
    }
  };

  const backlogIssues = issues.filter((i) => !i.sprintId);

  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading backlog...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-gray-50/50 p-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 px-3 py-2 bg-gray-900 text-white text-xs rounded-md shadow-lg animate-in fade-in duration-150">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-200 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link to="/projects" className="hover:underline">Projects</Link>
            <span>/</span>
            <Link to={`/projects/${projectId}`} className="hover:underline font-medium text-gray-700">
              {project?.name}
            </Link>
          </div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-emerald-600" />
            <span>{project?.name} Backlog & Sprints</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSprintModalOpen(true)}
            className="btn-secondary text-xs"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Create Sprint</span>
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

      {/* Sprints Section */}
      <div className="mt-6 space-y-6">
        {sprints.map((sprint) => {
          const sprintIssues = issues.filter(
            (i) => (i.sprintId?._id || i.sprintId) === sprint._id
          );

          return (
            <div key={sprint._id} className="card p-4 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-4 pb-3 border-b border-gray-100 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-sm font-bold text-gray-900">{sprint.name}</h2>
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                      sprint.status === 'ACTIVE'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : sprint.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {sprint.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({sprintIssues.length} issues)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {sprint.status === 'PLANNED' && (
                    <button
                      onClick={() => handleSprintStatusChange(sprint._id, 'ACTIVE')}
                      className="btn-secondary py-1 px-2.5 text-xs text-blue-600 hover:text-blue-700"
                    >
                      <Play className="w-3 h-3" />
                      <span>Start Sprint</span>
                    </button>
                  )}
                  {sprint.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleSprintStatusChange(sprint._id, 'COMPLETED')}
                      className="btn-secondary py-1 px-2.5 text-xs text-emerald-600 hover:text-emerald-700"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Complete Sprint</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteSprint(sprint._id)}
                    className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-gray-100"
                    title="Delete sprint"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {sprint.goal && (
                <p className="text-xs text-gray-500 mt-2 mb-3 italic">
                  Goal: {sprint.goal}
                </p>
              )}

              {/* Sprint Issue List */}
              <div className="mt-3 divide-y divide-gray-100">
                {sprintIssues.length === 0 ? (
                  <div className="py-4 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded">
                    Plan a sprint by dragging or moving issues from the backlog.
                  </div>
                ) : (
                  sprintIssues.map((issue) => (
                    <div
                      key={issue._id}
                      className="py-2 px-2 flex items-center justify-between gap-3 hover:bg-gray-50 rounded transition-colors text-xs"
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
                          {issue.assignee}
                        </span>
                        <button
                          onClick={() => handleMoveIssue(issue._id, null)}
                          className="text-gray-400 hover:text-gray-700 text-[11px] hover:underline"
                          title="Return to Backlog"
                        >
                          Backlog
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}

        {/* Product Backlog Section */}
        <div className="card p-4 bg-white shadow-sm mt-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-900">Product Backlog</h2>
              <span className="text-xs text-gray-500">
                ({backlogIssues.length} issues)
              </span>
            </div>
          </div>

          <div className="mt-3 divide-y divide-gray-100">
            {backlogIssues.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                Backlog is empty. Create a new issue to begin planning.
              </div>
            ) : (
              backlogIssues.map((issue) => (
                <div
                  key={issue._id}
                  className="py-2.5 px-2 flex items-center justify-between gap-3 hover:bg-gray-50 rounded transition-colors text-xs"
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
                      {issue.assignee}
                    </span>

                    {/* Move to Sprint dropdown if sprints exist */}
                    {sprints.length > 0 && (
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleMoveIssue(issue._id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                        className="py-0.5 px-1.5 bg-gray-50 border border-gray-200 rounded text-[11px] text-gray-700"
                      >
                        <option value="" disabled>
                          Move to...
                        </option>
                        {sprints.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Sprint Modal */}
      {sprintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6 bg-white shadow-xl animate-in fade-in duration-150">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Create Sprint</h2>
            <form onSubmit={handleCreateSprint} className="space-y-4">
              <div>
                <label className="form-label" htmlFor="sprint-name">
                  Sprint Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="sprint-name"
                  type="text"
                  value={newSprintName}
                  onChange={(e) => setNewSprintName(e.target.value)}
                  placeholder={`Sprint ${sprints.length + 1}`}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label" htmlFor="sprint-goal">
                  Sprint Goal
                </label>
                <textarea
                  id="sprint-goal"
                  rows={2}
                  value={newSprintGoal}
                  onChange={(e) => setNewSprintGoal(e.target.value)}
                  placeholder="e.g. Complete authentication module and user onboarding"
                  className="form-input resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSprintModalOpen(false)}
                  disabled={sprintSubmitting}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sprintSubmitting}
                  className="btn-primary"
                >
                  {sprintSubmitting ? 'Creating...' : 'Create Sprint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Issue Modal */}
      <CreateIssueModal
        isOpen={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        initialProjectId={projectId}
        onCreated={(newIssue) => {
          setIssues((prev) => [newIssue, ...prev]);
          showToast(`Issue ${newIssue.issueKey} created in backlog`);
        }}
      />
    </div>
  );
}
