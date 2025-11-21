// models/Cart.js
import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  productId: mongoose.Types.ObjectId,
  name: String,
  price: Number,
  qty: Number
}, { _id: false });

const cartSchema = new mongoose.Schema({
  deviceId: String,
  items: [itemSchema],
  total: Number,
  status: { type: String, default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Cart', cartSchema);
