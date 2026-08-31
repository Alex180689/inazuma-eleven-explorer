export function getCardBackgroundStyle(bgType, element) {
  if (bgType === 'none') {
    return {
      containerClass: 'bg-transparent border-0 border-none shadow-none ring-0 outline-none',
      borderColor: 'transparent',
      borderWidth: '0px',
      isNone: true,
    };
  }

  if (bgType === 'element') {
    switch (element) {
      case 'Fire':
        return {
          containerClass:
            'bg-gradient-to-b from-red-950 via-orange-950/80 to-black border-2 shadow-[0_0_16px_rgba(239,68,68,0.35)]',
          borderColor: '#ef4444',
          isNone: false,
        };
      case 'Wind':
        return {
          containerClass:
            'bg-gradient-to-b from-sky-950 via-blue-950/80 to-black border-2 shadow-[0_0_16px_rgba(56,189,248,0.35)]',
          borderColor: '#38bdf8',
          isNone: false,
        };
      case 'Earth':
        return {
          containerClass:
            'bg-gradient-to-b from-amber-950 via-yellow-950/80 to-black border-2 shadow-[0_0_16px_rgba(245,158,11,0.35)]',
          borderColor: '#f59e0b',
          isNone: false,
        };
      case 'Wood':
        return {
          containerClass:
            'bg-gradient-to-b from-emerald-950 via-green-950/80 to-black border-2 shadow-[0_0_16px_rgba(16,185,129,0.35)]',
          borderColor: '#10b981',
          isNone: false,
        };
      default:
        return {
          containerClass:
            'bg-gradient-to-b from-purple-950 via-slate-900 to-black border-2 shadow-[0_0_16px_rgba(168,85,247,0.35)]',
          borderColor: '#a855f7',
          isNone: false,
        };
    }
  }

  if (bgType === 'gold') {
    return {
      containerClass:
        'bg-gradient-to-b from-amber-800/90 via-amber-950 to-black border-2 shadow-[0_0_20px_rgba(245,158,11,0.4)]',
      borderColor: '#fbbf24',
      isNone: false,
    };
  }

  if (bgType === 'neon') {
    return {
      containerClass:
        'bg-gradient-to-b from-indigo-950 via-purple-950 to-black border-2 shadow-[0_0_20px_rgba(34,211,238,0.4)]',
      borderColor: '#22d3ee',
      isNone: false,
    };
  }

  if (bgType === 'glass') {
    return {
      containerClass:
        'bg-slate-900/40 backdrop-blur-md border-2 shadow-lg',
      borderColor: 'rgba(255, 255, 255, 0.35)',
      isNone: false,
    };
  }

  // Default 'dark'
  return {
    containerClass:
      'bg-gradient-to-b from-slate-800 to-slate-950 border-2 shadow-lg',
    borderColor: null, // will use element default color
    isNone: false,
  };
}

// Smooth, organic circular radial aura behind the player sprite in "none" mode
// Never forms a square or rectangle; perfectly rounded and seamless
export function getElementRadialAura(element) {
  switch (element) {
    case 'Fire':
      return 'radial-gradient(circle at 50% 52%, rgba(239, 68, 68, 0.85) 0%, rgba(249, 115, 22, 0.45) 45%, transparent 72%)';
    case 'Wind':
      return 'radial-gradient(circle at 50% 52%, rgba(56, 189, 248, 0.85) 0%, rgba(14, 165, 233, 0.45) 45%, transparent 72%)';
    case 'Earth':
      return 'radial-gradient(circle at 50% 52%, rgba(245, 158, 11, 0.85) 0%, rgba(217, 119, 6, 0.45) 45%, transparent 72%)';
    case 'Wood':
      return 'radial-gradient(circle at 50% 52%, rgba(16, 185, 129, 0.85) 0%, rgba(5, 150, 105, 0.45) 45%, transparent 72%)';
    default:
      return 'radial-gradient(circle at 50% 52%, rgba(168, 85, 247, 0.85) 0%, rgba(192, 132, 252, 0.45) 45%, transparent 72%)';
  }
}
