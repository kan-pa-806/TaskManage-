import { useState, useEffect } from 'react';
import { NavLink, useLocation, useParams, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  KanbanSquare,
  ListTodo,
  Calendar,
  Layers,
  ChevronDown,
  Plus,
  Shield,
  FileText,
  X,
} from 'lucide-react';
import { projectService } from '../../services/projectService';

export default function AppSidebar({
  mobileOpen,
  onCloseMobile,
  onOpenCreateProject,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);

  // Extract projectId if url matches /projects/:projectId
  const match = location.pathname.match(/\/projects\/([^/]+)/);
  const currentProjectId = match ? match[1] : null;

  useEffect(() => {
    projectService
      .getAll()
      .then((res) => {
        const list = res.data.data || [];
        setProjects(list);
        if (currentProjectId) {
          const found = list.find((p) => p._id === currentProjectId);
          if (found) setActiveProject(found);
        }
      })
      .catch(() => {});
  }, [currentProjectId]);

  const navClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-700 font-semibold'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-gray-50 border-r border-gray-200 w-64 select-none">
      {/* Workspace Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Workspace
        </div>
        <div className="flex items-center justify-between">
          <NavLink
            to="/"
            end
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-2 px-2 py-1.5 rounded-md text-xs w-full ${
                isActive ? 'bg-blue-100 text-blue-900 font-semibold' : 'text-gray-700 hover:bg-gray-200'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4 text-blue-600" />
            <span>Workspace Dashboard</span>
          </NavLink>
        </div>
      </div>

      {/* Projects Dropdown & Project Scope */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Projects
          </span>
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onOpenCreateProject();
            }}
            title="Create Project"
            className="text-gray-400 hover:text-blue-600 p-0.5 rounded hover:bg-gray-200"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {projects.length > 0 ? (
          <div className="space-y-1">
            <select
              value={currentProjectId || ''}
              onChange={(e) => {
                const id = e.target.value;
                if (id) {
                  navigate(`/projects/${id}/board`);
                  if (onCloseMobile) onCloseMobile();
                } else {
                  navigate('/projects');
                }
              }}
              className="w-full text-xs py-1.5 px-2 bg-white border border-gray-200 rounded-md font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select a project...</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.key})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <button
            onClick={onOpenCreateProject}
            className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
          >
            <Plus className="w-3 h-3" /> Create first project
          </button>
        )}
      </div>

      {/* Project Navigation (Visible when in project context) */}
      {currentProjectId && (
        <div className="p-3 border-b border-gray-200 flex-1 overflow-y-auto">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Planning & Execution
          </div>
          <nav className="space-y-1">
            <NavLink
              to={`/projects/${currentProjectId}`}
              end
              onClick={onCloseMobile}
              className={navClass}
            >
              <FolderKanban className="w-4 h-4 text-gray-500" />
              <span>Overview</span>
            </NavLink>
            <NavLink
              to={`/projects/${currentProjectId}/board`}
              onClick={onCloseMobile}
              className={navClass}
            >
              <KanbanSquare className="w-4 h-4 text-blue-600" />
              <span>Board</span>
            </NavLink>
            <NavLink
              to={`/projects/${currentProjectId}/backlog`}
              onClick={onCloseMobile}
              className={navClass}
            >
              <ListTodo className="w-4 h-4 text-emerald-600" />
              <span>Backlog</span>
            </NavLink>
            <NavLink
              to={`/projects/${currentProjectId}/sprints`}
              onClick={onCloseMobile}
              className={navClass}
            >
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>Sprints</span>
            </NavLink>
            <NavLink
              to={`/projects/${currentProjectId}/issues`}
              onClick={onCloseMobile}
              className={navClass}
            >
              <Layers className="w-4 h-4 text-amber-600" />
              <span>Issues</span>
            </NavLink>
          </nav>
        </div>
      )}

      {!currentProjectId && (
        <div className="p-3 flex-1 overflow-y-auto">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Navigation
          </div>
          <nav className="space-y-1">
            <NavLink to="/projects" onClick={onCloseMobile} className={navClass}>
              <FolderKanban className="w-4 h-4 text-gray-500" />
              <span>All Projects</span>
            </NavLink>
          </nav>
        </div>
      )}

      {/* Footer Legal Links */}
      <div className="p-3 border-t border-gray-200 text-xs text-gray-500 space-y-1">
        <NavLink
          to="/privacy-policy"
          onClick={onCloseMobile}
          className="flex items-center gap-2 py-1 text-gray-500 hover:text-gray-900"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Privacy Policy</span>
        </NavLink>
        <NavLink
          to="/terms"
          onClick={onCloseMobile}
          className="flex items-center gap-2 py-1 text-gray-500 hover:text-gray-900"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Terms of Service</span>
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (persistent) */}
      <aside className="hidden md:block h-full flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-50 shadow-2xl">
            <div className="absolute top-2 right-2">
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
