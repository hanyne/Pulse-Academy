// routes/review.js
const express = require('express');
const router = express.Router();
const Review = require('../model/Review');
const User = require('../model/User');
const { auth, authAdmin } = require('../middleware/auth');

// Create a review (only for apprenants)
router.post('/', auth(['apprenant']), async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = new Review({
      user: req.user.id,
      rating,
      comment,
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get all reviews with user details
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'firstName lastName photo')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Delete a review (admin only)
// routes/review.js
router.delete('/:id', authAdmin, async (req, res) => {
    try {
      const review = await Review.findById(req.params.id);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      await Review.deleteOne({ _id: req.params.id }); // Updated to use deleteOne
      res.json({ message: 'Review deleted successfully' });
    } catch (error) {
      console.error('Delete review error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

module.exports = router;