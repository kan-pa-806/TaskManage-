import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  Search,
  Plus,
  LogOut,
  Folder,
  X,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { searchService } from '../../services/searchService';
import { IssueTypeIcon } from '../IssueBadge';

export default function AppNavbar({ onOpenCreateIssue, onToggleMobileSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const searchRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setSearching(false);
      return;
    }

    const timer = setTimeout(() => {
      setSearching(true);
      searchService
        .search(query.trim())
        .then((res) => {
          setResults(res.data.data);
          setDropdownOpen(true);
        })
        .catch(() => setResults(null))
        .finally(() => setSearching(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside search dropdown to close
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (path) => {
    setDropdownOpen(false);
    setQuery('');
    navigate(path);
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left: Mobile hamburger & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden text-gray-500 hover:text-gray-700 p-1.5 rounded hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2 font-bold text-gray-900 tracking-tight">
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-white">
            <Layers className="w-4 h-4" />
          </div>
          <span className="hidden sm:inline text-sm font-bold">Issue Tracker</span>
        </Link>
      </div>

      {/* Middle: Real Global Search Bar */}
      <div className="flex-1 max-w-md relative" ref={searchRef}>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results) setDropdownOpen(true);
            }}
            placeholder="Search issues, keys (WEB-1), or projects..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults(null);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {dropdownOpen && results && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg py-2 z-50 max-h-80 overflow-y-auto">
            {searching ? (
              <div className="px-4 py-2 text-xs text-gray-500">Searching...</div>
            ) : results.projects?.length === 0 && results.issues?.length === 0 ? (
              <div className="px-4 py-3 text-xs text-gray-500 text-center">
                No matching issues or projects found
              </div>
            ) : (
              <>
                {results.projects?.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Projects
                    </div>
                    {results.projects.map((p) => (
                      <button
                        key={p._id}
                        onClick={() => handleSelectResult(`/projects/${p._id}`)}
                        className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2 text-xs"
                      >
                        <Folder className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        <span className="font-medium text-gray-800">{p.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">({p.key})</span>
                      </button>
                    ))}
                  </div>
                )}

                {results.issues?.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Issues
                    </div>
                    {results.issues.map((issue) => (
                      <button
                        key={issue._id}
                        onClick={() => handleSelectResult(`/issues/${issue._id}`)}
                        className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <IssueTypeIcon type={issue.issueType} className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="font-mono text-[11px] font-medium text-blue-600 flex-shrink-0">
                            {issue.issueKey}
                          </span>
                          <span className="truncate text-gray-700">{issue.title}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{issue.status}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Right: + Create Button & User menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onOpenCreateIssue}
          className="btn-primary py-1 px-3 text-xs flex items-center gap-1.5"
          id="global-create-issue-btn"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create</span>
        </button>

        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-medium text-xs flex items-center justify-center border border-blue-200" title={user.email}>
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
