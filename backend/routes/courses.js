const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const Course = require('../model/Course');
const { auth, authAdmin } = require('../middleware/auth');

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'course-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file) {
      return cb(null, false); // No file provided, proceed without error
    }
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname || '').toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images JPEG, JPG et PNG sont autorisées'));
    }
  }
});

// Get all courses (accessible to admin, formateur, apprenant)
router.get('/', auth(['admin', 'formateur', 'apprenant']), async (req, res) => {
  try {
    const courses = await Course.find().populate('instructor', 'firstName lastName email');
    res.json(courses);
  } catch (err) {
    console.error('Erreur lors de la récupération des cours:', err);
    res.status(500).json({ error: 'Erreur serveur', message: err.message });
  }
});

// Get courses for the logged-in instructor
router.get('/instructor', auth(['formateur']), async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id }).populate('instructor', 'firstName lastName email');
    res.json(courses);
  } catch (err) {
    console.error('Erreur lors de la récupération des formations du formateur:', err);
    res.status(500).json({ error: 'Erreur serveur', message: err.message });
  }
});

// Get a single course by ID (public access)
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'ID de cours invalide' });
    }
    const course = await Course.findById(req.params.id).populate('instructor', 'firstName lastName email bio');
    if (!course) {
      return res.status(404).json({ error: 'Formation non trouvée' });
    }
    res.json(course);
  } catch (err) {
    console.error('Erreur lors de la récupération du cours:', err);
    res.status(500).json({ error: 'Erreur serveur', message: err.message });
  }
});

// Create a course (admin only)
router.post('/', auth(['admin']), upload.single('image'), async (req, res) => {
  try {
    const { title, description, instructor, duration, price, rating, schedule } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(instructor)) {
      return res.status(400).json({ error: 'ID de formateur invalide' });
    }

    if (!title || !description || !instructor) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    const course = new Course({
      title,
      description,
      instructor,
      duration: duration || '',
      price: price ? parseFloat(price) : 0,
      rating: rating ? parseFloat(rating) : 0,
      image: req.file ? req.file.filename : null,
      schedule: schedule ? JSON.parse(schedule) : []
    });

    await course.save();
    const populatedCourse = await Course.findById(course._id).populate('instructor', 'firstName lastName email');
    res.status(201).json(populatedCourse);
  } catch (err) {
    console.error('Erreur lors de la création du cours:', err);
    res.status(500).json({ error: 'Erreur serveur', message: err.message });
  }
});

// Update a course (admin only)
router.put('/:id', auth(['admin']), upload.single('image'), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'ID de cours invalide' });
    }
    const { title, description, instructor, duration, price, rating, schedule, imagePath } = req.body;
    if (instructor && !mongoose.Types.ObjectId.isValid(instructor)) {
      return res.status(400).json({ error: 'ID de formateur invalide' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Formation non trouvée' });
    }

    course.title = title || course.title;
    course.description = description || course.description;
    course.instructor = instructor || course.instructor;
    course.duration = duration !== undefined ? duration : course.duration;
    course.price = price !== undefined ? parseFloat(price) : course.price;
    course.rating = rating !== undefined ? parseFloat(rating) : course.rating;
    course.image = req.file ? req.file.filename : (imagePath || course.image);
    course.schedule = schedule ? JSON.parse(schedule) : course.schedule;

    await course.save();
    const populatedCourse = await Course.findById(course._id).populate('instructor', 'firstName lastName email');
    res.json(populatedCourse);
  } catch (err) {
    console.error('Erreur lors de la mise à jour du cours:', err);
    res.status(500).json({ error: 'Erreur serveur', message: err.message });
  }
});

// Delete a course (admin only)
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'ID de cours invalide' });
    }
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Formation non trouvée' });
    }
    await Course.deleteOne({ _id: req.params.id });
    res.json({ message: 'Formation supprimée avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression du cours:', err);
    res.status(500).json({ error: 'Erreur serveur', message: err.message });
  }
});

module.exports = router;