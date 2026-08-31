import React from 'react';
import { Users } from 'lucide-react';
import PlayerSlot from './PlayerSlot';
import { BENCH_SLOTS_COUNT } from './formations';

export default function BenchSection({
  benchPlayers = {},
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
  const benchSlots = Array.from({ length: BENCH_SLOTS_COUNT }, (_, index) => ({
    id: index,
    role: 'SUB',
    label: `Riserva ${index + 1}`,
  }));

  const topRow = benchSlots.slice(0, 3);
  const bottomRow = benchSlots.slice(3, 5);

  return (
    <div className="w-full max-w-[290px] sm:max-w-[320px] p-4 pb-8 sm:pb-9 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-md flex flex-col items-center">
      {/* Dugout Header */}
      <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2.5 mb-4 px-1">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-xs uppercase tracking-wider font-display">
          <Users size={16} className="text-purple-400" />
          <span>Panchina</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono">
          5 Riserve
        </span>
      </div>

      {/* Row 1: 3 Players */}
      <div className="flex items-center justify-center gap-4 sm:gap-5 w-full">
        {topRow.map((slot) => {
          const player = benchPlayers[slot.id] || null;
          const isDragSource = dragSourceSlot?.type === 'bench' && dragSourceSlot?.index === slot.id;
          const isDropTarget = dropTargetSlot?.type === 'bench' && dropTargetSlot?.index === slot.id;

          return (
            <div key={slot.id} className="relative flex flex-col items-center">
              <PlayerSlot
                key={`${slot.id}-${player?.name || 'empty'}`}
                slot={slot}
                player={player}
                isBench={true}
                isDragSource={isDragSource}
                isDropTarget={isDropTarget}
                onPointerDownSlot={onPointerDownSlot}
                onRemove={() => onSlotRemove('bench', slot.id)}
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

      {/* Row 2: 2 Players (with comfortable vertical space for row 1 name labels) */}
      <div className="flex items-center justify-center gap-4 sm:gap-5 w-full mt-10 sm:mt-11">
        {bottomRow.map((slot) => {
          const player = benchPlayers[slot.id] || null;
          const isDragSource = dragSourceSlot?.type === 'bench' && dragSourceSlot?.index === slot.id;
          const isDropTarget = dropTargetSlot?.type === 'bench' && dropTargetSlot?.index === slot.id;

          return (
            <div key={slot.id} className="relative flex flex-col items-center">
              <PlayerSlot
                key={`${slot.id}-${player?.name || 'empty'}`}
                slot={slot}
                player={player}
                isBench={true}
                isDragSource={isDragSource}
                isDropTarget={isDropTarget}
                onPointerDownSlot={onPointerDownSlot}
                onRemove={() => onSlotRemove('bench', slot.id)}
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
