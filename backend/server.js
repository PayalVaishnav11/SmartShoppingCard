// server.js
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import { Server } from 'socket.io';

import Product from './models/Product.js';
import Cart from './models/Cart.js';

const MONGO = process.env.MONGO_URI || '';

mongoose.connect(MONGO)
  .then(() => console.log('Mongo connected'))
  .catch(err => {
    console.error('Mongo connection error', err);
    process.exit(1);
  });

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json()); // built-in body parser

// product CRUD
app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  const p = new Product(req.body);
  await p.save();
  res.json(p);
});

app.put('/api/products/:id', async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(p);
});

app.delete('/api/products/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// scanning endpoint (ESP / simulator posts here)
app.post('/api/scan', async (req, res) => {
  const { deviceId, rfid } = req.body;
  if (!deviceId || !rfid) return res.status(400).json({ error: 'missing' });

  const product = await Product.findOne({ rfidTag: rfid.trim() });
  if (!product) return res.json({ ok: false, message: 'unknown' });

  let cart = await Cart.findOne({ deviceId, status: 'open' });
  if (!cart) cart = new Cart({ deviceId, items: [], total: 0 });

  const existing = cart.items.find(it => it.productId.equals(product._id));
  if (existing) existing.qty += 1;
  else cart.items.push({ productId: product._id, name: product.name, price: product.price, qty: 1 });

  cart.total = cart.items.reduce((s, it) => s + it.qty * it.price, 0);
  await cart.save();

  io.to(deviceId).emit('cart:update', { deviceId, cart });
  res.json({ ok: true, cart });
});

app.post('/api/checkout/:deviceId', async (req, res) => {
  const cart = await Cart.findOne({ deviceId: req.params.deviceId, status: 'open' });
  if (!cart) return res.status(404).json({ error: 'no cart' });
  cart.status = 'paid';
  await cart.save();
  io.to(cart.deviceId).emit('cart:checkedout', { deviceId: cart.deviceId, cart });
  res.json({ ok: true, cart });
});

io.on('connection', socket => {
  socket.on('join', deviceId => socket.join(deviceId));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('API listening', PORT));
