// src/CustomerView.jsx
import React from 'react';
import { motion } from 'framer-motion';
import CartPanel from './components/CartPanel';
import { Sparkles } from 'lucide-react';

export default function CustomerView({ cart = null, deviceId, onCheckout }) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Decorative Header - Centered */}
      <motion.div
        className="bg-white border-b-2 border-slate-200 py-5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <h2 className="text-2xl font-bold text-slate-800">Ready to Shop</h2>
          <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Scan items to add them to your cart
          </p>
        </div>
      </motion.div>

      {/* Cart Panel - Full width */}
      <motion.div
        className="flex-1 flex flex-col"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <CartPanel cart={cart} deviceId={deviceId} onCheckout={onCheckout} />
      </motion.div>
    </div>
  );
}