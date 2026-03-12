// src/components/ProductCard.jsx
import React from 'react';
import { Package, Tag, IndianRupee } from 'lucide-react';

export default function ProductCard({ p }) {
  return (
    <div className="card-3d p-4 transition-all duration-300 hover:scale-[1.02]">
      <div className="h-40 w-full rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden flex items-center justify-center">
        <Package className="w-16 h-16 text-slate-400" />
      </div>

      <div className="mt-4">
        <div className="font-semibold text-lg text-slate-800">{p?.name}</div>
        <div className="flex items-center gap-1 text-emerald-600 mt-2 font-bold">
          <IndianRupee className="w-4 h-4" />
          {p?.price ?? 0}
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
          <Tag className="w-3 h-3" />
          {p?.rfidTag ? 'RFID linked' : 'No RFID'}
        </div>
      </div>
    </div>
  );
}
