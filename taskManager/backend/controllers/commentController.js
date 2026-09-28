const Comment = require('../models/Comment');
const Issue = require('../models/Issue');

// @desc    Get comments for an issue
// @route   GET /api/issues/:id/comments
const getComments = async (req, res, next) => {
  try {
    const issueId = req.params.id;
    const comments = await Comment.find({ issueId }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, count: comments.length, data: comments });
  } catch (error) {
    next(error);
  }
};

// @desc    Create comment on an issue
// @route   POST /api/issues/:id/comments
const createComment = async (req, res, next) => {
  try {
    const issueId = req.params.id;
    const { content, author } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const commentData = {
      issueId,
      content: content.trim(),
      author: author ? author.trim() : (req.user ? req.user.name : 'Team Member'),
    };
    if (req.user) {
      commentData.user = req.user._id;
    }

    const comment = await Comment.create(commentData);
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    await comment.deleteOne();
    res.status(200).json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid comment ID' });
    }
    next(error);
  }
};

module.exports = {
  getComments,
  createComment,
  deleteComment,
};
