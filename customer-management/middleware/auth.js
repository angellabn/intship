const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  const token  = header && header.split(' ')[1];
  if (!token)
    return res.status(401).json({ success: false, message: 'No token provided.' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

function adminOnly(req, res, next) {
  if (!req.user.isAdmin)
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  next();
}

module.exports = { authMiddleware, adminOnly };
