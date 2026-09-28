const Issue = require('../models/Issue');
const Project = require('../models/Project');
const Comment = require('../models/Comment');

// @desc    Get issues (filtered by project, sprint, status, priority, type, search)
// @route   GET /api/issues
// @route   GET /api/projects/:id/issues
const getIssues = async (req, res, next) => {
  try {
    const {
      projectId,
      sprintId,
      backlog,
      status,
      priority,
      issueType,
      assignee,
      label,
      search,
    } = req.query;

    const filter = {};
    const targetProjectId = req.params.id || projectId;

    if (targetProjectId) {
      filter.projectId = targetProjectId;
    }

    if (backlog === 'true') {
      filter.sprintId = null;
    } else if (sprintId) {
      filter.sprintId = sprintId;
    }

    if (status) {
      filter.status = status;
    }
    if (priority) {
      filter.priority = priority;
    }
    if (issueType) {
      filter.issueType = issueType;
    }
    if (assignee) {
      filter.assignee = assignee;
    }
    if (label) {
      filter.labels = label;
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { issueKey: new RegExp(q, 'i') },
        { title: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
      ];
    }

    const issues = await Issue.find(filter)
      .populate('projectId', 'name key')
      .populate('sprintId', 'name status')
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({ success: true, count: issues.length, data: issues });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single issue with its comments
// @route   GET /api/issues/:id
const getIssue = async (req, res, next) => {
  try {
    const id = req.params.id;
    // Support lookup by MongoDB _id or issueKey (e.g. WEB-1)
    let issue;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      issue = await Issue.findById(id)
        .populate('projectId', 'name key')
        .populate('sprintId', 'name status');
    } else {
      issue = await Issue.findOne({ issueKey: id.toUpperCase() })
        .populate('projectId', 'name key')
        .populate('sprintId', 'name status');
    }

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const comments = await Comment.find({ issueId: issue._id }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: {
        ...issue.toObject(),
        comments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new issue
// @route   POST /api/issues
const createIssue = async (req, res, next) => {
  try {
    const {
      projectId,
      title,
      description,
      issueType,
      status,
      priority,
      assignee,
      reporter,
      labels,
      sprintId,
    } = req.body;

    if (!projectId) {
      return res.status(400).json({ success: false, message: 'Project ID is required' });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title/Summary is required' });
    }

    // Atomically increment issueCounter in project to get guaranteed unique key
    const project = await Project.findByIdAndUpdate(
      projectId,
      { $inc: { issueCounter: 1 } },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const issueKey = `${project.key}-${project.issueCounter}`;

    const issueData = {
      projectId: project._id,
      issueKey,
      title: title.trim(),
      description: description ? description.trim() : '',
      issueType: issueType || 'Task',
      status: status || 'TO DO',
      priority: priority || 'Medium',
      assignee: assignee ? assignee.trim() : (req.user ? req.user.name : 'Unassigned'),
      reporter: reporter ? reporter.trim() : (req.user ? req.user.name : 'Admin'),
      labels: Array.isArray(labels) ? labels : [],
      sprintId: sprintId || null,
    };
    if (req.user) {
      issueData.user = req.user._id;
    }

    const issue = await Issue.create(issueData);
    const populated = await Issue.findById(issue._id)
      .populate('projectId', 'name key')
      .populate('sprintId', 'name status');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    next(error);
  }
};

// @desc    Update issue
// @route   PUT /api/issues/:id
const updateIssue = async (req, res, next) => {
  try {
    const {
      title,
      description,
      issueType,
      status,
      priority,
      assignee,
      reporter,
      labels,
      sprintId,
      order,
    } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    if (title !== undefined) issue.title = title.trim();
    if (description !== undefined) issue.description = description.trim();
    if (issueType !== undefined) issue.issueType = issueType;
    if (status !== undefined) issue.status = status;
    if (priority !== undefined) issue.priority = priority;
    if (assignee !== undefined) issue.assignee = assignee.trim();
    if (reporter !== undefined) issue.reporter = reporter.trim();
    if (labels !== undefined) issue.labels = Array.isArray(labels) ? labels : [];
    if (sprintId !== undefined) issue.sprintId = sprintId || null;
    if (order !== undefined) issue.order = Number(order);

    await issue.save();

    const populated = await Issue.findById(issue._id)
      .populate('projectId', 'name key')
      .populate('sprintId', 'name status');

    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid issue ID' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    next(error);
  }
};

// @desc    Delete issue and comments
// @route   DELETE /api/issues/:id
const deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    await Comment.deleteMany({ issueId: issue._id });
    await issue.deleteOne();

    res.status(200).json({ success: true, message: 'Issue deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid issue ID' });
    }
    next(error);
  }
};

module.exports = {
  getIssues,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue,
};
