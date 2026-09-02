import spriteList from '../data/spriteRegistry.json';

// Set of all available sprite filenames in /sprites/
const AVAILABLE_SPRITES = new Set(spriteList);

// Specific known name mappings
const SPECIAL_ALIASES = {
  'doug lee': 'tenshou',
  'luke': 'triton',
};

// Helper to get sprite image path for a player based on full name or surname in lowercase
export function getPlayerSpriteUrl(playerName) {
  if (!playerName) return null;
  const clean = playerName.trim().toLowerCase();

  // 0. Check specific aliases first
  if (SPECIAL_ALIASES[clean] && AVAILABLE_SPRITES.has(SPECIAL_ALIASES[clean])) {
    return `/sprites/${SPECIAL_ALIASES[clean]}.webp`;
  }

  const parts = clean.split(/\s+/);

  // 1. Try full name joined by underscore (e.g. sonny_welkin, rainier_welkin, tyler_murdock, erik_eagle)
  if (parts.length > 1) {
    const fullName = parts.join('_').replace(/[^a-z0-9'_]/g, '');
    if (AVAILABLE_SPRITES.has(fullName)) {
      return `/sprites/${fullName}.webp`;
    }
  }

  // 2. Try surname (e.g. evans, blaze, king, samford)
  const surname = parts[parts.length - 1].replace(/[^a-z0-9']/g, '');
  if (AVAILABLE_SPRITES.has(surname)) {
    return `/sprites/${surname}.webp`;
  }

  // 3. Try first name or alias
  const firstName = parts[0].replace(/[^a-z0-9']/g, '');
  if (AVAILABLE_SPRITES.has(firstName)) {
    return `/sprites/${firstName}.webp`;
  }

  // 4. Try condensed name without spaces
  const condensed = clean.replace(/[^a-z0-9']/g, '');
  if (AVAILABLE_SPRITES.has(condensed)) {
    return `/sprites/${condensed}.webp`;
  }

  // Fallback default
  return `/sprites/${surname}.webp`;
}
