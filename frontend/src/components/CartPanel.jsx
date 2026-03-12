// src/components/CartPanel.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/api";
import { Check, X, ShoppingCart, Loader2, CreditCard, Package, Sparkles } from "lucide-react";

export default function CartPanel({ cart, deviceId, onCheckout }) {
  const [showQr, setShowQr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const items = cart?.items || [];
  const total = cart?.total ?? 0;

  function handlePayClick() {
    setStatusMsg(null);
    setShowQr(true);
  }

  async function doCheckoutWithFallback(devId) {
    if (typeof onCheckout === "function") {
      return await onCheckout(devId);
    }
    if (!devId) throw new Error("No device id provided");
    return await api.post(`/api/checkout/${devId}`);
  }

  async function handleQrDone() {
    setStatusMsg(null);
    if (!deviceId) {
      setStatusMsg({ type: "error", text: "No device selected." });
      return;
    }
    setLoading(true);
    try {
      const res = await doCheckoutWithFallback(deviceId);
      const ok = (res && (res.ok === true || res.data?.ok === true)) || (res && res.status >= 200 && res.status < 300);
      if (ok) {
        setStatusMsg({ type: "success", text: "Checkout completed successfully." });
      }
      setShowQr(false);
    } catch (err) {
      console.error("Checkout failed:", err);
      const text = err?.response?.data?.error || err?.message || "Unknown error during checkout.";
      setStatusMsg({ type: "error", text: `Checkout failed - ${text}` });
    } finally {
      setLoading(false);
    }
  }

  function handleQrCancel() {
    setStatusMsg(null);
    setShowQr(false);
  }

  return (
    <div className="w-full flex-1 flex flex-col bg-white">
      {/* Cart Header */}
      <div className="mx-8 lg:mx-16 py-5 border-b-2 border-slate-200 flex items-center gap-5">
        <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
          <ShoppingCart className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-800">Your Cart</h3>
          <p className="text-base text-slate-500">{items.length} {items.length === 1 ? 'item' : 'items'} in cart</p>
        </div>
      </div>

      {/* Status message */}
      <AnimatePresence>
        {statusMsg && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mx-8 lg:mx-16 overflow-hidden"
          >
            <div
              role="status"
              className={`py-4 mt-4 px-5 text-base flex items-center gap-3 ${
                statusMsg.type === "error"
                  ? "bg-red-50 text-red-600 border-2 border-red-200"
                  : "bg-emerald-50 text-emerald-600 border-2 border-emerald-200"
              }`}
            >
              {statusMsg.type === "error" ? (
                <X className="w-5 h-5" />
              ) : (
                <Check className="w-5 h-5" />
              )}
              {statusMsg.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Header */}
      <div className="mx-8 lg:mx-16 mt-4 py-4 px-6 grid grid-cols-12 gap-4 text-base font-bold text-slate-600 bg-slate-100 border-2 border-slate-200">
        <div className="col-span-5 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Item
        </div>
        <div className="col-span-2 text-right">Price</div>
        <div className="col-span-2 text-center">Qty</div>
        <div className="col-span-3 text-right">Line Total</div>
      </div>

      {/* Cart Items - Full height usage */}
      <div className="flex-1 mx-8 lg:mx-16 overflow-y-auto">
        {items.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-24 h-24 mx-auto mb-5 bg-slate-100 flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-slate-400" />
            </div>
            <p className="text-slate-700 text-xl font-semibold">Your cart is empty</p>
            <p className="text-slate-500 text-base mt-2 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Scan a product to get started
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {items.map((it, idx) => (
              <motion.div
                key={it.productId || `${it.name}-${idx}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="py-5 px-6 grid grid-cols-12 gap-4 items-center border-b-2 border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="col-span-5 flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    <Package className="w-7 h-7 text-indigo-600" />
                  </div>
                  <span className="text-slate-800 text-lg font-semibold">{it.name}</span>
                </div>
                <div className="col-span-2 text-right text-slate-600 text-lg">₹{it.price}</div>
                <div className="col-span-2 text-center">
                  <span className="inline-flex items-center justify-center w-14 h-14 bg-slate-100 border-2 border-slate-200 text-slate-800 text-xl font-bold">
                    {it.qty}
                  </span>
                </div>
                <div className="col-span-3 text-right text-slate-800 font-bold text-xl">₹{(it.qty * it.price).toFixed(0)}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Total + Pay Section - Fixed at bottom */}
      <div className="mx-8 lg:mx-16 py-6 border-t-2 border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-5">
          <span className="text-slate-600 text-xl font-medium">Total Amount</span>
          <span className="text-4xl font-bold text-emerald-600">₹{total}</span>
        </div>
        <button
          className="w-full py-5 text-xl font-bold transition-all duration-300 flex items-center justify-center gap-3
            bg-gradient-to-r from-emerald-500 to-teal-500 text-white
            hover:from-emerald-600 hover:to-teal-600
            border-2 border-emerald-600
            shadow-lg
            disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          onClick={handlePayClick}
          disabled={items.length === 0 || loading}
        >
          {loading ? (
            <><Loader2 className="w-6 h-6 animate-spin" /> Processing...</>
          ) : (
            <><CreditCard className="w-6 h-6" /> Proceed to Pay</>
          )}
        </button>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showQr && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleQrCancel}
            />

            {/* Modal - Sharp corners */}
            <motion.div
              className="relative bg-white max-w-4xl w-full z-10 overflow-hidden border-2 border-slate-200 shadow-2xl"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Close button */}
              <button
                className="absolute top-4 right-4 w-12 h-12 bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-colors z-10"
                onClick={handleQrCancel}
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left - Order details */}
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                      <Package className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800">Order Summary</h3>
                      <p className="text-base text-slate-500">Verify items before payment</p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-slate-200 overflow-hidden">
                    {/* Modal table header */}
                    <div className="px-5 py-4 grid grid-cols-12 gap-3 text-sm font-bold text-slate-600 bg-slate-100 border-b-2 border-slate-200">
                      <div className="col-span-5">Item</div>
                      <div className="col-span-2 text-right">Price</div>
                      <div className="col-span-2 text-center">Qty</div>
                      <div className="col-span-3 text-right">Total</div>
                    </div>

                    <div className="max-h-56 overflow-y-auto">
                      {items.map((it, idx) => (
                        <div
                          key={it.productId || `modal-${it.name}-${idx}`}
                          className="px-5 py-4 grid grid-cols-12 gap-3 items-center border-b border-slate-100 last:border-b-0"
                        >
                          <div className="col-span-5 text-slate-700 text-base font-medium">{it.name}</div>
                          <div className="col-span-2 text-right text-slate-500 text-base">₹{it.price}</div>
                          <div className="col-span-2 text-center text-slate-600 text-base font-semibold">{it.qty}</div>
                          <div className="col-span-3 text-right text-slate-800 font-bold text-base">₹{(it.qty * it.price).toFixed(0)}</div>
                        </div>
                      ))}
                    </div>

                    <div className="px-5 py-5 flex justify-between items-center bg-emerald-50 border-t-2 border-emerald-200">
                      <span className="text-base text-slate-600 font-medium">Total Amount</span>
                      <span className="text-3xl font-bold text-emerald-600">₹{total}</span>
                    </div>
                  </div>
                </div>

                {/* Right - QR Code */}
                <div className="p-8 flex flex-col items-center justify-center border-t-2 md:border-t-0 md:border-l-2 border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
                      <CreditCard className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800">Scan to Pay</h3>
                      <p className="text-base text-slate-500">Use any UPI app</p>
                    </div>
                  </div>

                  <div className="w-48 h-48 bg-white p-4 border-2 border-slate-200 mb-6">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
                      alt="Payment QR"
                      className="w-full h-full"
                    />
                  </div>

                  <div className="w-full flex gap-4">
                    <button
                      className="flex-1 py-4 bg-white border-2 border-slate-300 text-slate-600 hover:text-slate-800 hover:bg-slate-100 text-base font-semibold transition-all"
                      onClick={handleQrCancel}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 border-2 border-emerald-600 text-white text-base font-bold
                        hover:from-emerald-600 hover:to-teal-600
                        disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                      onClick={handleQrDone}
                      disabled={loading || !deviceId}
                    >
                      {loading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Wait...</>
                      ) : (
                        <><Check className="w-5 h-5" /> Done</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
