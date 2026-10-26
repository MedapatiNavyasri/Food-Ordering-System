const User = require('../models/User');
const Food = require('../models/Food');

const MAX_QUANTITY = 10;
const isObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id));

// GET /api/cart - the logged-in customer's saved cart with current food details
exports.getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.food');
    const items = user.cart
      .filter((item) => item.food) // skip foods that were deleted
      .map((item) => ({
        foodId: item.food._id.toString(),
        name: item.food.name,
        price: item.food.price,
        image: item.food.image,
        quantity: item.quantity
      }));
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

// PUT /api/cart - replace the saved cart. Body: { items: [{ foodId, quantity }] }
exports.saveCart = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length > 20) {
      return res.status(400).json({ message: 'Invalid cart.' });
    }

    const wanted = new Map(); // foodId -> quantity
    for (const item of items) {
      if (!item || typeof item.foodId !== 'string' || !isObjectId(item.foodId)) {
        return res.status(400).json({ message: 'Invalid cart item.' });
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY) {
        return res.status(400).json({ message: `Quantity must be between 1 and ${MAX_QUANTITY}.` });
      }
      wanted.set(item.foodId, Math.min((wanted.get(item.foodId) || 0) + item.quantity, MAX_QUANTITY));
    }

    // keep only foods that really exist
    const foods = await Food.find({ _id: { $in: [...wanted.keys()] } }).select('_id');
    const cart = foods.map((food) => ({ food: food._id, quantity: wanted.get(food._id.toString()) }));

    await User.updateOne({ _id: req.user._id }, { $set: { cart } });
    res.json({ message: 'Cart saved.' });
  } catch (err) {
    next(err);
  }
};