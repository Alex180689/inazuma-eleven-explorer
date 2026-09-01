import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Sparkles } from 'lucide-react';
import { getMoveInfo, checkMoveStab } from '../utils/hissatsu';

export default function MoveVideoHoverCard({
  isOpen,
  video,
  playerName,
  moveName,
  playerElement,
  targetRect,
}) {
  if (!isOpen || !video || !targetRect) return null;

  const cardWidth = 320;
  const cardHeight = 270;
  const margin = 16;

  // Horizontal position: place to right if on left half of screen, else to left
  const spaceRight = window.innerWidth - targetRect.right;
  const placeRight = spaceRight >= cardWidth + margin || targetRect.left < window.innerWidth / 2;

  const posX = placeRight
    ? Math.min(window.innerWidth - cardWidth - margin, targetRect.right + 12)
    : Math.max(margin, targetRect.left - cardWidth - 12);

  // Vertical position: align with hovered move card, clamped within viewport
  const centerY = targetRect.top + targetRect.height / 2;
  const idealY = centerY - cardHeight / 2;
  const maxY = window.innerHeight - cardHeight - margin;
  const posY = Math.max(margin, Math.min(maxY, idealY));

  const moveInfo = getMoveInfo(moveName);
  const isStab = checkMoveStab(moveName, playerElement);

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 4 }}
        transition={{ type: 'spring', stiffness: 450, damping: 28 }}
        style={{
          position: 'fixed',
          left: `${posX}px`,
          top: `${posY}px`,
          width: `${cardWidth}px`,
          zIndex: 99999,
        }}
        className="pointer-events-none select-none rounded-2xl bg-slate-950 border border-amber-500/60 shadow-[0_25px_60px_rgba(0,0,0,0.98)] backdrop-blur-2xl p-3 text-white overflow-hidden ring-1 ring-amber-500/30"
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header: Player Name + Move Name + Badges */}
        <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800/80 relative z-10">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
              <Film size={11} className="text-amber-400 animate-pulse" />
              <span className="font-semibold text-amber-300 truncate">{playerName}</span>
            </div>
            <h4 className="font-bold text-sm text-white truncate leading-tight mt-0.5">
              {moveName}
            </h4>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isStab && (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-black font-mono bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-sm uppercase">
                STAB
              </span>
            )}
            {moveInfo?.type && (
              <span
                className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono border uppercase ${moveInfo.type.badgeClass}`}
              >
                {moveInfo.type.code}
              </span>
            )}
          </div>
        </div>

        {/* Video / GIF Player Container */}
        <div className="relative rounded-xl overflow-hidden bg-black border border-slate-800/90 shadow-inner flex items-center justify-center min-h-[160px] max-h-[220px]">
          {video.isGif ? (
            <img
              src={video.url}
              alt={`${playerName} - ${moveName}`}
              className="w-full h-full object-contain"
            />
          ) : (
            <video
              src={video.url}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain max-h-[220px]"
            />
          )}

          {/* Rec Indicator Pill */}
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 flex items-center gap-1 text-[9px] font-mono font-medium text-slate-300 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            <span>CLIP</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
