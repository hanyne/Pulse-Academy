// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'formateur', 'apprenant'],
    default: 'apprenant'
  },
  firstName: {
    type: String,
    required: false // Nom (non obligatoire)
  },
  lastName: {
    type: String,
    required: false // Prénom (non obligatoire)
  },
  dateOfBirth: {
    type: Date,
    required: false // Date de naissance (non obligatoire)
  },
  photo: {
    type: String,
    required: false // Chemin de la photo dans uploads (non obligatoire au niveau du modèle, mais géré dans les routes)
  },
  bio: {
    type: String,
    required: false // Bio (non obligatoire)
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);