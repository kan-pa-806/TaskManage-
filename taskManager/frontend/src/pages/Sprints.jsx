import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Plus,
  Play,
  CheckCircle2,
  Trash2,
  RefreshCw,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { projectService } from '../services/projectService';
import { sprintService } from '../services/sprintService';

export default function Sprints() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Sprint modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
    ])
      .then(([pRes, sRes]) => {
        setProject(pRes.data.data);
        setSprints(sRes.data.data || []);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Failed to load sprints');
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const res = await sprintService.create({
        projectId,
        name: name.trim(),
        goal: goal.trim(),
        startDate: startDate || null,
        endDate: endDate || null,
      });
      setSprints((prev) => [res.data.data, ...prev]);
      setName('');
      setGoal('');
      setStartDate('');
      setEndDate('');
      setIsModalOpen(false);
      showToast(`Created ${res.data.data.name}`);
    } catch (err) {
      showToast('Failed to create sprint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (sprintId, nextStatus) => {
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

  const handleDelete = async (sprintId) => {
    if (!window.confirm('Delete this sprint? Issues will return to the backlog.')) {
      return;
    }
    try {
      await sprintService.remove(sprintId);
      setSprints((prev) => prev.filter((s) => s._id !== sprintId));
      showToast('Sprint deleted');
    } catch (err) {
      showToast('Failed to delete sprint');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-gray-50/50 p-6">
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
            <Calendar className="w-5 h-5 text-purple-600" />
            <span>{project?.name} Sprints</span>
          </h1>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Sprint</span>
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 flex items-center justify-center text-xs text-gray-500 gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading sprints...</span>
        </div>
      ) : sprints.length === 0 ? (
        <div className="py-16 text-center card p-8 bg-white max-w-md mx-auto mt-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-800 mb-1">No sprints created</p>
          <p className="text-xs text-gray-500 mb-4">
            Create sprints to organize and plan development iterations.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary inline-flex text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Sprint</span>
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {sprints.map((sprint) => (
            <div
              key={sprint._id}
              className="card p-5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm font-bold text-gray-900">{sprint.name}</h3>
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
                </div>
                {sprint.goal && (
                  <p className="text-xs text-gray-500 italic">{sprint.goal}</p>
                )}
                {(sprint.startDate || sprint.endDate) && (
                  <p className="text-[11px] text-gray-400">
                    {sprint.startDate && new Date(sprint.startDate).toLocaleDateString()}
                    {sprint.startDate && sprint.endDate && ' — '}
                    {sprint.endDate && new Date(sprint.endDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to={`/projects/${projectId}/backlog`}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>View in Backlog</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                {sprint.status === 'PLANNED' && (
                  <button
                    onClick={() => handleStatusChange(sprint._id, 'ACTIVE')}
                    className="btn-secondary py-1 px-2.5 text-xs text-blue-600 hover:text-blue-700"
                  >
                    <Play className="w-3 h-3" />
                    <span>Start</span>
                  </button>
                )}

                {sprint.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleStatusChange(sprint._id, 'COMPLETED')}
                    className="btn-secondary py-1 px-2.5 text-xs text-emerald-600 hover:text-emerald-700"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Complete</span>
                  </button>
                )}

                <button
                  onClick={() => handleDelete(sprint._id)}
                  className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-gray-100"
                  title="Delete sprint"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Sprint Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6 bg-white shadow-xl animate-in fade-in duration-150">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Create Sprint</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="form-label" htmlFor="name">
                  Sprint Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={`Sprint ${sprints.length + 1}`}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label" htmlFor="goal">
                  Sprint Goal
                </label>
                <textarea
                  id="goal"
                  rows={2}
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="What is the goal of this iteration?"
                  className="form-input resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label" htmlFor="start">
                    Start Date
                  </label>
                  <input
                    id="start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="end">
                    End Date
                  </label>
                  <input
                    id="end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Creating...' : 'Create Sprint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
