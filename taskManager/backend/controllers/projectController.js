const Project = require('../models/Project');
const Issue = require('../models/Issue');
const Sprint = require('../models/Sprint');
const Comment = require('../models/Comment');

// @desc    Get all projects
// @route   GET /api/projects
const getProjects = async (req, res, next) => {
  try {
    const filter = req.user ? { $or: [{ user: req.user._id }, { user: null }, { user: { $exists: false } }] } : {};
    const projects = await Project.find(filter).sort({ createdAt: -1 });

    // Attach basic counts to each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (p) => {
        const totalIssues = await Issue.countDocuments({ projectId: p._id });
        const doneIssues = await Issue.countDocuments({ projectId: p._id, status: 'DONE' });
        return {
          ...p.toObject(),
          totalIssues,
          doneIssues,
        };
      })
    );

    res.status(200).json({ success: true, data: projectsWithCounts });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project with statistics
// @route   GET /api/projects/:id
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Calculate real metrics from database
    const totalIssues = await Issue.countDocuments({ projectId: project._id });
    const todoIssues = await Issue.countDocuments({ projectId: project._id, status: 'TO DO' });
    const inProgressIssues = await Issue.countDocuments({ projectId: project._id, status: 'IN PROGRESS' });
    const inReviewIssues = await Issue.countDocuments({ projectId: project._id, status: 'IN REVIEW' });
    const doneIssues = await Issue.countDocuments({ projectId: project._id, status: 'DONE' });

    const activeSprint = await Sprint.findOne({ projectId: project._id, status: 'ACTIVE' });
    const plannedSprints = await Sprint.countDocuments({ projectId: project._id, status: 'PLANNED' });

    res.status(200).json({
      success: true,
      data: {
        ...project.toObject(),
        metrics: {
          total: totalIssues,
          todo: todoIssues,
          inProgress: inProgressIssues,
          inReview: inReviewIssues,
          done: doneIssues,
          completionPercentage: totalIssues > 0 ? Math.round((doneIssues / totalIssues) * 100) : 0,
        },
        activeSprint: activeSprint ? activeSprint.name : null,
        plannedSprintsCount: plannedSprints,
      },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid project ID' });
    }
    next(error);
  }
};

// @desc    Create new project
// @route   POST /api/projects
const createProject = async (req, res, next) => {
  try {
    let { name, key, description, lead } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Project name is required' });
    }
    if (!key || !key.trim()) {
      return res.status(400).json({ success: false, message: 'Project key is required' });
    }

    key = key.trim().toUpperCase();

    const existing = await Project.findOne({ key });
    if (existing) {
      return res.status(400).json({ success: false, message: `Project key '${key}' already in use` });
    }

    const projectData = {
      name: name.trim(),
      key,
      description: description ? description.trim() : '',
      lead: lead ? lead.trim() : (req.user ? req.user.name : 'Admin'),
      issueCounter: 0,
    };
    if (req.user) {
      projectData.user = req.user._id;
    }

    const project = await Project.create(projectData);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
const updateProject = async (req, res, next) => {
  try {
    const { name, description, lead } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (name !== undefined) project.name = name.trim();
    if (description !== undefined) project.description = description.trim();
    if (lead !== undefined) project.lead = lead.trim();

    const updated = await project.save();
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid project ID' });
    }
    next(error);
  }
};

// @desc    Delete project and its data
// @route   DELETE /api/projects/:id
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const issues = await Issue.find({ projectId: project._id });
    const issueIds = issues.map((i) => i._id);

    // Delete comments for all issues
    await Comment.deleteMany({ issueId: { $in: issueIds } });
    // Delete issues
    await Issue.deleteMany({ projectId: project._id });
    // Delete sprints
    await Sprint.deleteMany({ projectId: project._id });
    // Delete project
    await project.deleteOne();

    res.status(200).json({ success: true, message: 'Project and all related data deleted' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid project ID' });
    }
    next(error);
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
