// src/App.jsx
import React, { useEffect, useState, useRef } from 'react';
import api, { SERVER } from './api/api';
import { io } from 'socket.io-client';
import { Toaster, toast } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import CustomerView from './CustomerView';
import AdminProductForm from './components/AdminProductForm';
import AdminProductList from './components/AdminProductList';
import StoreNavigator from './components/StoreNavigator';
import { ShoppingCart, Settings, Map, Sparkles } from 'lucide-react';

const ENV_DEVICE = import.meta.env.VITE_DEVICE_ID || 'cart-esp-01';
const ENABLE_SIM = (import.meta.env.VITE_ENABLE_DEV_SIM === 'true');

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(null);
  const [viewMode, setViewMode] = useState('customer');
  const [connected, setConnected] = useState(false);

  const deviceIdRef = useRef(ENV_DEVICE);
  const [selectedDevice, setSelectedDevice] = useState(deviceIdRef.current);
  const socketRef = useRef(null);

  useEffect(() => {
    loadProducts();

    socketRef.current = io(SERVER, { autoConnect: false });
    socketRef.current.connect();

    socketRef.current.on('connect', () => setConnected(true));
    socketRef.current.on('disconnect', () => setConnected(false));

    socketRef.current.emit('join', deviceIdRef.current);

    socketRef.current.on('cart:update', (data) => {
      if (data.deviceId === deviceIdRef.current) {
        setCart(data.cart);
        const items = data.cart?.items || [];
        if (items.length > 0) {
          const lastItem = items[items.length - 1];
          toast.success(`${lastItem.name} added to cart!`, {
            icon: '🛒',
            style: {
              background: '#ffffff',
              color: '#1e293b',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              borderRadius: '16px',
            },
          });
        }
      }
    });

    socketRef.current.on('cart:checkedout', (data) => {
      if (data.deviceId === deviceIdRef.current) {
        setCart(null);
        toast.success('Checkout complete! Thank you!', {
          icon: '✅',
          style: {
            background: '#ffffff',
            color: '#1e293b',
            border: '1px solid #10b981',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.2)',
            borderRadius: '16px',
          },
        });
      }
    });

    return () => socketRef.current?.disconnect();
  }, []);

  async function loadProducts() {
    try {
      const res = await api.get('/api/products');
      const products = res.data?.products ?? res.data;
      setProducts(products || []);
    } catch (e) {
      console.error(e);
    }
  }

  const simulateScan = async (rfid) => {
    if (!ENABLE_SIM) return;
    const id = selectedDevice || deviceIdRef.current;
    await api.post('/api/scan', { deviceId: id, rfid });
  };

  const onProductSaved = (p) => {
    if (!p) return;
    setProducts(prev => [p, ...prev]);
    toast.success('Product saved successfully!', {
      style: { 
        background: '#ffffff', 
        color: '#1e293b', 
        border: '1px solid #6366f1',
        boxShadow: '0 10px 25px rgba(99, 102, 241, 0.2)',
        borderRadius: '16px',
      },
    });
  };
  const onProductDeleted = (id) => {
    setProducts(prev => prev.filter(x => x._id !== id));
    toast.success('Product deleted', {
      style: { 
        background: '#ffffff', 
        color: '#1e293b', 
        border: '1px solid #ef4444',
        boxShadow: '0 10px 25px rgba(239, 68, 68, 0.2)',
        borderRadius: '16px',
      },
    });
  };
  const onProductUpdated = (u) => {
    setProducts(prev => prev.map(p => p._id === u._id ? u : p));
    toast.success('Product updated', {
      style: { 
        background: '#ffffff', 
        color: '#1e293b', 
        border: '1px solid #10b981',
        boxShadow: '0 10px 25px rgba(16, 185, 129, 0.2)',
        borderRadius: '16px',
      },
    });
  };

  const checkout = async (deviceOverride) => {
    const deviceToUse = deviceOverride ?? (selectedDevice?.id ?? selectedDevice) ?? deviceIdRef.current;
    if (!deviceToUse) {
      toast.error("No device selected for checkout.");
      return;
    }

    try {
      await api.post(`/api/checkout/${deviceToUse}`);
      setCart(null);
    } catch (e) {
      console.error("Checkout failed:", e);
      toast.error('Checkout failed. See console for details.');
    }
  };

  const handleDeviceChange = (newDeviceId) => {
    setSelectedDevice(newDeviceId);
    deviceIdRef.current = newDeviceId;
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('join', deviceIdRef.current);
    }
    setCart(null);
  };

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Animated mesh background */}
      <div className="mesh-bg">
        <div className="accent-blob" />
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '16px', padding: '14px 18px' },
        }}
      />

      <div className="relative z-10 flex flex-col flex-1 min-h-0 w-full">
        {/* Header - Full width navbar */}
        <header className="w-full bg-slate-800 border-b-2 border-slate-700 shrink-0">
          <div className="flex items-center justify-between px-12 lg:px-24 py-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Smart Shopping Cart</h1>
              <p className="text-sm text-slate-400">Seamless checkout experience</p>
            </div>
            
            {/* Tab Switcher - Proper buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('customer')}
                className={`px-6 py-3 text-base font-semibold transition-all duration-300 flex items-center gap-3 ${
                  viewMode === 'customer'
                    ? 'bg-emerald-500 text-white border-2 border-emerald-400'
                    : 'bg-slate-700 text-slate-300 border-2 border-slate-600 hover:bg-slate-600'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                Customer
              </button>
              <button
                onClick={() => setViewMode('storeMap')}
                className={`px-6 py-3 text-base font-semibold transition-all duration-300 flex items-center gap-3 ${
                  viewMode === 'storeMap'
                    ? 'bg-cyan-500 text-white border-2 border-cyan-400'
                    : 'bg-slate-700 text-slate-300 border-2 border-slate-600 hover:bg-slate-600'
                }`}
              >
                <Map className="w-5 h-5" />
                Store Map
              </button>
              <button
                onClick={() => setViewMode('admin')}
                className={`px-6 py-3 text-base font-semibold transition-all duration-300 flex items-center gap-3 ${
                  viewMode === 'admin'
                    ? 'bg-indigo-500 text-white border-2 border-indigo-400'
                    : 'bg-slate-700 text-slate-300 border-2 border-slate-600 hover:bg-slate-600'
                }`}
              >
                <Settings className="w-5 h-5" />
                Admin
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {viewMode === 'customer' ? (
            <motion.div
              key="customer"
              className="flex flex-col flex-1 min-h-0 w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CustomerView
                products={products}
                cart={cart}
                onCheckout={checkout}
                deviceId={selectedDevice ?? deviceIdRef.current}
                setSelectedDevice={setSelectedDevice}
                simulateScan={simulateScan}
                enableSim={ENABLE_SIM}
                onDeviceChange={handleDeviceChange}
              />
            </motion.div>
          ) : null}
          {viewMode === 'admin' ? (
            <motion.div
              key="admin"
              className="flex-1 overflow-y-auto w-full flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-full flex-1 flex flex-col ">
                <AdminProductForm onSaved={onProductSaved} />
                <AdminProductList products={products} onDeleted={onProductDeleted} onUpdated={onProductUpdated} />
              </div>
            </motion.div>
          ) : null}
          {viewMode === 'storeMap' ? (
            <motion.div
              key="storeMap"
              className="flex-1 w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StoreNavigator onBack={() => setViewMode('customer')} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}