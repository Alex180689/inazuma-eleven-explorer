import React, { useRef } from 'react';
import { Zap, Upload, RotateCcw, Info, Sparkles, Shield, Trophy } from 'lucide-react';

export default function Navbar({
  playersCount = 495,
  onResetToDefault,
  onUploadCSV,
  onOpenShortcuts,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result;
        if (text) {
          onUploadCSV(text);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="relative z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black shadow-lg shadow-amber-500/25">
            <Zap size={22} className="fill-slate-950" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black font-display tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400">
                INAZUMA ELEVEN
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                IE1 DB
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Player Explorer & Head-to-Head Comparison Engine
            </p>
          </div>
        </div>

        {/* Action Controls & Stats Counter */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Players Count Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
            <Trophy size={13} className="text-amber-400" />
            <span>
              <strong className="text-white font-bold">{playersCount}</strong> Giocatori
            </span>
          </div>

          {/* Hidden File Input for CSV */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />

          {/* Upload Custom CSV Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
            title="Carica un file CSV personalizzato"
          >
            <Upload size={13} className="text-amber-400" />
            <span className="hidden sm:inline">Carica CSV</span>
          </button>

          {/* Reset button */}
          <button
            onClick={onResetToDefault}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-400 hover:text-white transition-all"
            title="Reimposta confronto predefinito (Mark vs Joe King)"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
}
