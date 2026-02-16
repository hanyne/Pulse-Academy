// middleware/auth.js
const jwt = require('jsonwebtoken');

// Generic auth middleware that accepts an array of allowed roles
const auth = (roles = []) => {
  return (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Accès refusé. Aucun token fourni.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.user;

      if (roles.length && !roles.includes(decoded.user.role)) {
        return res.status(403).json({ message: 'Accès interdit. Rôle non autorisé.' });
      }

      next();
    } catch (err) {
      res.status(400).json({ message: 'Token invalide.' });
    }
  };
};

// Admin-specific middleware
const authAdmin = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Aucun token, autorisation refusée' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès interdit : réservé aux admins' });
    }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalide' });
  }
};


// Export both auth and authAdmin
module.exports = { auth, authAdmin };