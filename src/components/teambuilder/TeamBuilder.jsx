import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Trash2,
  Trophy,
  Sparkles,
  Zap,
  Info,
  ChevronDown,
  Flame,
  Wind,
  Mountain,
  Trees,
  Save,
  Settings,
  LayoutGrid,
  FolderOpen,
  Download,
  Upload,
  QrCode,
  ScanLine,
} from 'lucide-react';
import SoccerPitch from './SoccerPitch';
import BenchSection from './BenchSection';
import SaveTeamModal from './SaveTeamModal';
import PlayerHoverCard from './PlayerHoverCard';
import TeamQrModal from './TeamQrModal';
import TeamQrScannerModal from './TeamQrScannerModal';
import TeamBuilderSettingsModal, {
  getTeamBuilderSettings,
  DEFAULT_TEAMBUILDER_SETTINGS,
} from './TeamBuilderSettingsModal';
import { FORMATIONS } from './formations';
import { getPlayerSpriteUrl } from '../../utils/spriteUtils';
import { getCardBackgroundStyle, getElementRadialAura } from '../../utils/cardBackgrounds';
import { ELEMENTS } from '../../constants/elements';
import { POSITIONS } from '../../constants/positions';
import { calculateOverall } from '../../utils/statsUtils';
import {
  getSavedTeams,
  saveTeamToStorage,
  deleteTeamFromStorage,
  getActiveTeamId,
  setActiveTeamId,
  downloadTeamsBackup,
  importTeamsFromJson,
} from '../../utils/teamStorage';

const ELEMENT_ICONS = {
  Fire: Flame,
  Wind: Wind,
  Earth: Mountain,
  Wood: Trees,
  Neutral: Sparkles,
};

const ROLE_BADGES_SOLID = {
  GK: 'bg-black text-amber-300 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
  DF: 'bg-black text-blue-300 border-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]',
  MF: 'bg-black text-emerald-300 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
  FW: 'bg-black text-red-300 border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]',
  SUB: 'bg-black text-purple-300 border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.5)]',
};

// Reusable card view for the floating drag follower
function FloatingCardView({ player, settings, tilt = 0, isWeighted = true }) {
  const elem = player ? ELEMENTS[player.element] || ELEMENTS.Neutral : null;
  const ElemIcon = player ? ELEMENT_ICONS[player.element] || Sparkles : null;
  const roleBadge = player ? (ROLE_BADGES_SOLID[player.position] || ROLE_BADGES_SOLID.MF) : null;
  const slotSize = settings?.slotSize || 64;
  const badgeSize = settings?.badgeSize || 20;
  const cardBg = getCardBackgroundStyle(settings?.cardBackground || 'dark', player?.element);
  const ovr = player ? calculateOverall(player, isWeighted) : 75;

  return (
    <div
      style={
        cardBg.isNone
          ? {
              width: `${slotSize}px`,
              height: `${slotSize}px`,
              border: 'none',
              background: 'transparent',
              boxShadow: 'none',
              transform: `rotate(${tilt}deg)`,
            }
          : {
              width: `${slotSize}px`,
              height: `${slotSize}px`,
              borderColor: cardBg.borderColor || elem?.color || '#f59e0b',
              transform: `rotate(${tilt}deg)`,
            }
      }
      className={`relative flex items-center justify-center select-none ${
        cardBg.isNone ? 'bg-transparent border-0 ring-0 shadow-none' : `rounded-2xl border-2 ${cardBg.containerClass}`
      }`}
    >
      <div
        className={`w-full h-full flex items-center justify-center relative ${
          cardBg.isNone ? 'overflow-visible' : 'rounded-[14px] overflow-hidden'
        }`}
      >
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
          className="w-full h-full object-contain [image-rendering:pixelated] pointer-events-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.85)] relative z-10"
        />
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

      {/* Bottom-Right: Natural Role Badge (overlapping corner) */}
      {settings?.showRoleBadge !== false && (
        <div
          style={{
            minWidth: `${badgeSize}px`,
            height: `${badgeSize}px`,
            fontSize: `${Math.max(8, Math.round(badgeSize * 0.44))}px`,
          }}
          className={`absolute -bottom-1.5 -right-1.5 z-20 px-1 rounded-md border flex items-center justify-center shadow-md font-mono font-black pointer-events-none ${roleBadge}`}
        >
          {player.position}
        </div>
      )}

      {/* Bottom-Left: Element Icon with Solid Dark Backing (overlapping corner) */}
      {settings?.showElementBadge !== false && (
        <div
          style={{
            width: `${badgeSize}px`,
            height: `${badgeSize}px`,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            borderColor: elem?.color || '#94a3b8',
            color: elem?.color || '#94a3b8',
          }}
          className="absolute -bottom-1.5 -left-1.5 z-20 rounded-full flex items-center justify-center border shadow-md pointer-events-none"
        >
          {ElemIcon && (
            <ElemIcon
              size={Math.max(9, Math.round(badgeSize * 0.58))}
              strokeWidth={2.5}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function TeamBuilder({
  fieldPlayers = {},
  benchPlayers = {},
  selectedFormationId = 'f-base-442',
  onSelectFormation,
  onSlotClick,
  onSlotRemove,
  onSwap,
  onClearTeam,
  onLoadTeam,
  isWeighted = true,
  allPlayers = [],
}) {
  const currentFormation = useMemo(() => {
    return (
      FORMATIONS.find((f) => f.id === selectedFormationId) || FORMATIONS[0]
    );
  }, [selectedFormationId]);

  // Saved Teams state
  const [savedTeams, setSavedTeams] = useState(() => getSavedTeams());
  const [activeTeamId, setActiveTeamIdState] = useState(() => getActiveTeamId());
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // Settings state (pitch stretch, slot size, badge size, etc.)
  const [settings, setSettings] = useState(() => getTeamBuilderSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // QR Code Modals state (generation & webcam scanner)
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);

  const handleTeamScanned = (scannedTeam) => {
    if (!scannedTeam) return;
    if (onSelectFormation && scannedTeam.formationId) {
      onSelectFormation(scannedTeam.formationId);
    }
    if (onLoadTeam) {
      onLoadTeam(scannedTeam);
    }
  };

  const currentSavedTeam = useMemo(() => {
    return savedTeams.find((t) => t.id === activeTeamId) || null;
  }, [savedTeams, activeTeamId]);

  const handleSelectTeamFromDropdown = (val) => {
    if (val === 'NEW') {
      if (onClearTeam) onClearTeam();
      setActiveTeamIdState(null);
      setActiveTeamId(null);
      return;
    }
    if (!val) return;
    const team = savedTeams.find((t) => t.id === val);
    if (team) {
      setActiveTeamIdState(team.id);
      setActiveTeamId(team.id);
      if (onLoadTeam) {
        onLoadTeam(team);
      }
    }
  };

  const handleSaveTeamConfirmed = ({ id, name }) => {
    const result = saveTeamToStorage({
      id: id || activeTeamId,
      name,
      formationId: selectedFormationId,
      fieldPlayers,
      benchPlayers,
    });
    if (result.success) {
      setSavedTeams(result.teams);
      setActiveTeamIdState(result.team.id);
    }
  };

  const handleDeleteSavedTeam = () => {
    if (!currentSavedTeam) return;
    if (
      window.confirm(
        `Vuoi davvero eliminare definitivamente la squadra "${currentSavedTeam.name}"?`
      )
    ) {
      const result = deleteTeamFromStorage(currentSavedTeam.id);
      if (result.success) {
        setSavedTeams(result.teams);
        setActiveTeamIdState(null);
      }
    }
  };

  const importInputRef = useRef(null);

  const handleExportTeams = () => {
    const res = downloadTeamsBackup();
    if (!res.success) {
      alert(res.error);
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        const res = importTeamsFromJson(text);
        if (res.success) {
          setSavedTeams(res.teams);
          alert(`Importate con successo ${res.count} squadre!`);
        } else {
          alert(res.error);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Pointer-based Drag & Drop state
  const [activeDrag, setActiveDrag] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const dragStateRef = useRef(null);

  // Ctrl Key tracking for fast removal with hover preview
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);

  // Hover Player Popover Card state (with debounced entry and instant dismissal)
  const [hoveredCardInfo, setHoveredCardInfo] = useState(null);
  const hoverTimeoutRef = useRef(null);

  const handleSlotHover = useCallback((slot, isBench, player, rect) => {
    if (isCtrlPressed || dragStateRef.current?.isDragging || dragStateRef.current?.isPointerDown) {
      setHoveredCardInfo(null);
      return;
    }
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCardInfo({ player, targetRect: rect, isBench });
    }, 140);
  }, [isCtrlPressed]);

  const handleSlotLeave = useCallback(() => {
    clearTimeout(hoverTimeoutRef.current);
    setHoveredCardInfo(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Control' || e.ctrlKey) {
        setIsCtrlPressed(true);
        clearTimeout(hoverTimeoutRef.current);
        setHoveredCardInfo(null);
      }
    };
    const handleKeyUp = (e) => {
      if (e.key === 'Control' || !e.ctrlKey) {
        setIsCtrlPressed(false);
      }
    };
    const handleBlur = () => {
      setIsCtrlPressed(false);
      clearTimeout(hoverTimeoutRef.current);
      setHoveredCardInfo(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  const handlePointerDownSlot = (e, slot, isBench, player) => {
    if (e.button !== 0) return;

    // Immediately dismiss hover card on click / drag start
    clearTimeout(hoverTimeoutRef.current);
    setHoveredCardInfo(null);

    // If holding Ctrl: remove player immediately on click without starting drag or opening modal
    if (e.ctrlKey || isCtrlPressed) {
      if (player) {
        if (onSlotRemove) {
          onSlotRemove(isBench ? 'bench' : 'field', slot.id);
        }
      }
      // If empty slot, do nothing
      return;
    }

    dragStateRef.current = {
      isPointerDown: true,
      isDragging: false,
      player,
      source: { type: isBench ? 'bench' : 'field', index: slot.id },
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
    };
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      const state = dragStateRef.current;
      if (!state || !state.isPointerDown) return;

      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;

      if (!state.isDragging && Math.hypot(dx, dy) > 5) {
        if (state.player) {
          state.isDragging = true;
          document.body.style.cursor = 'none';
          clearTimeout(hoverTimeoutRef.current);
          setHoveredCardInfo(null);
        }
      }

      if (state.isDragging && state.player) {
        const deltaX = e.clientX - state.lastX;
        state.lastX = e.clientX;
        state.lastY = e.clientY;
        const targetTilt = Math.max(-14, Math.min(14, deltaX * 1.5));

        setActiveDrag({
          player: state.player,
          source: state.source,
          x: e.clientX,
          y: e.clientY,
          tilt: targetTilt,
        });

        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        let foundTarget = null;
        for (const el of elements) {
          const type = el.getAttribute('data-slot-type');
          const idStr = el.getAttribute('data-slot-id');
          if (type && idStr !== null) {
            foundTarget = { type, index: Number(idStr) };
            break;
          }
        }
        setDropTarget(foundTarget);
      }
    };

    const handlePointerUp = (e) => {
      const state = dragStateRef.current;
      if (!state || !state.isPointerDown) return;

      document.body.style.cursor = '';
      clearTimeout(hoverTimeoutRef.current);
      setHoveredCardInfo(null);

      if (state.isDragging && state.player) {
        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        let foundTarget = null;
        for (const el of elements) {
          const type = el.getAttribute('data-slot-type');
          const idStr = el.getAttribute('data-slot-id');
          if (type && idStr !== null) {
            foundTarget = { type, index: Number(idStr) };
            break;
          }
        }

        if (
          foundTarget &&
          !(
            foundTarget.type === state.source.type &&
            foundTarget.index === state.source.index
          )
        ) {
          if (onSwap) {
            onSwap(state.source, foundTarget);
          }
        }
      } else {
        if (!e.ctrlKey && !isCtrlPressed && onSlotClick) {
          onSlotClick(state.source.type, state.source.index);
        }
      }

      dragStateRef.current = null;
      setActiveDrag(null);
      setDropTarget(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      document.body.style.cursor = '';
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [onSwap, onSlotClick, isCtrlPressed]);

  // Compute team overall metrics
  const teamMetrics = useMemo(() => {
    const starters = Object.values(fieldPlayers).filter(Boolean);
    const reserves = Object.values(benchPlayers).filter(Boolean);

    if (starters.length === 0) {
      return {
        avgOvr: 0,
        totalFP: 0,
        totalTP: 0,
        startersCount: 0,
        reservesCount: reserves.length,
      };
    }

    const totalOvr = starters.reduce((acc, p) => acc + (p.ovr || 70), 0);
    const totalFP = starters.reduce((acc, p) => acc + (p.stats?.fp || 0), 0);
    const totalTP = starters.reduce((acc, p) => acc + (p.stats?.tp || 0), 0);

    return {
      avgOvr: Math.round(totalOvr / starters.length),
      totalFP,
      totalTP,
      startersCount: starters.length,
      reservesCount: reserves.length,
    };
  }, [fieldPlayers, benchPlayers]);

  const formationRoleCounts = useMemo(() => {
    const counts = { GK: 0, DF: 0, MF: 0, FW: 0 };
    currentFormation.slots.forEach((s) => {
      if (counts[s.role] !== undefined) counts[s.role]++;
    });
    return counts;
  }, [currentFormation]);

  return (
    <div className="w-full mt-10 mb-8 border-t border-slate-800/90 pt-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Main Header & Metrics Box */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-md mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Title & Badge */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/25">
                <Shield size={22} strokeWidth={2.5} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase font-display">
                    Inazuma Team Builder
                  </h2>
                  {currentSavedTeam && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold flex items-center gap-1">
                      <FolderOpen size={11} />
                      <span>{currentSavedTeam.name}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Costruisci la tua squadra dei sogni, seleziona lo schema e organizza i titolari e le riserve.
                </p>
              </div>
            </div>

            {/* Quick Metrics & Settings Gear Icon */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* OVR Media */}
                <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2">
                  <Trophy size={14} className="text-amber-400" />
                  <div className="leading-none">
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">OVR Media</span>
                    <span className="text-sm font-black font-mono text-amber-300">
                      {teamMetrics.avgOvr > 0 ? teamMetrics.avgOvr : '--'}
                    </span>
                  </div>
                </div>

                {/* Titolari */}
                <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2">
                  <Shield size={14} className="text-emerald-400" />
                  <div className="leading-none">
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">Titolari</span>
                    <span className="text-sm font-black font-mono text-emerald-300">
                      {teamMetrics.startersCount} / 11
                    </span>
                  </div>
                </div>

                {/* PT Totali */}
                <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2">
                  <Zap size={14} className="text-cyan-400" />
                  <div className="leading-none">
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">PT Totali</span>
                    <span className="text-sm font-black font-mono text-cyan-300">
                      {teamMetrics.totalTP > 0 ? teamMetrics.totalTP : '--'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Settings Gear Button */}
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700 transition-all shadow cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title="Impostazioni dimensioni campo e slot"
              >
                <Settings size={16} />
                <span className="hidden sm:inline">Impostazioni</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3-Column Ergonomic Layout (Left: Modulo, Center: Campo, Right: Panchina + Squadre) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Modulo & Tattica (Col span 3) */}
          {/* ========================================================= */}
          <div className="lg:col-span-3 space-y-4">
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-3 text-slate-200 font-bold text-xs uppercase tracking-wider font-display">
                <LayoutGrid size={16} className="text-emerald-400" />
                <span>Schema Tattico</span>
              </div>

              {/* Formation Selector Dropdown */}
              <div className="relative mb-3">
                <select
                  value={selectedFormationId}
                  onChange={(e) => onSelectFormation(e.target.value)}
                  className="w-full appearance-none bg-slate-950 text-emerald-300 font-bold text-sm px-3.5 py-2.5 pr-9 rounded-xl border border-emerald-500/40 hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer shadow-lg transition-all"
                >
                  {FORMATIONS.map((form) => (
                    <option key={form.id} value={form.id} className="bg-slate-900 text-white font-medium py-1">
                      {form.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none"
                />
              </div>

              {/* Formation Description */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/90 mb-3 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                  <Info size={13} />
                  <span>{currentFormation.name}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {currentFormation.description}
                </p>
              </div>

              {/* Roles Breakdown */}
              <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[9px] text-amber-400 block font-bold">GK</span>
                  <span className="text-xs font-black text-amber-300">{formationRoleCounts.GK}</span>
                </div>
                <div className="p-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <span className="text-[9px] text-blue-400 block font-bold">DF</span>
                  <span className="text-xs font-black text-blue-300">{formationRoleCounts.DF}</span>
                </div>
                <div className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[9px] text-emerald-400 block font-bold">MF</span>
                  <span className="text-xs font-black text-emerald-300">{formationRoleCounts.MF}</span>
                </div>
                <div className="p-1.5 rounded-xl bg-red-500/10 border border-red-500/20">
                  <span className="text-[9px] text-red-400 block font-bold">FW</span>
                  <span className="text-xs font-black text-red-300">{formationRoleCounts.FW}</span>
                </div>
              </div>

              {/* Clear Team Action */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClearTeam}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800/70 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Svuota Campo e Panchina</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* CENTER COLUMN: Campo da Calcio Tattico (Col span 6) */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 flex justify-center w-full">
            <SoccerPitch
              formation={currentFormation}
              fieldPlayers={fieldPlayers}
              dragSourceSlot={activeDrag?.source}
              dropTargetSlot={dropTarget}
              onPointerDownSlot={handlePointerDownSlot}
              onSlotRemove={onSlotRemove}
              onSlotHover={handleSlotHover}
              onSlotLeave={handleSlotLeave}
              settings={settings}
              isCtrlPressed={isCtrlPressed}
              isWeighted={isWeighted}
            />
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Panchina + Gestione Squadre (Col span 3) */}
          {/* ========================================================= */}
          <div className="lg:col-span-3 space-y-4">
            {/* Top Box: 5-Man Bench (3 Top, 2 Bottom) */}
            <BenchSection
              benchPlayers={benchPlayers}
              dragSourceSlot={activeDrag?.source}
              dropTargetSlot={dropTarget}
              onPointerDownSlot={handlePointerDownSlot}
              onSlotRemove={onSlotRemove}
              onSlotHover={handleSlotHover}
              onSlotLeave={handleSlotLeave}
              settings={settings}
              isCtrlPressed={isCtrlPressed}
              isWeighted={isWeighted}
            />

            {/* Bottom Box: Gestione Squadre Salvate */}
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 text-slate-200 font-bold text-xs uppercase tracking-wider font-display">
                <div className="flex items-center gap-2">
                  <FolderOpen size={16} className="text-amber-400" />
                  <span>Squadre Salvate</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  {savedTeams.length}
                </span>
              </div>

              {/* Saved Teams Dropdown */}
              <div className="relative mb-3">
                <select
                  value={activeTeamId || ''}
                  onChange={(e) => handleSelectTeamFromDropdown(e.target.value)}
                  className="w-full appearance-none bg-slate-950 text-amber-300 font-bold text-xs sm:text-sm px-3.5 py-2.5 pr-8 rounded-xl border border-amber-500/40 hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer shadow-lg transition-all truncate"
                >
                  <option value="" className="bg-slate-900 text-slate-400 font-medium">
                    {savedTeams.length > 0 ? '-- Carica Squadra --' : '-- Nessuna Squadra --'}
                  </option>
                  <option value="NEW" className="bg-slate-900 text-emerald-400 font-bold">
                    + Nuova Squadra (Vuota)
                  </option>
                  {savedTeams.map((t) => (
                    <option key={t.id} value={t.id} className="bg-slate-900 text-white font-medium">
                      {t.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {/* Save / Update Button */}
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                  title={currentSavedTeam ? `Aggiorna o rinomina "${currentSavedTeam.name}"` : 'Salva squadra con nome'}
                >
                  <Save size={14} strokeWidth={2.5} />
                  <span>{currentSavedTeam ? 'Salva Modifiche' : 'Salva Squadra'}</span>
                </button>

                {/* Delete Saved Team Button */}
                {currentSavedTeam && (
                  <button
                    type="button"
                    onClick={handleDeleteSavedTeam}
                    className="w-full py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    title={`Elimina definitivamente la squadra salvata "${currentSavedTeam.name}"`}
                  >
                    <Trash2 size={13} />
                    <span>Elimina Squadra</span>
                  </button>
                )}

                {/* Export, Import & QR Code Tools */}
                <div className="pt-2.5 border-t border-slate-800/80 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsQrModalOpen(true)}
                      className="py-2 px-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:border-amber-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                      title="Genera il QR Code della formazione corrente per condividerla"
                    >
                      <QrCode size={14} className="text-amber-400" />
                      <span>Genera QR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsScannerModalOpen(true)}
                      className="py-2 px-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                      title="Inquadra con la webcam un QR Code per caricare la squadra"
                    >
                      <ScanLine size={14} className="text-cyan-400" />
                      <span>Leggi QR</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleExportTeams}
                      className="py-1.5 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                      title="Esporta tutte le squadre salvate in un file JSON"
                    >
                      <Download size={13} className="text-slate-400" />
                      <span>Esporta JSON</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => importInputRef.current?.click()}
                      className="py-1.5 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                      title="Importa squadre salvate da un file JSON"
                    >
                      <Upload size={13} className="text-slate-400" />
                      <span>Importa JSON</span>
                    </button>
                  </div>

                  <input
                    type="file"
                    ref={importInputRef}
                    accept=".json"
                    className="hidden"
                    onChange={handleImportFile}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Player Info Popover Card with Mini Radar Chart and Moves */}
      {!activeDrag && !isCtrlPressed && hoveredCardInfo && (
        <PlayerHoverCard
          player={hoveredCardInfo.player}
          targetRect={hoveredCardInfo.targetRect}
          settings={settings}
          isWeighted={isWeighted}
          isBench={hoveredCardInfo.isBench}
        />
      )}

      {/* Floating 100% Opaque Balatro Card Follower during Pointer Drag */}
      {activeDrag && (
        <div
          className="fixed pointer-events-none z-[99999]"
          style={{
            left: activeDrag.x,
            top: activeDrag.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <FloatingCardView
            player={activeDrag.player}
            settings={settings}
            tilt={activeDrag.tilt || 0}
            isWeighted={isWeighted}
          />
        </div>
      )}

      {/* Save / Edit Team Modal Dialog */}
      <SaveTeamModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveTeamConfirmed}
        currentTeam={currentSavedTeam}
      />

      {/* Settings Modal Dialog */}
      <TeamBuilderSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onChangeSettings={setSettings}
        onResetSettings={() => setSettings(DEFAULT_TEAMBUILDER_SETTINGS)}
      />

      {/* QR Code Generator Modal Dialog */}
      <TeamQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        teamData={{
          name: currentSavedTeam ? currentSavedTeam.name : 'Squadra Inazuma',
          formationId: selectedFormationId,
          fieldPlayers,
          benchPlayers,
        }}
        formationName={currentFormation?.name || '4-4-2'}
      />

      {/* QR Code Scanner Webcam Modal Dialog */}
      <TeamQrScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onTeamScanned={handleTeamScanned}
        allPlayers={allPlayers}
      />
    </div>
  );
}
