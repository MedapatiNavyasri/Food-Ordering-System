const Food = require('../models/Food');
const Order = require('../models/Order');
const User = require('../models/User');

const MAX_QUANTITY = 10;
const isObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id));

// Accepts +91, 91 or 0 in front of a 10 digit mobile number.
function cleanPhone(raw) {
  let phone = String(raw || '').replace(/[\s-]/g, '');
  if (phone.startsWith('+91')) phone = phone.slice(3);
  else if (phone.startsWith('91') && phone.length === 12) phone = phone.slice(2);
  else if (phone.startsWith('0') && phone.length === 11) phone = phone.slice(1);
  return phone;
}

// POST /api/orders
exports.placeOrder = async (req, res, next) => {
  try {
    const { items, customerName, phone, address, paymentMethod } = req.body;

    // --- check the delivery details ---
    if (typeof customerName !== 'string' || customerName.trim().length < 2 || customerName.trim().length > 50) {
      return res.status(400).json({ message: 'Please enter your name (2 to 50 characters).' });
    }
    const cleanedPhone = cleanPhone(phone);
    if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit Indian mobile number.' });
    }
    if (typeof address !== 'string' || address.trim().length < 10 || address.trim().length > 300) {
      return res.status(400).json({ message: 'Please enter a full delivery address (10 to 300 characters).' });
    }
    if (paymentMethod !== 'Cash on Delivery') {
      return res.status(400).json({ message: 'Only Cash on Delivery is available.' });
    }

    // --- check the cart items (only ids and quantities are used from the browser) ---
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }
    if (items.length > 20) {
      return res.status(400).json({ message: 'You can order at most 20 different items at once.' });
    }

    const wanted = new Map(); // foodId -> quantity
    for (const item of items) {
      if (!item || typeof item.foodId !== 'string' || !isObjectId(item.foodId)) {
        return res.status(400).json({ message: 'One of the cart items is invalid.' });
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY) {
        return res.status(400).json({ message: `Quantity must be between 1 and ${MAX_QUANTITY}.` });
      }
      const total = (wanted.get(item.foodId) || 0) + item.quantity;
      if (total > MAX_QUANTITY) {
        return res.status(400).json({ message: `Quantity must be between 1 and ${MAX_QUANTITY}.` });
      }
      wanted.set(item.foodId, total);
    }

    // --- load the real food data from MongoDB ---
    const foods = await Food.find({ _id: { $in: [...wanted.keys()] } });
    if (foods.length !== wanted.size) {
      return res.status(400).json({ message: 'Some food items no longer exist. Please review your cart.' });
    }
    const unavailable = foods.filter((food) => !food.available);
    if (unavailable.length > 0) {
      const names = unavailable.map((food) => food.name).join(', ');
      return res.status(400).json({ message: `Not available right now: ${names}. Please review your cart.` });
    }

    // --- calculate the total on the server using current prices ---
    let totalAmount = 0;
    const orderItems = foods.map((food) => {
      const quantity = wanted.get(food._id.toString());
      const subtotal = Math.round(food.price * quantity * 100) / 100;
      totalAmount += subtotal;
      return { food: food._id, name: food.name, price: food.price, quantity, subtotal };
    });
    totalAmount = Math.round(totalAmount * 100) / 100;

    const order = await Order.create({
      customer: req.user._id, // taken from the session, not from the request body
      customerName: customerName.trim(),
      items: orderItems,
      totalAmount,
      address: address.trim(),
      phone: cleanedPhone,
      paymentMethod,
      status: 'Pending'
    });

        // The order is saved, so empty the customer's saved cart
    await User.updateOne({ _id: req.user._id }, { $set: { cart: [] } });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/my
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    if (!isObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid order id.' });
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    const isOwner = order.customer.equals(req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not allowed to view this order.' });
    }
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

// GET /order-confirmation/:id  (server-rendered with EJS)
exports.showConfirmationPage = async (req, res, next) => {
  try {
    if (!req.session.userId) return res.redirect('/login');
    const user = await User.findById(req.session.userId);
    if (!user) return res.redirect('/login');

    if (!isObjectId(req.params.id)) {
      return res.status(404).send('Order not found.');
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).send('Order not found.');
    }
    if (!order.customer.equals(user._id) && user.role !== 'admin') {
      return res.status(403).send('You are not allowed to view this order.');
    }
    res.render('order-confirmation', { order });
  } catch (err) {
    next(err);
  }
};
