import { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { projectService } from '../services/projectService';

export default function ProjectModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [lead, setLead] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Auto-generate a 3-4 letter uppercase key when name changes if user hasn't typed custom key
  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!key || key.length <= 4) {
      const suggested = val
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .join('')
        .slice(0, 4)
        .toUpperCase();
      if (suggested && /^[A-Z0-9]+$/.test(suggested)) {
        setKey(suggested);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    if (!key.trim() || !/^[A-Z0-9]{2,10}$/.test(key.trim().toUpperCase())) {
      setError('Key must be 2 to 10 uppercase alphanumeric characters (e.g. WEB, PROJ)');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await projectService.create({
        name: name.trim(),
        key: key.trim().toUpperCase(),
        description: description.trim(),
        lead: lead.trim() || 'Admin',
      });
      setName('');
      setKey('');
      setDescription('');
      setLead('');
      onCreated(res.data.data);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="card w-full max-w-lg p-6 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-semibold text-gray-900">Create Project</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="form-label" htmlFor="project-name">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. Website Redesign"
              className="form-input"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="form-label" htmlFor="project-key">
              Project Key <span className="text-red-500">*</span>
            </label>
            <input
              id="project-key"
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              placeholder="e.g. WEB"
              className="form-input font-mono uppercase"
              maxLength={10}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Used as prefix for issue identifiers (e.g. {key || 'KEY'}-1, {key || 'KEY'}-2)
            </p>
          </div>

          <div>
            <label className="form-label" htmlFor="project-lead">
              Project Lead
            </label>
            <input
              id="project-lead"
              type="text"
              value={lead}
              onChange={(e) => setLead(e.target.value)}
              placeholder="e.g. Aditya Patil"
              className="form-input"
              maxLength={100}
            />
          </div>

          <div>
            <label className="form-label" htmlFor="project-desc">
              Description
            </label>
            <textarea
              id="project-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of what this project covers..."
              className="form-input resize-none"
              maxLength={1000}
            />
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
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
