const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  submitTask
} = require('../controllers/tasksController');

const router = express.Router();

router.post('/', protect, authorize('manager'), createTask);
router.get('/', protect, getAllTasks);
router.get('/:id', protect, getTaskById);
router.put('/:id', protect, authorize('manager'), updateTask);
router.delete('/:id', protect, authorize('manager'), deleteTask);
router.post('/:id/submit', protect, authorize('employee'), submitTask);

module.exports = router;
