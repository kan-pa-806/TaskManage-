const mongoose = require('mongoose');

const sprintSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Sprint name is required'],
      trim: true,
      maxlength: [100, 'Sprint name cannot exceed 100 characters'],
    },
    goal: {
      type: String,
      trim: true,
      maxlength: [500, 'Goal cannot exceed 500 characters'],
      default: '',
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ['PLANNED', 'ACTIVE', 'COMPLETED'],
        message: 'Status must be PLANNED, ACTIVE, or COMPLETED',
      },
      default: 'PLANNED',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Sprint', sprintSchema);
