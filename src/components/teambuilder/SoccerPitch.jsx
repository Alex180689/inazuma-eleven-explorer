import React from 'react';
import PlayerSlot from './PlayerSlot';

export default function SoccerPitch({
  formation,
  fieldPlayers = {},
  dragSourceSlot,
  dropTargetSlot,
  onPointerDownSlot,
  onSlotRemove,
  onSlotHover,
  onSlotLeave,
  settings,
  isCtrlPressed = false,
  isWeighted = true,
}) {
  const pitchWidth = settings?.pitchWidth || 540;
  const pitchHeight = settings?.pitchHeight || 640;
  const lineOpacity = (settings?.lineOpacity || 45) / 100;
  const showGrassStripes = settings?.showGrassStripes !== false;

  return (
    <div
      className="relative select-none flex justify-center mx-auto"
      style={{
        width: `${pitchWidth}px`,
        maxWidth: '100%',
      }}
    >
      {/* Pitch Frame & Grass Surface with dynamic width & height from settings */}
      <div
        className="relative w-full rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-[0_0_35px_rgba(16,185,129,0.2)] transition-all duration-150"
        style={{
          height: `${pitchHeight}px`,
          background: 'linear-gradient(180deg, #062117 0%, #082d20 50%, #061c14 100%)',
        }}
      >
        {/* Grass Lawn Pattern (Subtle stripes) */}
        {showGrassStripes && (
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'repeating-linear-gradient(180deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 45px, transparent 45px, transparent 90px)',
            }}
          />
        )}

        {/* Tactical Pitch Markings SVG */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          stroke={`rgba(52, 211, 153, ${lineOpacity})`}
          strokeWidth="1.5"
          fill="none"
        >
          {/* Pitch Outer Boundary Line */}
          <rect x="5%" y="4%" width="90%" height="92%" rx="12" />

          {/* Halfway Line */}
          <line x1="5%" y1="50%" x2="95%" y2="50%" />

          {/* Center Circle & Spot */}
          <circle cx="50%" cy="50%" r="12%" />
          <circle cx="50%" cy="50%" r="1.5%" fill={`rgba(52, 211, 153, ${lineOpacity * 1.3})`} />

          {/* Top Penalty Box (Attacking) */}
          <rect x="22%" y="4%" width="56%" height="16%" />
          <rect x="34%" y="4%" width="32%" height="6%" />
          <path d="M 40% 20% A 10% 10% 0 0 0 60% 20%" />
          <circle cx="50%" cy="14%" r="1%" fill={`rgba(52, 211, 153, ${lineOpacity * 1.3})`} />

          {/* Bottom Penalty Box (Defending) */}
          <rect x="22%" y="80%" width="56%" height="16%" />
          <rect x="34%" y="90%" width="32%" height="6%" />
          <path d="M 40% 80% A 10% 10% 0 0 1 60% 80%" />
          <circle cx="50%" cy="86%" r="1%" fill={`rgba(52, 211, 153, ${lineOpacity * 1.3})`} />

          {/* Corner Arcs */}
          <path d="M 5% 7% A 3% 3% 0 0 0 8% 4%" />
          <path d="M 92% 4% A 3% 3% 0 0 0 95% 7%" />
          <path d="M 5% 93% A 3% 3% 0 0 1 8% 96%" />
          <path d="M 92% 96% A 3% 3% 0 0 1 95% 93%" />
        </svg>

        {/* 11 Tactical Player Slots */}
        {formation.slots.map((slot) => {
          const player = fieldPlayers[slot.id] || null;
          const isDragSource = dragSourceSlot?.type === 'field' && dragSourceSlot?.index === slot.id;
          const isDropTarget = dropTargetSlot?.type === 'field' && dropTargetSlot?.index === slot.id;

          return (
            <div
              key={slot.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
              style={{
                left: `${slot.x}%`,
                top: `${slot.y}%`,
              }}
            >
              <PlayerSlot
                slot={slot}
                player={player}
                isBench={false}
                isDragSource={isDragSource}
                isDropTarget={isDropTarget}
                onPointerDownSlot={onPointerDownSlot}
                onRemove={() => onSlotRemove('field', slot.id)}
                onSlotHover={onSlotHover}
                onSlotLeave={onSlotLeave}
                settings={settings}
                isCtrlPressed={isCtrlPressed}
                isWeighted={isWeighted}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
