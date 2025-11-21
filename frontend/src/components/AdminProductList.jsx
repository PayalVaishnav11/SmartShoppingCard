import React from 'react';
import api from '../api/api';

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
    <div className="mt-4 bg-white p-3 rounded">
      <h4 className="font-semibold mb-2">Products (Admin)</h4>
      <ul className="space-y-2">
        {products.map(p => (
          <li key={p._id} className="flex justify-between items-center border-b pb-2">
            <div>
              <div className="font-medium">{p.name} <span className="text-xs text-slate-500">₹{p.price}</span></div>
              <div className="text-xs text-slate-500">{p.rfidTag ? `RFID: ${p.rfidTag}` : 'No RFID'}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>toggleRFID(p)} className="px-2 py-1 border rounded">Set RFID</button>
              <button onClick={()=>del(p._id)} className="px-2 py-1 border rounded text-red-600">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
