import Papa from 'papaparse';
import defaultPlayers from './players.json';
import { calculateOverall, calculateTotalStats } from '../utils/statsUtils';
import rawCSV from '../../IE1.csv?raw';

// Parse CSV text into normalized player objects
export function parseCSVData(csvText) {
  try {
    const cleanText = (csvText || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const results = Papa.parse(cleanText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (!results.data || results.data.length === 0) {
      return defaultPlayers;
    }

    // Deduplicate players intelligently (handles slight variations like "Chester Horse jr." vs "Chester Horse Jr", and "Saggy" vs "Sagaminator Saggy")
    const playersMap = new Map();
    const statsMap = new Map();

    results.data
      .filter(row => row.Name && row.Position && row.Element)
      .forEach((row) => {
        if (row.Name === 'Tenshou') {
          row.Name = 'Doug Lee';
        }
        const normKey = String(row.Name).toLowerCase().replace(/[^a-z0-9]/g, '').trim();
        const freedomVal = Number(row.Freedom ?? row['Libertà'] ?? row['Liberta'] ?? 0);

        // Stats signature (Position + Element + core stats)
        const statsSig = [
          row.Position,
          row.Element,
          row.FP,
          row.TP,
          row.Kick,
          row.Body,
          row.Control,
          row.Guard,
          row.Speed,
          row.Stamina,
          row.Guts,
        ].join('|');

        // Check if we already have this exact player by stats signature
        if (statsMap.has(statsSig)) {
          const existingKey = statsMap.get(statsSig);
          const existing = playersMap.get(existingKey);
          const existingFreedom = Number(existing.Freedom ?? existing['Libertà'] ?? existing['Liberta'] ?? 0);

          const preferNew =
            freedomVal > existingFreedom ||
            (freedomVal === existingFreedom &&
              String(row.Name).length > String(existing.Name).length);

          if (preferNew) {
            playersMap.delete(existingKey);
            playersMap.set(normKey, row);
            statsMap.set(statsSig, normKey);
          }
          return;
        }

        const existing = playersMap.get(normKey);
        if (!existing) {
          playersMap.set(normKey, row);
          statsMap.set(statsSig, normKey);
        } else {
          const existingFreedom = Number(existing.Freedom ?? existing['Libertà'] ?? existing['Liberta'] ?? 0);
          if (freedomVal > existingFreedom || (existing.Team === 'Scouting' && row.Team !== 'Scouting')) {
            playersMap.set(normKey, row);
            statsMap.set(statsSig, normKey);
          }
        }
      });

    const parsed = Array.from(playersMap.values())
      .map((row, index) => {
        const moves = [
          row['1st Move'] ? String(row['1st Move']).trim() : '',
          row['2nd Move'] ? String(row['2nd Move']).trim() : '',
          row['3rd Move'] ? String(row['3rd Move']).trim() : '',
          row['4th Move'] ? String(row['4th Move']).trim() : '',
        ].filter(Boolean);

        const totalCore = (Number(row.Kick) || 50) +
          (Number(row.Body) || 50) +
          (Number(row.Control) || 50) +
          (Number(row.Guard) || 50) +
          (Number(row.Speed) || 50) +
          (Number(row.Stamina) || 50) +
          (Number(row.Guts) || 50);

        const rawFreedom = row.Freedom ?? row['Libertà'] ?? row['Liberta'];
        const freedom = rawFreedom !== undefined && rawFreedom !== null && String(rawFreedom).trim() !== ''
          ? Number(rawFreedom)
          : Math.max(5, 520 - totalCore);

        const playerObj = {
          id: `p_${index + 1}`,
          name: String(row.Name).trim(),
          team: String(row.Team || 'Sconosciuta').trim(),
          position: String(row.Position).trim().toUpperCase(),
          element: String(row.Element).trim(),
          stats: {
            fp: Number(row.FP) || 100,
            tp: Number(row.TP) || 100,
            kick: Number(row.Kick) || 50,
            body: Number(row.Body) || 50,
            control: Number(row.Control) || 50,
            guard: Number(row.Guard) || 50,
            speed: Number(row.Speed) || 50,
            stamina: Number(row.Stamina) || 50,
            guts: Number(row.Guts) || 50,
            freedom: Number(freedom) || 10,
          },
          moves,
        };

        playerObj.totalStats = calculateTotalStats(playerObj);
        playerObj.ovrWeighted = calculateOverall(playerObj, true);
        playerObj.ovrPure = calculateOverall(playerObj, false);

        return playerObj;
      });

    return parsed.length > 0 ? parsed : defaultPlayers;
  } catch (err) {
    console.error('Error parsing CSV:', err);
    return defaultPlayers;
  }
}

// Live parsed players from the actual CSV with fallback
const livePlayers = rawCSV ? parseCSVData(rawCSV) : defaultPlayers;

export function getDefaultPlayers() {
  return (livePlayers && livePlayers.length > 0) ? livePlayers : defaultPlayers;
}

// Get all unique teams
export function extractUniqueTeams(players) {
  const teams = new Set();
  players.forEach(p => {
    if (p.team) teams.add(p.team);
  });
  return Array.from(teams).sort();
}
