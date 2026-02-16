// routes/contact.js
const express = require('express');
const router = express.Router();
const Contact = require('../model/contact');

// Route pour envoyer un message (POST - Create)
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation simple
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    const newContact = new Contact({
      name,
      email,
      subject,
      message
    });

    await newContact.save();
    res.status(201).json({ message: 'Message envoyé avec succès', data: newContact });
  } catch (err) {
    console.error('Erreur lors de l\'envoi du message:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Route pour récupérer tous les messages (GET - Read)
router.get('/contact', async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error('Erreur lors de la récupération des messages:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Route pour mettre à jour un message (PUT - Update)
router.put('/contact/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, subject, message } = req.body;

    // Validation simple
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { name, email, subject, message, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    res.status(200).json({ message: 'Message mis à jour avec succès', data: updatedContact });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du message:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Route pour supprimer un message (DELETE - Delete)
router.delete('/contact/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    res.status(200).json({ message: 'Message supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression du message:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;