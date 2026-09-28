const Issue = require('../models/Issue');
const Project = require('../models/Project');

// @desc    Global search across projects and issues
// @route   GET /api/search?q=...
const searchAll = async (req, res, next) => {
  try {
    const q = req.query.q ? req.query.q.trim() : '';
    if (!q) {
      return res.status(200).json({ success: true, data: { projects: [], issues: [] } });
    }

    const regex = new RegExp(q, 'i');

    const [projects, issues] = await Promise.all([
      Project.find({
        $or: [{ name: regex }, { key: regex }, { description: regex }],
      }).limit(5),
      Issue.find({
        $or: [{ issueKey: regex }, { title: regex }, { description: regex }],
      })
        .populate('projectId', 'name key')
        .limit(10),
    ]);

    res.status(200).json({
      success: true,
      data: {
        projects,
        issues,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { searchAll };
