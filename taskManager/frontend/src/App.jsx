import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppNavbar from './components/layout/AppNavbar';
import AppSidebar from './components/layout/AppSidebar';

import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectOverview from './pages/ProjectOverview';
import ProjectBoard from './pages/ProjectBoard';
import ProjectBacklog from './pages/ProjectBacklog';
import ProjectIssues from './pages/ProjectIssues';
import Sprints from './pages/Sprints';
import IssuePage from './pages/IssuePage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Login from './pages/Login';
import Register from './pages/Register';

import CreateIssueModal from './components/CreateIssueModal';
import ProjectModal from './components/ProjectModal';

function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center p-8 bg-gray-50">
      <div className="text-center card p-8 bg-white max-w-sm">
        <p className="text-4xl font-bold text-gray-300 mb-2">404</p>
        <p className="text-sm font-semibold text-gray-800 mb-1">Page not found</p>
        <p className="text-xs text-gray-500 mb-4">The page or resource you requested does not exist.</p>
        <Link to="/" className="btn-primary inline-flex text-xs">
          Go to Workspace
        </Link>
      </div>
    </main>
  );
}

function MainLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [createIssueOpen, setCreateIssueOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white text-gray-900 font-sans">
      {/* Top Navbar */}
      <AppNavbar
        onOpenCreateIssue={() => setCreateIssueOpen(true)}
        onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
      />

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left Sidebar */}
        <AppSidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onOpenCreateProject={() => setCreateProjectOpen(true)}
        />

        {/* Content Container */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:projectId"
              element={
                <ProtectedRoute>
                  <ProjectOverview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:projectId/board"
              element={
                <ProtectedRoute>
                  <ProjectBoard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:projectId/backlog"
              element={
                <ProtectedRoute>
                  <ProjectBacklog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:projectId/issues"
              element={
                <ProtectedRoute>
                  <ProjectIssues />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:projectId/sprints"
              element={
                <ProtectedRoute>
                  <Sprints />
                </ProtectedRoute>
              }
            />
            <Route
              path="/issues/:issueId"
              element={
                <ProtectedRoute>
                  <IssuePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/privacy-policy"
              element={
                <ProtectedRoute>
                  <PrivacyPolicy />
                </ProtectedRoute>
              }
            />
            <Route
              path="/terms"
              element={
                <ProtectedRoute>
                  <Terms />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>

      {/* Global Modals */}
      <CreateIssueModal
        isOpen={createIssueOpen}
        onClose={() => setCreateIssueOpen(false)}
        onCreated={(issue) => {
          navigate(`/issues/${issue._id}`);
        }}
      />

      <ProjectModal
        isOpen={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
        onCreated={(project) => {
          navigate(`/projects/${project._id}/board`);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Jira-style Application Routes */}
          <Route path="/*" element={<MainLayout />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
