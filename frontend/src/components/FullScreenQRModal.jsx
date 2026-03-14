// src/components/FullScreenQRModal.jsx
import React from "react";
import { X, CreditCard, IndianRupee } from "lucide-react";

export default function FullScreenQRModal({ open = false, amount = 0, onClose, onDone }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="card-3d w-full max-w-2xl mx-4 md:mx-0 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Scan to Pay</h2>
                <p className="text-sm text-slate-500">Use any UPI app</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl btn-3d flex items-center justify-center text-slate-500 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="my-8 flex justify-center">
            <div className="card-3d w-64 h-64 md:w-72 md:h-72 p-4 flex items-center justify-center">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
                alt="Payment QR"
                className="w-full h-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Amount</span>
              <span className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-600 text-xl font-bold border border-emerald-100">
                <IndianRupee className="w-5 h-5" />
                {amount}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-3 rounded-xl btn-3d text-slate-600 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={onDone}
                className="px-6 py-3 btn-success-3d rounded-xl font-semibold"
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