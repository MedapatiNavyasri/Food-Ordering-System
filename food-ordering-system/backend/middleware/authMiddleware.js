const User = require('../models/User');

// Checks that someone is logged in. The user is loaded from MongoDB on every
// request, so the role always comes from the database and never from the browser.
async function requireLogin(req, res, next) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Please log in first.' });
    }
    const user = await User.findById(req.session.userId).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ message: 'Please log in again.' });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

// Must be used after requireLogin.
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only.' });
  }
  next();
}

module.exports = { requireLogin, requireAdmin };
