const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getEmployees,
  getUsers,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const router = express.Router();

router.get('/employees', protect, authorize('manager'), getEmployees);
router.get('/', protect, authorize('manager'), getUsers);
router.get('/:id', protect, getUser);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, authorize('manager'), deleteUser);

module.exports = router;
