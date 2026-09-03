import React from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Flame, Wind, Mountain, Trees, Sparkles } from 'lucide-react';
import { POSITIONS } from '../../constants/positions';
import { ELEMENTS } from '../../constants/elements';
import { getPlayerSpriteUrl } from '../../utils/spriteUtils';
import { getCardBackgroundStyle, getElementRadialAura } from '../../utils/cardBackgrounds';
import { calculateOverall } from '../../utils/statsUtils';

const ELEMENT_ICONS = {
  Fire: Flame,
  Wind: Wind,
  Earth: Mountain,
  Wood: Trees,
  Neutral: Sparkles,
};

const ROLE_COLORS = {
  GK: {
    border: 'border-amber-400/60 hover:border-amber-300',
    bg: 'bg-amber-500/10',
    text: 'text-amber-300',
  },
  DF: {
    border: 'border-blue-400/60 hover:border-blue-300',
    bg: 'bg-blue-500/10',
    text: 'text-blue-300',
  },
  MF: {
    border: 'border-emerald-400/60 hover:border-emerald-300',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-300',
  },
  FW: {
    border: 'border-red-400/60 hover:border-red-300',
    bg: 'bg-red-500/10',
    text: 'text-red-300',
  },
  SUB: {
    border: 'border-purple-400/60 hover:border-purple-300',
    bg: 'bg-purple-500/10',
    text: 'text-purple-300',
  },
};

// 100% Solid Opaque Badges for maximum legibility over any sprite
const ROLE_BADGES_SOLID = {
  GK: 'bg-black text-amber-300 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
  DF: 'bg-black text-blue-300 border-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]',
  MF: 'bg-black text-emerald-300 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
  FW: 'bg-black text-red-300 border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]',
  SUB: 'bg-black text-purple-300 border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.5)]',
};

export default function PlayerSlot({
  slot,
  player,
  isBench = false,
  isDragSource = false,
  isDropTarget = false,
  onClick,
  onRemove,
  onPointerDownSlot,
  onSlotHover,
  onSlotLeave,
  settings,
  isCtrlPressed = false,
  isWeighted = true,
}) {
  const slotRole = slot.role || (isBench ? 'SUB' : 'MF');
  const roleStyle = ROLE_COLORS[slotRole] || ROLE_COLORS.MF;

  const elemData = player ? (ELEMENTS[player.element] || ELEMENTS.Neutral) : null;
  const ElementIcon = player ? (ELEMENT_ICONS[player.element] || Sparkles) : null;
  const naturalRoleBadge = player ? (ROLE_BADGES_SOLID[player.position] || ROLE_BADGES_SOLID.MF) : null;

  const slotSize = settings?.slotSize || 64;
  const badgeSize = settings?.badgeSize || 20;
  const cardBg = getCardBackgroundStyle(settings?.cardBackground || 'dark', player?.element);
  const ovr = player ? calculateOverall(player, isWeighted) : 75;

  return (
    <div
      data-slot-type={isBench ? 'bench' : 'field'}
      data-slot-id={slot.id}
      style={{ width: `${slotSize}px`, height: `${slotSize}px` }}
      className="relative flex items-center justify-center select-none shrink-0 group"
    >
      <motion.div
        layout
        onPointerDown={(e) => {
          if (onSlotLeave) onSlotLeave();
          onPointerDownSlot && onPointerDownSlot(e, slot, isBench, player);
        }}
        onMouseEnter={(e) => {
          if (player && onSlotHover && !isCtrlPressed) {
            onSlotHover(slot, isBench, player, e.currentTarget.getBoundingClientRect(), e);
          }
        }}
        onMouseMove={(e) => {
          if (player && onSlotHover && !isCtrlPressed) {
            onSlotHover(slot, isBench, player, e.currentTarget.getBoundingClientRect(), e);
          }
        }}
        onMouseLeave={() => {
          if (onSlotLeave) onSlotLeave();
        }}
        whileHover={{
          scale: isCtrlPressed ? (player ? 1.02 : 1) : player && !isDragSource ? 1.08 : 1.04,
          y: isCtrlPressed ? 0 : player && !isDragSource ? -3 : -1,
          transition: { type: 'spring', stiffness: 450, damping: 20 },
        }}
        whileTap={{ scale: isCtrlPressed ? (player ? 0.96 : 1) : 0.94 }}
        animate={{
          scale: isDropTarget ? 1.14 : isDragSource ? 0.92 : 1,
          rotate: 0,
          opacity: isDragSource ? 0.35 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 450,
          damping: 24,
          mass: 0.8,
        }}
        className={`relative w-full h-full flex items-center justify-center transition-colors duration-150 ${
          cardBg.isNone ? '' : 'rounded-2xl'
        } ${
          isDropTarget
            ? 'ring-4 ring-emerald-400 ring-offset-2 ring-offset-slate-950 bg-emerald-500/30 scale-110 shadow-2xl z-30'
            : isDragSource
            ? 'ring-2 ring-dashed ring-amber-400/60 bg-amber-500/10'
            : isCtrlPressed && !player
            ? 'cursor-default opacity-80'
            : isCtrlPressed && player
            ? 'cursor-pointer'
            : player
            ? cardBg.isNone ? 'cursor-pointer z-10' : 'cursor-pointer shadow-lg hover:shadow-2xl z-10'
            : 'cursor-pointer hover:shadow-md'
        }`}
        style={{
          boxShadow: player && !isDragSource && !isCtrlPressed && !cardBg.isNone
            ? '0 10px 25px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.4)'
            : undefined,
        }}
      >
        {player ? (
          /* OCCUPIED SLOT CARD */
          <div
            className={`w-full h-full relative flex items-center justify-center transition-all duration-200 ${
              cardBg.isNone ? 'bg-transparent border-0 ring-0 shadow-none' : `rounded-2xl border-2 ${cardBg.containerClass}`
            }`}
            style={
              cardBg.isNone
                ? { border: 'none', background: 'transparent', boxShadow: 'none' }
                : { borderColor: cardBg.borderColor || elemData?.color || '#38bdf8' }
            }
          >
            {/* Center Player Sprite Container */}
            <div
              className={`w-full h-full flex items-center justify-center relative ${
                cardBg.isNone ? 'overflow-visible' : 'rounded-[14px] overflow-hidden'
              }`}
            >
              {/* Smooth, seamless circular elemental aura behind the sprite (no box, no cutoffs) */}
              {cardBg.isNone && (
                <div
                  className="absolute -inset-2 rounded-full pointer-events-none blur-[6px]"
                  style={{
                    background: getElementRadialAura(player.element),
                  }}
                />
              )}

              <img
                src={getPlayerSpriteUrl(player.name)}
                alt={player.name}
                loading="eager"
                decoding="sync"
                className="w-full h-full object-contain [image-rendering:pixelated] pointer-events-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.85)] relative z-10"
                onError={(e) => {
                  const parts = player.name.trim().toLowerCase().split(/\s+/);
                  if (parts.length > 1) {
                    const surname = parts[parts.length - 1].replace(/[^a-z0-9']/g, '');
                    e.currentTarget.src = `/sprites/${surname}.webp`;
                  }
                }}
              />

              {/* Ctrl Hover Delete Overlay */}
              {isCtrlPressed && (
                <div
                  className={`absolute inset-0 bg-red-600/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-20 ${
                    cardBg.isNone ? 'rounded-2xl' : ''
                  }`}
                >
                  <X
                    size={Math.round(slotSize * 0.46)}
                    className="text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.95)]"
                    strokeWidth={3.5}
                  />
                </div>
              )}
            </div>

            {/* Top-Right: Overall Badge (Number only, overlapping corner) */}
            {settings?.showOvrBadge !== false && (
              <div
                style={{
                  width: `${badgeSize}px`,
                  height: `${badgeSize}px`,
                  fontSize: `${Math.max(9, Math.round(badgeSize * 0.48))}px`,
                }}
                className="absolute -top-1.5 -right-1.5 z-20 bg-black border border-amber-400 rounded-full flex items-center justify-center shadow-md font-mono font-black text-amber-300 pointer-events-none"
              >
                {ovr}
              </div>
            )}

            {/* Bottom-Right: 100% Solid Opaque Natural Role Badge (overlapping corner) */}
            {settings?.showRoleBadge !== false && (
              <div
                style={{
                  minWidth: `${badgeSize}px`,
                  height: `${badgeSize}px`,
                  fontSize: `${Math.max(8, Math.round(badgeSize * 0.44))}px`,
                }}
                className={`absolute -bottom-1.5 -right-1.5 z-20 px-1 rounded-md border flex items-center justify-center shadow-md font-mono font-black pointer-events-none ${naturalRoleBadge}`}
                title={`Ruolo naturale: ${player.position}`}
              >
                {player.position}
              </div>
            )}

            {/* Bottom-Left: Element Icon with 100% Solid Dark Backing (overlapping corner) */}
            {settings?.showElementBadge !== false && (
              <div
                style={{
                  width: `${badgeSize}px`,
                  height: `${badgeSize}px`,
                  backgroundColor: 'rgba(0, 0, 0, 0.95)',
                  borderColor: elemData?.color || '#94a3b8',
                  color: elemData?.color || '#94a3b8',
                }}
                className="absolute -bottom-1.5 -left-1.5 z-20 rounded-full flex items-center justify-center border shadow-md pointer-events-none"
                title={`Elemento: ${elemData?.nameIt || player.element}`}
              >
                {ElementIcon && (
                  <ElementIcon
                    size={Math.max(9, Math.round(badgeSize * 0.58))}
                    strokeWidth={2.5}
                  />
                )}
              </div>
            )}
          </div>
        ) : (
          /* EMPTY SLOT (Only role inside, no text underneath!) */
          <div
            className={`w-full h-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-200 ${roleStyle.border} ${roleStyle.bg}`}
          >
            <span className={`font-mono font-black text-sm sm:text-base tracking-wider ${roleStyle.text}`}>
              {slotRole}
            </span>
            {!isCtrlPressed && (
              <span className="text-[8px] font-mono text-slate-400 mt-0.5 flex items-center gap-0.5 opacity-70">
                <Plus size={8} strokeWidth={3} />
              </span>
            )}
          </div>
        )}
      </motion.div>

      {/* Name Label Underneath Slot: Positioned with breathing room so it never overlaps the corner role badge */}
      {player && (
        <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 max-w-[84px] sm:max-w-[96px] text-center pointer-events-none z-20">
          <p
            className="text-[10px] sm:text-[11px] font-bold text-white truncate bg-slate-950 px-1.5 py-0.5 rounded-md border border-slate-700/90 shadow-md"
            title={player.name}
          >
            {player.name.split(' ').pop()}
          </p>
        </div>
      )}
    </div>
  );
}
