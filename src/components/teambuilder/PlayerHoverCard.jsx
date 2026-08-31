import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ELEMENTS } from '../../constants/elements';
import { POSITIONS } from '../../constants/positions';
import { STAT_KEYS, calculateOverall, getPlayerTier } from '../../utils/statsUtils';
import { getPlayerSpriteUrl } from '../../utils/spriteUtils';
import { Flame, Wind, Mountain, Trees, Sparkles, Zap, Shield, Trophy } from 'lucide-react';

const ELEMENT_ICONS = {
  Fire: Flame,
  Wind: Wind,
  Earth: Mountain,
  Wood: Trees,
  Neutral: Sparkles,
};

const ELEMENT_RADAR_THEMES = {
  Fire: { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.35)', dot: '#f87171' },
  Wind: { stroke: '#38bdf8', fill: 'rgba(56, 189, 248, 0.35)', dot: '#7dd3fc' },
  Earth: { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.35)', dot: '#fbbf24' },
  Wood: { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.35)', dot: '#34d399' },
  Neutral: { stroke: '#a855f7', fill: 'rgba(168, 85, 247, 0.35)', dot: '#c084fc' },
};

const ROLE_BADGES = {
  GK: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  DF: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  MF: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  FW: 'bg-red-500/20 text-red-300 border-red-500/40',
};

export default function PlayerHoverCard({ player, targetRect, settings, isWeighted = true, isBench = false }) {
  if (!player || !targetRect) return null;

  const elem = ELEMENTS[player.element] || ELEMENTS.Neutral;
  const ElemIcon = ELEMENT_ICONS[player.element] || Sparkles;
  const radarTheme = ELEMENT_RADAR_THEMES[player.element] || ELEMENT_RADAR_THEMES.Neutral;
  const roleBadgeStyle = ROLE_BADGES[player.position] || ROLE_BADGES.MF;
  const ovr = calculateOverall(player, isWeighted);
  const tier = getPlayerTier(ovr);

  // Dynamic Opacity from TeamBuilder settings (default 92%)
  const opacityPercent = settings?.hoverCardOpacity ?? 92;
  const bgAlpha = Math.max(0.25, Math.min(1.0, opacityPercent / 100));

  // Responsive Left / Right positioning relative to slot
  const cardWidth = 300;
  const cardHeight = 425; // estimated card height
  const verticalMargin = 24; // guaranteed breathing room with viewport top & bottom
  const spaceRight = window.innerWidth - targetRect.right;
  const spaceLeft = targetRect.left;

  // Place on the right if there's enough room, or if right has more room than left (Bench players FORCED to the left)
  const placeRight = isBench ? false : (spaceRight >= cardWidth + 16 || spaceRight >= spaceLeft);
  const posX = placeRight
    ? targetRect.right + 12
    : Math.max(12, targetRect.left - cardWidth - 12);

  // Center vertically with the slot, clamped within viewport margins
  const centerY = targetRect.top + targetRect.height / 2;
  const idealY = centerY - cardHeight / 2;
  const maxY = window.innerHeight - cardHeight - verticalMargin;
  const posY = Math.max(verticalMargin, Math.min(maxY, idealY));

  // Mini Radar Chart Geometry (compact 240x170 SVG)
  const svgWidth = 240;
  const svgHeight = 170;
  const rCenterX = svgWidth / 2;
  const rCenterY = svgHeight / 2 + 2;
  const radius = 54;
  const numStats = STAT_KEYS.length;

  const getCoordinates = (index, fraction) => {
    const angle = (Math.PI * 2 * index) / numStats - Math.PI / 2;
    const x = rCenterX + radius * fraction * Math.cos(angle);
    const y = rCenterY + radius * fraction * Math.sin(angle);
    return { x, y };
  };

  // Grid level polygons (33%, 66%, 100%)
  const gridLevels = [0.33, 0.66, 1.0];

  // Player Stats Polygon Points
  const polygonPoints = useMemo(() => {
    return STAT_KEYS.map((stat, i) => {
      const val = player.stats?.[stat.key] || 50;
      const fraction = Math.min(1, Math.max(0.15, val / (stat.max || 85)));
      const { x, y } = getCoordinates(i, fraction);
      return `${x},${y}`;
    }).join(' ');
  }, [player.stats]);

  return createPortal(
    <AnimatePresence>
      <motion.div
        key={`hover-card-${player.id || player.name}`}
        initial={{ opacity: 0, scale: 0.95, x: placeRight ? -8 : 8 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 450, damping: 28 }}
        style={{
          position: 'fixed',
          left: `${posX}px`,
          top: `${posY}px`,
          width: `${cardWidth}px`,
          maxHeight: `calc(100vh - ${verticalMargin * 2}px)`,
          overflowY: 'auto',
          backgroundColor: `rgba(2, 6, 23, ${bgAlpha})`,
          zIndex: 9999,
        }}
        className="pointer-events-none select-none rounded-3xl backdrop-blur-xl border border-slate-700/80 shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-4 text-white overflow-hidden"
      >
        {/* Subtle elemental ambient glow at top */}
        <div
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-25"
          style={{ backgroundColor: elem.color }}
        />

        {/* 1. Header: Avatar + Info */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800 relative z-10">
          <div
            style={{ borderColor: elem.color }}
            className="w-13 h-13 rounded-2xl border-2 bg-gradient-to-b from-slate-800 to-slate-900 overflow-hidden flex items-center justify-center shrink-0 shadow-md"
          >
            <img
              src={getPlayerSpriteUrl(player.name)}
              alt={player.name}
              className="w-full h-full object-contain [image-rendering:pixelated]"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1.5">
              {/* Player Name using comparison font and larger size */}
              <h3
                className="text-base sm:text-lg font-bold text-white tracking-tight truncate leading-tight"
                title={player.name}
              >
                {player.name}
              </h3>

              <div className="flex items-center gap-1 shrink-0">
                {/* Tier Grade Badge */}
                <span
                  className={`px-1.5 py-0.5 rounded-md border text-[10px] font-mono font-black shadow-sm ${tier.color}`}
                  title={`Grado: Tier ${tier.label}`}
                >
                  TIER {tier.label}
                </span>

                {/* OVR Pill */}
                <span
                  className="px-1.5 py-0.5 rounded-md bg-black border border-amber-400/90 text-amber-300 font-mono font-black text-[11px] shadow-sm"
                  title={`Overall: ${ovr}`}
                >
                  {ovr}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 truncate mt-0.5">
              {player.team || 'Scouting'}
            </p>

            {/* Role & Element Badges */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-black border ${roleBadgeStyle}`}
              >
                {player.position}
              </span>

              <span
                style={{
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  borderColor: elem.color,
                  color: elem.color,
                }}
                className="px-1.5 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1"
              >
                <ElemIcon size={11} />
                <span>{elem.nameIt || player.element}</span>
              </span>
            </div>
          </div>
        </div>

        {/* 2. Mini Radar Polygon Chart */}
        <div className="relative flex flex-col items-center py-2 relative z-10">
          <div className="w-full flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
            <span className="font-semibold uppercase tracking-wider text-slate-300">Radar Statistiche</span>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-emerald-400 font-bold">FP: {player.stats?.fp || 100}</span>
              <span className="text-cyan-400 font-bold">TP: {player.stats?.tp || 100}</span>
            </div>
          </div>

          <svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="overflow-visible mt-1"
          >
            {/* Concentric Grid Levels */}
            {gridLevels.map((lvl, idx) => {
              const pts = STAT_KEYS.map((_, i) => {
                const { x, y } = getCoordinates(i, lvl);
                return `${x},${y}`;
              }).join(' ');
              return (
                <polygon
                  key={idx}
                  points={pts}
                  fill="none"
                  stroke="rgba(71, 85, 105, 0.4)"
                  strokeWidth="1"
                  strokeDasharray={idx === 2 ? 'none' : '2 2'}
                />
              );
            })}

            {/* Axis Lines from Center */}
            {STAT_KEYS.map((_, i) => {
              const { x, y } = getCoordinates(i, 1.0);
              return (
                <line
                  key={i}
                  x1={rCenterX}
                  y1={rCenterY}
                  x2={x}
                  y2={y}
                  stroke="rgba(71, 85, 105, 0.35)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Filled Player Polygon */}
            <polygon
              points={polygonPoints}
              fill={radarTheme.fill}
              stroke={radarTheme.stroke}
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Vertices & Stat Labels */}
            {STAT_KEYS.map((stat, i) => {
              const val = player.stats?.[stat.key] || 50;
              const fraction = Math.min(1, Math.max(0.15, val / (stat.max || 85)));
              const dot = getCoordinates(i, fraction);
              const labelPos = getCoordinates(i, 1.34);

              return (
                <g key={stat.key}>
                  {/* Vertex Dot */}
                  <circle
                    cx={dot.x}
                    cy={dot.y}
                    r="2.5"
                    fill={radarTheme.dot}
                    stroke="#0f172a"
                    strokeWidth="1"
                  />

                  {/* Stat Text Label & Value */}
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[9px] font-mono fill-slate-300 select-none pointer-events-none"
                  >
                    <tspan className="font-medium text-slate-400">{stat.labelIt.slice(0, 3)}</tspan>{' '}
                    <tspan className="font-bold fill-white">{val}</tspan>
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* 3. Special Moves (Mosse Speciali) */}
        <div className="pt-2.5 border-t border-slate-800 relative z-10">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-2 px-1">
            <span className="font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Zap size={11} />
              <span>Tecniche Speciali</span>
            </span>
            {player.stats?.freedom !== undefined && (
              <span className="text-purple-400 font-bold">
                Libertà: {player.stats.freedom}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {player.moves && player.moves.length > 0 ? (
              player.moves.slice(0, 4).map((move, idx) => (
                <div
                  key={idx}
                  className="px-2 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-1.5 shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span
                    className="text-[10px] font-semibold text-slate-200 truncate"
                    title={move}
                  >
                    {move}
                  </span>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-2 text-[10px] text-slate-500 italic">
                Nessuna mossa registrata
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
