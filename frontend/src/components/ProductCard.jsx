// src/components/ProductCard.jsx
import React,{useState} from 'react';

export default function ProductCard({ p }) {

  return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden transform hover:-translate-y-1 transition p-3">
      <div className="h-40 w-full bg-slate-100 rounded overflow-hidden flex items-center justify-center">
      </div>

      <div className="mt-3">
        <div className="font-semibold text-lg">{p?.name}</div>
        <div className="text-slate-600 mt-1">₹{p?.price ?? 0}</div>
        <div className="text-xs text-slate-500 mt-1">{p?.rfidTag ? 'RFID linked' : 'No RFID'}</div>
      </div>
    </div>
  );
}
