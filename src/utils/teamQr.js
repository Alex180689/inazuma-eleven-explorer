/**
 * Utility for Encoding and Decoding Inazuma Eleven Teams into Compact QR Code Data
 */

export const QR_PREFIX = 'IE1:';

/**
 * Encodes current team state into a compact string for QR generation
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
    if (player && player.id) {
      fieldMap[slotIdx] = player.id;
    }
  });

  const benchMap = {};
  Object.entries(benchPlayers).forEach(([slotIdx, player]) => {
    if (player && player.id) {
      benchMap[slotIdx] = player.id;
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
      // If item is an ID string (e.g. "p_1")
      if (typeof item === 'string') {
        return playerById.get(item) || playerByName.get(item.toLowerCase().trim()) || null;
      }
      // If item is already an object
      if (typeof item === 'object' && item.id) {
        return playerById.get(item.id) || item;
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
