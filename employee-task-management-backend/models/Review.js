const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  task_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: [true, 'Review must be associated with a task']
  },
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must be assigned to an employee']
  },
  manager_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must have a manager']
  },
  module_id: {
    type: Number,
    required: [true, 'Module ID is required'],
    min: [1, 'Module ID must be between 1 and 10'],
    max: [10, 'Module ID must be between 1 and 10']
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Review description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: [500, 'Feedback cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  submission_date: {
    type: Date
  },
  score: {
    type: Number,
    min: [0, 'Score cannot be less than 0'],
    max: [100, 'Score cannot be more than 100']
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
reviewSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Pre-save middleware to set submission_date when status changes to completed
reviewSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.submission_date) {
    this.submission_date = Date.now();
  }
  next();
});

module.exports = mongoose.model('Review', reviewSchema);

