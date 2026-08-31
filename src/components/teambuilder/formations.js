// Inazuma Eleven Formations with pitch coordinates (x: 0-100%, y: 0-100%)
// Pitch orientation: Goalkeeper is at the bottom (defending), Forwards at the top (attacking).

export const FORMATIONS = [
  {
    id: 'f-base-442',
    name: 'F-Base (4-4-2)',
    shortName: '4-4-2',
    description: 'Schema bilanciato classico Raimon. Terzini e ali leggermente avanzati.',
    slots: [
      // GK
      { id: 0, role: 'GK', label: 'Portiere', x: 50, y: 90 },
      // Defenders (Terzini avanzati a y: 67, Centrali a y: 77)
      { id: 1, role: 'DF', label: 'Terzino Sinistro', x: 16, y: 67 },
      { id: 2, role: 'DF', label: 'Difensore Centrale Sx', x: 38, y: 77 },
      { id: 3, role: 'DF', label: 'Difensore Centrale Dx', x: 62, y: 77 },
      { id: 4, role: 'DF', label: 'Terzino Destro', x: 84, y: 67 },
      // Midfielders (Ali avanzate a y: 39, Centrali a y: 51)
      { id: 5, role: 'MF', label: 'Ala Sinistra', x: 15, y: 39 },
      { id: 6, role: 'MF', label: 'Centrocampista Sx', x: 38, y: 51 },
      { id: 7, role: 'MF', label: 'Centrocampista Dx', x: 62, y: 51 },
      { id: 8, role: 'MF', label: 'Ala Destra', x: 85, y: 39 },
      // Forwards
      { id: 9, role: 'FW', label: 'Punta Sinistra', x: 36, y: 17 },
      { id: 10, role: 'FW', label: 'Punta Destra', x: 64, y: 17 },
    ],
  },
  {
    id: 'f-death-zone-532',
    name: 'F-Zona Micidiale (5-3-2)',
    shortName: '5-3-2',
    description: 'La celebre tattica della Royal Academy, difesa impenetrabile a 5 con contropiede.',
    slots: [
      { id: 0, role: 'GK', label: 'Portiere', x: 50, y: 90 },
      // 5 Difensori
      { id: 1, role: 'DF', label: 'Terzino Sx', x: 14, y: 68 },
      { id: 2, role: 'DF', label: 'Centrale Sx', x: 32, y: 77 },
      { id: 3, role: 'DF', label: 'Libero Centrale', x: 50, y: 79 },
      { id: 4, role: 'DF', label: 'Centrale Dx', x: 68, y: 77 },
      { id: 5, role: 'DF', label: 'Terzino Dx', x: 86, y: 68 },
      // 3 Centrocampisti
      { id: 6, role: 'MF', label: 'Centrocampista Sx', x: 26, y: 47 },
      { id: 7, role: 'MF', label: 'Regista', x: 50, y: 44 },
      { id: 8, role: 'MF', label: 'Centrocampista Dx', x: 74, y: 47 },
      // 2 Attaccanti
      { id: 9, role: 'FW', label: 'Punta Sx', x: 36, y: 18 },
      { id: 10, role: 'FW', label: 'Punta Dx', x: 64, y: 18 },
    ],
  },
  {
    id: 'f-ghost-dance-433',
    name: 'F-Danza Fantasma (4-3-3)',
    shortName: '4-3-3',
    description: 'Schema offensivo e imprevedibile della Occult, con tridente d\'attacco largo.',
    slots: [
      { id: 0, role: 'GK', label: 'Portiere', x: 50, y: 90 },
      // 4 Difensori
      { id: 1, role: 'DF', label: 'Terzino Sx', x: 16, y: 72 },
      { id: 2, role: 'DF', label: 'Centrale Sx', x: 38, y: 76 },
      { id: 3, role: 'DF', label: 'Centrale Dx', x: 62, y: 76 },
      { id: 4, role: 'DF', label: 'Terzino Dx', x: 84, y: 72 },
      // 3 Centrocampisti
      { id: 5, role: 'MF', label: 'Mezzala Sx', x: 28, y: 49 },
      { id: 6, role: 'MF', label: 'Mediano', x: 50, y: 56 },
      { id: 7, role: 'MF', label: 'Mezzala Dx', x: 72, y: 49 },
      // 3 Attaccanti
      { id: 8, role: 'FW', label: 'Ala Offensiva Sx', x: 18, y: 22 },
      { id: 9, role: 'FW', label: 'Centravanti', x: 50, y: 15 },
      { id: 10, role: 'FW', label: 'Ala Offensiva Dx', x: 82, y: 22 },
    ],
  },
  {
    id: 'f-crane-wing-343',
    name: 'F-Ali di Gru (3-4-3)',
    shortName: '3-4-3',
    description: 'Formazione ad ali spiegata con densità e pressing aggressivo a centrocampo.',
    slots: [
      { id: 0, role: 'GK', label: 'Portiere', x: 50, y: 90 },
      // 3 Difensori
      { id: 1, role: 'DF', label: 'Difensore Sx', x: 25, y: 75 },
      { id: 2, role: 'DF', label: 'Difensore Centrale', x: 50, y: 77 },
      { id: 3, role: 'DF', label: 'Difensore Dx', x: 75, y: 75 },
      // 4 Centrocampisti
      { id: 4, role: 'MF', label: 'Esterno Sx', x: 14, y: 48 },
      { id: 5, role: 'MF', label: 'Centrocampista Sx', x: 38, y: 52 },
      { id: 6, role: 'MF', label: 'Centrocampista Dx', x: 62, y: 52 },
      { id: 7, role: 'MF', label: 'Esterno Dx', x: 86, y: 48 },
      // 3 Attaccanti
      { id: 8, role: 'FW', label: 'Attaccante Sx', x: 22, y: 20 },
      { id: 9, role: 'FW', label: 'Centravanti', x: 50, y: 16 },
      { id: 10, role: 'FW', label: 'Attaccante Dx', x: 78, y: 20 },
    ],
  },
  {
    id: 'f-wild-park-352',
    name: 'F-Parco Selvaggio (3-5-2)',
    shortName: '3-5-2',
    description: 'Formazione dinamica della Wild: baricentro compatto e raddoppi continui.',
    slots: [
      { id: 0, role: 'GK', label: 'Portiere', x: 50, y: 90 },
      // 3 Difensori
      { id: 1, role: 'DF', label: 'Difensore Sx', x: 26, y: 75 },
      { id: 2, role: 'DF', label: 'Centrale', x: 50, y: 78 },
      { id: 3, role: 'DF', label: 'Difensore Dx', x: 74, y: 75 },
      // 5 Centrocampisti
      { id: 4, role: 'MF', label: 'Esterno Sx', x: 15, y: 47 },
      { id: 5, role: 'MF', label: 'Centrocampista Sx', x: 36, y: 53 },
      { id: 6, role: 'MF', label: 'Trequartista', x: 50, y: 39 },
      { id: 7, role: 'MF', label: 'Centrocampista Dx', x: 64, y: 53 },
      { id: 8, role: 'MF', label: 'Esterno Dx', x: 85, y: 47 },
      // 2 Attaccanti
      { id: 9, role: 'FW', label: 'Attaccante Sx', x: 35, y: 17 },
      { id: 10, role: 'FW', label: 'Attaccante Dx', x: 65, y: 17 },
    ],
  },
  {
    id: 'f-butterfly-451',
    name: 'F-Farfalla (4-5-1)',
    shortName: '4-5-1',
    description: 'Centrocampo folto a rombo con unica punta d\'incursione, ottima per il possesso palla.',
    slots: [
      { id: 0, role: 'GK', label: 'Portiere', x: 50, y: 90 },
      // 4 Difensori
      { id: 1, role: 'DF', label: 'Terzino Sx', x: 16, y: 71 },
      { id: 2, role: 'DF', label: 'Centrale Sx', x: 38, y: 75 },
      { id: 3, role: 'DF', label: 'Centrale Dx', x: 62, y: 75 },
      { id: 4, role: 'DF', label: 'Terzino Dx', x: 84, y: 71 },
      // 5 Centrocampisti a rombo
      { id: 5, role: 'MF', label: 'Mediano Difensivo', x: 50, y: 59 },
      { id: 6, role: 'MF', label: 'Centrocampista Sx', x: 26, y: 46 },
      { id: 7, role: 'MF', label: 'Centrocampista Dx', x: 74, y: 46 },
      { id: 8, role: 'MF', label: 'Ala Sinistra', x: 16, y: 34 },
      { id: 9, role: 'MF', label: 'Ala Destra', x: 84, y: 34 },
      // 1 Attaccante
      { id: 10, role: 'FW', label: 'Centravanti', x: 50, y: 16 },
    ],
  },
  {
    id: 'f-superstar-5-235',
    name: 'F-Super Star 5 (2-3-5)',
    shortName: '2-3-5',
    description: 'La leggendaria formazione ultra-offensiva con ben 5 attaccanti sulla linea di porta.',
    slots: [
      { id: 0, role: 'GK', label: 'Portiere', x: 50, y: 90 },
      // 2 Difensori
      { id: 1, role: 'DF', label: 'Difensore Sx', x: 35, y: 74 },
      { id: 2, role: 'DF', label: 'Difensore Dx', x: 65, y: 74 },
      // 3 Centrocampisti
      { id: 3, role: 'MF', label: 'Centrocampista Sx', x: 25, y: 50 },
      { id: 4, role: 'MF', label: 'Centrocampista Centro', x: 50, y: 48 },
      { id: 5, role: 'MF', label: 'Centrocampista Dx', x: 75, y: 50 },
      // 5 Attaccanti
      { id: 6, role: 'FW', label: 'Attaccante Esterno Sx', x: 12, y: 22 },
      { id: 7, role: 'FW', label: 'Punta Sx', x: 31, y: 17 },
      { id: 8, role: 'FW', label: 'Centravanti', x: 50, y: 14 },
      { id: 9, role: 'FW', label: 'Punta Dx', x: 69, y: 17 },
      { id: 10, role: 'FW', label: 'Attaccante Esterno Dx', x: 88, y: 22 },
    ],
  },
  {
    id: 'f-double-volante-4231',
    name: 'F-Doppio Volante (4-2-3-1)',
    shortName: '4-2-3-1',
    description: 'Doppio mediano di copertura con tre rifinitori alle spalle della prima punta.',
    slots: [
      { id: 0, role: 'GK', label: 'Portiere', x: 50, y: 90 },
      // 4 Difensori
      { id: 1, role: 'DF', label: 'Terzino Sx', x: 16, y: 71 },
      { id: 2, role: 'DF', label: 'Centrale Sx', x: 38, y: 76 },
      { id: 3, role: 'DF', label: 'Centrale Dx', x: 62, y: 76 },
      { id: 4, role: 'DF', label: 'Terzino Dx', x: 84, y: 71 },
      // 2 Mediani
      { id: 5, role: 'MF', label: 'Mediano Sx', x: 37, y: 57 },
      { id: 6, role: 'MF', label: 'Mediano Dx', x: 63, y: 57 },
      // 3 Trequartisti
      { id: 7, role: 'MF', label: 'Trequartista Sx', x: 20, y: 37 },
      { id: 8, role: 'MF', label: 'Trequartista Centrale', x: 50, y: 34 },
      { id: 9, role: 'MF', label: 'Trequartista Dx', x: 80, y: 37 },
      // 1 Attaccante
      { id: 10, role: 'FW', label: 'Centravanti', x: 50, y: 16 },
    ],
  },
];

export const BENCH_SLOTS_COUNT = 5;
