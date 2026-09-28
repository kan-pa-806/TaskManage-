const Task = require('../models/Task');
const Issue = require('../models/Issue');
const Project = require('../models/Project');

// Map legacy Task status to Issue status
const mapStatus = (taskStatus) => {
  switch (taskStatus) {
    case 'In Progress':
      return 'IN PROGRESS';
    case 'Completed':
      return 'DONE';
    default:
      return 'TO DO';
  }
};

// @desc    Check and migrate legacy Tasks to Issues
// @route   POST /api/migration/migrate-tasks
const migrateTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find();
    if (tasks.length === 0) {
      return res.status(200).json({ success: true, message: 'No legacy tasks to migrate', count: 0 });
    }

    // Find or create default project
    let project = await Project.findOne();
    if (!project) {
      project = await Project.create({
        name: 'General Project',
        key: 'GEN',
        description: 'Auto-created project containing migrated tasks',
        lead: 'Admin',
        issueCounter: 0,
      });
    }

    let migratedCount = 0;
    for (const task of tasks) {
      // Check if already migrated by title and createdAt
      const existing = await Issue.findOne({
        projectId: project._id,
        title: task.title,
      });

      if (!existing) {
        project = await Project.findByIdAndUpdate(
          project._id,
          { $inc: { issueCounter: 1 } },
          { new: true }
        );

        await Issue.create({
          projectId: project._id,
          issueKey: `${project.key}-${project.issueCounter}`,
          title: task.title,
          description: task.description || '',
          status: mapStatus(task.status),
          priority: task.priority || 'Medium',
          issueType: 'Task',
          assignee: 'Unassigned',
          reporter: 'System',
          createdAt: task.createdAt || new Date(),
        });
        migratedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Migrated ${migratedCount} legacy tasks to project ${project.name} (${project.key})`,
      count: migratedCount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { migrateTasks };
