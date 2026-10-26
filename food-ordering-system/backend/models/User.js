const mongoose = require('mongoose');

// Saved shopping cart: only the food id and quantity are stored.
// Name and price are always read from the Food collection, so they are never out of date.
const cartItemSchema = new mongoose.Schema({
  food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
  quantity: { type: Number, required: true, min: 1, max: 10 }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  cart: { type: [cartItemSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);