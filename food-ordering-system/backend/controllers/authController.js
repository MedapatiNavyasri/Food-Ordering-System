const bcrypt = require('bcryptjs');
const User = require('../models/User');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Only send safe fields to the browser (never the password hash).
function safeUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Reject anything that is not a plain string (stops NoSQL injection objects)
    if ([name, email, password, confirmPassword].some((v) => typeof v !== 'string')) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (cleanName.length < 2 || cleanName.length > 50) {
      return res.status(400).json({ message: 'Name must be between 2 and 50 characters.' });
    }
    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Password and confirm password do not match.' });
    }

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({ message: 'This email is already registered. Please log in.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    // The role is always "customer" here. It is never read from the request.
    await User.create({ name: cleanName, email: cleanEmail, passwordHash, role: 'customer' });

    res.status(201).json({ message: 'Registration successful! You can now log in.' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'This email is already registered. Please log in.' });
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    const passwordOk = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!passwordOk) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // New session id after login (protects against session fixation)
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = user._id.toString();
      req.session.save((saveErr) => {
        if (saveErr) return next(saveErr);
        res.json({ message: 'Login successful.', user: safeUser(user) });
      });
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    res.json({ message: 'You have been logged out.' });
  });
};

exports.me = (req, res) => {
  res.json({ user: safeUser(req.user) });
};
