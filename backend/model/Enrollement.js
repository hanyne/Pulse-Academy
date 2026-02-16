const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  nom: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  prenom: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  email: {
    type: String,
    required: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Veuillez entrer un email valide']
  },
  telephone: {
    type: String,
    trim: true,
    match: [/^[0-9]{8}$/, 'Le numéro de téléphone doit contenir 8 chiffres']
  },
  cin: {
    type: String,
    required: true,
    trim: true,
    match: [/^[0-9]{8}$/, 'Le CIN doit contenir 8 chiffres']
  },
  adresse: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 100
  },
  niveauEtude: {
    type: String,
    required: true,
    enum: ['Bac', 'Licence', 'Master', 'Doctorat', 'Autre'],
    default: 'Autre'
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['en attente', 'confirme', 'paye', 'refuse'],
    default: 'en attente'
  },
  discountedPrice: {
    type: Number,
    default: null,
    validate: {
      validator: function (value) {
        return value === null || value >= 0;
      },
      message: 'Le prix réduit doit être un nombre positif ou null'
    }
  }
});

enrollmentSchema.index({ user: 1, course: 1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema);