// src/components/FullScreenQRModal.jsx
import React from "react";

export default function FullScreenQRModal({ open = false, amount = 0, onClose, onDone }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-2xl mx-4 md:mx-0 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold">Scan to pay</h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 rounded-md p-1"
            >✕</button>
          </div>

          <p className="text-sm text-slate-500 mt-2">Use any payment app to scan this QR. This is a placeholder/dummy QR.</p>

          <div className="my-8 flex justify-center">
            <div className="bg-slate-200 w-64 h-64 md:w-72 md:h-72 rounded-md flex items-center justify-center text-6xl text-slate-400 font-bold">
              QR
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Amount</div>
              <div className="text-lg font-semibold">₹{amount}</div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md border border-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={onDone}
                className="px-5 py-2 bg-green-600 text-white rounded-md font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
