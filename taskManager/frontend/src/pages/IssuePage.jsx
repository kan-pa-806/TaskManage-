import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Trash2,
  Send,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  Clock,
  User,
  Check,
} from 'lucide-react';
import { issueService } from '../services/issueService';
import { commentService } from '../services/commentService';
import { sprintService } from '../services/sprintService';
import { IssueTypeIcon, IssuePriorityIcon, IssueStatusBadge } from '../components/IssueBadge';
import { useAuth } from '../context/AuthContext';

export default function IssuePage() {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [issue, setIssue] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [comments, setComments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Editing states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  // New comment
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadIssue = useCallback(() => {
    setLoading(true);
    setError('');

    issueService
      .getById(issueId)
      .then((res) => {
        const data = res.data.data;
        setIssue(data);
        setTitle(data.title);
        setDescription(data.description || '');
        setComments(data.comments || []);

        if (data.projectId?._id) {
          sprintService
            .getAll({ projectId: data.projectId._id })
            .then((sRes) => setSprints(sRes.data.data || []))
            .catch(() => {});
        }
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Failed to load issue');
      })
      .finally(() => setLoading(false));
  }, [issueId]);

  useEffect(() => {
    loadIssue();
  }, [loadIssue]);

  // Field updater
  const handleUpdateField = async (fields) => {
    try {
      const res = await issueService.update(issue._id, fields);
      setIssue(res.data.data);
      showToast('Issue updated');
    } catch (err) {
      showToast('Failed to update issue');
    }
  };

  const handleSaveTitle = async () => {
    if (!title.trim() || title === issue.title) {
      setIsEditingTitle(false);
      return;
    }
    await handleUpdateField({ title: title.trim() });
    setIsEditingTitle(false);
  };

  const handleSaveDescription = async () => {
    await handleUpdateField({ description: description.trim() });
    setIsEditingDesc(false);
  };

  // Add Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentSubmitting(true);
    try {
      const res = await commentService.create(issue._id, {
        content: newComment.trim(),
        author: user?.name || 'User',
      });
      setComments((prev) => [...prev, res.data.data]);
      setNewComment('');
      showToast('Comment added');
    } catch (err) {
      showToast('Failed to add comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId) => {
    try {
      await commentService.remove(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      showToast('Comment deleted');
    } catch (err) {
      showToast('Failed to delete comment');
    }
  };

  // Delete Issue
  const handleDeleteIssue = async () => {
    setIsDeleting(true);
    try {
      await issueService.remove(issue._id);
      showToast('Issue deleted');
      navigate(`/projects/${issue.projectId?._id}/board`);
    } catch (err) {
      showToast('Failed to delete issue');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading issue details...</span>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="flex-1 p-6">
        <div className="card p-6 text-center max-w-md mx-auto">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-900 mb-1">Issue not found</p>
          <p className="text-xs text-gray-500 mb-4">{error || 'Unable to locate this issue'}</p>
          <button onClick={() => navigate(-1)} className="btn-secondary inline-flex">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go back</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-white">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 px-3 py-2 bg-gray-900 text-white text-xs rounded-md shadow-lg animate-in fade-in duration-150">
          {toast}
        </div>
      )}

      {/* Top Breadcrumb Bar */}
      <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link to={`/projects/${issue.projectId?._id}/board`} className="flex items-center gap-1 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{issue.projectId?.name || 'Project'}</span>
          </Link>
          <span>/</span>
          <span className="font-mono font-semibold text-blue-600">{issue.issueKey}</span>
        </div>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="btn-danger py-1 px-2.5 text-xs flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Issue</span>
        </button>
      </div>

      {/* Main Content Area: 2 Columns */}
      <div className="flex-1 p-6 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Title, Description, Comments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title / Summary */}
          <div>
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                  className="form-input text-lg font-bold"
                  autoFocus
                />
                <button onClick={handleSaveTitle} className="btn-primary py-1.5 px-3">
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="text-xl font-bold text-gray-900 hover:bg-gray-50 p-1 -ml-1 rounded cursor-pointer transition-colors"
                title="Click to edit summary"
              >
                {issue.title}
              </h1>
            )}
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Description
            </h2>
            {isEditingDesc ? (
              <div className="space-y-2">
                <textarea
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input resize-none"
                  placeholder="Add a detailed description..."
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <button onClick={handleSaveDescription} className="btn-primary py-1 px-3 text-xs">
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setDescription(issue.description || '');
                      setIsEditingDesc(false);
                    }}
                    className="btn-secondary py-1 px-3 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingDesc(true)}
                className="p-3 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-800 cursor-pointer hover:bg-gray-100/70 transition-colors min-h-[80px] whitespace-pre-wrap"
                title="Click to edit description"
              >
                {issue.description || (
                  <span className="text-gray-400 italic">No description provided. Click to add one.</span>
                )}
              </div>
            )}
          </div>

          {/* Comments Thread */}
          <div className="pt-4 border-t border-gray-200">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>Comments ({comments.length})</span>
            </h2>

            {/* Comments List */}
            <div className="space-y-3 mb-6">
              {comments.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No comments yet. Start the conversation below.</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="p-3 bg-gray-50 rounded-md border border-gray-100 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{comment.author}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-gray-400 hover:text-red-600 p-0.5"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Box */}
            <form onSubmit={handleAddComment} className="space-y-2">
              <textarea
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="form-input resize-none text-xs"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={commentSubmitting}
                  className="btn-primary py-1 px-3 text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  <span>{commentSubmitting ? 'Posting...' : 'Save Comment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Status & Metadata attributes */}
        <div className="space-y-5 bg-gray-50/70 p-4 rounded-lg border border-gray-200 h-fit">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-2">
            Details
          </h3>

          {/* Status */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 block mb-1">Status</label>
            <select
              value={issue.status}
              onChange={(e) => handleUpdateField({ status: e.target.value })}
              className="form-input text-xs bg-white font-medium"
            >
              <option value="TO DO">TO DO</option>
              <option value="IN PROGRESS">IN PROGRESS</option>
              <option value="IN REVIEW">IN REVIEW</option>
              <option value="DONE">DONE</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 block mb-1">Priority</label>
            <select
              value={issue.priority}
              onChange={(e) => handleUpdateField({ priority: e.target.value })}
              className="form-input text-xs bg-white"
            >
              <option value="Lowest">Lowest</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Highest">Highest</option>
            </select>
          </div>

          {/* Issue Type */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 block mb-1">Issue Type</label>
            <select
              value={issue.issueType}
              onChange={(e) => handleUpdateField({ issueType: e.target.value })}
              className="form-input text-xs bg-white"
            >
              <option value="Task">Task</option>
              <option value="Bug">Bug</option>
              <option value="Story">Story</option>
              <option value="Epic">Epic</option>
            </select>
          </div>

          {/* Assignee */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 block mb-1">Assignee</label>
            <input
              type="text"
              value={issue.assignee || ''}
              onChange={(e) => setIssue((prev) => ({ ...prev, assignee: e.target.value }))}
              onBlur={() => handleUpdateField({ assignee: issue.assignee || 'Unassigned' })}
              placeholder="Assignee name..."
              className="form-input text-xs bg-white"
            />
          </div>

          {/* Sprint */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 block mb-1">Sprint</label>
            <select
              value={issue.sprintId?._id || issue.sprintId || ''}
              onChange={(e) => handleUpdateField({ sprintId: e.target.value || null })}
              className="form-input text-xs bg-white"
            >
              <option value="">Backlog (No Sprint)</option>
              {sprints.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.status})
                </option>
              ))}
            </select>
          </div>

          {/* Reporter */}
          <div className="pt-2 border-t border-gray-200 text-xs text-gray-500 space-y-1.5">
            <div className="flex items-center justify-between">
              <span>Reporter:</span>
              <span className="font-medium text-gray-700">{issue.reporter || 'Admin'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Created:</span>
              <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Updated:</span>
              <span>{new Date(issue.updatedAt || issue.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="card w-full max-w-sm p-6 bg-white shadow-xl animate-in fade-in duration-150">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Delete Issue?</h2>
            <p className="text-xs text-gray-500 mb-4">
              Are you sure you want to delete <span className="font-mono font-bold text-gray-800">{issue.issueKey}</span>? All comments and associated data will be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteIssue}
                disabled={isDeleting}
                className="btn-danger"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
