import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import { Trash2, Tag, Package, IndianRupee, LayoutList } from 'lucide-react';

export default function AdminProductList({ products, onDeleted, onUpdated }) {
  const del = async (id) => {
    if (!confirm('Delete product?')) return;
    await api.delete(`/api/products/${id}`);
    onDeleted?.(id);
  };

  const toggleRFID = async (p) => {
    const newRFID = prompt('Enter RFID tag (blank to remove)', p.rfidTag || '');
    if (newRFID === null) return;
    const updated = { ...p, rfidTag: newRFID || undefined };
    const res = await api.put(`/api/products/${p._id}`, updated);
    onUpdated?.(res.data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full flex-1 flex flex-col bg-white"
    >
      {/* Header */}
      <div className="mx-8 lg:mx-16 py-5 border-b-2 border-slate-200 flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
          <LayoutList className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Product Inventory</h3>
          <p className="text-sm text-slate-500">{products.length} products in database</p>
        </div>
      </div>

      {/* Products List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {products.map((p, idx) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10, height: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="mx-8 lg:mx-16 py-5 flex items-center justify-between border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <div className="min-w-0 flex-1 flex items-center gap-5">
                <div className="w-16 h-16 bg-slate-100 flex items-center justify-center">
                  <Package className="w-8 h-8 text-slate-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-1">
                    <span className="text-xl text-slate-800 font-semibold">{p.name}</span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 text-base font-bold">
                      <IndianRupee className="w-4 h-4" />
                      {p.price}
                    </span>
                  </div>
                  <div className="text-base text-slate-500 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    RFID: {p.rfidTag || '—'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-6">
                <button
                  onClick={() => toggleRFID(p)}
                  className="px-5 py-3 text-cyan-600 text-base font-medium hover:bg-cyan-50 transition-all flex items-center gap-2 border-2 border-cyan-300"
                >
                  <Tag className="w-5 h-5" />
                  Set RFID
                </button>
                <button
                  onClick={() => del(p._id)}
                  className="px-5 py-3 text-red-500 text-base font-medium hover:bg-red-50 transition-all flex items-center gap-2 border-2 border-red-300"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {products.length === 0 && (
          <div className="mx-8 lg:mx-16 py-20 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-100 flex items-center justify-center mb-5">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-700 text-xl font-medium">No products yet</p>
            <p className="text-slate-500 text-base mt-2">Add your first product using the form above</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
