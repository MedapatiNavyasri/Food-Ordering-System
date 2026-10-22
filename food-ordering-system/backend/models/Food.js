const mongoose = require('mongoose');

const CATEGORIES = ['Pizza', 'Burgers', 'Biryani', 'Snacks', 'Drinks'];

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  category: { type: String, required: true, enum: CATEGORIES },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, trim: true, default: '' },
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Food = mongoose.model('Food', foodSchema);
Food.CATEGORIES = CATEGORIES;

module.exports = Food;
