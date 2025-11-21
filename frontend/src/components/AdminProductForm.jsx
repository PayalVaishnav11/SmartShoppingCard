import React, { useState } from 'react';
import api from '../api/api';

export default function AdminProductForm({ onSaved }) {
   const [form, setForm] = useState({ name:'', price:0, rfidTag:'', desc:'' });
  const [loading, setLoading] = useState(false);

   const save = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/products', form);
      onSaved?.(res.data);
      setForm({ name:'', price:0, rfidTag:'', desc:'' });
    } catch (err) {
      console.error(err);
      alert('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
         <form onSubmit={save} className="grid grid-cols-2 gap-3 bg-white p-4 rounded">
      <input required placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="p-2 border rounded col-span-2"/>
      <input required type="number" placeholder="Price" value={form.price} onChange={e=>setForm({...form,price:Number(e.target.value)})} className="p-2 border rounded"/>
      <input placeholder="RFID Tag (optional)" value={form.rfidTag} onChange={e=>setForm({...form,rfidTag:e.target.value})} className="p-2 border rounded"/>
      <textarea placeholder="Description" value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} className="p-2 border rounded col-span-2"/>
      <div className="col-span-2 flex justify-end">
        <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">{loading?'Saving...':'Save Product'}</button>
      </div>
    </form>
  );
}
