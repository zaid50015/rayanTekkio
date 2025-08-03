const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createReview,
  getAllReviews,
  getReviewSuggestions,
  getReviewsByEmployee,
  submitReview,
  getReviewById,
  updateReview,
  deleteReview
} = require('../controllers/reviewsController');

const router = express.Router();

router.post('/', protect, authorize('manager'), createReview);
router.get('/', protect, getAllReviews);
router.get('/suggestions/:employeeId', protect, authorize('manager'), getReviewSuggestions);
router.get('/employee/:employeeId', protect, authorize('manager'), getReviewsByEmployee);
router.post('/:id/submit', protect, authorize('employee'), submitReview);
router.get('/:id', protect, getReviewById);
router.put('/:id', protect, authorize('manager'), updateReview);
router.delete('/:id', protect, authorize('manager'), deleteReview);

module.exports = router;
