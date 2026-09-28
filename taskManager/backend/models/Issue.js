const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true,
    },
    issueKey: {
      type: String,
      required: [true, 'Issue key is required'],
      trim: true,
      uppercase: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Summary/Title is required'],
      trim: true,
      maxlength: [250, 'Title cannot exceed 250 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [10000, 'Description cannot exceed 10000 characters'],
    },
    issueType: {
      type: String,
      enum: {
        values: ['Task', 'Bug', 'Story', 'Epic'],
        message: 'Issue type must be Task, Bug, Story, or Epic',
      },
      default: 'Task',
    },
    status: {
      type: String,
      enum: {
        values: ['TO DO', 'IN PROGRESS', 'IN REVIEW', 'DONE'],
        message: 'Status must be TO DO, IN PROGRESS, IN REVIEW, or DONE',
      },
      default: 'TO DO',
    },
    priority: {
      type: String,
      enum: {
        values: ['Lowest', 'Low', 'Medium', 'High', 'Highest'],
        message: 'Priority must be Lowest, Low, Medium, High, or Highest',
      },
      default: 'Medium',
    },
    assignee: {
      type: String,
      trim: true,
      default: 'Unassigned',
    },
    reporter: {
      type: String,
      trim: true,
      default: 'Unassigned',
    },
    labels: {
      type: [String],
      default: [],
    },
    sprintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sprint',
      default: null,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

issueSchema.index({ projectId: 1, issueKey: 1 }, { unique: true });

module.exports = mongoose.model('Issue', issueSchema);
