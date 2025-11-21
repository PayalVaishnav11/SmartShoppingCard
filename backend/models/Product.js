import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  rfidTag: { type: String, unique: true, sparse: true },
  imageUrl: String,
  desc: String,
  stock: { type: Number, default: 0 }
});
export default mongoose.model('Product', productSchema);