export const POSITIONS = {
  GK: {
    id: 'GK',
    nameIt: 'Portiere',
    nameEn: 'Goalkeeper',
    short: 'GK',
    color: '#eab308', // Yellow
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    primaryStats: ['guard', 'body', 'guts'],
    weights: {
      guard: 0.35,
      body: 0.20,
      control: 0.15,
      guts: 0.15,
      speed: 0.05,
      stamina: 0.05,
      kick: 0.05
    }
  },
  DF: {
    id: 'DF',
    nameIt: 'Difensore',
    nameEn: 'Defender',
    short: 'DF',
    color: '#3b82f6', // Blue
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    primaryStats: ['guard', 'speed', 'body'],
    weights: {
      guard: 0.30,
      body: 0.20,
      speed: 0.20,
      control: 0.10,
      stamina: 0.10,
      guts: 0.05,
      kick: 0.05
    }
  },
  MF: {
    id: 'MF',
    nameIt: 'Centrocampista',
    nameEn: 'Midfielder',
    short: 'MF',
    color: '#10b981', // Green
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    primaryStats: ['control', 'body', 'speed'],
    weights: {
      control: 0.25,
      body: 0.20,
      speed: 0.20,
      kick: 0.15,
      guard: 0.10,
      stamina: 0.05,
      guts: 0.05
    }
  },
  FW: {
    id: 'FW',
    nameIt: 'Attaccante',
    nameEn: 'Forward',
    short: 'FW',
    color: '#ef4444', // Red
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    primaryStats: ['kick', 'speed', 'body'],
    weights: {
      kick: 0.35,
      speed: 0.20,
      body: 0.15,
      control: 0.15,
      guts: 0.05,
      stamina: 0.05,
      guard: 0.05
    }
  }
};

export const POSITION_LIST = ['GK', 'DF', 'MF', 'FW'];
