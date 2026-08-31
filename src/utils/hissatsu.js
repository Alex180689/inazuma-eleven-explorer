import rawHissatsu from '../../hissatsu.txt?raw';
import { ELEMENTS } from '../constants/elements';

export const MOVE_TYPES = {
  S: {
    id: 'Shoot',
    code: 'TIRO',
    labelIt: 'Tiro',
    color: '#f43f5e', // rose-500
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  },
  D: {
    id: 'Dribble',
    code: 'DRIB',
    labelIt: 'Dribbling',
    color: '#06b6d4', // cyan-500
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  },
  B: {
    id: 'Block',
    code: 'BLOC',
    labelIt: 'Blocco',
    color: '#a855f7', // purple-500
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  },
  C: {
    id: 'Catch',
    code: 'PARA',
    labelIt: 'Parata',
    color: '#f59e0b', // amber-500
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
};

export const MOVE_ELEMENT_MAP = {
  W: 'Wind',
  G: 'Wood',
  F: 'Fire',
  M: 'Earth',
};

// Normalize strings for resilient matching
function normKey(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// Build the hissatsu registry from hissatsu.txt
function buildHissatsuRegistry(rawText) {
  const registry = new Map();
  if (!rawText) return registry;

  const lines = rawText.split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed === 'SDBC;WGFM') return;
    const parts = trimmed.split(';');
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const code = parts[1].trim().toUpperCase();
      const itTranslation = parts[2] ? parts[2].trim() : '';

      if (code.length === 2) {
        const typeChar = code[0];
        const elemChar = code[1];
        const typeInfo = MOVE_TYPES[typeChar];
        const elemKey = MOVE_ELEMENT_MAP[elemChar];
        const elementInfo = elemKey ? ELEMENTS[elemKey] : null;

        const entry = {
          name,
          typeChar,
          elemChar,
          type: typeInfo,
          elementKey: elemKey,
          element: elementInfo,
          translationIt: itTranslation,
        };

        registry.set(normKey(name), entry);
      }
    }
  });

  // Common aliases & dub spelling variations
  const aliases = [
    ['tripledefense', 'tripledefence'],
    ['bunshinfeint', 'bushinfeint'],
    ['superscandf', 'superscan'],
    ['superscanof', 'superscan'],
    ['shikofumi', 'sumostomp'],
    ['tsumuji', 'whirlwind'],
    ['yugamukuukan', 'warpspace'],
    ['counterstrike', 'counterstrike'],
    ['gigantwall', 'gigantwall'],
  ];

  aliases.forEach(([alias, target]) => {
    if (!registry.has(alias) && registry.has(target)) {
      registry.set(alias, registry.get(target));
    }
  });

  return registry;
}

// Cached singleton registry
const HISSATSU_DB = buildHissatsuRegistry(rawHissatsu);

/**
 * Retrieve metadata for a move by name
 * @param {string} moveName
 * @returns {object|null}
 */
export function getMoveInfo(moveName) {
  if (!moveName) return null;
  const key = normKey(moveName);
  return HISSATSU_DB.get(key) || null;
}

/**
 * Check whether a move benefits from the Same-Type Attack Bonus (STAB)
 * @param {string} moveName
 * @param {string} playerElement
 * @returns {boolean}
 */
export function checkMoveStab(moveName, playerElement) {
  if (!moveName || !playerElement) return false;
  const info = getMoveInfo(moveName);
  if (!info || !info.elementKey) return false;
  return (
    String(info.elementKey).toLowerCase() === String(playerElement).toLowerCase()
  );
}
