// Set of all available sprite filenames in /sprites/
const AVAILABLE_SPRITES = new Set([
  'achilles', 'alien', 'anthropic', 'aphrodi', 'apollo', 'arcade', 'ares', 'artemis', 'artist', 'athena',
  'bandit', 'banker', 'barista', 'baughan', 'blaze', 'blood', 'bloom', 'blue', 'boar', 'builder',
  'bullford', 'buster', 'butler', 'cake', 'calier', 'caperock', 'carlton', 'carson', 'castle', 'chameleon',
  'chaney', 'charles_island', 'cheetah', 'chicken', 'chops', 'chronos', 'claus', 'cleats', 'cloak', 'clover',
  'code', 'cool', 'cosplay', 'crackshot', 'creepy', 'crumb', 'custom', 'cyborg', 'daltry', 'damian',
  'dawson', 'demeter', 'dionysus', 'dollman', 'dragonfly', 'drent', 'eagle', 'edmonds', 'eldorado', 'erik_eagle',
  'evans', 'feldt', 'fielding', 'fishman', 'foreman', 'formby', 'franky', 'gamer', 'ghost', 'gladstone',
  'glass', 'gloom', 'good', 'gorilla', 'grantham', 'grave', 'greeny', 'grim', 'grower', 'grumble',
  'hairtown', 'hall', 'hatch', 'hattori', 'hayseed', 'heart', 'hephestus', 'hera', 'heracles', 'hermes',
  'hero', 'higgins', 'hillfort', 'hillman', 'hillvalley', 'holmes', 'hood', 'hopper', 'horse', 'howells',
  'hugger', 'icarus', 'idol', 'ingham', 'ingram', 'ironside', 'island', 'izzy_island', 'jiangshi', 'jones',
  'kincaid', 'kind', 'king', 'knuckles', 'koala', 'lawrenson', 'leading', 'lion', 'lively', 'love',
  'lovely', 'machines', 'martin', 'marvel', 'marvin_murdock', 'mask', 'master', 'medusa', 'meenan', 'middleton',
  'milky', 'mirthful', 'molehill', 'monkey', 'mooney', 'moonlight', 'moore', 'morefield', 'most', 'mother',
  'mouseman', 'mower', 'muffs', 'muller', 'mummy', 'nashmith', 'nathaniel', 'net', 'neville', 'nevis',
  'newman', 'night', 'noir', 'novel', "o'hands", 'ohands', 'online', 'oughtry', 'panda', 'petty',
  'plank', 'poe', 'porter', 'poseidon', 'potts', 'prentice', 'raccoon', 'randall', 'rhymes', 'riverside',
  'riversong', 'roast', 'robot', 'rock', 'ronin', 'saggy', 'sally', 'samford', 'samurai', 'sandstone',
  'saunders', 'scott', 'sefton', 'seller', 'server', 'sharp', 'shearer', 'sheldon', 'sherman', 'signalman',
  'silver', 'simmons', 'snake', 'spook', 'spray', 'squirrel', 'stager', 'star', 'steaky', 'stiller',
  'strike', 'stronger', 'styx', 'suffolk', 'sweet', 'swift', 'swing', 'tailor', 'talis', 'talisman',
  'tell', 'thomas_murdock', 'thunder', 'toad', 'tomlinson', 'train', 'trops', 'tunk', 'turner', 'tyler_murdock',
  'undead', 'under', 'vox', 'waldon', 'wallside', 'waters', 'wells', 'wolfy', 'work', 'wraith',
  'yosemite', 'yuma', 'zombie'
]);

// Helper to get sprite image path for a player based on full name or surname in lowercase
export function getPlayerSpriteUrl(playerName) {
  if (!playerName) return null;
  const clean = playerName.trim().toLowerCase();
  const parts = clean.split(/\s+/);

  // 1. Try full name joined by underscore (e.g. tyler_murdock, thomas_murdock, marvin_murdock, erik_eagle)
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
