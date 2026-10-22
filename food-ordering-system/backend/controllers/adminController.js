const Food = require('../models/Food');
const Order = require('../models/Order');
const { validateFoodInput } = require('./foodController');

const isObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id));

// Adds the list of allowed next statuses so the frontend knows which buttons to show.
function orderForAdmin(order) {
  const plain = order.toObject();
  plain.nextStatuses = Order.TRANSITIONS[order.status] || [];
  return plain;
}

// ---------- Food management ----------

exports.getFoods = async (req, res, next) => {
  try {
    const foods = await Food.find().sort({ createdAt: -1 });
    res.json({ foods });
  } catch (err) {
    next(err);
  }
};

exports.addFood = async (req, res, next) => {
  try {
    const { error, data } = validateFoodInput(req.body);
    if (error) return res.status(400).json({ message: error });

    const food = await Food.create(data);
    res.status(201).json({ message: 'Food item added.', food });
  } catch (err) {
    next(err);
  }
};

exports.updateFood = async (req, res, next) => {
  try {
    if (!isObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid food id.' });
    }
    const { error, data } = validateFoodInput(req.body);
    if (error) return res.status(400).json({ message: error });

    const food = await Food.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!food) return res.status(404).json({ message: 'Food item not found.' });

    res.json({ message: 'Food item updated.', food });
  } catch (err) {
    next(err);
  }
};

exports.deleteFood = async (req, res, next) => {
  try {
    if (!isObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid food id.' });
    }
    // Old orders keep their own copy of name and price, so they are not affected.
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) return res.status(404).json({ message: 'Food item not found.' });

    res.json({ message: 'Food item deleted.' });
  } catch (err) {
    next(err);
  }
};

exports.setAvailability = async (req, res, next) => {
  try {
    if (!isObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid food id.' });
    }
    if (typeof req.body.available !== 'boolean') {
      return res.status(400).json({ message: 'Availability must be true or false.' });
    }
    const food = await Food.findByIdAndUpdate(
      req.params.id,
      { available: req.body.available },
      { new: true }
    );
    if (!food) return res.status(404).json({ message: 'Food item not found.' });

    res.json({ message: 'Availability updated.', food });
  } catch (err) {
    next(err);
  }
};

// ---------- Order management ----------

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('customer', 'name email').sort({ createdAt: -1 });
    res.json({ orders: orders.map(orderForAdmin) });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!isObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid order id.' });
    }
    if (typeof status !== 'string' || !Order.STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    const allowed = Order.TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `An order that is ${order.status} cannot be changed to ${status}.`
      });
    }

    order.status = status;
    await order.save();
    await order.populate('customer', 'name email');

    res.json({ message: `Order is now ${status}.`, order: orderForAdmin(order) });
  } catch (err) {
    next(err);
  }
};
