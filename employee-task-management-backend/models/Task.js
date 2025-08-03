const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task must be assigned to a user']
  },
  assigned_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task must have an assigner']
  },
  deadline: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v > Date.now();
      },
      message: 'Deadline must be in the future'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'in_review'],
    default: 'pending'
  },
  submission_notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Submission notes cannot be more than 500 characters']
  },
  submission_date: {
    type: Date
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update the updated_at field
taskSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Pre-save middleware to set submission_date when status changes to completed
taskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.submission_date) {
    this.submission_date = Date.now();
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);

