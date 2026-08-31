import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Copy, Shield, AlertCircle } from 'lucide-react';

export default function SaveTeamModal({
  isOpen,
  onClose,
  onSave,
  currentTeam, // { id, name, ... } if an existing saved team is loaded
}) {
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTeamName(currentTeam?.name || '');
      setError('');
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 60);
    }
  }, [isOpen, currentTeam]);

  if (!isOpen) return null;

  const handleSaveExisting = (e) => {
    e.preventDefault();
    const trimmed = teamName.trim();
    if (!trimmed) {
      setError('Inserisci un nome per la squadra');
      return;
    }
    onSave({
      id: currentTeam?.id,
      name: trimmed,
    });
    onClose();
  };

  const handleSaveAsNew = (e) => {
    e.preventDefault();
    const trimmed = teamName.trim();
    if (!trimmed) {
      setError('Inserisci un nome per la squadra');
      return;
    }
    onSave({
      id: null, // Forces creation of a new ID
      name: trimmed === currentTeam?.name ? `${trimmed} (Copia)` : trimmed,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/90 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Shield size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {currentTeam?.id ? 'Modifica / Salva Squadra' : 'Salva Nuova Squadra'}
              </h3>
              <p className="text-xs text-slate-400">
                Inserisci un nome per ritrovarla nel menu a tendina
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSaveExisting} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
              Nome Squadra
            </label>
            <input
              ref={inputRef}
              type="text"
              value={teamName}
              onChange={(e) => {
                setTeamName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Es. Raimon All-Stars, Dark Emperors..."
              maxLength={40}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-medium text-sm transition-all"
            />
            {error && (
              <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                <AlertCircle size={13} />
                <span>{error}</span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex flex-col gap-2">
            {currentTeam?.id ? (
              <>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
                >
                  <Save size={16} />
                  <span>Aggiorna "{currentTeam.name}"</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAsNew}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
                >
                  <Copy size={15} />
                  <span>Salva come nuova squadra</span>
                </button>
              </>
            ) : (
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
              >
                <Save size={16} />
                <span>Salva Squadra</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
