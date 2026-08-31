import React from 'react';
import { motion } from 'framer-motion';
import { Flame, ShieldAlert, Target, Shield, Zap, Activity, HeartHandshake } from 'lucide-react';
import { getStatDelta } from '../utils/statsUtils';

const STAT_ICONS = {
  Flame,
  ShieldAlert,
  Target,
  Shield,
  Zap,
  Activity,
  HeartHandshake,
};

const STAT_COLORS = {
  kick: { icon: 'text-red-400', bg: 'linear-gradient(90deg, #991b1b, #ef4444)', shadow: '0 0 8px rgba(239, 68, 68, 0.4)' },
  body: { icon: 'text-amber-400', bg: 'linear-gradient(90deg, #b45309, #f59e0b)', shadow: '0 0 8px rgba(245, 158, 11, 0.4)' },
  control: { icon: 'text-sky-400', bg: 'linear-gradient(90deg, #0369a1, #38bdf8)', shadow: '0 0 8px rgba(56, 189, 248, 0.4)' },
  guard: { icon: 'text-emerald-400', bg: 'linear-gradient(90deg, #047857, #34d399)', shadow: '0 0 8px rgba(52, 211, 153, 0.4)' },
  speed: { icon: 'text-purple-400', bg: 'linear-gradient(90deg, #6b21a8, #c084fc)', shadow: '0 0 8px rgba(192, 132, 252, 0.4)' },
  stamina: { icon: 'text-orange-400', bg: 'linear-gradient(90deg, #c2410c, #fb923c)', shadow: '0 0 8px rgba(251, 146, 60, 0.4)' },
  guts: { icon: 'text-rose-400', bg: 'linear-gradient(90deg, #be123c, #fb7185)', shadow: '0 0 8px rgba(251, 113, 133, 0.4)' },
};

export default function StatBar({
  statKey,
  label,
  value,
  compareValue,
  maxValue = 85,
  elementColor = '#eab308',
  iconName,
  showDelta = true,
  isPlayer1 = true, // Kept for prop signature compatibility
}) {
  const Icon = STAT_ICONS[iconName] || Zap;
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  
  const delta = showDelta && compareValue !== undefined ? getStatDelta(value, compareValue) : null;
  
  // Diff is always (current player - rival player), so positive means current player is better
  const isWinning = delta && delta.diff > 0;
  const isLosing = delta && delta.diff < 0;

  const theme = STAT_COLORS[statKey] || {
    icon: 'text-amber-400',
    bg: `linear-gradient(90deg, #475569, ${elementColor})`,
    shadow: `0 0 8px ${elementColor}88`
  };

  return (
    <div className="flex flex-col gap-1 py-1 group">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 group-hover:text-white transition-colors">
          <Icon size={13} className={`${theme.icon} transition-colors`} />
          <span className="font-medium">{label}</span>
        </div>

        <div className="flex items-center gap-2">
          {showDelta && delta && (
            <span
              className={`text-[11px] font-mono font-bold px-1.5 py-0.2 rounded border transition-all ${
                isWinning
                  ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
                  : isLosing
                  ? 'text-rose-400 bg-rose-500/15 border-rose-500/30'
                  : 'text-slate-400 bg-slate-800/40 border-slate-700/50'
              }`}
            >
              {delta.formatted}
            </span>
          )}
          <span className="font-mono font-bold text-sm text-white w-6 text-right">
            {value}
          </span>
        </div>
      </div>

      <div className="h-2 w-full bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full transition-all"
          style={{
            background: theme.bg,
            boxShadow: isWinning ? theme.shadow : 'none',
          }}
        />
      </div>
    </div>
  );
}
