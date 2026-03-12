import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/api';
import { Loader2, Plus, Package, Tag, IndianRupee, FileText } from 'lucide-react';

export default function AdminProductForm({ onSaved }) {
  const [form, setForm] = useState({ name: '', price: 0, rfidTag: '', desc: '' });
  const [loading, setLoading] = useState(false);

  const save = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/products', form);
      onSaved?.(res.data);
      setForm({ name: '', price: 0, rfidTag: '', desc: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="w-full"
    >
      <div className="bg-white border-b-2 border-slate-200 shadow-sm">
        {/* Header - Centered */}
        <div className="py-5 border-b border-slate-100">
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-800">Add New Product</h3>
            <p className="text-sm text-slate-500">Fill in the product details below</p>
          </div>
        </div>

        <form onSubmit={save} className="mx-8 lg:mx-16 py-6">
          {/* Row 1: Name and Price */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <div className="lg:col-span-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <Package className="w-4 h-4 text-indigo-500" />
                Product Name
              </label>
              <input
                required
                placeholder="Enter product name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-5 py-4 text-lg border-2 border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <IndianRupee className="w-4 h-4 text-emerald-500" />
                Price (₹)
              </label>
              <input
                required
                type="number"
                placeholder="0"
                value={form.price}
                onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full px-5 py-4 text-lg border-2 border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Row 2: RFID and Description */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <Tag className="w-4 h-4 text-amber-500" />
                RFID Tag (optional)
              </label>
              <input
                placeholder="Enter RFID tag"
                value={form.rfidTag}
                onChange={e => setForm({ ...form, rfidTag: e.target.value })}
                className="w-full px-5 py-4 text-lg border-2 border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <FileText className="w-4 h-4 text-blue-500" />
                Description
              </label>
              <input
                placeholder="Enter product description"
                value={form.desc}
                onChange={e => setForm({ ...form, desc: e.target.value })}
                className="w-full px-5 py-4 text-lg border-2 border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 text-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold
                hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg
                disabled:opacity-40 disabled:cursor-not-allowed
                flex items-center gap-3"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
              ) : (
                <><Plus className="w-5 h-5" /> Save Product</>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
