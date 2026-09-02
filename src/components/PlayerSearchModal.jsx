import React, { useState, useMemo, useEffect, useRef, useDeferredValue } from 'react';
import { Search, X, ArrowUpDown, Check, Trophy, Sparkles, Zap, RotateCcw, Plus, Minus } from 'lucide-react';
import { POSITION_LIST, POSITIONS } from '../constants/positions';
import { ELEMENT_LIST, ELEMENTS } from '../constants/elements';
import { calculateOverall, getPlayerTier, calculateTotalStats } from '../utils/statsUtils';
import ElementBadge from './ElementBadge';
import PositionBadge from './PositionBadge';
import PlayerAvatar from './PlayerAvatar';
import PlayerHoverCard from './teambuilder/PlayerHoverCard';

export default function PlayerSearchModal({
  isOpen,
  onClose,
  onSelectPlayer,
  targetSlot = 1,
  currentPlayer,
  otherPlayer,
  allPlayers = [],
  uniqueTeams = [],
  isWeighted = true,
  excludedPlayerNames,
  settings,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedElement, setSelectedElement] = useState('ALL');
  const [selectedTeam, setSelectedTeam] = useState('ALL');
  const [selectedRecruited, setSelectedRecruited] = useState('ALL'); // 'ALL' | 'RECRUITED' | 'UNRECRUITED'
  const [sortBy, setSortBy] = useState('ovr'); // 'ovr' | 'name' | 'kick' | 'guard' | 'speed' | 'tp'
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' | 'asc'
  const [displayCount, setDisplayCount] = useState(60);

  // Persistent recruited players in localStorage
  const RECRUITED_STORAGE_KEY = 'ie1_recruited_players';
  const [recruitedPlayers, setRecruitedPlayers] = useState(() => {
    try {
      const saved = localStorage.getItem(RECRUITED_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const toggleRecruited = (playerName) => {
    setRecruitedPlayers((prev) => {
      const next = { ...prev };
      if (next[playerName]) {
        delete next[playerName];
      } else {
        next[playerName] = true;
      }
      try {
        localStorage.setItem(RECRUITED_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Error saving recruited players to localStorage:', e);
      }
      return next;
    });
  };

  // Persistent player counters in localStorage
  const COUNTER_STORAGE_KEY = 'ie1_player_counters';
  const [playerCounters, setPlayerCounters] = useState(() => {
    try {
      const saved = localStorage.getItem(COUNTER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const updatePlayerCounter = (playerName, delta) => {
    setPlayerCounters((prev) => {
      const current = prev[playerName] || 0;
      const nextVal = Math.max(0, current + delta);
      const next = { ...prev };
      if (nextVal === 0) {
        delete next[playerName];
      } else {
        next[playerName] = nextVal;
      }
      try {
        localStorage.setItem(COUNTER_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Error saving player counters to localStorage:', e);
      }
      return next;
    });
  };

  const inputRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Hover Player Card state (with debounced entry and instant dismissal)
  const [hoveredCardInfo, setHoveredCardInfo] = useState(null);
  const hoverTimeoutRef = useRef(null);

  const handleCardHover = (player, rect) => {
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCardInfo({ player, targetRect: rect });
    }, 140);
  };

  const handleCardLeave = () => {
    clearTimeout(hoverTimeoutRef.current);
    setHoveredCardInfo(null);
  };

  // Focus input and reset scroll on open
  useEffect(() => {
    if (isOpen) {
      setDisplayCount(60);
      if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchTerm('');
      handleCardLeave();
    }
  }, [isOpen]);

  // Reset display count on filter changes
  useEffect(() => {
    setDisplayCount(60);
    handleCardLeave();
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
  }, [deferredSearchTerm, selectedRole, selectedElement, selectedTeam, selectedRecruited, sortBy, sortOrder]);

  // Infinite scroll load more handler
  const handleScroll = (e) => {
    handleCardLeave();
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 300) {
      setDisplayCount((prev) => Math.min(prev + 48, totalCount));
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Disable background body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Filter and Sort players with grouping by team and move - highly optimized for instantaneous 60fps search
  const { directPlayers, teamGroups, moveGroups, totalCount, isGrouped } = useMemo(() => {
    const term = deferredSearchTerm.trim().toLowerCase();

    // 1. Single pass base filtering
    const baseFiltered = [];
    for (let i = 0; i < allPlayers.length; i++) {
      const p = allPlayers[i];
      if (selectedRole !== 'ALL' && p.position !== selectedRole) continue;
      if (selectedElement !== 'ALL' && p.element !== selectedElement) continue;
      if (selectedTeam !== 'ALL' && p.team !== selectedTeam) continue;
      if (selectedRecruited === 'RECRUITED' && !recruitedPlayers[p.name]) continue;
      if (selectedRecruited === 'UNRECRUITED' && recruitedPlayers[p.name]) continue;
      if (excludedPlayerNames && excludedPlayerNames.has(p.name)) continue;

      baseFiltered.push({
        ...p,
        ovr: isWeighted ? (p.ovrWeighted ?? p.ovr ?? 50) : (p.ovrPure ?? p.ovr ?? 50),
      });
    }

    const sortFn = (a, b) => {
      let valA, valB;
      switch (sortBy) {
        case 'name':
          return sortOrder === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case 'total':
          valA = a.totalStats ?? 0;
          valB = b.totalStats ?? 0;
          break;
        case 'kick':
          valA = a.stats.kick || 0;
          valB = b.stats.kick || 0;
          break;
        case 'body':
          valA = a.stats.body || 0;
          valB = b.stats.body || 0;
          break;
        case 'control':
          valA = a.stats.control || 0;
          valB = b.stats.control || 0;
          break;
        case 'guard':
          valA = a.stats.guard || 0;
          valB = b.stats.guard || 0;
          break;
        case 'speed':
          valA = a.stats.speed || 0;
          valB = b.stats.speed || 0;
          break;
        case 'stamina':
          valA = a.stats.stamina || 0;
          valB = b.stats.stamina || 0;
          break;
        case 'guts':
          valA = a.stats.guts || 0;
          valB = b.stats.guts || 0;
          break;
        case 'fp':
          valA = a.stats.fp || 0;
          valB = b.stats.fp || 0;
          break;
        case 'tp':
          valA = a.stats.tp || 0;
          valB = b.stats.tp || 0;
          break;
        case 'freedom':
          valA = a.stats.freedom || 0;
          valB = b.stats.freedom || 0;
          break;
        case 'counter':
          valA = playerCounters[a.name] || 0;
          valB = playerCounters[b.name] || 0;
          break;
        case 'ovr':
        default:
          valA = a.ovr;
          valB = b.ovr;
          break;
      }

      return sortOrder === 'asc' ? valA - valB : valB - valA;
    };

    if (!term) {
      baseFiltered.sort(sortFn);
      return {
        directPlayers: baseFiltered,
        teamGroups: [],
        moveGroups: [],
        totalCount: baseFiltered.length,
        isGrouped: false,
      };
    }

    // When a search term is present:
    const nameMatches = [];
    const teamGroupsMap = new Map(); // teamName => player[]
    const moveGroupsMap = new Map(); // moveName => player[]
    const allUniquePlayerIds = new Set();

    // 1. Strict Name matches
    for (let i = 0; i < baseFiltered.length; i++) {
      const p = baseFiltered[i];
      if (p.name.toLowerCase().includes(term)) {
        nameMatches.push(p);
        allUniquePlayerIds.add(p.id);
      }
    }

    // 2. Team matches (all players belonging to a matching team)
    for (let i = 0; i < baseFiltered.length; i++) {
      const p = baseFiltered[i];
      if (p.team.toLowerCase().includes(term)) {
        let list = teamGroupsMap.get(p.team);
        if (!list) {
          list = [];
          teamGroupsMap.set(p.team, list);
        }
        list.push(p);
        allUniquePlayerIds.add(p.id);
      }
    }

    // 3. Move matches (all players learning a matching move, term >= 2 chars)
    if (term.length >= 2) {
      for (let i = 0; i < baseFiltered.length; i++) {
        const p = baseFiltered[i];
        if (p.moves) {
          for (let j = 0; j < p.moves.length; j++) {
            const m = p.moves[j];
            if (m && m.toLowerCase().includes(term)) {
              let list = moveGroupsMap.get(m);
              if (!list) {
                list = [];
                moveGroupsMap.set(m, list);
              }
              list.push(p);
              allUniquePlayerIds.add(p.id);
            }
          }
        }
      }
    }

    // Sort name matches with name prefix priority
    nameMatches.sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(term);
      const bStarts = b.name.toLowerCase().startsWith(term);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return sortFn(a, b);
    });

    const teamGroupsList = [];
    teamGroupsMap.forEach((players, teamName) => {
      players.sort(sortFn);
      teamGroupsList.push({ teamName, players });
    });
    teamGroupsList.sort((a, b) => b.players.length - a.players.length);

    const moveGroupsList = [];
    moveGroupsMap.forEach((players, moveName) => {
      players.sort(sortFn);
      moveGroupsList.push({ moveName, players });
    });
    moveGroupsList.sort((a, b) => b.players.length - a.players.length);

    const isGrouped = teamGroupsList.length > 0 || moveGroupsList.length > 0;

    return {
      directPlayers: nameMatches,
      teamGroups: teamGroupsList,
      moveGroups: moveGroupsList,
      totalCount: allUniquePlayerIds.size,
      isGrouped,
    };
  }, [allPlayers, deferredSearchTerm, selectedRole, selectedElement, selectedTeam, selectedRecruited, excludedPlayerNames, isWeighted, sortBy, sortOrder, recruitedPlayers, playerCounters]);

  // Helper to render individual player cards cleanly (without the inner move label)
  const renderPlayerCard = (player, keyPrefix = 'direct') => {
    const isCurrentSelected = currentPlayer?.name === player.name;
    const isOtherSelected = otherPlayer?.name === player.name;
    const isRecruited = !!recruitedPlayers[player.name];
    const tier = getPlayerTier(player.ovr);
    const count = playerCounters[player.name] || 0;
    const showCounters = settings?.showPlayerCounters !== false;

    return (
      <div
        key={`${keyPrefix}-${player.id}`}
        onMouseEnter={(e) => handleCardHover(player, e.currentTarget.getBoundingClientRect())}
        onMouseLeave={handleCardLeave}
        onClick={() => {
          handleCardLeave();
          onSelectPlayer(player);
          onClose();
        }}
        className={`p-2.5 sm:p-3 rounded-xl cursor-pointer border transition-all duration-150 flex items-center justify-between gap-2 select-none relative ${
          isCurrentSelected
            ? 'bg-slate-900 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-500'
            : isOtherSelected
            ? 'bg-slate-900/60 border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700'
            : isRecruited
            ? 'bg-slate-950 border-emerald-500/40 hover:border-emerald-500/80 hover:shadow-lg'
            : 'bg-slate-950 hover:bg-slate-800/80 border-slate-800 hover:border-slate-600 hover:shadow-lg'
        }`}
      >
        {/* Recruitment Status Checkmark Pin (Top-Right Corner Overlay) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleRecruited(player.name);
          }}
          title={isRecruited ? "Giocatore già ingaggiato nel gioco (clicca per deselezionare)" : "Clicca per segnare come già ingaggiato nel gioco"}
          className={`absolute -top-1.5 -right-1.5 z-20 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-150 ${
            isRecruited
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/40 ring-2 ring-slate-900 scale-105'
              : isCurrentSelected
              ? 'bg-slate-900 border border-slate-600 text-transparent hover:text-emerald-400 hover:border-emerald-500/80 hover:bg-slate-800 ring-2 ring-slate-900'
              : 'bg-slate-900 border border-slate-700 text-transparent hover:text-emerald-400 hover:border-emerald-500/80 hover:bg-slate-800 ring-2 ring-slate-900'
          }`}
        >
          <Check size={11} strokeWidth={3.5} className={isRecruited ? 'opacity-100' : 'opacity-0 hover:opacity-100'} />
        </button>

        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Avatar Badge with Sprite */}
          <PlayerAvatar player={player} size="sm" showPosition={false} />

          {/* Name, Team & Badges */}
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs sm:text-sm text-white truncate leading-tight" title={player.name}>
              {player.name}
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">{player.team}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <PositionBadge position={player.position} size="sm" />
              <ElementBadge element={player.element} size="sm" showLabel={false} />

              {/* Counter Widget (- [N] +) with Persistent Memory */}
              {showCounters && (
                <div
                  className="flex items-center bg-slate-900/95 border border-slate-700/80 hover:border-slate-600 rounded-md p-0.5 shadow-sm ml-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updatePlayerCounter(player.name, -1);
                    }}
                    title="Diminuisci contatore"
                    className="w-4 h-4 rounded flex items-center justify-center bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer active:scale-90"
                  >
                    <Minus size={9} strokeWidth={2.5} />
                  </button>
                  <span
                    className={`min-w-[16px] text-center font-mono font-bold text-[11px] px-1 select-none ${
                      count > 0 ? 'text-amber-300 font-extrabold' : 'text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updatePlayerCounter(player.name, 1);
                    }}
                    title="Aumenta contatore"
                    className="w-4 h-4 rounded flex items-center justify-center bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer active:scale-90"
                  >
                    <Plus size={9} strokeWidth={2.5} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* OVR, Tier & In Uso */}
        <div className="text-right shrink-0 flex flex-col items-end justify-center pr-1">
          <div className="flex items-baseline gap-0.5">
            <span className="text-[9px] font-mono text-slate-500 uppercase">OVR</span>
            <span className="font-mono font-black text-base text-amber-300">{player.ovr}</span>
          </div>
          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border mt-0.5 ${tier.color}`}>
            TIER {tier.label}
          </span>
          {isCurrentSelected && (
            <span className="text-[9px] font-bold text-amber-400 flex items-center gap-0.5 mt-0.5">
              <Check size={10} /> In Uso
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden transition-all duration-200 ${
        isOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
      }`}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-200"
      />

      {/* Modal Window */}
      <div
        className={`relative w-full max-w-5xl h-[88vh] max-h-[850px] bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10 transition-all duration-200 ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-2'
        }`}
      >
          {/* Modal Top Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold font-display text-lg">
                {typeof targetSlot === 'object' && targetSlot !== null
                  ? (targetSlot.type === 'field' ? `T${targetSlot.index + 1}` : `R${targetSlot.index + 1}`)
                  : `P${targetSlot}`}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  {typeof targetSlot === 'object' && targetSlot !== null
                    ? (targetSlot.type === 'field' ? `Seleziona Titolare #${targetSlot.index + 1}` : `Seleziona Riserva #${targetSlot.index + 1}`)
                    : `Seleziona Giocatore ${targetSlot}`}
                </h3>
                <p className="text-xs text-slate-400">
                  Esplora {allPlayers.length} giocatori con statistiche e tecniche speciali
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search & Filters Controls Section */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/95 space-y-3 shrink-0">
            {/* Row 1: Search Box (shortened) + Recruitment Selector + Sort Dropdown */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Box (accorciata) */}
              <div className="relative w-full sm:w-[260px] md:w-[300px] shrink-0">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cerca nome o mossa..."
                  className="w-full pl-10 pr-10 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Recruitment Filter Pills (affianco alla barra di ricerca) */}
              <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800 shrink-0">
                <button
                  onClick={() => setSelectedRecruited('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedRecruited === 'ALL'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tutti
                </button>
                <button
                  onClick={() => setSelectedRecruited('RECRUITED')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    selectedRecruited === 'RECRUITED'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                      : 'text-emerald-400 hover:text-emerald-300'
                  }`}
                  title="Mostra solo i giocatori contrassegnati come già ingaggiati"
                >
                  <Check size={12} strokeWidth={3} />
                  <span>Ingaggiati ({Object.keys(recruitedPlayers).length})</span>
                </button>
                <button
                  onClick={() => setSelectedRecruited('UNRECRUITED')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedRecruited === 'UNRECRUITED'
                      ? 'bg-slate-700 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Mostra solo i giocatori non ancora ingaggiati"
                >
                  Non ingaggiati
                </button>
              </div>

              {/* Sort Selector (a destra) */}
              <div className="flex items-center gap-2 sm:ml-auto shrink-0">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-300">
                  <ArrowUpDown size={14} className="text-amber-400" />
                  <span className="text-slate-400 hidden sm:inline">Ordina:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="ovr" className="bg-slate-900">
                      {isWeighted ? 'Overall (OVR Ruolo)' : 'Overall (OVR Puro)'}
                    </option>
                    <option value="total" className="bg-slate-900">Totale Statistiche</option>
                    <option value="kick" className="bg-slate-900">Tiro (Kick)</option>
                    <option value="body" className="bg-slate-900">Fisico (Body)</option>
                    <option value="control" className="bg-slate-900">Controllo (Control)</option>
                    <option value="guard" className="bg-slate-900">Difesa (Guard)</option>
                    <option value="speed" className="bg-slate-900">Velocità (Speed)</option>
                    <option value="stamina" className="bg-slate-900">Resistenza (Stamina)</option>
                    <option value="guts" className="bg-slate-900">Grinta (Guts)</option>
                    <option value="fp" className="bg-slate-900">Punti Fatica (FP)</option>
                    <option value="tp" className="bg-slate-900">Punti Tecnica (TP)</option>
                    <option value="freedom" className="bg-slate-900">Libertà (Freedom)</option>
                    <option value="counter" className="bg-slate-900">Contatore (-/+)</option>
                    <option value="name" className="bg-slate-900">Nome Giocatore (A-Z)</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    className="ml-1 px-1.5 py-0.5 rounded hover:bg-slate-800 text-amber-400 font-mono font-bold"
                    title={sortOrder === 'desc' ? 'Decrescente' : 'Crescente'}
                  >
                    {sortOrder === 'desc' ? '↓' : '↑'}
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: Filter Badges + Team Dropdown + Resetta Filtri */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {/* Position Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setSelectedRole('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedRole === 'ALL'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tutti Ruoli
                </button>
                {POSITION_LIST.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setSelectedRole(pos)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedRole === pos
                        ? `${POSITIONS[pos].badgeClass} shadow-md`
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>

              {/* Element Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setSelectedElement('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedElement === 'ALL'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tutti Elem.
                </button>
                {ELEMENT_LIST.map((elemKey) => {
                  const elem = ELEMENTS[elemKey];
                  return (
                    <button
                      key={elemKey}
                      onClick={() => setSelectedElement(elemKey)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        selectedElement === elemKey
                          ? `${elem.badgeClass} shadow-md`
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {elem.nameIt}
                    </button>
                  );
                })}
              </div>

              {/* Team Filter Dropdown */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs">
                <span className="text-slate-400">Squadra:</span>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer max-w-[150px] truncate"
                >
                  <option value="ALL" className="bg-slate-900">Tutte ({uniqueTeams.length})</option>
                  {uniqueTeams.map((t) => (
                    <option key={t} value={t} className="bg-slate-900">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Resetta Filtri (a destra del drop down delle squadre) */}
              {(selectedRole !== 'ALL' || selectedElement !== 'ALL' || selectedTeam !== 'ALL' || selectedRecruited !== 'ALL' || searchTerm) && (
                <button
                  onClick={() => {
                    setSelectedRole('ALL');
                    setSelectedElement('ALL');
                    setSelectedTeam('ALL');
                    setSelectedRecruited('ALL');
                    setSearchTerm('');
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors flex items-center gap-1 ml-1"
                >
                  <RotateCcw size={12} />
                  <span>Resetta Filtri</span>
                </button>
              )}
            </div>
          </div>

          {/* Results Count Bar */}
          <div className="px-5 py-2 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <span>
              Trovati <strong className="text-amber-400">{totalCount}</strong> giocatori
              {isGrouped && (
                <span className="text-slate-500 ml-1.5 font-mono text-[11px]">
                  ({directPlayers.length} per nome
                  {teamGroups.length > 0 ? `, ${teamGroups.reduce((acc, g) => acc + g.players.length, 0)} per squadra` : ''}
                  {moveGroups.length > 0 ? `, ${moveGroups.reduce((acc, g) => acc + g.players.length, 0)} per mossa` : ''})
                </span>
              )}
            </span>
            <span className="text-[11px] text-slate-500">Clicca su una scheda per selezionare</span>
          </div>

          {/* Scrollable Players List / Grid */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 p-4 sm:p-5 overflow-y-auto min-h-0"
          >
            {totalCount > 0 ? (
              <>
                {isGrouped ? (
                  <div className="space-y-6">
                    {/* Direct Matches (by Name) */}
                    {directPlayers.length > 0 && (
                      <div>
                        {(teamGroups.length > 0 || moveGroups.length > 0) && (
                          <div className="flex items-center gap-2 mb-3 px-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                            <span className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono">
                              Corrispondenza Nome ({directPlayers.length})
                            </span>
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
                          {directPlayers.slice(0, displayCount).map((player) => renderPlayerCard(player, 'name'))}
                        </div>
                        {directPlayers.length > displayCount && (
                          <div className="py-2.5 text-center">
                            <button
                              onClick={() => setDisplayCount((prev) => Math.min(prev + 60, directPlayers.length))}
                              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-amber-400 font-bold text-xs border border-slate-700 transition-all shadow-md"
                            >
                              Carica altri ({directPlayers.length - displayCount} rimanenti)
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Grouped by Team */}
                    {teamGroups.map(({ teamName, players }) => (
                      <div key={`team-${teamName}`} className="pt-2">
                        <div className="flex items-center gap-2.5 mb-3 px-3.5 py-2 rounded-xl bg-slate-950/90 border border-sky-500/30 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)] shrink-0 animate-pulse" />
                          <span className="text-xs font-black uppercase tracking-wider text-sky-400 font-mono flex items-center gap-1.5">
                            <span>SQUADRA:</span>
                            <span className="text-white underline decoration-sky-500/50 underline-offset-4">{teamName}</span>
                          </span>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800/90 text-sky-300 border border-slate-700 font-mono font-bold ml-auto">
                            {players.length} {players.length === 1 ? 'giocatore' : 'giocatori'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
                          {players.map((player) => renderPlayerCard(player, `team-${teamName}`))}
                        </div>
                      </div>
                    ))}

                    {/* Grouped by Move */}
                    {moveGroups.map(({ moveName, players }) => (
                      <div key={`move-${moveName}`} className="pt-2">
                        <div className="flex items-center gap-2.5 mb-3 px-3.5 py-2 rounded-xl bg-slate-950/90 border border-amber-500/30 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)] shrink-0 animate-pulse" />
                          <span className="text-xs font-black uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
                            <span>MOSSA:</span>
                            <span className="text-white underline decoration-amber-500/50 underline-offset-4">{moveName}</span>
                          </span>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800/90 text-amber-300 border border-slate-700 font-mono font-bold ml-auto">
                            {players.length} {players.length === 1 ? 'giocatore' : 'giocatori'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
                          {players.map((player) => renderPlayerCard(player, `move-${moveName}`))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
                      {directPlayers.slice(0, displayCount).map((player) => renderPlayerCard(player, 'flat'))}
                    </div>

                    {directPlayers.length > displayCount && (
                      <div className="py-4 text-center">
                        <button
                          onClick={() => setDisplayCount((prev) => Math.min(prev + 60, directPlayers.length))}
                          className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-amber-400 font-bold text-xs border border-slate-700 transition-all shadow-md"
                        >
                          Carica altri ({directPlayers.length - displayCount} rimanenti)
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500">
                <Search size={40} className="mb-3 opacity-30" />
                <p className="font-semibold text-slate-300">Nessun giocatore trovato</p>
                <p className="text-xs text-slate-500 mt-1">Prova a cambiare i filtri o il termine di ricerca.</p>
              </div>
            )}
          </div>
        </div>

        {/* Hover Player Info Popover Card with Mini Radar Chart and Moves */}
        {isOpen && hoveredCardInfo && (
          <PlayerHoverCard
            player={hoveredCardInfo.player}
            targetRect={hoveredCardInfo.targetRect}
            settings={settings}
            isWeighted={isWeighted}
          />
        )}
      </div>
  );
}
