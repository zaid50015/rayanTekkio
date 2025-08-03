const Task = require('../models/Task');
const User = require('../models/User');

exports.createTask = async (req, res) => {
  try {
    const { title, description, assigned_to, deadline } = req.body;

    if (!title || !description || !assigned_to) {
      return res.status(400).json({ success: false, message: 'Title, description, and assigned_to are required' });
    }

    const assignedUser = await User.findById(assigned_to);
    if (!assignedUser) {
      return res.status(404).json({ success: false, message: 'Assigned user not found' });
    }

    if (assignedUser.role !== 'employee') {
      return res.status(400).json({ success: false, message: 'Only employees can be assigned tasks' });
    }

    const task = await Task.create({
      title,
      description,
      assigned_to,
      assigned_by: req.user.id,
      deadline: deadline ? new Date(deadline) : undefined
    });

    await task.populate('assigned_to', 'username email');
    await task.populate('assigned_by', 'username email');

    res.status(201).json({ success: true, message: 'Task created successfully', data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const query = req.user.role === 'employee' ? { assigned_to: req.user.id } : {};

    if (req.query.status) {
      query.status = req.query.status;
    }

    const tasks = await Task.find(query)
      .populate('assigned_to', 'username email')
      .populate('assigned_by', 'username email')
      .sort({ created_at: -1 });

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assigned_to', 'username email')
      .populate('assigned_by', 'username email');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (req.user.role === 'employee' && task.assigned_to._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this task' });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, description, assigned_to, deadline, status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (assigned_to) updateData.assigned_to = assigned_to;
    if (deadline) updateData.deadline = new Date(deadline);
    if (status) updateData.status = status;

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    })
      .populate('assigned_to', 'username email')
      .populate('assigned_by', 'username email');

    res.status(200).json({ success: true, message: 'Task updated successfully', data: updatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await task.remove();

    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.submitTask = async (req, res) => {
  try {
    const { submission_notes } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.assigned_to.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to submit this task' });
    }

    if (task.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Task is already completed' });
    }

    task.status = 'completed';
    task.submission_notes = submission_notes || '';
    task.submission_date = new Date();

    await task.save();
    await task.populate('assigned_to', 'username email');
    await task.populate('assigned_by', 'username email');

    res.status(200).json({ success: true, message: 'Task submitted successfully', data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
