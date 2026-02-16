const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const User = require('../model/User');
const { auth, authAdmin } = require('../middleware/auth');

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'user-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (!file) {
      return cb(null, false); // No file provided, proceed without error
    }
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images JPEG, JPG et PNG sont autorisées'));
    }
  }
});

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'Utilisateur déjà existant' });
    }

    user = new User({
      email,
      password,
      role: role || 'apprenant'
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const token = jwt.sign(
      { user: { id: user._id, role: user.role } },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ token, role: user.role, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Erreur lors de l\'inscription:', err);
    res.status(500).json({ error: 'Erreur serveur', message: err.message });
  }
});

// Login a user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Utilisateur non trouvé' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Mot de passe incorrect' });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const token = jwt.sign(
      { user: { id: user._id, role: user.role } },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ 
      token, 
      role: user.role, 
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        dateOfBirth: user.dateOfBirth, 
        photo: user.photo, 
        bio: user.bio 
      } 
    });
  } catch (err) {
    console.error('Erreur lors de la connexion:', err);
    res.status(500).json({ error: 'Erreur serveur', message: err.message });
  }
});

// Update user profile
router.put('/me', auth(['admin', 'formateur', 'apprenant']), upload.single('photo'), async (req, res) => {
  try {
    const { email, password, firstName, lastName, dateOfBirth, bio } = req.body;
    const photo = req.file ? req.file.filename : undefined;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Cet email est déjà utilisé' });
      }
      user.email = email;
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : undefined;
    if (photo) user.photo = photo;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.json({ 
      message: 'Profil mis à jour avec succès', 
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        dateOfBirth: user.dateOfBirth, 
        photo: user.photo, 
        bio: user.bio 
      } 
    });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du profil:', err);
    res.status(500).json({ error: 'Erreur serveur', message: err.message });
  }
});

// Get current user profile
router.get('/me', auth(['admin', 'formateur', 'apprenant']), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json({ 
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        dateOfBirth: user.dateOfBirth, 
        photo: user.photo, 
        bio: user.bio 
      } 
    });
  } catch (err) {
    console.error('Erreur lors de la récupération du profil:', err);
    res.status(500).json({ error: 'Erreur serveur', message: err.message });
  }
});

// CRUD Routes for Users (Admin Only)
router.get('/users', authAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['formateur', 'apprenant'] } }).select('-password');
    res.json(users);
  } catch (err) {
    console.error('Erreur lors de la récupération des utilisateurs:', err);
    res.status(500).json({ error: 'Erreur serveur', message: err.message });
  }
});

router.get('/users/:id', authAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    if (!['formateur', 'apprenant'].includes(user.role)) {
      return res.status(403).json({ error: 'Utilisateur n\'est ni formateur ni apprenant' });
    }
    res.json(user);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', err);
    res.status(500).json({ error: 'Erreur serveur', message: err.message });
  }
});

router.post('/users', authAdmin, upload.single('photo'), async (req, res) => {
  const { email, password, role, firstName, lastName, dateOfBirth, bio } = req.body;
  const photo = req.file ? req.file.filename : undefined;

  try {
    if (!['formateur', 'apprenant'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide. Doit être formateur ou apprenant.' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'Utilisateur déjà existant' });
    }

    user = new User({
      email,
      password,
      role,
      firstName,
      lastName,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      photo,
      bio
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.status(201).json({ 
      message: 'Utilisateur créé avec succès', 
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        dateOfBirth: user.dateOfBirth, 
        photo: user.photo, 
        bio: user.bio 
      } 
    });
  } catch (err) {
    console.error('Erreur lors de la création de l\'utilisateur:', err);
    res.status(500).json({ error: 'Erreur serveur', message: err.message });
  }
});

router.put('/users/:id', authAdmin, upload.single('photo'), async (req, res) => {
  const { email, password, role, firstName, lastName, dateOfBirth, bio } = req.body;
  const photo = req.file ? req.file.filename : undefined;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (role && !['formateur', 'apprenant'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide. Doit être formateur ou apprenant.' });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Cet email est déjà utilisé' });
      }
      user.email = email;
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    if (role) user.role = role;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : undefined;
    if (photo) user.photo = photo;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.json({ 
      message: 'Utilisateur mis à jour avec succès', 
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        dateOfBirth: user.dateOfBirth, 
        photo: user.photo, 
        bio: user.bio 
      } 
    });
  } catch (err) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
    res.status(500).json({ error: 'Erreur serveur', message: err.message });
  }
});

router.delete('/users/:id', authAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (!['formateur', 'apprenant'].includes(user.role)) {
      return res.status(403).json({ error: 'Utilisateur n\'est ni formateur ni apprenant' });
    }

    await User.deleteOne({ _id: req.params.id });
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', err);
    res.status(500).json({ error: 'Erreur serveur', message: err.message });
  }
});

// Get all instructors (formateurs)
// Get all instructors (formateurs)
router.get('/instructors', async (req, res) => {
  try {
    const instructors = await User.find({ role: 'formateur' })
      .select('firstName lastName email _id photo specialty instagram'); // add fields you need

    if (!instructors || instructors.length === 0) {
      return res.status(200).json([]); // return empty array instead of 404
    }

    res.json(instructors);
  } catch (err) {
    console.error('Erreur lors de la récupération des formateurs:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;