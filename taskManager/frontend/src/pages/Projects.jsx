import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { projectService } from '../services/projectService';
import ProjectModal from '../components/ProjectModal';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadProjects = () => {
    setLoading(true);
    setError('');
    projectService
      .getAll()
      .then((res) => {
        setProjects(res.data.data || []);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Failed to load projects');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async (e, id, name) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Delete project "${name}" and all its issues/sprints?`)) {
      return;
    }
    try {
      await projectService.remove(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete project');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-gray-50/50 p-6">
      <div className="flex items-center justify-between pb-6 border-b border-gray-200 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-blue-600" />
            <span>Projects</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your workspaces and active project portfolios
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Project</span>
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
          <span>Loading projects...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="py-16 text-center card p-8 bg-white max-w-md mx-auto mt-8">
          <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-800 mb-1">No projects yet</p>
          <p className="text-xs text-gray-500 mb-4">
            Create your first project to start tracking issues, boards, and sprints.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary inline-flex text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Project</span>
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <div
              key={p._id}
              className="card p-5 bg-white hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                    {p.key}
                  </span>
                  <button
                    onClick={(e) => handleDelete(e, p._id, p.name)}
                    className="text-gray-400 hover:text-red-600 p-1 rounded"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <Link
                  to={`/projects/${p._id}/board`}
                  className="text-base font-bold text-gray-900 hover:text-blue-600 block mb-1"
                >
                  {p.name}
                </Link>

                <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                  {p.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>{p.totalIssues || 0} issues</span>
                <Link
                  to={`/projects/${p._id}/board`}
                  className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span>Open Board</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={(newProj) => {
          setProjects((prev) => [newProj, ...prev]);
        }}
      />
    </div>
  );
}
