require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');

const connectDB = require('./database');
const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const orderController = require('./controllers/orderController');

// Stop early if the session secret was not set properly
const secret = process.env.SESSION_SECRET;
if (!secret || secret === 'change-this-to-a-long-random-string') {
  console.error('Please set a real SESSION_SECRET in backend/.env (a long random string).');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json({ limit: '10kb' }));

// Sessions are stored in MongoDB (collection "sessions")
app.use(session({
  secret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI, ttl: 7 * 24 * 60 * 60 }),
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Server-rendered (EJS) order confirmation page
app.get('/order-confirmation/:id', orderController.showConfirmationPage);

// Unknown API paths
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found.' });
});

// Serve the built React app (after running "npm run build" in frontend)
const distFolder = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(distFolder)) {
  app.use(express.static(distFolder));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distFolder, 'index.html'));
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
});
