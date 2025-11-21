// src/App.jsx  (edited parts only)
import React, { useEffect, useState, useRef } from 'react';
import api, { SERVER } from './api/api';
import { io } from 'socket.io-client';
import CustomerView from './CustomerView';
import AdminProductForm from './components/AdminProductForm';
import AdminProductList from './components/AdminProductList';

const ENV_DEVICE = import.meta.env.VITE_DEVICE_ID || 'cart-esp-01';
const ENABLE_SIM = (import.meta.env.VITE_ENABLE_DEV_SIM === 'true');

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(null);
  const [viewMode, setViewMode] = useState('customer'); // 'customer' or 'admin'

  // deviceIdRef holds the device that sockets use (default from env)
  const deviceIdRef = useRef(ENV_DEVICE);
  const [selectedDevice, setSelectedDevice] = useState(deviceIdRef.current);
  const socketRef = useRef(null);

  useEffect(() => {
    loadProducts();

    // socket
    // connect and join the default device
    socketRef.current = io(SERVER, { autoConnect: false });
    socketRef.current.connect();

    // ensure we join the current device
    socketRef.current.emit('join', deviceIdRef.current);

    socketRef.current.on('cart:update', (data) => {
      if (data.deviceId === deviceIdRef.current) setCart(data.cart);
    });
    socketRef.current.on('cart:checkedout', (data) => {
      if (data.deviceId === deviceIdRef.current) setCart(data.cart);
    });

    return () => socketRef.current?.disconnect();
  }, []);

  async function loadProducts() {
    try {
      const res = await api.get('/api/products');
      console.log('Products loaded:', res.data);
      const products = res.data?.products ?? res.data;
      setProducts(products || []);
    } catch (e) {
      console.error(e);
      // handle gracefully
    }
  }

  // developer-only sim (hidden in prod)
  const simulateScan = async (rfid) => {
    if (!ENABLE_SIM) return;
    // use selectedDevice if set, else fallback to deviceIdRef.current
    const id = selectedDevice || deviceIdRef.current;
    await api.post('/api/scan', { deviceId: id, rfid });
  };

  const onProductSaved = (p) => {
  if (!p) return;
  setProducts(prev => [p, ...prev]);
};
  const onProductDeleted = (id) => setProducts(prev => prev.filter(x => x._id !== id));
  const onProductUpdated = (u) => setProducts(prev => prev.map(p => p._id === u._id ? u : p));

  // --------------- CHANGE: use selectedDevice || fallback to deviceIdRef.current --------------
  const checkout = async (deviceOverride) => {
  // prefer explicit deviceOverride, then selectedDevice, then fallback to deviceIdRef
  const deviceToUse = deviceOverride ?? (selectedDevice?.id ?? selectedDevice) ?? deviceIdRef.current;
  if (!deviceToUse) {
    alert("No device selected for checkout.");
    return;
  }

  try {
    // try the API route your backend exposes. I see your backend has /api/checkout/:deviceId
    await api.post(`/api/checkout/${deviceToUse}`);
    // server will emit cart:checkedout — UI should receive it via socket
    // additionally clear local cart optimistically for immediate UX:
    setCart(null);
    alert('Checkout complete (simulated).');
  } catch (e) {
    console.error("Checkout failed:", e);
    alert('Checkout failed. See console for details.');
  }
};

  // optional helper when user changes the device dropdown in the UI:
  // call this from the dropdown's onChange with the new device ID
  const handleDeviceChange = (newDeviceId) => {
    setSelectedDevice(newDeviceId);
    deviceIdRef.current = newDeviceId;

    // tell socket to listen for the new device's room
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('join', deviceIdRef.current);
    }

    // optionally, clear cart or reload cart for that device
    setCart(null);
    // you may want to fetch the cart for that device here:
    // api.get(`/api/cart/${deviceIdRef.current}`).then(r => setCart(r.data));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Smart Shopping Card</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => setViewMode('customer')}
                    className={`px-3 py-2 rounded ${viewMode==='customer' ? 'bg-green-600 text-white':'border'}`}>
              Customer
            </button>
            <button onClick={() => setViewMode('admin')}
                    className={`px-3 py-2 rounded ${viewMode==='admin' ? 'bg-green-600 text-white':'border'}`}>
              Admin
            </button>
          </div>
        </header>

        {viewMode === 'customer' ? (
          <CustomerView
            products={products}
            cart={cart}
            onCheckout={checkout}
            // pass device id as selectedDevice fallback to the default env device
            deviceId={selectedDevice ?? deviceIdRef.current }
            setSelectedDevice={setSelectedDevice}      
            simulateScan={simulateScan}
            enableSim={ENABLE_SIM}
            // also pass the device-change handler to the customer view / device dropdown
            onDeviceChange={handleDeviceChange}
          />
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-4">Admin — Add Product</h2>
            <AdminProductForm onSaved={onProductSaved} />
            <div className="mt-6">
              <AdminProductList products={products} onDeleted={onProductDeleted} onUpdated={onProductUpdated} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
