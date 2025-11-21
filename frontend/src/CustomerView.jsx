// src/CustomerView.jsx (minimal)
import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import CartPanel from './components/CartPanel';

const SERVER = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CustomerView(
  {
  cart = null,
  deviceId,            // passed from App (selectedDevice or default)
  onCheckout,          // passed from App (checkout function)
}
) {
  const socketRef = useRef(null)


  useEffect(() => {
    const socket = io(SERVER);
    socketRef.current = socket;
    socket.emit('join', deviceId);

    socket.on('cart:update', (data) => {
      if (data?.deviceId === deviceId) setCart(data.cart);
    });

    socket.on('cart:checkedout', (data) => {
      if (data?.deviceId === deviceId) setCart(null);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          
            <p className="text-slate-600 mt-1 text-center m-auto">
              Scan items to add them to your cart.
            </p>
      
          {/* Optional: small device selector if you want to let user change device */}
          {/* {typeof setSelectedDevice === 'function' && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Device:</label>
              <select
                value={deviceId || ''}
                onChange={(e) => {
                  const newId = e.target.value || null;
                  if (onDeviceChange) onDeviceChange(newId);
                  if (setSelectedDevice) setSelectedDevice(newId);
                }}
                className="border rounded px-2 py-1"
              >
                <option value={deviceId ?? ''}>{deviceId ?? 'default-device'}</option>
              </select>
            </div>
          )} */}

          
        </header>

        <main className="grid grid-cols-1 gap-8">
          <div className="max-w-6xl mx-auto w-full">
              <div className="md:col-span-1">
                <CartPanel
                  cart={cart}
                  deviceId={deviceId}
                  onCheckout={onCheckout}
                />
              </div>
            </div>
        </main>
      </div>
    </div>
  );
}
