const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    required: false
  },
  rating: {
    type: Number,
    default: 0
  },
  duration: {
    type: String,
    required: false
  },
  price: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  schedule: [{
    day: {
      type: String,
      required: true,
      enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    date: {
      type: String, // Store as string (e.g., "YYYY-MM-DD")
      required: false
    }
  }]
});

module.exports = mongoose.model('Course', courseSchema);