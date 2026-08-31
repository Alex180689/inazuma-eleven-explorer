import { POSITIONS } from '../constants/positions';
import { ELEMENTS } from '../constants/elements';

export const STAT_KEYS = [
  { key: 'kick', labelIt: 'Tiro', labelEn: 'Kick', max: 85, icon: 'Flame', desc: 'Potenza di tiro e precisione' },
  { key: 'body', labelIt: 'Fisico', labelEn: 'Body', max: 85, icon: 'ShieldAlert', desc: 'Dribbling e contrasti fisici' },
  { key: 'control', labelIt: 'Controllo', labelEn: 'Control', max: 85, icon: 'Target', desc: 'Controllo palla e precisione passaggi' },
  { key: 'guard', labelIt: 'Difesa', labelEn: 'Guard', max: 85, icon: 'Shield', desc: 'Capacità difensiva e parate' },
  { key: 'speed', labelIt: 'Velocità', labelEn: 'Speed', max: 85, icon: 'Zap', desc: 'Velocità di corsa sul campo' },
  { key: 'stamina', labelIt: 'Resistenza', labelEn: 'Stamina', max: 85, icon: 'Activity', desc: 'Resistenza alla fatica nel tempo' },
  { key: 'guts', labelIt: 'Grinta', labelEn: 'Guts', max: 85, icon: 'HeartHandshake', desc: 'Spirito di rimonta e bonus duelli' },
];

export const VITAL_KEYS = [
  { key: 'fp', labelIt: 'FP (Fatica)', labelEn: 'FP', max: 220, unit: 'FP', desc: 'Punti Fatica / Fitness Point' },
  { key: 'tp', labelIt: 'TP (Tecnica)', labelEn: 'TP', max: 200, unit: 'TP', desc: 'Punti Tecnica per mosse speciali' },
];

// Calculate total core stats sum
export function calculateTotalStats(player) {
  if (!player || !player.stats) return 0;
  return (
    (player.stats.kick || 0) +
    (player.stats.body || 0) +
    (player.stats.control || 0) +
    (player.stats.guard || 0) +
    (player.stats.speed || 0) +
    (player.stats.stamina || 0) +
    (player.stats.guts || 0)
  );
}

// Calculate overall score (0 - 99 scale)
// isWeighted: true (default, weighted by role position) | false (pure unweighted core average)
export function calculateOverall(player, isWeighted = true) {
  if (!player || !player.stats) return 50;
  
  if (!isWeighted) {
    const total = calculateTotalStats(player);
    const mean = total / 7;
    // Map max mean (~74 peak, e.g. Jude Sharp 520/7 = 74.29) to ~93, avg ~56 to ~70
    const scaled = Math.round((mean / 78) * 98);
    return Math.min(99, Math.max(40, scaled));
  }

  const posConfig = POSITIONS[player.position] || POSITIONS.FW;
  const weights = posConfig.weights;
  
  let weightedSum = 0;
  Object.keys(weights).forEach(stat => {
    const val = player.stats[stat] || 50;
    weightedSum += val * weights[stat];
  });
  
  // Normalization factor to map ~79 peak to 92 overall
  const scaled = Math.round((weightedSum / 80) * 98);
  return Math.min(99, Math.max(40, scaled));
}

// Deterministic unique color generator based on player name characters
export function getPlayerColor(name, hueOffset = 0) {
  if (!name) return {
    color: '#38bdf8',
    secondaryColor: '#0284c7',
    glowColor: '#38bdf8',
    bgTint: 'rgba(56, 189, 248, 0.15)',
    boxGlow: '0 0 15px rgba(56, 189, 248, 0.45)',
    hue: 200,
  };

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }

  const baseHue = (hash + hueOffset) % 360;

  return {
    color: `hsl(${baseHue}, 85%, 60%)`,
    secondaryColor: `hsl(${(baseHue + 30) % 360}, 85%, 45%)`,
    glowColor: `hsl(${baseHue}, 90%, 55%)`,
    bgTint: `hsla(${baseHue}, 85%, 60%, 0.22)`,
    boxGlow: `0 0 15px hsla(${baseHue}, 90%, 55%, 0.45)`,
    hue: baseHue,
  };
}

// Get Player Tier (calibrated on real distribution: min 40, max 92, avg 70.5)
export function getPlayerTier(ovr) {
  if (ovr >= 89) return { label: 'S+', color: 'text-amber-300 border-amber-400 bg-amber-400/15 shadow-[0_0_10px_rgba(251,191,36,0.25)]' };
  if (ovr >= 84) return { label: 'S', color: 'text-yellow-400 border-yellow-500 bg-yellow-500/15' };
  if (ovr >= 78) return { label: 'A', color: 'text-purple-400 border-purple-500 bg-purple-500/15' };
  if (ovr >= 70) return { label: 'B', color: 'text-blue-400 border-blue-500 bg-blue-500/15' };
  if (ovr >= 60) return { label: 'C', color: 'text-emerald-400 border-emerald-500 bg-emerald-500/15' };
  return { label: 'D', color: 'text-slate-400 border-slate-500 bg-slate-500/15' };
}


// Format delta: returns { diff, formatted, color, winner: 1 | 2 | 0 }
export function getStatDelta(val1, val2) {
  const diff = (val1 || 0) - (val2 || 0);
  if (diff > 0) {
    return {
      diff,
      formatted: `+${diff}`,
      colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      winner: 1
    };
  } else if (diff < 0) {
    return {
      diff,
      formatted: `${diff}`,
      colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      winner: 2
    };
  }
  return {
    diff: 0,
    formatted: '=',
    colorClass: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
    winner: 0
  };
}

// Prepare radar data for Recharts
export function formatRadarData(player1, player2, mode = 'core') {
  if (!player1 || !player2) return [];
  
  if (mode === 'all') {
    const allStats = [
      ...STAT_KEYS,
      { key: 'fp', labelIt: 'FP', labelEn: 'FP', max: 220 },
      { key: 'tp', labelIt: 'TP', labelEn: 'TP', max: 200 },
      { key: 'freedom', labelIt: 'Libertà', labelEn: 'Freedom', max: 70 },
    ];
    return allStats.map(s => {
      // normalize so radar isn't heavily warped by FP/TP high raw values
      const p1Raw = player1.stats[s.key] || 0;
      const p2Raw = player2.stats[s.key] || 0;
      const scale = s.max || 85;
      return {
        subject: s.labelIt,
        fullSubject: `${s.labelIt} (${s.labelEn})`,
        key: s.key,
        p1Value: p1Raw,
        p2Value: p2Raw,
        p1Normalized: Math.round((p1Raw / scale) * 100),
        p2Normalized: Math.round((p2Raw / scale) * 100),
        max: scale
      };
    });
  }

  // 7 Core Attributes
  return STAT_KEYS.map(s => {
    const p1Val = player1.stats[s.key] || 0;
    const p2Val = player2.stats[s.key] || 0;
    return {
      subject: s.labelIt,
      fullSubject: `${s.labelIt} (${s.labelEn})`,
      key: s.key,
      p1Value: p1Val,
      p2Value: p2Val,
      p1Normalized: p1Val,
      p2Normalized: p2Val,
      max: 85
    };
  });
}

// Preset Iconic Rivalries with exact dataset player names
export const PRESET_MATCHUPS = [
  {
    name: 'Duello Portieri: Mark vs Joe King',
    p1Name: 'Mark Evans',
    p2Name: 'Joe King',
    desc: 'Raimon vs Royal Academy: La grande sfida tra i due portieri leggendari'
  },
  {
    name: 'Assi dell\'Attacco: Axel vs David Samford',
    p1Name: 'Axel Blaze',
    p2Name: 'David Samford',
    desc: 'Tornado di Fuoco (Raimon) vs Pinguino Imperiale (Royal Academy)'
  },
  {
    name: 'Scontro Divino: Jude Sharp vs Hera',
    p1Name: 'Jude Sharp',
    p2Name: 'Hera',
    desc: 'La visione tattica di Jude contro la maestria della Zeus'
  },
  {
    name: 'Gara di Velocità: Nathan Swift vs Cheetah',
    p1Name: 'Nathan Swift',
    p2Name: 'Cheetah',
    desc: 'Lo scatto del vento Raimon contro il velocista della Wild'
  },
  {
    name: 'Rivalità in Difesa: Bobby Shearer vs Malcom Night',
    p1Name: 'Bobby Shearer',
    p2Name: 'Malcom Night',
    desc: 'I vecchi compagni d\'infanzia: Raimon vs Kirkwood'
  },
  {
    name: 'Sfida dei Portieri: Mark Evans vs Feldt',
    p1Name: 'Mark Evans',
    p2Name: 'Feldt',
    desc: 'La grinta di Mark contro il calcolo cibernetico della Brainwashing'
  },
  {
    name: 'Attacco Raimon: Kevin Dragonfly vs Axel Blaze',
    p1Name: 'Kevin Dragonfly',
    p2Name: 'Axel Blaze',
    desc: 'Drago d\'Impatto vs Tornado di Fuoco: sana competizione interna'
  }
];
