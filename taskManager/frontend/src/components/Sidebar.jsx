import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListTodo, Clock, CheckCircle2, Circle, FileText, Shield, Menu, X, ChevronRight } from 'lucide-react';

const navItems = [
  {
    label: 'Dashboard',
    to: '/',
    icon: LayoutDashboard,
    exact: true,
  },
];

const taskFilters = [
  { label: 'All Tasks', to: '/?status=all', icon: ListTodo, filter: 'all' },
  { label: 'Pending', to: '/?status=Pending', icon: Circle, filter: 'Pending' },
  { label: 'In Progress', to: '/?status=In Progress', icon: Clock, filter: 'In Progress' },
  { label: 'Completed', to: '/?status=Completed', icon: CheckCircle2, filter: 'Completed' },
];

const settingsItems = [
  { label: 'Privacy Policy', to: '/privacy-policy', icon: Shield },
  { label: 'Terms of Service', to: '/terms', icon: FileText },
];

export default function Sidebar({ activeFilter, onFilterChange }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleFilterClick = (filter) => {
    onFilterChange(filter);
    navigate('/');
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <nav className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
            <ListTodo className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-semibold text-gray-900">Task Manager</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {/* Main nav */}
        <div>
          <NavLink
            to="/"
            end
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </NavLink>
        </div>

        {/* Tasks section */}
        <div>
          <p className="px-3 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tasks</p>
          <div className="space-y-0.5">
            {taskFilters.map(({ label, icon: Icon, filter }) => (
              <button
                key={filter}
                onClick={() => handleFilterClick(filter)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left ${
                  activeFilter === filter
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Settings section */}
        <div>
          <p className="px-3 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Settings</p>
          <div className="space-y-0.5">
            {settingsItems.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-3.5 left-4 z-50 p-1.5 rounded-md text-gray-600 hover:bg-gray-100"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-lg transform transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 h-screen sticky top-0 flex-shrink-0">
        <SidebarContent />
      </aside>
    </>
  );
}
