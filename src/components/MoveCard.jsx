import React, { useState, useMemo } from 'react';
import { Zap, Sparkles, Flame, Wind, Mountain, Trees, Film } from 'lucide-react';
import { getMoveInfo, checkMoveStab } from '../utils/hissatsu';
import { findMoveVideo } from '../utils/videoUtils';
import MoveVideoHoverCard from './MoveVideoHoverCard';

const ELEMENT_ICON_MAP = {
  Fire: Flame,
  Wind: Wind,
  Earth: Mountain,
  Wood: Trees,
};

export default function MoveCard({
  moveName,
  slotIndex,
  playerElement,
  playerName,
  showStabEffect = true,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [targetRect, setTargetRect] = useState(null);

  if (!moveName) {
    return (
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-slate-500 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-5 h-5 rounded-md flex items-center justify-center bg-slate-900 text-slate-600 font-mono text-[10px] font-bold shrink-0">
            {slotIndex + 1}
          </span>
          <span className="italic text-[11px]">Nessuna Tecnica</span>
        </div>
      </div>
    );
  }

  const moveInfo = getMoveInfo(moveName);
  const isStab = checkMoveStab(moveName, playerElement);
  const applyStabVisual = isStab && showStabEffect;
  const ElementIcon = moveInfo?.elementKey ? ELEMENT_ICON_MAP[moveInfo.elementKey] : null;

  // Check if a specific player recording exists for this move
  const video = useMemo(() => {
    return findMoveVideo(playerName, moveName);
  }, [playerName, moveName]);

  const handleMouseEnter = (e) => {
    if (video) {
      setTargetRect(e.currentTarget.getBoundingClientRect());
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`group relative flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 shadow-sm ${
          video ? 'cursor-pointer hover:border-amber-400/80 hover:shadow-[0_0_12px_rgba(245,158,11,0.18)]' : ''
        } ${
          applyStabVisual
            ? 'bg-slate-950/85 border border-amber-400/50 hover:border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.12)]'
            : 'bg-slate-950/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700'
        }`}
        title={
          video
            ? `${moveName} • Clip video in loop disponibile!`
            : applyStabVisual
            ? `${moveName} • Bonus STAB (+20% Potenza per elemento affine: ${playerElement})`
            : moveName
        }
      >
        {/* Left: Slot index + Move Name */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span
            className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10px] font-extrabold shrink-0 transition-colors ${
              applyStabVisual
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                : 'bg-slate-800 group-hover:bg-slate-700 text-slate-300'
            }`}
          >
            {slotIndex + 1}
          </span>

          <span
            className={`font-semibold text-xs sm:text-sm truncate transition-colors ${
              applyStabVisual
                ? 'text-white group-hover:text-amber-200'
                : 'text-slate-200 group-hover:text-white'
            }`}
          >
            {moveName}
          </span>
        </div>

        {/* Right: Badges (Video + STAB + Type + Element Icon) */}
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {/* Video Clip Available Indicator */}
          {video && (
            <span
              className="w-5 h-5 rounded-md flex items-center justify-center bg-amber-500/20 border border-amber-500/40 text-amber-300 transition-all shrink-0 shadow-sm"
              title="Clip Video in loop disponibile al passaggio del mouse"
            >
              <Film size={11} className="animate-pulse" />
            </span>
          )}

          {/* STAB Pill */}
          {applyStabVisual && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black font-mono bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-sm uppercase tracking-wider flex items-center gap-0.5 animate-pulse">
              <Sparkles size={9} className="fill-slate-950" />
              <span>STAB</span>
            </span>
          )}

          {/* Move Type Badge (TIRO rosa, DRIB blu, BLOC verde, PARA ocra) */}
          {moveInfo?.type && (
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono border uppercase tracking-wider ${moveInfo.type.badgeClass}`}
              title={`Tipo: ${moveInfo.type.labelIt}`}
            >
              {moveInfo.type.code}
            </span>
          )}

          {/* Move Element Icon Badge */}
          {moveInfo?.element && ElementIcon && (
            <span
              className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${moveInfo.element.badgeClass}`}
              title={`Elemento: ${moveInfo.element.nameIt}`}
            >
              <ElementIcon size={12} className="shrink-0" />
            </span>
          )}

          {/* Fallback generic lightning icon if not in hissatsu registry */}
          {!moveInfo && (
            <Zap
              size={12}
              className="text-slate-600 group-hover:text-amber-400 shrink-0 transition-colors"
            />
          )}
        </div>
      </div>

      {/* Floating Video Overlay Popup Portal */}
      {video && (
        <MoveVideoHoverCard
          isOpen={isHovered}
          video={video}
          playerName={playerName}
          moveName={moveName}
          playerElement={playerElement}
          targetRect={targetRect}
        />
      )}
    </>
  );
}
