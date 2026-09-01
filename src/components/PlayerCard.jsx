import React from 'react';
import { motion } from 'framer-motion';
import { ELEMENTS } from '../constants/elements';
import { POSITIONS } from '../constants/positions';
import { STAT_KEYS, calculateOverall, calculateTotalStats, getPlayerTier } from '../utils/statsUtils';
import ElementBadge from './ElementBadge';
import PositionBadge from './PositionBadge';
import PlayerAvatar from './PlayerAvatar';
import MoveCard from './MoveCard';
import StatBar from './StatBar';
import { User, Trophy, Search, Zap, Sparkles, Heart } from 'lucide-react';

export default function PlayerCard({
  player,
  rivalPlayer,
  playerNumber = 1,
  onOpenSearch,
  playerTheme,
  isWeighted = true,
  showStabEffect = true,
  videoWindowWidth = 340,
}) {
  if (!player) {
    return (
      <div className="glass-panel rounded-2xl p-8 flex flex-col items-center justify-center text-center border-dashed border-slate-700 min-h-[520px]">
        <div className="w-20 h-20 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 mb-4 animate-pulse">
          <User size={36} />
        </div>
        <h3 className="text-xl font-bold text-slate-300 mb-2">Nessun Giocatore Selezionato</h3>
        <p className="text-sm text-slate-400 mb-6 max-w-xs">
          Seleziona il Giocatore {playerNumber} per iniziare il confronto.
        </p>
        <button
          onClick={onOpenSearch}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Search size={16} />
          <span>Scegli Giocatore {playerNumber}</span>
        </button>
      </div>
    );
  }

  const elem = ELEMENTS[player.element] || ELEMENTS.Neutral;
  const ovr = calculateOverall(player, isWeighted);
  const totalStats = calculateTotalStats(player);
  const tier = getPlayerTier(ovr);

  // Rival OVR comparison
  const rivalOvr = rivalPlayer ? calculateOverall(rivalPlayer, isWeighted) : null;
  const isOvrWinner = rivalOvr !== null && ovr > rivalOvr;

  return (
    <div
      className={`relative rounded-2xl glass-card overflow-hidden border transition-all duration-300 flex flex-col justify-between ${elem.cardBorder} ${elem.glowClass}`}
    >
      {/* Background Top Element Ambient Glow */}
      <div
        className="absolute top-0 inset-x-0 h-36 opacity-20 pointer-events-none blur-2xl"
        style={{ background: `radial-gradient(circle, ${elem.color} 0%, transparent 70%)` }}
      />

      <div>
        {/* Header Banner with Team and Player Tag */}
        <div className="relative p-5 pb-4 border-b border-slate-800/80 bg-slate-900/50">
          {/* Team and Role */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-mono font-semibold border border-slate-700 tracking-wider">
              {player.team}
            </span>
            <PositionBadge position={player.position} size="sm" showFullName />
          </div>

          {/* Player Profile Info with Face Sprite */}
          <div className="flex items-start gap-3.5">
            {/* Player Avatar (Sprite + Elemental Glow) */}
            <PlayerAvatar player={player} size="md" showPosition={false} playerTheme={playerTheme} />

            {/* Name & Quick Summary */}
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-white tracking-tight truncate leading-tight" title={player.name}>
                {player.name}
              </h2>
              
              <p className="text-xs text-slate-300 mt-1 font-mono flex items-center gap-1.5">
                <span className="text-slate-400">Totale Statistiche:</span>
                <span className="font-bold text-amber-400 text-sm">{totalStats}</span>
                <span className="text-[10px] text-slate-500">pts</span>
              </p>

              {/* OVR, Tier & Element Badges on a single clean row */}
              <div className="mt-2.5 flex items-center gap-1.5 flex-nowrap">
                <div
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border font-bold text-xs shrink-0 ${
                    isOvrWinner
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                      : 'bg-slate-800/80 text-slate-200 border-slate-700'
                  }`}
                  title="Valutazione complessiva"
                >
                  <Trophy size={12} className={isOvrWinner ? 'text-amber-400' : 'text-slate-400'} />
                  <span className="text-xs font-extrabold font-mono">{ovr}</span>
                </div>

                <div className={`px-1.5 py-0.5 rounded-md border text-[10px] font-mono font-black shrink-0 ${tier.color}`}>
                  TIER {tier.label}
                </div>

                <ElementBadge element={player.element} size="sm" className="shrink-0 px-1.5 py-0.5 text-[10px]" />
              </div>
            </div>
          </div>
        </div>

        {/* Vital Points (PE & PT) */}
        <div className="px-5 py-3 bg-slate-900/60 border-b border-slate-800/80 grid grid-cols-2 gap-2.5">
          {/* PE Meter */}
          <div className="bg-slate-950/70 rounded-xl p-2 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-rose-400 flex items-center gap-1 text-[11px]">
                <Heart size={11} className="fill-rose-500 text-rose-500" /> PE
              </span>
              <span className="font-mono font-bold text-slate-200">{player.stats.fp}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full"
                style={{ width: `${Math.min(100, (player.stats.fp / 220) * 100)}%` }}
              />
            </div>
          </div>

          {/* PT Meter */}
          <div className="bg-slate-950/70 rounded-xl p-2 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-cyan-400 flex items-center gap-1 text-[11px]">
                <Sparkles size={11} /> PT
              </span>
              <span className="font-mono font-bold text-slate-200">{player.stats.tp}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full"
                style={{ width: `${Math.min(100, (player.stats.tp / 200) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Core Stats Progress Bars */}
        <div className="px-5 pt-2.5 pb-3">
          <div className="space-y-1">
            {STAT_KEYS.map(stat => (
              <StatBar
                key={stat.key}
                statKey={stat.key}
                label={stat.labelIt}
                value={player.stats[stat.key]}
                compareValue={rivalPlayer?.stats?.[stat.key]}
                maxValue={stat.max}
                elementColor={elem.color}
                iconName={stat.icon}
                showDelta={!!rivalPlayer}
                isPlayer1={playerNumber === 1}
              />
            ))}
          </div>
        </div>

        {/* Special Moves List (Vertical Stack 1 to 4) */}
        <div className="px-5 pb-4 pt-2 border-t border-slate-800/60">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2.5">
            Tecniche Speciali
          </h4>

          <div className="flex flex-col space-y-2">
            {[0, 1, 2, 3].map(slot => (
              <MoveCard
                key={slot}
                moveName={player.moves[slot]}
                slotIndex={slot}
                playerElement={player.element}
                playerName={player.name}
                showStabEffect={showStabEffect}
                videoWindowWidth={videoWindowWidth}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
