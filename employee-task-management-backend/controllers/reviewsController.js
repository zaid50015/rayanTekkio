const Review = require('../models/Review');
const Task = require('../models/Task');
const User = require('../models/User');

// Helper: Rotation logic
const calculateNextModule = (moduleScores) => {
  const sortedModules = moduleScores
    .map((module, index) => ({ ...module, originalIndex: index }))
    .sort((a, b) => a.score - b.score);
  return sortedModules[0]?.module_id;
};

exports.createReview = async (req, res) => {
  try {
    const { task_id, employee_id, module_id, title, description } = req.body;

    if (!task_id || !employee_id || !module_id || !title || !description) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const task = await Task.findById(task_id);
    const employee = await User.findById(employee_id);
    if (!task || !employee || employee.role !== 'employee') {
      return res.status(404).json({ success: false, message: 'Invalid task or employee' });
    }

    const review = await Review.create({
      task_id,
      employee_id,
      manager_id: req.user.id,
      module_id,
      title,
      description
    });

    await review.populate('task_id', 'title description');
    await review.populate('employee_id', 'username email');
    await review.populate('manager_id', 'username email');

    res.status(201).json({ success: true, message: 'Created', data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const query = req.user.role === 'employee' ? { employee_id: req.user.id } : {};
    if (req.query.status) query.status = req.query.status;

    const reviews = await Review.find(query)
      .populate('task_id', 'title description')
      .populate('employee_id', 'username email')
      .populate('manager_id', 'username email')
      .sort({ created_at: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.getReviewSuggestions = async (req, res) => {
  try {
    const employee = await User.findById(req.params.employeeId);
    if (!employee || employee.role !== 'employee') {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const nextModuleId = calculateNextModule(employee.modules_scores);
    const completedTasks = await Task.find({ assigned_to: req.params.employeeId, status: 'completed' })
      .sort({ submission_date: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        suggested_module: nextModuleId,
        employee_scores: employee.modules_scores,
        recent_completed_tasks: completedTasks
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.getReviewsByEmployee = async (req, res) => {
  try {
    const reviews = await Review.find({ employee_id: req.params.employeeId })
      .populate('task_id', 'title description')
      .populate('employee_id', 'username email')
      .populate('manager_id', 'username email')
      .sort({ created_at: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.submitReview = async (req, res) => {
  try {
    const { feedback, score } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.employee_id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (review.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Already completed' });
    }

    review.status = 'completed';
    review.feedback = feedback || '';
    review.score = score || 0;
    review.submission_date = new Date();
    await review.save();

    const user = await User.findById(req.user.id);
    const moduleIndex = user.modules_scores.findIndex(m => m.module_id === review.module_id);
    if (moduleIndex !== -1) {
      const oldScore = user.modules_scores[moduleIndex].score;
      user.modules_scores[moduleIndex].score = Math.round((oldScore + (score || 0)) / 2);
    } else {
      user.modules_scores.push({ module_id: review.module_id, score: score || 0 });
    }
    await user.save();

    await review.populate('task_id', 'title description');
    await review.populate('employee_id', 'username email');
    await review.populate('manager_id', 'username email');

    res.status(200).json({ success: true, message: 'Submitted', data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('task_id', 'title description')
      .populate('employee_id', 'username email')
      .populate('manager_id', 'username email');

    if (!review) return res.status(404).json({ success: false, message: 'Not found' });

    if (req.user.role === 'employee' && review.employee_id._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.status(200).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { title, description, module_id } = req.body;
    const update = {};
    if (title) update.title = title;
    if (description) update.description = description;
    if (module_id) update.module_id = module_id;

    const review = await Review.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true
    })
      .populate('task_id', 'title description')
      .populate('employee_id', 'username email')
      .populate('manager_id', 'username email');

    if (!review) return res.status(404).json({ success: false, message: 'Not found' });

    res.status(200).json({ success: true, message: 'Updated', data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Not found' });

    await review.remove();

    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
