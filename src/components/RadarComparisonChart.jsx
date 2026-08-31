import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ELEMENTS } from '../constants/elements';
import { STAT_KEYS, VITAL_KEYS, getStatDelta, calculateTotalStats, calculateOverall, getPlayerColor } from '../utils/statsUtils';
import { Layers, Trophy, Sparkles } from 'lucide-react';

export default function RadarComparisonChart({ player1, player2, p1Theme, p2Theme, isWeighted = true }) {
  const [chartMode, setChartMode] = useState('core'); // 'core' (7 stats) | 'all' (9 stats)
  const [hoveredStat, setHoveredStat] = useState(null);

  if (!player1 || !player2) {
    return (
      <div className="h-80 flex flex-col items-center justify-center text-center text-slate-500 p-6">
        <Sparkles size={36} className="mb-2 opacity-40 animate-pulse" />
        <p className="text-sm font-medium">Seleziona entrambi i giocatori per visualizzare il Radar Poligonale.</p>
      </div>
    );
  }

  // Calculate unique colors based on player name characters (or use synchronized matchup themes)
  const p1ColorTheme = p1Theme || getPlayerColor(player1.name);
  let p2ColorTheme = p2Theme || getPlayerColor(player2.name);

  if (!p2Theme) {
    // If hues are too close (less than 45 degrees apart), shift player 2 hue by 135 degrees to ensure distinct contrast
    const hueDiff = Math.min(
      Math.abs(p1ColorTheme.hue - p2ColorTheme.hue),
      360 - Math.abs(p1ColorTheme.hue - p2ColorTheme.hue)
    );
    if (hueDiff < 45) {
      p2ColorTheme = getPlayerColor(player2.name, 135);
    }
  }

  const p1Ovr = calculateOverall(player1, isWeighted);
  const p2Ovr = calculateOverall(player2, isWeighted);
  const p1Total = calculateTotalStats(player1);
  const p2Total = calculateTotalStats(player2);

  // Define stats list based on mode
  const statsList = chartMode === 'all'
    ? [
        ...STAT_KEYS,
        { key: 'fp', labelIt: 'PE', labelEn: 'PE', max: 220 },
        { key: 'tp', labelIt: 'PT', labelEn: 'PT', max: 200 },
        { key: 'freedom', labelIt: 'Libertà', labelEn: 'Freedom', max: 70 },
      ]
    : STAT_KEYS;

  const numStats = statsList.length;
  // Dimensions with ample margin for labels so nothing overflows
  const svgWidth = 460;
  const svgHeight = 390;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2 - 5;
  const radius = 120;

  // Concentric levels (25%, 50%, 75%, 100%)
  const levels = [0.25, 0.5, 0.75, 1.0];

  // Helper to get polar coordinate
  const getCoordinates = (index, fraction) => {
    const angle = (Math.PI * 2 * index) / numStats - Math.PI / 2;
    const x = centerX + radius * fraction * Math.cos(angle);
    const y = centerY + radius * fraction * Math.sin(angle);
    return { x, y, angle };
  };

  // Generate grid polygon points for a level
  const getGridPoints = (levelFraction) => {
    return statsList
      .map((_, i) => {
        const { x, y } = getCoordinates(i, levelFraction);
        return `${x},${y}`;
      })
      .join(' ');
  };

  // Generate Player 1 Polygon Points (scaled to 100 max)
  const p1Points = statsList
    .map((stat, i) => {
      const val = player1.stats[stat.key] || 0;
      const fraction = Math.min(1, Math.max(0.12, val / (stat.max || 100)));
      const { x, y } = getCoordinates(i, fraction);
      return `${x},${y}`;
    })
    .join(' ');

  // Generate Player 2 Polygon Points (scaled to 100 max)
  const p2Points = statsList
    .map((stat, i) => {
      const val = player2.stats[stat.key] || 0;
      const fraction = Math.min(1, Math.max(0.12, val / (stat.max || 100)));
      const { x, y } = getCoordinates(i, fraction);
      return `${x},${y}`;
    })
    .join(' ');

  // Stat info for hover
  const activeStatObj = hoveredStat ? statsList.find((s) => s.key === hoveredStat) : null;
  const activeP1Val = activeStatObj ? player1.stats[activeStatObj.key] || 0 : null;
  const activeP2Val = activeStatObj ? player2.stats[activeStatObj.key] || 0 : null;
  const activeDelta = activeStatObj ? getStatDelta(activeP1Val, activeP2Val) : null;

  return (
    <div className="flex flex-col h-full justify-between select-none">
      {/* Top Header with Mode Toggle */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-amber-400" />
          <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">
            Radar di Confronto
          </h3>
        </div>

        {/* Toggle Mode */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setChartMode('core')}
            className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
              chartMode === 'core'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            7 Attributi
          </button>
          <button
            onClick={() => setChartMode('all')}
            className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
              chartMode === 'all'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Completo (+PE/PT/Libertà)
          </button>
        </div>
      </div>

      {/* SVG Radar Visualizer */}
      <div className="relative flex-1 flex items-center justify-center min-h-[340px] py-1">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-[380px] overflow-visible"
        >
          <defs>
            {/* Player 1 Gradient */}
            <linearGradient id="p1GradWide" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={p1ColorTheme.color} stopOpacity="0.45" />
              <stop offset="100%" stopColor={p1ColorTheme.secondaryColor} stopOpacity="0.12" />
            </linearGradient>

            {/* Player 2 Gradient */}
            <linearGradient id="p2GradWide" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={p2ColorTheme.color} stopOpacity="0.45" />
              <stop offset="100%" stopColor={p2ColorTheme.secondaryColor} stopOpacity="0.12" />
            </linearGradient>

            {/* Glow filters */}
            <filter id="p1GlowWide" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={p1ColorTheme.glowColor} floodOpacity="0.5" />
            </filter>
            <filter id="p2GlowWide" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={p2ColorTheme.glowColor} floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Radar Center Backdrop */}
          <circle cx={centerX} cy={centerY} r={radius} fill="#0b1120" stroke="#1e293b" strokeWidth="1" />

          {/* Concentric Grid Polygons */}
          {levels.map((lvl, idx) => (
            <polygon
              key={idx}
              points={getGridPoints(lvl)}
              fill="none"
              stroke="#334155"
              strokeWidth={idx === levels.length - 1 ? '1.5' : '1'}
              strokeDasharray={idx < levels.length - 1 ? '3 3' : 'none'}
              opacity={0.7}
            />
          ))}

          {/* Concentric level percentage indicators */}
          <text x={centerX + 4} y={centerY - radius * 0.5} fill="#475569" fontSize="8px" fontFamily="monospace">50%</text>
          <text x={centerX + 4} y={centerY - radius} fill="#475569" fontSize="8px" fontFamily="monospace">100%</text>

          {/* Radial Spokes / Axes */}
          {statsList.map((_, i) => {
            const { x, y } = getCoordinates(i, 1);
            return (
              <line
                key={i}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="#334155"
                strokeWidth="1"
                opacity={0.6}
              />
            );
          })}

          {/* 1. Internal Fills Layer (both rendered UNDERNEATH outlines and dots) */}
          <g style={{ mixBlendMode: 'screen' }}>
            <polygon
              points={p1Points}
              fill="url(#p1GradWide)"
              stroke="none"
              className="transition-all duration-300 ease-out"
            />
            <polygon
              points={p2Points}
              fill="url(#p2GradWide)"
              stroke="none"
              className="transition-all duration-300 ease-out"
            />
          </g>

          {/* 2. Outline Borders Layer (rendered ON TOP of both fills so borders are 100% clear) */}
          <polygon
            points={p1Points}
            fill="none"
            stroke={p1ColorTheme.color}
            strokeWidth="2.5"
            filter="url(#p1GlowWide)"
            className="transition-all duration-300 ease-out"
          />
          <polygon
            points={p2Points}
            fill="none"
            stroke={p2ColorTheme.color}
            strokeWidth="2.5"
            filter="url(#p2GlowWide)"
            className="transition-all duration-300 ease-out"
          />

          {/* Vertex Circles for Player 1 */}
          {statsList.map((stat, i) => {
            const val = player1.stats[stat.key] || 0;
            const fraction = Math.min(1, Math.max(0.12, val / (stat.max || 85)));
            const { x, y } = getCoordinates(i, fraction);
            const isHovered = hoveredStat === stat.key;

            return (
              <circle
                key={`p1-dot-${i}`}
                cx={x}
                cy={y}
                r={isHovered ? 5.5 : 3.5}
                fill="#ffffff"
                stroke={p1ColorTheme.color}
                strokeWidth="2"
                className="transition-all duration-150 cursor-pointer"
                onMouseEnter={() => setHoveredStat(stat.key)}
                onMouseLeave={() => setHoveredStat(null)}
              />
            );
          })}

          {/* Vertex Circles for Player 2 */}
          {statsList.map((stat, i) => {
            const val = player2.stats[stat.key] || 0;
            const fraction = Math.min(1, Math.max(0.12, val / (stat.max || 85)));
            const { x, y } = getCoordinates(i, fraction);
            const isHovered = hoveredStat === stat.key;

            return (
              <circle
                key={`p2-dot-${i}`}
                cx={x}
                cy={y}
                r={isHovered ? 5.5 : 3.5}
                fill="#ffffff"
                stroke={p2ColorTheme.color}
                strokeWidth="2"
                className="transition-all duration-150 cursor-pointer"
                onMouseEnter={() => setHoveredStat(stat.key)}
                onMouseLeave={() => setHoveredStat(null)}
              />
            );
          })}

          {/* Stat Labels around the perimeter with ample room */}
          {statsList.map((stat, i) => {
            const { x, y, angle } = getCoordinates(i, 1.28);
            const isHovered = hoveredStat === stat.key;
            const v1 = player1.stats[stat.key] || 0;
            const v2 = player2.stats[stat.key] || 0;

            let textAnchor = 'middle';
            const cos = Math.cos(angle);
            if (cos > 0.25) textAnchor = 'start';
            else if (cos < -0.25) textAnchor = 'end';

            return (
              <g
                key={`label-${i}`}
                className="cursor-pointer select-none"
                onMouseEnter={() => setHoveredStat(stat.key)}
                onMouseLeave={() => setHoveredStat(null)}
              >
                <text
                  x={x}
                  y={y - 5}
                  textAnchor={textAnchor}
                  dominantBaseline="central"
                  fill={isHovered ? '#fbbf24' : '#f1f5f9'}
                  fontSize={isHovered ? '13px' : '11.5px'}
                  fontWeight={isHovered ? '800' : '700'}
                  className="transition-colors font-sans"
                >
                  {stat.labelIt}
                </text>
                <text
                  x={x}
                  y={y + 9}
                  textAnchor={textAnchor}
                  dominantBaseline="central"
                  fill="#94a3b8"
                  fontSize="10px"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  <tspan fill={p1ColorTheme.color}>{v1}</tspan> vs <tspan fill={p2ColorTheme.color}>{v2}</tspan>
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Floating Tooltip */}
        {activeStatObj && activeDelta && (
          <div className="absolute top-2 inset-x-4 glass-panel p-2.5 rounded-xl border border-amber-500/40 shadow-2xl flex items-center justify-between text-xs z-20">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-300">{activeStatObj.labelIt}</span>
              <span className="text-slate-400 font-mono text-[10px]">Max: {activeStatObj.max || 100}</span>
            </div>

            <div className="flex items-center gap-3 font-mono font-bold">
              <span style={{ color: p1ColorTheme.color }}>{player1.name}: {activeP1Val}</span>
              <span className="text-slate-500">vs</span>
              <span style={{ color: p2ColorTheme.color }}>{player2.name}: {activeP2Val}</span>
              <span className={`px-1.5 py-0.5 rounded text-[11px] border ${activeDelta.colorClass}`}>
                {activeDelta.formatted}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Matchup Quick Verdict */}
      <div className="mt-2 pt-3 border-t border-slate-800/80 space-y-2">
        {/* Players Legend */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* P1 Badge */}
          <div
            className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/70 border transition-colors"
            style={{ borderColor: `${p1ColorTheme.color}60` }}
          >
            <span
              className="w-3 h-3 rounded-full shrink-0 shadow"
              style={{ background: p1ColorTheme.color, boxShadow: `0 0 8px ${p1ColorTheme.glowColor}` }}
            />
            <div className="min-w-0 flex-1">
              <p className="font-bold truncate" style={{ color: p1ColorTheme.color }}>{player1.name}</p>
              <p className="text-[10px] text-slate-400 font-mono">OVR {p1Ovr} • {p1Total} pts</p>
            </div>
          </div>

          {/* P2 Badge */}
          <div
            className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/70 border transition-colors"
            style={{ borderColor: `${p2ColorTheme.color}60` }}
          >
            <span
              className="w-3 h-3 rounded-full shrink-0 shadow"
              style={{ background: p2ColorTheme.color, boxShadow: `0 0 8px ${p2ColorTheme.glowColor}` }}
            />
            <div className="min-w-0 flex-1">
              <p className="font-bold truncate" style={{ color: p2ColorTheme.color }}>{player2.name}</p>
              <p className="text-[10px] text-slate-400 font-mono">OVR {p2Ovr} • {p2Total} pts</p>
            </div>
          </div>
        </div>

        {/* Matchup Verdict Banner */}
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center flex items-center justify-center gap-2 text-xs">
          <Trophy size={14} className="text-amber-400 shrink-0" />
          <span className="font-semibold text-slate-200">
            {p1Ovr > p2Ovr ? (
              <>Vantaggio complessivo per <strong style={{ color: p1ColorTheme.color }}>{player1.name}</strong> (+{p1Ovr - p2Ovr} OVR)</>
            ) : p2Ovr > p1Ovr ? (
              <>Vantaggio complessivo per <strong style={{ color: p2ColorTheme.color }}>{player2.name}</strong> (+{p2Ovr - p1Ovr} OVR)</>
            ) : (
              <>Equilibrio perfetto di Overall tra i due giocatori (Parità a {p1Ovr})</>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
