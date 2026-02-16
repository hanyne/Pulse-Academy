const express = require('express');
const router = express.Router();
const Enrollment = require('../model/Enrollement'); // Fixed typo: Enrollement -> Enrollment
const Course = require('../model/Course'); // Added missing import
const { auth } = require('../middleware/auth');

// Regular enrollment
router.post('/', auth(['apprenant']), async (req, res) => {
  try {
    const { courseId, nom, prenom, email, telephone, cin, adresse, niveauEtude } = req.body;

    // Validate required fields
    if (!courseId || !nom || !prenom || !email || !cin || !adresse || !niveauEtude) {
      return res.status(400).json({ 
        message: 'Erreur de validation', 
        errors: [{ message: 'Veuillez fournir tous les champs requis' }] 
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Formation non trouvée' });
    }

    // Check for existing enrollment
    const existingEnrollment = await Enrollment.findOne({
      user: req.user.id,
      course: courseId
    });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Vous êtes déjà inscrit à cette formation' });
    }

    const enrollment = new Enrollment({
      user: req.user.id,
      course: courseId,
      nom,
      prenom,
      email,
      telephone,
      cin,
      adresse,
      niveauEtude
    });

    const savedEnrollment = await enrollment.save();
    await savedEnrollment.populate([
      { path: 'course', select: 'title schedule price' },
      { path: 'user', select: 'email nom prenom' }
    ]);

    res.status(201).json(savedEnrollment);
  } catch (err) {
    console.error('Erreur lors de l\'inscription:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Discounted enrollment for new learners
router.post('/discounted', auth(['apprenant']), async (req, res) => {
  try {
    const { courseId, nom, prenom, email, telephone, cin, adresse, niveauEtude } = req.body;

    // Validate required fields
    if (!courseId || !nom || !prenom || !email || !cin || !adresse || !niveauEtude) {
      return res.status(400).json({ 
        message: 'Erreur de validation', 
        errors: [{ message: 'Veuillez fournir tous les champs requis' }] 
      });
    }

    // Validate email format
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ 
        message: 'Erreur de validation', 
        errors: [{ field: 'email', message: 'Format d\'email invalide' }] 
      });
    }

    // Validate CIN and optional telephone format
    if (!/^[0-9]{8}$/.test(cin)) {
      return res.status(400).json({ 
        message: 'Erreur de validation', 
        errors: [{ field: 'cin', message: 'Le CIN doit contenir 8 chiffres' }] 
      });
    }
    if (telephone && !/^[0-9]{8}$/.test(telephone)) {
      return res.status(400).json({ 
        message: 'Erreur de validation', 
        errors: [{ field: 'telephone', message: 'Le numéro de téléphone doit contenir 8 chiffres' }] 
      });
    }

    // Check if user has prior enrollments
    const priorEnrollments = await Enrollment.find({ user: req.user.id });
    if (priorEnrollments.length > 0) {
      return res.status(400).json({ 
        message: 'La réduction est réservée aux nouveaux apprenants sans inscriptions précédentes.' 
      });
    }

    // Check if course exists and has a valid price
    const course = await Course.findById(courseId);
    if (!course || isNaN(course.price)) {
      return res.status(404).json({ message: 'Formation non trouvée ou prix invalide' });
    }

    // Check for existing enrollment
    const existingEnrollment = await Enrollment.findOne({
      user: req.user.id,
      course: courseId
    });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Vous êtes déjà inscrit à cette formation' });
    }

    // Apply 20% discount
    const DISCOUNT_PERCENTAGE = process.env.DISCOUNT_PERCENTAGE || 0.2;
    const originalPrice = course.price;
    const discountedPrice = originalPrice * (1 - DISCOUNT_PERCENTAGE);

    const enrollment = new Enrollment({
      user: req.user.id,
      course: courseId,
      nom,
      prenom,
      email,
      telephone,
      cin,
      adresse,
      niveauEtude,
      discountedPrice
    });

    const savedEnrollment = await enrollment.save();
    await savedEnrollment.populate([
      { path: 'course', select: 'title schedule price' },
      { path: 'user', select: 'email nom prenom' }
    ]);

    res.status(201).json(savedEnrollment);
  } catch (err) {
    console.error('Erreur lors de l\'inscription avec réduction:', err);
    res.status(500).json({ 
      message: 'Erreur serveur', 
      error: err.message 
    });
  }
});

// Get all enrollments for a course
router.get('/all/:courseId', auth(['admin', 'formateur']), async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      course: req.params.courseId
    }).populate('user', 'email nom prenom').populate('course', 'title');
    res.status(200).json(enrollments);
  } catch (err) {
    console.error('Erreur lors de la récupération des inscriptions:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Update enrollment status
router.put('/:id', auth(['admin']), async (req, res) => {
  try {
    const { status, methodePaiement } = req.body;
    if (!['en attente', 'confirme', 'paye', 'refuse'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide. Utilisez "en attente", "confirme", "paye" ou "refuse".' });
    }

    const updateData = { status };
    if (status === 'paye') {
      updateData.datePaiement = new Date();
      if (methodePaiement) {
        if (!['Espèces', 'Carte', 'Virement'].includes(methodePaiement)) {
          return res.status(400).json({ message: 'Méthode de paiement invalide.' });
        }
        updateData.methodePaiement = methodePaiement;
      }
    }

    const updatedEnrollment = await Enrollment.findOneAndUpdate(
      { _id: req.params.id },
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'email nom prenom').populate('course', 'title');

    if (!updatedEnrollment) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }

    res.json({ message: 'Statut mis à jour avec succès', enrollment: updatedEnrollment });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du statut:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Get pending enrollments for a course
router.get('/pending/:courseId', auth(['admin', 'formateur']), async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      course: req.params.courseId,
      status: 'en attente'
    }).populate('user', 'email nom prenom').populate('course', 'title');
    res.status(200).json(enrollments);
  } catch (err) {
    console.error('Erreur lors de la récupération des inscriptions:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Get confirmed enrollments for a course
router.get('/confirmed/:courseId', auth(['admin', 'formateur']), async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      course: req.params.courseId,
      status: 'confirme'
    }).populate('user', 'email nom prenom').populate('course', 'title');
    res.status(200).json(enrollments);
  } catch (err) {
    console.error('Erreur lors de la récupération des inscriptions confirmées:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Get paid enrollments for the logged-in user (apprenant)
router.get('/paid', auth(['apprenant']), async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      user: req.user.id,
      status: 'paye'
    }).populate('course', 'title schedule').populate('user', 'email nom prenom');
    res.status(200).json(enrollments);
  } catch (err) {
    console.error('Erreur lors de la récupération des inscriptions payées:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;