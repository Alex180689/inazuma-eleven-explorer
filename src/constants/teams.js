// Official & canon team color palettes for Inazuma Eleven 1
export const TEAM_COLORS = {
  'Raimon': {
    name: 'Raimon',
    primary: '#f59e0b', // Yellow / Gold
    secondary: '#1d4ed8', // Royal Blue
    accent: '#3b82f6',
    glow: 'rgba(245, 158, 11, 0.35)',
    description: 'Divisa Gialla e Blu Reale della Raimon'
  },
  'Royal Academy': {
    name: 'Royal Academy',
    primary: '#059669', // Imperial Green
    secondary: '#dc2626', // Crimson Red
    accent: '#047857',
    glow: 'rgba(5, 150, 105, 0.35)',
    description: 'Divisa Verde Imperiale con mantello e dettagli Rossi'
  },
  'Zeus': {
    name: 'Zeus',
    primary: '#38bdf8', // Sky Blue / Divine Aura
    secondary: '#eab308', // Olympian Gold
    accent: '#f8fafc', // Divine White
    glow: 'rgba(56, 189, 248, 0.4)',
    description: 'Tuniche Bianche con finiture Oro e bagliore Celeste Divino'
  },
  'Occult': {
    name: 'Occult',
    primary: '#6b21a8', // Spooky Purple
    secondary: '#991b1b', // Dark Blood Red
    accent: '#3b0764',
    glow: 'rgba(107, 33, 168, 0.4)',
    description: 'Divisa Viola Notte e Rosso Sangue con trama spettrale'
  },
  'Wild': {
    name: 'Wild',
    primary: '#15803d', // Jungle Green
    secondary: '#92400e', // Earth / Khaki Brown
    accent: '#65a30d',
    glow: 'rgba(21, 128, 61, 0.35)',
    description: 'Tonalità Giungla Verde Muschio e Terra Naturale'
  },
  'Brainwashing': {
    name: 'Brainwashing',
    primary: '#0284c7', // Cyber Sky Blue
    secondary: '#64748b', // Steel Gray / Metal
    accent: '#38bdf8',
    glow: 'rgba(2, 132, 199, 0.35)',
    description: 'Grigio Metallico e Ciano Digitale Cibernetico'
  },
  'Otaku': {
    name: 'Otaku',
    primary: '#d97706', // Mustard Yellow
    secondary: '#db2777', // Salmon / Magenta Pink
    accent: '#b45309',
    glow: 'rgba(217, 119, 6, 0.35)',
    description: 'Giallo Senape Vintage e Rosa Salmone'
  },
  'Farm': {
    name: 'Farm',
    primary: '#166534', // Deep Field Green
    secondary: '#854d0e', // Harvest Brown / Ochre
    accent: '#15803d',
    glow: 'rgba(22, 101, 52, 0.35)',
    description: 'Verde Campagna e Marrone Roccia delle risaie'
  },
  'Kirkwood': {
    name: 'Kirkwood',
    primary: '#ea580c', // Blazing Orange
    secondary: '#dc2626', // Flame Red
    accent: '#fbbf24', // Gold
    glow: 'rgba(234, 88, 12, 0.4)',
    description: 'Divisa Arancione Fiammeggiante, Rosso e Bianco'
  },
  'Shuriken': {
    name: 'Shuriken',
    primary: '#581c87', // Ninja Violet
    secondary: '#0f172a', // Stealth Black / Dark Navy
    accent: '#7e22ce',
    glow: 'rgba(88, 28, 135, 0.4)',
    description: 'Viola Ninja Notturno e Nero Furtivo'
  },
  'Inazuma KFC': {
    name: 'Inazuma KFC',
    primary: '#f97316', // Kids Bright Orange
    secondary: '#16a34a', // Bright Green
    accent: '#0ea5e9',
    glow: 'rgba(249, 115, 22, 0.35)',
    description: 'Arancione Vivace, Verde e Azzurro'
  },
  "Street Sally's": {
    name: "Street Sally's",
    primary: '#475569', // Street Slate Gray
    secondary: '#db2777', // Magenta Pink
    accent: '#1e293b',
    glow: 'rgba(71, 85, 105, 0.35)',
    description: 'Grigio Asfalto e Rosa Fucsia'
  },
  'Umbrella': {
    name: 'Umbrella',
    primary: '#7c3aed', // Plum Violet
    secondary: '#2563eb', // Rain Blue
    accent: '#9333ea',
    glow: 'rgba(124, 58, 237, 0.35)',
    description: 'Viola Prugna e Blu Pioggia'
  },
  'Raimon Old Boys': {
    name: 'Raimon Old Boys',
    primary: '#b45309', // Classic Vintage Gold
    secondary: '#1e3a8a', // Heritage Navy Blue
    accent: '#78350f',
    glow: 'rgba(180, 83, 9, 0.35)',
    description: 'Oro Antico e Blu Tradizionale della Raimon Leggendaria'
  },
  'Scouting': {
    name: 'Scouting',
    primary: '#0891b2', // Scout Cyan
    secondary: '#4f46e5', // Tech Indigo
    accent: '#eab308',
    glow: 'rgba(8, 145, 178, 0.35)',
    description: 'Ciano e Indaco Tecnologico'
  },
  'Connection Map': {
    name: 'Connection Map',
    primary: '#312e81', // Deep Space Indigo
    secondary: '#06b6d4', // Electric Cyan
    accent: '#8b5cf6',
    glow: 'rgba(49, 46, 129, 0.4)',
    description: 'Indaco Cosmico e Ciano Connessione'
  }
};

export function getTeamTheme(teamName) {
  if (!teamName) return TEAM_COLORS['Raimon'];
  return TEAM_COLORS[teamName] || {
    name: teamName,
    primary: '#3b82f6',
    secondary: '#1e293b',
    accent: '#60a5fa',
    glow: 'rgba(59, 130, 246, 0.3)',
    description: `Squadra ${teamName}`
  };
}
