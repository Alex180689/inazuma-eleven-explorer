import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Dices, Flame, Search, ChevronDown, Scale, SlidersHorizontal } from 'lucide-react';
import { ELEMENTS } from '../constants/elements';
import { PRESET_MATCHUPS, calculateOverall } from '../utils/statsUtils';
import ElementBadge from './ElementBadge';
import PositionBadge from './PositionBadge';
import PlayerAvatar from './PlayerAvatar';

export default function DualSearchSelector({
  player1,
  player2,
  onOpenSearchP1,
  onOpenSearchP2,
  onSwapPlayers,
  onRandomMatchup,
  onSelectPreset,
  isWeighted = true,
  onToggleWeighted,
}) {
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const handleSwap = () => {
    setIsSwapping(true);
    onSwapPlayers();
    setTimeout(() => setIsSwapping(false), 400);
  };

  const p1Ovr = player1 ? calculateOverall(player1, isWeighted) : 0;
  const p2Ovr = player2 ? calculateOverall(player2, isWeighted) : 0;

  return (
    <div className="relative z-30 glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Player 1 Slot (Left) */}
        <div className="lg:col-span-4">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Slot Giocatore 1
            </span>
            {player1 && (
              <span className="text-[11px] font-mono text-slate-400">
                OVR: <strong className="text-amber-300 font-bold">{p1Ovr}</strong>
              </span>
            )}
          </div>

          <div
            onClick={onOpenSearchP1}
            className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 group relative overflow-hidden ${
              player1
                ? 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-700/80 hover:border-amber-500/50 shadow-md'
                : 'bg-slate-900/40 hover:bg-slate-900/70 border-dashed border-slate-700'
            }`}
          >
            {player1 ? (
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <PlayerAvatar player={player1} size="sm" showPosition={false} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors truncate">
                      {player1.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <PositionBadge position={player1.position} size="sm" />
                    <ElementBadge element={player1.element} size="sm" showLabel={false} />
                    <span className="text-[11px] text-slate-400 truncate ml-1">{player1.team}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-slate-400">
                <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-sm">
                  P1
                </div>
                <span className="text-sm font-medium">Seleziona Giocatore 1...</span>
              </div>
            )}

            <div className="px-2.5 py-1.5 rounded-lg bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-300 text-xs font-semibold flex items-center gap-1 shrink-0 transition-all">
              <Search size={13} />
              <span>Scegli</span>
            </div>
          </div>
        </div>

        {/* Center Action Controls (Middle) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center gap-2.5 relative">
          {/* Swap & Random buttons */}
          <div className="flex items-center gap-2 w-full justify-center">
            {/* Swap Button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleSwap}
              disabled={!player1 || !player2}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title="Scambia Giocatore 1 e Giocatore 2"
            >
              <motion.span
                animate={{ rotate: isSwapping ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="inline-flex"
              >
                <ArrowLeftRight size={15} className="text-amber-400" />
              </motion.span>
              <span>Scambia ⇆</span>
            </motion.button>

            {/* Random Rival Button */}
            <button
              onClick={onRandomMatchup}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Dices size={15} />
              <span>Scontro Casuale 🎲</span>
            </button>
          </div>

          {/* Preset Rivalries Menu */}
          <div className="relative w-full max-w-xs">
            <button
              onClick={() => setShowPresetsMenu(!showPresetsMenu)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition-colors shadow-sm"
            >
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold truncate">
                <Flame size={14} />
                <span>Duelli Iconici Storici</span>
              </span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${showPresetsMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Floating Dropdown with high z-index */}
            {showPresetsMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowPresetsMenu(false)}
                />
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/98 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800 max-h-72 overflow-y-auto ring-1 ring-amber-500/30">
                  {PRESET_MATCHUPS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onSelectPreset(preset.p1Name, preset.p2Name);
                        setShowPresetsMenu(false);
                      }}
                      className="w-full text-left p-3 hover:bg-slate-800 transition-colors flex flex-col gap-0.5 group"
                    >
                      <span className="font-bold text-xs text-amber-300 group-hover:text-amber-200">{preset.name}</span>
                      <span className="text-[11px] text-slate-400">{preset.desc}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* OVR Formula Toggle (Role Weighted vs Pure Core Average) */}
          <div className="flex items-center justify-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800 text-[11px] w-full max-w-xs shadow-inner mt-0.5">
            <button
              onClick={() => onToggleWeighted && onToggleWeighted(true)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg font-semibold transition-all ${
                isWeighted
                  ? 'bg-amber-500 text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Calcolo Overall basato sui pesi per ruolo (es. FW privilegia Tiro, DF Difesa)"
            >
              <Scale size={13} />
              <span>Pesate (Ruolo)</span>
            </button>
            <button
              onClick={() => onToggleWeighted && onToggleWeighted(false)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg font-semibold transition-all ${
                !isWeighted
                  ? 'bg-amber-500 text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Calcolo Overall basato sulla media pura di tutti i 7 attributi senza pesi"
            >
              <SlidersHorizontal size={13} />
              <span>Senza Pesi (Pure)</span>
            </button>
          </div>
        </div>

        {/* Player 2 Slot (Right) */}
        <div className="lg:col-span-4">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Slot Giocatore 2
            </span>
            {player2 && (
              <span className="text-[11px] font-mono text-slate-400">
                OVR: <strong className="text-cyan-300 font-bold">{p2Ovr}</strong>
              </span>
            )}
          </div>

          <div
            onClick={onOpenSearchP2}
            className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 group relative overflow-hidden ${
              player2
                ? 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-700/80 hover:border-cyan-500/50 shadow-md'
                : 'bg-slate-900/40 hover:bg-slate-900/70 border-dashed border-slate-700'
            }`}
          >
            {player2 ? (
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <PlayerAvatar player={player2} size="sm" showPosition={false} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors truncate">
                      {player2.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <PositionBadge position={player2.position} size="sm" />
                    <ElementBadge element={player2.element} size="sm" showLabel={false} />
                    <span className="text-[11px] text-slate-400 truncate ml-1">{player2.team}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-slate-400">
                <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-sm">
                  P2
                </div>
                <span className="text-sm font-medium">Seleziona Giocatore 2...</span>
              </div>
            )}

            <div className="px-2.5 py-1.5 rounded-lg bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-300 text-xs font-semibold flex items-center gap-1 shrink-0 transition-all">
              <Search size={13} />
              <span>Scegli</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
