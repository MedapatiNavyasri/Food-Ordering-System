const mongoose = require('mongoose');

const STATUSES = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Delivered', 'Cancelled', 'Rejected'];

// Which status can an order move to from its current status?
const TRANSITIONS = {
  Pending: ['Accepted', 'Rejected', 'Cancelled'],
  Accepted: ['Preparing', 'Cancelled'],
  Preparing: ['Ready', 'Cancelled'],
  Ready: ['Delivered'],
  Delivered: [],
  Cancelled: [],
  Rejected: []
};

// Name and price are copied from the food at the time of purchase (a snapshot),
// so old orders stay correct even if the food is edited or deleted later.
const orderItemSchema = new mongoose.Schema({
  food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true, trim: true },
  items: { type: [orderItemSchema], required: true },
  totalAmount: { type: Number, required: true },
  address: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  paymentMethod: { type: String, enum: ['Cash on Delivery'], default: 'Cash on Delivery' },
  status: { type: String, enum: STATUSES, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);
Order.STATUSES = STATUSES;
Order.TRANSITIONS = TRANSITIONS;

module.exports = Order;
