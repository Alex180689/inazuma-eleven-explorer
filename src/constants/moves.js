// Move categories and inferred properties for Inazuma Eleven 1
export const MOVE_TYPES = {
  SHOT: { id: 'SHOT', label: 'Tiro', icon: 'zap', color: '#ef4444', bg: 'bg-red-500/15 text-red-300 border-red-500/30' },
  CATCH: { id: 'CATCH', label: 'Parata', icon: 'shield', color: '#eab308', bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  DRIBBLE: { id: 'DRIBBLE', label: 'Dribbling', icon: 'sparkles', color: '#06b6d4', bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  BLOCK: { id: 'BLOCK', label: 'Difesa', icon: 'lock', color: '#3b82f6', bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  SKILL: { id: 'SKILL', label: 'Abilità', icon: 'star', color: '#a855f7', bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
};

// Heuristic/known mapping for Inazuma 1 moves
export function inferMoveInfo(moveName) {
  const name = (moveName || '').toLowerCase();
  
  // Catch moves
  if (
    name.includes('hand') || name.includes('god') || name.includes('majin') ||
    name.includes('pocket') || name.includes('kobushi') || name.includes('knuckle') ||
    name.includes('claw') || name.includes('defence') || name.includes('catch') ||
    name.includes('block') || name.includes('guard') || name.includes('shield') ||
    name.includes('tsunami wall') || name.includes('infinite') || name.includes('stomp')
  ) {
    return { type: MOVE_TYPES.CATCH, power: 'High' };
  }
  
  // Shot moves
  if (
    name.includes('shot') || name.includes('tornado') || name.includes('fire') ||
    name.includes('crash') || name.includes('impact') || name.includes('strike') ||
    name.includes('break') || name.includes('boost') || name.includes('dive') ||
    name.includes('buster') || name.includes('arrow') || name.includes('kick') ||
    name.includes('quake') || name.includes('header') || name.includes('cannon') ||
    name.includes('drop') || name.includes('drive') || name.includes('meteor')
  ) {
    return { type: MOVE_TYPES.SHOT, power: 'High' };
  }
  
  // Block / Defense moves
  if (
    name.includes('wall') || name.includes('slide') || name.includes('fake') ||
    name.includes('scan') || name.includes('cut') || name.includes('tackle') ||
    name.includes('stitch') || name.includes('spider') || name.includes('fog') ||
    name.includes('train') || name.includes('armadillo') || name.includes('cyclone')
  ) {
    return { type: MOVE_TYPES.BLOCK, power: 'Med' };
  }
  
  // Dribble moves
  if (
    name.includes('dash') || name.includes('turn') || name.includes('spark') ||
    name.includes('magic') || name.includes('space') || name.includes('afterimage') ||
    name.includes('doppelganger') || name.includes('accelerator') || name.includes('flurry') ||
    name.includes('draw') || name.includes('ball') || name.includes('illusion') ||
    name.includes('rodeo') || name.includes('breakthrough') || name.includes('moonsault')
  ) {
    return { type: MOVE_TYPES.DRIBBLE, power: 'Med' };
  }
  
  return { type: MOVE_TYPES.SKILL, power: 'Special' };
}
