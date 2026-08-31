import React, { useState, useMemo, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { getDefaultPlayers, extractUniqueTeams } from './data/dataLoader';
import { PRESET_MATCHUPS, getPlayerColor } from './utils/statsUtils';
import { getTeamTheme } from './constants/teams';

const defaultPlayers = getDefaultPlayers();

import { Shield } from 'lucide-react';
import Navbar from './components/Navbar';
import DualSearchSelector from './components/DualSearchSelector';
import PlayerCard from './components/PlayerCard';
import RadarComparisonChart from './components/RadarComparisonChart';
import PlayerSearchModal from './components/PlayerSearchModal';
import TeamBuilder from './components/teambuilder/TeamBuilder';
import ElectricShockEffect from './components/ElectricShockEffect';

export default function App() {
  const [players, setPlayers] = useState(defaultPlayers);
  const [shockTrigger, setShockTrigger] = useState(0);
  
  // Default selected players: Mark Evans (Raimon) vs Joe King (Royal Academy)
  const [player1, setPlayer1] = useState(() => {
    return defaultPlayers.find(p => p.name === 'Mark Evans') || defaultPlayers[0];
  });
  
  const [player2, setPlayer2] = useState(() => {
    return defaultPlayers.find(p => p.name === 'Joe King') || defaultPlayers[13] || defaultPlayers[1];
  });

  // Modal search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTargetSlot, setSearchTargetSlot] = useState(1);

  // Team Builder state
  const [isTeamBuilderOpen, setIsTeamBuilderOpen] = useState(false);
  const [selectedFormationId, setSelectedFormationId] = useState(() => {
    return localStorage.getItem('ie1_formation_id') || 'f-base-442';
  });

  const [fieldPlayers, setFieldPlayers] = useState(() => {
    try {
      const saved = localStorage.getItem('ie1_teambuilder_field');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [benchPlayers, setBenchPlayers] = useState(() => {
    try {
      const saved = localStorage.getItem('ie1_teambuilder_bench');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Set of player names already placed in Team Builder (excluding the slot currently being edited)
  const excludedPlayerNames = useMemo(() => {
    if (typeof searchTargetSlot !== 'object' || searchTargetSlot === null) {
      return new Set();
    }
    const currentSlotPlayer =
      searchTargetSlot.type === 'field'
        ? fieldPlayers[searchTargetSlot.index]
        : benchPlayers[searchTargetSlot.index];

    const set = new Set();
    Object.values(fieldPlayers).forEach((p) => {
      if (p?.name) set.add(p.name);
    });
    Object.values(benchPlayers).forEach((p) => {
      if (p?.name) set.add(p.name);
    });

    if (currentSlotPlayer?.name) {
      set.delete(currentSlotPlayer.name);
    }
    return set;
  }, [searchTargetSlot, fieldPlayers, benchPlayers]);

  // OVR Calculation Mode: true (Weighted by position) | false (Unweighted pure core average)
  const [isWeighted, setIsWeighted] = useState(true);

  // Extract unique teams
  const uniqueTeams = useMemo(() => extractUniqueTeams(players), [players]);

  // Team Themes for Dynamic Background
  const p1TeamTheme = useMemo(() => getTeamTheme(player1?.team), [player1]);
  const p2TeamTheme = useMemo(() => getTeamTheme(player2?.team), [player2]);

  // Synchronized Matchup Color Themes (ensures PlayerCard avatars match the radar exactly, shifting Player 2 if hues collide)
  const p1Theme = useMemo(() => getPlayerColor(player1?.name), [player1?.name]);
  const p2Theme = useMemo(() => {
    if (!player2?.name) return null;
    let theme2 = getPlayerColor(player2.name);
    if (p1Theme) {
      const hueDiff = Math.min(
        Math.abs(p1Theme.hue - theme2.hue),
        360 - Math.abs(p1Theme.hue - theme2.hue)
      );
      if (hueDiff < 45) {
        theme2 = getPlayerColor(player2.name, 135);
      }
    }
    return theme2;
  }, [player1?.name, player2?.name, p1Theme]);

  // Open search modal for specific slot
  const handleOpenSearch = (slot) => {
    setSearchTargetSlot(slot);
    setIsSearchOpen(true);
  };

  // Team Builder Handlers
  const handleSelectFormation = (formId) => {
    setSelectedFormationId(formId);
    try {
      localStorage.setItem('ie1_formation_id', formId);
    } catch {}
  };

  const handleSlotClick = (type, index) => {
    setSearchTargetSlot({ type, index });
    setIsSearchOpen(true);
  };

  const handleSlotRemove = (type, index) => {
    if (type === 'field') {
      setFieldPlayers((prev) => {
        const next = { ...prev };
        delete next[index];
        try { localStorage.setItem('ie1_teambuilder_field', JSON.stringify(next)); } catch {}
        return next;
      });
    } else {
      setBenchPlayers((prev) => {
        const next = { ...prev };
        delete next[index];
        try { localStorage.setItem('ie1_teambuilder_bench', JSON.stringify(next)); } catch {}
        return next;
      });
    }
  };

  const handleSwap = (source, target) => {
    if (!source || !target) return;
    if (source.type === target.type && source.index === target.index) return;

    let sourcePlayer = source.type === 'field' ? fieldPlayers[source.index] : benchPlayers[source.index];
    let targetPlayer = target.type === 'field' ? fieldPlayers[target.index] : benchPlayers[target.index];

    let newField = { ...fieldPlayers };
    let newBench = { ...benchPlayers };

    // Set target
    if (target.type === 'field') {
      if (sourcePlayer) newField[target.index] = sourcePlayer;
      else delete newField[target.index];
    } else {
      if (sourcePlayer) newBench[target.index] = sourcePlayer;
      else delete newBench[target.index];
    }

    // Set source
    if (source.type === 'field') {
      if (targetPlayer) newField[source.index] = targetPlayer;
      else delete newField[source.index];
    } else {
      if (targetPlayer) newBench[source.index] = targetPlayer;
      else delete newBench[source.index];
    }

    setFieldPlayers(newField);
    setBenchPlayers(newBench);
    try {
      localStorage.setItem('ie1_teambuilder_field', JSON.stringify(newField));
      localStorage.setItem('ie1_teambuilder_bench', JSON.stringify(newBench));
    } catch {}
  };

  const handleClearTeam = () => {
    if (window.confirm('Sei sicuro di voler svuotare il campo e la panchina?')) {
      setFieldPlayers({});
      setBenchPlayers({});
      try {
        localStorage.removeItem('ie1_teambuilder_field');
        localStorage.removeItem('ie1_teambuilder_bench');
      } catch {}
    }
  };

  const handleLoadTeam = (team) => {
    if (!team) return;
    setSelectedFormationId(team.formationId || 'f-base-442');
    setFieldPlayers(team.fieldPlayers || {});
    setBenchPlayers(team.benchPlayers || {});
    try {
      localStorage.setItem('ie1_formation_id', team.formationId || 'f-base-442');
      localStorage.setItem('ie1_teambuilder_field', JSON.stringify(team.fieldPlayers || {}));
      localStorage.setItem('ie1_teambuilder_bench', JSON.stringify(team.benchPlayers || {}));
    } catch {}
  };

  // Select player from modal
  const handleSelectPlayer = (selected) => {
    if (typeof searchTargetSlot === 'object' && searchTargetSlot !== null) {
      if (searchTargetSlot.type === 'field') {
        setFieldPlayers((prev) => {
          const next = { ...prev, [searchTargetSlot.index]: selected };
          try { localStorage.setItem('ie1_teambuilder_field', JSON.stringify(next)); } catch {}
          return next;
        });
      } else {
        setBenchPlayers((prev) => {
          const next = { ...prev, [searchTargetSlot.index]: selected };
          try { localStorage.setItem('ie1_teambuilder_bench', JSON.stringify(next)); } catch {}
          return next;
        });
      }
    } else if (searchTargetSlot === 1) {
      setPlayer1(selected);
    } else {
      setPlayer2(selected);
    }
  };

  // Swap players
  const handleSwapPlayers = () => {
    const temp = player1;
    setPlayer1(player2);
    setPlayer2(temp);
  };

  // Random Matchup with electric lightning shock animation
  const handleRandomMatchup = useCallback(() => {
    if (!players || players.length < 2) return;

    const idx1 = Math.floor(Math.random() * players.length);
    let idx2 = Math.floor(Math.random() * players.length);
    while (idx2 === idx1) {
      idx2 = Math.floor(Math.random() * players.length);
    }

    setPlayer1(players[idx1]);
    setPlayer2(players[idx2]);

    // Trigger high-voltage lightning shock animation
    setShockTrigger((prev) => prev + 1);
  }, [players]);

  // Select Preset Rivalry
  const handleSelectPreset = (p1Name, p2Name) => {
    const found1 = players.find(p => p.name.toLowerCase() === p1Name.toLowerCase());
    const found2 = players.find(p => p.name.toLowerCase() === p2Name.toLowerCase());

    if (found1) setPlayer1(found1);
    if (found2) setPlayer2(found2);

    // Trigger electric shock
    setShockTrigger((prev) => prev + 1);
  };

  // Reset to default
  const handleReset = () => {
    const m = players.find(p => p.name === 'Mark Evans') || players[0];
    const j = players.find(p => p.name === 'Joe King') || players[1];
    setPlayer1(m);
    setPlayer2(j);
  };

  // Handle custom CSV Upload
  const handleUploadCSV = (csvText) => {
    const parsed = parseCSVData(csvText);
    if (parsed && parsed.length > 0) {
      setPlayers(parsed);
      setPlayer1(parsed[0]);
      setPlayer2(parsed[1] || parsed[0]);
      alert(`CSV caricato con successo: ${parsed.length} giocatori indicizzati.`);
    }
  };

  // Global Keyboard shortcuts (Space to swap, R for random)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (isSearchOpen) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleSwapPlayers();
      } else if (e.key === 'r' || e.key === 'R') {
        handleRandomMatchup();
      } else if (e.key === '1') {
        handleOpenSearch(1);
      } else if (e.key === '2') {
        handleOpenSearch(2);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player1, player2, isSearchOpen, handleRandomMatchup]);

  return (
    <div
      className="min-h-screen flex flex-col text-slate-100 selection:bg-amber-500/30 selection:text-amber-300 transition-colors duration-700"
      style={{
        background: `
          radial-gradient(circle at 10% 25%, ${p1TeamTheme.primary}28 0%, ${p1TeamTheme.secondary}12 35%, transparent 65%),
          radial-gradient(circle at 90% 25%, ${p2TeamTheme.primary}28 0%, ${p2TeamTheme.secondary}12 35%, transparent 65%),
          linear-gradient(to right, ${p1TeamTheme.primary}14 0%, rgba(7, 11, 20, 0.98) 50%, ${p2TeamTheme.primary}14 100%),
          #070b14
        `,
      }}
    >
      {/* Navbar Header */}
      <Navbar
        playersCount={players.length}
        onResetToDefault={handleReset}
        onUploadCSV={handleUploadCSV}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1480px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Dual Search Top Stage */}
        <DualSearchSelector
          player1={player1}
          player2={player2}
          onOpenSearchP1={() => handleOpenSearch(1)}
          onOpenSearchP2={() => handleOpenSearch(2)}
          onSwapPlayers={handleSwapPlayers}
          onRandomMatchup={handleRandomMatchup}
          onSelectPreset={handleSelectPreset}
          isWeighted={isWeighted}
          onToggleWeighted={setIsWeighted}
        />

        {/* Bottom Comparison Stage (3-Column Layout on Desktop, Responsive Stack on Mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
          {/* Left Column: Player 1 Card (Cols 3.5 / 12) */}
          <div className="lg:col-span-3 xl:col-span-3 order-1 flex flex-col">
            <PlayerCard
              player={player1}
              rivalPlayer={player2}
              playerNumber={1}
              onOpenSearch={() => handleOpenSearch(1)}
              playerTheme={p1Theme}
              isWeighted={isWeighted}
            />
          </div>

          {/* Center Column: Radar Chart Showcase (Cols 6 / 12 on Desktop for extra space) */}
          <div className="lg:col-span-6 xl:col-span-6 order-2 flex flex-col">
            <div
              className="glass-card rounded-2xl p-5 sm:p-6 border shadow-2xl flex-1 flex flex-col justify-between transition-all duration-500"
              style={{
                borderColor: 'rgba(51, 65, 85, 0.6)',
                background: `linear-gradient(135deg, ${p1TeamTheme.primary}10 0%, rgba(15, 23, 42, 0.9) 50%, ${p2TeamTheme.primary}10 100%)`,
              }}
            >
              <RadarComparisonChart
                player1={player1}
                player2={player2}
                p1Theme={p1Theme}
                p2Theme={p2Theme}
                isWeighted={isWeighted}
              />
            </div>
          </div>

          {/* Right Column: Player 2 Card (Cols 3.5 / 12) */}
          <div className="lg:col-span-3 xl:col-span-3 order-3 flex flex-col">
            <PlayerCard
              player={player2}
              rivalPlayer={player1}
              playerNumber={2}
              onOpenSearch={() => handleOpenSearch(2)}
              playerTheme={p2Theme}
              isWeighted={isWeighted}
            />
          </div>
        </div>

        {/* Quick Tips / Team Color Indicators Footer Banner */}
        <div className="glass-panel rounded-xl p-3 px-4 border border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Team theme pills */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: p1TeamTheme.primary }} />
              <span>{player1?.team} ({p1TeamTheme.name})</span>
            </span>
            <span className="text-slate-600">vs</span>
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: p2TeamTheme.primary }} />
              <span>{player2?.team} ({p2TeamTheme.name})</span>
            </span>
          </div>

          {/* Middle / Right: Keyboard Shortcuts & Team Builder Button */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="hidden sm:flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Spazio</kbd> Scambia
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">R</kbd> Casuale
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">1</kbd> o <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">2</kbd> Ricerca
              </span>
            </div>
          </div>
        </div>

        {/* Team Builder Section (Always Open by Default) */}
        <div id="team-builder-section">
          <TeamBuilder
            fieldPlayers={fieldPlayers}
            benchPlayers={benchPlayers}
            selectedFormationId={selectedFormationId}
            onSelectFormation={handleSelectFormation}
            onSlotClick={handleSlotClick}
            onSlotRemove={handleSlotRemove}
            onSwap={handleSwap}
            onClearTeam={handleClearTeam}
            onLoadTeam={handleLoadTeam}
            isWeighted={isWeighted}
          />
        </div>
      </main>

      {/* Modal Search & Selection */}
      <PlayerSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPlayer={handleSelectPlayer}
        targetSlot={searchTargetSlot}
        currentPlayer={
          typeof searchTargetSlot === 'object' && searchTargetSlot !== null
            ? (searchTargetSlot.type === 'field' ? fieldPlayers[searchTargetSlot.index] : benchPlayers[searchTargetSlot.index])
            : (searchTargetSlot === 1 ? player1 : player2)
        }
        otherPlayer={
          typeof searchTargetSlot === 'object' ? null : (searchTargetSlot === 1 ? player2 : player1)
        }
        allPlayers={players}
        uniqueTeams={uniqueTeams}
        isWeighted={isWeighted}
        excludedPlayerNames={excludedPlayerNames}
      />

      {/* Electric Lightning Shock VFX */}
      <ElectricShockEffect trigger={shockTrigger} />
    </div>
  );
}
