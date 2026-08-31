import React from 'react';
import { Zap } from 'lucide-react';

export default function MoveCard({ moveName, slotIndex, playerElement }) {
  if (!moveName) {
    return (
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-slate-500 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-5 h-5 rounded-md flex items-center justify-center bg-slate-900 text-slate-600 font-mono text-[10px] font-bold shrink-0">
            {slotIndex + 1}
          </span>
          <span className="italic">Nessuna Tecnica</span>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-all duration-200 shadow-sm">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Slot Number Badge */}
        <span className="w-5 h-5 rounded-md flex items-center justify-center bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-300 font-mono text-[11px] font-extrabold shrink-0 transition-colors">
          {slotIndex + 1}
        </span>

        {/* Move Name */}
        <span className="font-semibold text-xs sm:text-sm text-slate-100 group-hover:text-white truncate" title={moveName}>
          {moveName}
        </span>
      </div>

      <Zap size={12} className="text-slate-600 group-hover:text-amber-400 shrink-0 ml-2 transition-colors" />
    </div>
  );
}
