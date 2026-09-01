import videoFiles from '../data/videoRegistry.json';

// Helper to normalize strings for robust matching (lowercase, alphanumeric only)
function normalizeStr(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Extracts player's surname (last word of full name)
 * @param {string} playerName
 * @returns {string}
 */
export function getPlayerSurname(playerName) {
  if (!playerName) return '';
  const parts = playerName.trim().split(/\s+/);
  return parts[parts.length - 1];
}

/**
 * Finds a matching video recording for a specific player and technique move.
 * The filename convention is: <Surname>_<MoveName>.<ext>
 * e.g. Evans_God_Hand.mp4, Hatch_Wrath_Shot.mp4, Waldon_Death_Zone.mp4
 * 
 * @param {string} playerName - e.g. "Mark Evans", "Daniel Hatch", "Herman Waldon"
 * @param {string} moveName - e.g. "God Hand", "Wrath Shot", "Death Zone"
 * @returns {object|null} { fileName: string, url: string, ext: string, isGif: boolean }
 */
export function findMoveVideo(playerName, moveName) {
  if (!playerName || !moveName) return null;

  const playerFullNorm = normalizeStr(playerName);
  const playerSurnameNorm = normalizeStr(getPlayerSurname(playerName));
  const moveNorm = normalizeStr(moveName);

  if (!Array.isArray(videoFiles)) return null;

  for (const fileName of videoFiles) {
    const dotIdx = fileName.lastIndexOf('.');
    if (dotIdx === -1) continue;

    const baseName = fileName.substring(0, dotIdx);
    const ext = fileName.substring(dotIdx).toLowerCase();

    // Must be a supported media file (.mp4, .webm, .gif)
    if (!['.mp4', '.webm', '.gif'].includes(ext)) continue;

    // Split baseName by underscore: e.g. ["Evans", "God", "Hand"]
    const parts = baseName.split('_');
    if (parts.length < 2) continue;

    const filePlayer = normalizeStr(parts[0]);
    const fileMove = normalizeStr(parts.slice(1).join(''));

    // Strictly match the specific player (surname or full name) AND the specific move
    const isPlayerMatch = filePlayer === playerSurnameNorm || filePlayer === playerFullNorm;
    const isMoveMatch = fileMove === moveNorm;

    if (isPlayerMatch && isMoveMatch) {
      return {
        fileName,
        url: `/videos/${encodeURIComponent(fileName)}`,
        ext,
        isGif: ext === '.gif',
      };
    }
  }

  return null;
}
