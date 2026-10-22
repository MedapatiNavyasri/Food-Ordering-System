const Food = require('../models/Food');

const isObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id));

// Checks food data coming from the admin form.
// Returns { error } or { data } with cleaned values.
function validateFoodInput(body) {
  const { name, description, category, price, image, available } = body || {};

  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 60) {
    return { error: 'Food name must be between 2 and 60 characters.' };
  }
  if (typeof description !== 'string' || !description.trim()) {
    return { error: 'Description is required.' };
  }
  if (description.trim().length > 200) {
    return { error: 'Description must be 200 characters or less.' };
  }
  if (!Food.CATEGORIES.includes(category)) {
    return { error: 'Please choose a valid category.' };
  }
  if ((typeof price !== 'number' && typeof price !== 'string') || String(price).trim() === '') {
    return { error: 'Price must be a number greater than 0.' };
  }
  const priceNumber = Number(price);
  if (!Number.isFinite(priceNumber) || priceNumber <= 0 || priceNumber > 100000) {
    return { error: 'Price must be a number greater than 0.' };
  }
  const imageUrl = typeof image === 'string' ? image.trim() : '';
  if (imageUrl && !/^(https?:\/\/|\/)/i.test(imageUrl)) {
    return { error: 'Image URL must start with http:// or https://' };
  }
  if (available !== undefined && typeof available !== 'boolean') {
    return { error: 'Availability must be true or false.' };
  }

  return {
    data: {
      name: name.trim(),
      description: description.trim(),
      category,
      price: Math.round(priceNumber * 100) / 100,
      image: imageUrl,
      available: available === undefined ? true : available
    }
  };
}

// GET /api/foods  - only available items
exports.getFoods = async (req, res, next) => {
  try {
    const foods = await Food.find({ available: true }).sort({ category: 1, name: 1 });
    res.json({ foods });
  } catch (err) {
    next(err);
  }
};

// GET /api/foods/:id - one available item
exports.getFoodById = async (req, res, next) => {
  try {
    if (!isObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid food id.' });
    }
    const food = await Food.findOne({ _id: req.params.id, available: true });
    if (!food) {
      return res.status(404).json({ message: 'Food item not found.' });
    }
    res.json({ food });
  } catch (err) {
    next(err);
  }
};

exports.validateFoodInput = validateFoodInput;
