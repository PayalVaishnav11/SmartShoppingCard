// src/components/CartPanel.jsx
import React, { useState } from "react";
import api from "../api/api"; // keep your existing axios instance;
import { Check, X, ShoppingCart } from "lucide-react";

export default function CartPanel({ cart, deviceId, onCheckout }) {
  const [showQr, setShowQr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null); // { type: 'success'|'error', text }

  const items = cart?.items || [];
  const total = cart?.total ?? 0;

  function handlePayClick() {
    setStatusMsg(null);
    setShowQr(true);
  }

  async function tryPost(url) {
    try {
      return await api.post(url);
    } catch (e) {
      // rethrow so caller can attempt fallback
      throw e;
    }
  }

  async function doCheckoutWithFallback(devId) {
    // try parent first (preferred). If not available, fallback to backend endpoints.
    if (typeof onCheckout === "function") {
      // parent function might accept device override - await it
      return await onCheckout(devId);
    }

    // fallback: try both endpoint shapes
    if (!devId) throw new Error("No device id provided");
    try {
      return await tryPost(`/api/checkout/${devId}`);
    } catch (err) {
      // fallback to older route if present
      return await tryPost(`/checkout/${devId}`);
    }
  }

  async function handleQrDone() {
    // Called when user presses "Done" after scanning the dummy QR.
    setStatusMsg(null);

    if (!deviceId) {
      setStatusMsg({ type: "error", text: "No device selected. Please select a device before checkout." });
      return;
    }

    setLoading(true);
    try {
      const res = await doCheckoutWithFallback(deviceId);

      // Accept several shapes of success return:
      // - parent may return nothing (and emit via socket)
      // - parent/backend may return response.data with ok/cart
      // Handle gracefully:
      const ok = (res && (res.ok === true || res.data?.ok === true)) || (res && res.status >= 200 && res.status < 300);

      if (ok) {
        setStatusMsg({ type: "success", text: "Checkout completed successfully." });
      } else {
        // try to read message
        const msg = res?.data?.message || res?.data?.error || "Checkout returned non-OK response.";
        setStatusMsg({ type: "success", text: `Checkout result: ${msg}` });
      }

      // close modal (optimistic). UI will be updated via socket / parent.
      setShowQr(false);
    } catch (err) {
      console.error("Checkout failed:", err);
      // extract error message
      const text = err?.response?.data?.error || err?.message || "Unknown error during checkout.";
      setStatusMsg({ type: "error", text: `Checkout failed — ${text}` });
      // keep modal open so user can retry or cancel
    } finally {
      setLoading(false);
    }
  }

  function handleQrCancel() {
    setStatusMsg(null);
    setShowQr(false);
  }

  return (
    <div className="w-full max-w-none shadow-lg">
      <div className="card p-4 shadow rounded">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-3xl font-semibold">Cart</h3>
          </div>
          {/* <div className="text-sm text-slate-500">Device: <span className="font-medium text-slate-700">{deviceId ?? "—"}</span></div> */}
        </div>

        {/* optional inline status message */}
        {statusMsg && (
          <div
            role="status"
            className={`mb-3 px-3 py-2 rounded text-sm ${statusMsg.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
          >
            {statusMsg.text}
          </div>
        )}

        {/* items table (compact row layout) */}
        <div className="text-sm text-slate-600">
          <div className="grid grid-cols-12 gap-4 items-center font-medium pb-2 border-b">
            <div className="col-span-6 font-bold text-2xl">Item</div>
            <div className="col-span-2 text-right font-bold text-2xl">Price</div>
            <div className="col-span-2 text-center font-bold text-2xl">Qty</div>
            <div className="col-span-2 text-right font-bold text-2xl">Line Total</div>
          </div>

          {(items.length === 0) ? (
            <div className="py-6 text-slate-500">No items yet — scan a product to add it.</div>
          ) : (
            items.map((it) => (
              <div
                key={it.productId || it.rfid || `${it.name}-${Math.random()}`}
                className="grid grid-cols-12 gap-4 items-center py-3 border-b last:border-b-0"
              >
                <div className="col-span-6 text-slate-800">{it.name}</div>
                <div className="col-span-2 text-right text-slate-700">₹{it.price}</div>
                <div className="col-span-2 text-center text-slate-700">{it.qty}</div>
                <div className="col-span-2 text-right font-medium">₹{(it.qty * it.price).toFixed(0)}</div>
              </div>
            ))
          )}

          <div className="pt-4 ">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Total</div>
              <div className="text-xl font-bold">₹{total}</div>
            </div>

            <button
              className=" mt-4 w-32 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 disabled:opacity-50 inline-flex items-center justify-center gap-2"
              onClick={handlePayClick}
              disabled={items.length === 0 || loading}
              aria-disabled={items.length === 0 || loading}
            >
              {loading ? "Processing..." : <>
                <Check className="w-4 h-4" /> Pay
              </>}
            </button>
          </div>
        </div>
      </div>

      {/* QR + large-cart Modal (modal now shows the cart bigger and centered) */}
      {showQr && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-dialog-title"
        >
          <div className="bg-white rounded-lg max-w-5xl w-full p-6 shadow-lg relative">
            <button
              className="absolute top-4 right-4 text-slate-600"
              onClick={handleQrCancel}
              aria-label="Close"
            >✕</button>

            <div className="grid grid-cols-3 gap-6">
              {/* Left: big cart table, takes 2/3 width */}
              <div className="col-span-2">
                <h3 id="qr-dialog-title" className="text-xl font-semibold mb-2">Items in your trolley</h3>
                <p className="text-sm text-slate-500 mb-4">Verify items and total, then scan the QR to pay.</p>

                <div className="border rounded p-4">
                  <div className="grid grid-cols-12 gap-4 items-center font-medium pb-2 border-b mb-2">
                    <div className="col-span-5 text-slate-600">Item</div>
                    <div className="col-span-2 text-right text-slate-600">Price</div>
                    <div className="col-span-2 text-center text-slate-600">Qty</div>
                    <div className="col-span-3 text-right text-slate-600">Line Total</div>
                  </div>

                  {items.map((it) => (
                    <div key={it.productId || it.rfid || `${it.name}-${Math.random()}`} className="grid grid-cols-12 gap-4 items-center py-3 border-b last:border-b-0">
                      <div className="col-span-5 text-slate-800">{it.name}</div>
                      <div className="col-span-2 text-right">₹{it.price}</div>
                      <div className="col-span-2 text-center">{it.qty}</div>
                      <div className="col-span-3 text-right">₹{(it.qty * it.price).toFixed(0)}</div>
                    </div>
                  ))}

                  <div className="pt-4 flex justify-end">
                    <div className="text-right">
                      <div className="text-sm">Total</div>
                      <div className="text-2xl font-bold">₹{total}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: QR area */}
              <div className="col-span-1 flex flex-col items-center">
                <h3 className="text-xl font-semibold mb-2">Scan to pay</h3>
                <p className="text-sm text-slate-500 mb-6 text-center">Use any payment app to scan this QR. Demo only.</p>

                <div className="w-64 h-64 bg-slate-100 border rounded flex items-center justify-center text-6xl text-slate-300 mb-6">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="" />
                </div>

                <div className="w-full flex justify-between gap-3">
                  <button
                    className="px-4 py-2 border rounded w-1/2"
                    onClick={handleQrCancel}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded w-1/2 disabled:opacity-60 inline-flex items-center justify-center gap-2"
                    onClick={handleQrDone}
                    disabled={loading || !deviceId}
                    title={!deviceId ? "Select a device before finishing checkout" : ""}
                  >
                    {loading ? "Finishing..." : <><Check className="w-4 h-4" /> Done</>}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
