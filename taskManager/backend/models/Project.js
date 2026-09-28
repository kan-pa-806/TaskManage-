const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    key: {
      type: String,
      required: [true, 'Project key is required'],
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9]{2,10}$/, 'Project key must be 2-10 alphanumeric uppercase characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    lead: {
      type: String,
      trim: true,
      default: 'Admin',
    },
    issueCounter: {
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

// Unique index on key per user/workspace
projectSchema.index({ key: 1 }, { unique: true });

module.exports = mongoose.model('Project', projectSchema);
