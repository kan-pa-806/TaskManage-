const Sprint = require('../models/Sprint');
const Issue = require('../models/Issue');

// @desc    Get sprints for a project
// @route   GET /api/sprints
// @route   GET /api/projects/:id/sprints
const getSprints = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.query.projectId;
    const filter = projectId ? { projectId } : {};

    const sprints = await Sprint.find(filter).sort({ createdAt: -1 });

    // Include issue counts for each sprint
    const sprintsWithCounts = await Promise.all(
      sprints.map(async (s) => {
        const total = await Issue.countDocuments({ sprintId: s._id });
        const done = await Issue.countDocuments({ sprintId: s._id, status: 'DONE' });
        return {
          ...s.toObject(),
          totalIssues: total,
          doneIssues: done,
        };
      })
    );

    res.status(200).json({ success: true, count: sprintsWithCounts.length, data: sprintsWithCounts });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single sprint
// @route   GET /api/sprints/:id
const getSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({ success: false, message: 'Sprint not found' });
    }

    const issues = await Issue.find({ sprintId: sprint._id }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: {
        ...sprint.toObject(),
        issues,
      },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid sprint ID' });
    }
    next(error);
  }
};

// @desc    Create new sprint
// @route   POST /api/sprints
// @route   POST /api/projects/:id/sprints
const createSprint = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.body.projectId;
    const { name, goal, startDate, endDate, status } = req.body;

    if (!projectId) {
      return res.status(400).json({ success: false, message: 'Project ID is required' });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Sprint name is required' });
    }

    const sprint = await Sprint.create({
      projectId,
      name: name.trim(),
      goal: goal ? goal.trim() : '',
      startDate: startDate || null,
      endDate: endDate || null,
      status: status || 'PLANNED',
    });

    res.status(201).json({ success: true, data: sprint });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    next(error);
  }
};

// @desc    Update sprint (e.g. start/complete)
// @route   PUT /api/sprints/:id
const updateSprint = async (req, res, next) => {
  try {
    const { name, goal, startDate, endDate, status } = req.body;
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({ success: false, message: 'Sprint not found' });
    }

    if (name !== undefined) sprint.name = name.trim();
    if (goal !== undefined) sprint.goal = goal.trim();
    if (startDate !== undefined) sprint.startDate = startDate;
    if (endDate !== undefined) sprint.endDate = endDate;
    if (status !== undefined) sprint.status = status;

    const updated = await sprint.save();
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid sprint ID' });
    }
    next(error);
  }
};

// @desc    Delete sprint (moves sprint issues back to backlog)
// @route   DELETE /api/sprints/:id
const deleteSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({ success: false, message: 'Sprint not found' });
    }

    // Move all issues belonging to this sprint back to the backlog
    await Issue.updateMany({ sprintId: sprint._id }, { sprintId: null });
    await sprint.deleteOne();

    res.status(200).json({ success: true, message: 'Sprint deleted, issues moved to backlog' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid sprint ID' });
    }
    next(error);
  }
};

module.exports = {
  getSprints,
  getSprint,
  createSprint,
  updateSprint,
  deleteSprint,
};
