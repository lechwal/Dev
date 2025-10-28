const jwt = require('jsonwebtoken');

// Middleware pour vérifier le token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token d\'authentification manquant' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide ou expiré' });
    }
    req.user = user;
    next();
  });
};

// Middleware pour vérifier si l'utilisateur est de la direction
const requireDirection = (req, res, next) => {
  if (req.user.role !== 'DIRECTION') {
    return res.status(403).json({ error: 'Accès réservé à la direction' });
  }
  next();
};

// Middleware pour filtrer les données selon l'équipe
const filterByTeam = (req, res, next) => {
  // Si l'utilisateur est de la direction, il peut tout voir
  if (req.user.role === 'DIRECTION') {
    req.teamFilter = null; // Pas de filtre
  } else {
    // Sinon, on filtre par l'équipe de l'utilisateur
    req.teamFilter = req.user.teamId;
  }
  next();
};

module.exports = {
  authenticateToken,
  requireDirection,
  filterByTeam
};
