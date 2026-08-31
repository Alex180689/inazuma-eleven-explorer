import React from 'react';
import { motion } from 'framer-motion';
import { STAT_KEYS, VITAL_KEYS, getStatDelta, calculateTotalStats, calculateOverall } from '../utils/statsUtils';
import { ELEMENTS } from '../constants/elements';
import { Swords, Trophy, Sparkles, Zap, Flame, ShieldAlert, Target, Shield, Activity, HeartHandshake } from 'lucide-react';

const STAT_ICONS = {
  Flame,
  ShieldAlert,
  Target,
  Shield,
  Zap,
  Activity,
  HeartHandshake,
};

// Elemental matchup logic (Inazuma Eleven standard cycle)
// Fire -> Wood -> Earth -> Wind -> Fire
function getElementalAdvantage(elem1, elem2) {
  const chart = {
    Fire: { beats: 'Wood', weakTo: 'Wind' },
    Wind: { beats: 'Fire', weakTo: 'Earth' },
    Earth: { beats: 'Wind', weakTo: 'Wood' },
    Wood: { beats: 'Earth', weakTo: 'Fire' },
  };

  if (chart[elem1]?.beats === elem2) {
    return { winner: 1, text: `${ELEMENTS[elem1]?.nameIt} ha vantaggio elementale su ${ELEMENTS[elem2]?.nameIt} (+Vantaggio)` };
  }
  if (chart[elem2]?.beats === elem1) {
    return { winner: 2, text: `${ELEMENTS[elem2]?.nameIt} ha vantaggio elementale su ${ELEMENTS[elem1]?.nameIt} (+Vantaggio)` };
  }
  return { winner: 0, text: 'Nessun vantaggio elementale diretto' };
}

export default function DeltaStatsView({ player1, player2 }) {
  if (!player1 || !player2) return null;

  const p1Elem = ELEMENTS[player1.element] || ELEMENTS.Neutral;
  const p2Elem = ELEMENTS[player2.element] || ELEMENTS.Neutral;

  const p1Total = calculateTotalStats(player1);
  const p2Total = calculateTotalStats(player2);
  const totalDelta = getStatDelta(p1Total, p2Total);

  const p1Ovr = calculateOverall(player1);
  const p2Ovr = calculateOverall(player2);

  // Count wins
  let p1Wins = 0;
  let p2Wins = 0;
  let ties = 0;

  STAT_KEYS.forEach(stat => {
    const d = getStatDelta(player1.stats[stat.key], player2.stats[stat.key]);
    if (d.winner === 1) p1Wins++;
    else if (d.winner === 2) p2Wins++;
    else ties++;
  });

  const elemMatchup = getElementalAdvantage(player1.element, player2.element);

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800">
      {/* Header and Match Summary */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Swords size={18} className="text-amber-400" />
          <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">
            Differenziale Statistiche (Head-to-Head)
          </h3>
        </div>

        {/* Win count summary */}
        <div className="flex items-center gap-2 text-xs font-mono font-bold">
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {p1Wins}W - {ties}D - {p2Wins}W
          </span>
        </div>
      </div>

      {/* Elemental Matchup Note */}
      {elemMatchup.winner !== 0 && (
        <div
          className={`mb-4 p-2.5 rounded-xl text-xs font-medium flex items-center justify-between border ${
            elemMatchup.winner === 1
              ? 'bg-red-500/10 text-red-300 border-red-500/30'
              : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Sparkles size={14} />
            {elemMatchup.text}
          </span>
          <span className="font-bold font-mono text-[10px] uppercase">Affinità</span>
        </div>
      )}

      {/* Head to Head Table */}
      <div className="space-y-2.5">
        {STAT_KEYS.map(stat => {
          const v1 = player1.stats[stat.key] || 0;
          const v2 = player2.stats[stat.key] || 0;
          const delta = getStatDelta(v1, v2);
          const Icon = STAT_ICONS[stat.icon] || Zap;

          // Calculate visual balance bar percentage (50% is equal)
          const sum = v1 + v2 || 1;
          const p1Pct = Math.round((v1 / sum) * 100);

          return (
            <div
              key={stat.key}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all"
            >
              {/* Row Header */}
              <div className="flex items-center justify-between text-xs mb-1.5">
                {/* P1 Value */}
                <div className="flex items-center gap-1.5 w-16">
                  <span
                    className={`font-mono font-bold text-sm ${
                      delta.winner === 1 ? 'text-emerald-400 font-black' : 'text-slate-300'
                    }`}
                  >
                    {v1}
                  </span>
                  {delta.winner === 1 && (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-1 rounded">
                      +{delta.diff}
                    </span>
                  )}
                </div>

                {/* Stat Label */}
                <div className="flex items-center gap-1 text-slate-300 font-semibold">
                  <Icon size={12} className="text-amber-400" />
                  <span>{stat.labelIt}</span>
                </div>

                {/* P2 Value */}
                <div className="flex items-center justify-end gap-1.5 w-16">
                  {delta.winner === 2 && (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-1 rounded">
                      +{Math.abs(delta.diff)}
                    </span>
                  )}
                  <span
                    className={`font-mono font-bold text-sm ${
                      delta.winner === 2 ? 'text-emerald-400 font-black' : 'text-slate-300'
                    }`}
                  >
                    {v2}
                  </span>
                </div>
              </div>

              {/* Tug-of-war Bar */}
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex items-center">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${p1Pct}%`,
                    background: delta.winner === 1 ? p1Elem.color : '#64748b',
                  }}
                />
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${100 - p1Pct}%`,
                    background: delta.winner === 2 ? p2Elem.color : '#475569',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Score Delta Banner */}
      <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 text-center">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <p className="text-[10px] uppercase font-mono text-slate-400 mb-0.5">Totale Punti (7 Stat)</p>
          <div className="flex items-center justify-center gap-2">
            <span className="font-mono font-bold text-base text-white">{p1Total}</span>
            <span className="text-slate-500 font-mono text-xs">vs</span>
            <span className="font-mono font-bold text-base text-white">{p2Total}</span>
          </div>
          <span className={`inline-block mt-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded ${totalDelta.colorClass}`}>
            Delta: {totalDelta.formatted} ({totalDelta.winner === 1 ? player1.name : totalDelta.winner === 2 ? player2.name : 'Parità'})
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <p className="text-[10px] uppercase font-mono text-slate-400 mb-0.5">Overall Rating (OVR)</p>
          <div className="flex items-center justify-center gap-2">
            <span className="font-mono font-bold text-base text-amber-300">{p1Ovr}</span>
            <span className="text-slate-500 font-mono text-xs">vs</span>
            <span className="font-mono font-bold text-base text-amber-300">{p2Ovr}</span>
          </div>
          <span className="inline-block mt-1 text-[11px] font-mono font-semibold text-slate-300">
            {p1Ovr > p2Ovr ? `🏆 ${player1.name} in vantaggio` : p2Ovr > p1Ovr ? `🏆 ${player2.name} in vantaggio` : '⚖️ Pareggio Perfetto'}
          </span>
        </div>
      </div>
    </div>
  );
}
