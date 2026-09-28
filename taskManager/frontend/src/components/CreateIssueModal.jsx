import { useState, useEffect } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { projectService } from '../services/projectService';
import { issueService } from '../services/issueService';
import { sprintService } from '../services/sprintService';

export default function CreateIssueModal({
  isOpen,
  onClose,
  onCreated,
  initialProjectId,
}) {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId || '');
  const [sprints, setSprints] = useState([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState('Task');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('TO DO');
  const [assignee, setAssignee] = useState('');
  const [labelsInput, setLabelsInput] = useState('');
  const [sprintId, setSprintId] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetchingProjects, setFetchingProjects] = useState(false);
  const [error, setError] = useState('');

  // Fetch available projects on open
  useEffect(() => {
    if (!isOpen) return;
    setFetchingProjects(true);
    projectService
      .getAll()
      .then((res) => {
        const list = res.data.data || [];
        setProjects(list);
        if (initialProjectId) {
          setSelectedProjectId(initialProjectId);
        } else if (list.length > 0 && !selectedProjectId) {
          setSelectedProjectId(list[0]._id);
        }
      })
      .catch(() => setError('Could not load projects'))
      .finally(() => setFetchingProjects(false));
  }, [isOpen, initialProjectId]);

  // Load sprints when selected project changes
  useEffect(() => {
    if (!selectedProjectId) {
      setSprints([]);
      return;
    }
    sprintService
      .getAll({ projectId: selectedProjectId })
      .then((res) => {
        setSprints(res.data.data || []);
      })
      .catch(() => setSprints([]));
  }, [selectedProjectId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) {
      setError('Please select a project');
      return;
    }
    if (!title.trim()) {
      setError('Summary is required');
      return;
    }

    setLoading(true);
    setError('');

    const labels = labelsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await issueService.create({
        projectId: selectedProjectId,
        title: title.trim(),
        description: description.trim(),
        issueType,
        priority,
        status,
        assignee: assignee.trim() || 'Unassigned',
        labels,
        sprintId: sprintId || null,
      });

      // Reset fields
      setTitle('');
      setDescription('');
      setAssignee('');
      setLabelsInput('');
      setSprintId('');
      onCreated(res.data.data);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="card w-full max-w-2xl p-6 bg-white shadow-xl my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-semibold text-gray-900">Create Issue</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {projects.length === 0 && !fetchingProjects ? (
          <div className="mt-6 text-center py-6">
            <p className="text-sm text-gray-600 mb-3">You must create a project before creating issues.</p>
            <button onClick={onClose} className="btn-secondary">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="issue-project">
                  Project <span className="text-red-500">*</span>
                </label>
                <select
                  id="issue-project"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="form-input bg-white"
                  required
                >
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.key})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" htmlFor="issue-type">
                  Issue Type
                </label>
                <select
                  id="issue-type"
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="form-input bg-white"
                >
                  <option value="Task">Task</option>
                  <option value="Bug">Bug</option>
                  <option value="Story">Story</option>
                  <option value="Epic">Epic</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="issue-title">
                Summary / Title <span className="text-red-500">*</span>
              </label>
              <input
                id="issue-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Implement user login form"
                className="form-input"
                maxLength={250}
                required
              />
            </div>

            <div>
              <label className="form-label" htmlFor="issue-desc">
                Description
              </label>
              <textarea
                id="issue-desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide meaningful details, context, and steps..."
                className="form-input resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="form-label" htmlFor="issue-status">
                  Status
                </label>
                <select
                  id="issue-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="form-input bg-white"
                >
                  <option value="TO DO">TO DO</option>
                  <option value="IN PROGRESS">IN PROGRESS</option>
                  <option value="IN REVIEW">IN REVIEW</option>
                  <option value="DONE">DONE</option>
                </select>
              </div>

              <div>
                <label className="form-label" htmlFor="issue-priority">
                  Priority
                </label>
                <select
                  id="issue-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="form-input bg-white"
                >
                  <option value="Lowest">Lowest</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Highest">Highest</option>
                </select>
              </div>

              <div>
                <label className="form-label" htmlFor="issue-sprint">
                  Sprint
                </label>
                <select
                  id="issue-sprint"
                  value={sprintId}
                  onChange={(e) => setSprintId(e.target.value)}
                  className="form-input bg-white"
                >
                  <option value="">Backlog (No Sprint)</option>
                  {sprints.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="issue-assignee">
                  Assignee
                </label>
                <input
                  id="issue-assignee"
                  type="text"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  placeholder="e.g. Aditya Patil"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label" htmlFor="issue-labels">
                  Labels (comma-separated)
                </label>
                <input
                  id="issue-labels"
                  type="text"
                  value={labelsInput}
                  onChange={(e) => setLabelsInput(e.target.value)}
                  placeholder="frontend, auth, bug"
                  className="form-input"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
