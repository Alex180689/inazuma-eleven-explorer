import legacyQrMap from './legacyQrMap.js';

export const QR_PREFIX = 'IE1:';

/**
 * Encodes current team state into a compact string for QR generation
 * Uses player names for permanent stability across CSV row additions and reordering
 * @param {Object} param
 * @param {string} param.name - Team name
 * @param {string} param.formationId - Formation ID (e.g. 'f-base-442')
 * @param {Object} param.fieldPlayers - Map of slot index -> player object
 * @param {Object} param.benchPlayers - Map of slot index -> player object
 * @returns {string} - Compact QR payload
 */
export function encodeTeamToQrString({ name, formationId, fieldPlayers = {}, benchPlayers = {} }) {
  const fieldMap = {};
  Object.entries(fieldPlayers).forEach(([slotIdx, player]) => {
    if (player && (player.name || player.id)) {
      // Use player name for permanent, immutable resolution
      fieldMap[slotIdx] = player.name || player.id;
    }
  });

  const benchMap = {};
  Object.entries(benchPlayers).forEach(([slotIdx, player]) => {
    if (player && (player.name || player.id)) {
      benchMap[slotIdx] = player.name || player.id;
    }
  });

  const payload = {
    v: 1,
    n: name || 'Squadra Inazuma',
    f: formationId || 'f-base-442',
    p: fieldMap,
    b: benchMap,
  };

  return `${QR_PREFIX}${JSON.stringify(payload)}`;
}

/**
 * Decodes a scanned QR string and reconstructs the full team using the player database
 * @param {string} qrString - The raw decoded QR text
 * @param {Array} allPlayers - Full array of player objects from DB
 * @returns {Object} { success: boolean, team?: Object, error?: string, stats?: Object }
 */
export function decodeQrStringToTeam(qrString, allPlayers = []) {
  if (!qrString || typeof qrString !== 'string') {
    return { success: false, error: 'Dati QR non validi o vuoti.' };
  }

  let jsonStr = qrString.trim();
  if (jsonStr.startsWith(QR_PREFIX)) {
    jsonStr = jsonStr.substring(QR_PREFIX.length);
  }

  try {
    const data = JSON.parse(jsonStr);

    // Support both compact format (v: 1) and standard JSON export format
    const name = data.n || data.name || 'Squadra da QR';
    const formationId = data.f || data.formationId || 'f-base-442';
    const rawField = data.p || data.fieldPlayers || {};
    const rawBench = data.b || data.benchPlayers || {};

    // Fast lookup map for players by ID and lowercase name
    const playerById = new Map();
    const playerByName = new Map();
    allPlayers.forEach((p) => {
      if (p.id) playerById.set(p.id, p);
      if (p.name) playerByName.set(p.name.toLowerCase().trim(), p);
    });

    const resolvePlayer = (item) => {
      if (!item) return null;
      if (typeof item === 'string') {
        const trimmed = item.trim();
        const lower = trimmed.toLowerCase();

        // 1. If it's a legacy numeric ID (like "p_498"), check legacy map first
        if (legacyQrMap && legacyQrMap[trimmed]) {
          const mappedName = legacyQrMap[trimmed].toLowerCase().trim();
          if (playerByName.has(mappedName)) {
            return playerByName.get(mappedName);
          }
        }

        // 2. Direct name match
        if (playerByName.has(lower)) {
          return playerByName.get(lower);
        }

        // 3. Direct ID match
        if (playerById.has(trimmed)) {
          return playerById.get(trimmed);
        }

        return null;
      }
      // If item is already an object
      if (typeof item === 'object' && item.id) {
        return (
          playerById.get(item.id) ||
          (item.name ? playerByName.get(item.name.toLowerCase().trim()) : null) ||
          item
        );
      }
      return null;
    };

    const fieldPlayers = {};
    Object.entries(rawField).forEach(([slotIdx, val]) => {
      const resolved = resolvePlayer(val);
      if (resolved) {
        fieldPlayers[slotIdx] = resolved;
      }
    });

    const benchPlayers = {};
    Object.entries(rawBench).forEach(([slotIdx, val]) => {
      const resolved = resolvePlayer(val);
      if (resolved) {
        benchPlayers[slotIdx] = resolved;
      }
    });

    const fieldCount = Object.keys(fieldPlayers).length;
    const benchCount = Object.keys(benchPlayers).length;

    if (fieldCount === 0 && benchCount === 0) {
      return {
        success: false,
        error: 'Nessun giocatore valido trovato nel QR code per questa versione di gioco.',
      };
    }

    return {
      success: true,
      team: {
        id: `team_qr_${Date.now()}`,
        name,
        formationId,
        fieldPlayers,
        benchPlayers,
      },
      stats: {
        fieldCount,
        benchCount,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: 'Formato QR non riconosciuto: ' + err.message,
    };
  }
}
