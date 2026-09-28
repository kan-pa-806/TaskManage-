import { Plus, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ title, onCreateTask }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 md:px-6 h-14">
        {/* Page title — offset on mobile for hamburger */}
        <h1 className="ml-8 md:ml-0 text-base font-semibold text-gray-900">{title}</h1>

        <div className="flex items-center gap-3">
          {/* Show user name on medium+ screens */}
          {user && (
            <span className="hidden sm:block text-sm text-gray-500 truncate max-w-[140px]">
              {user.name}
            </span>
          )}

          {onCreateTask && (
            <button
              onClick={onCreateTask}
              className="btn-primary"
              id="create-task-btn"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Task</span>
              <span className="sm:hidden">New</span>
            </button>
          )}

          {/* Logout */}
          {user && (
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              aria-label="Sign out"
              id="logout-btn"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
