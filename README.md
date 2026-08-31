# ⚡ Inazuma Eleven Explorer & Team Builder (IE1)

A modern, responsive, and visually rich web application for exploring the complete database of **1,000+ players** from the first **Inazuma Eleven** video game (Nintendo DS). Compare players head-to-head with interactive 7-axis radar charts, evaluate role-weighted stats, and build your dream squad using an advanced, Balatro-inspired tactical Team Builder.

---

## 🌟 Key Features

### 1. ⚔️ Head-to-Head Player Comparison
* **Real-time Stat Engine**: Compare any two players across all 7 core statistics (Kick, Body, Control, Guard, Speed, Stamina, Guts) plus Vital Points: **PE** (Energy Points / FP) and **PT** (Technique Points / TP).
* **Dynamic 7-Axis Radar Chart**: Custom SVG radar polygon scaled to 100 with distinct concentric levels (25%, 50%, 75%, 100%), synchronized team colors, and elemental glows.
* **Overall (OVR) & Tier List**:
  * **Role-Weighted Mode**: Calculates overall rating based on tactical role weights (GK, DF, MF, FW).
  * **Pure Mode**: Unweighted arithmetic average of core stats.
  * Tier ranks (**S+, S, A, B, C, D**) dynamically calculated from competitive stat cutoffs.
* **Random Matchup with Electric VFX**: Generate surprise matchups accompanied by high-voltage lightning shock animations rendered on an HTML5 canvas.
* **Iconic Story Rivalries**: Quick presets to instantly compare classic series duels (Mark Evans vs Joe King, Axel Blaze vs Jude Sharp, Mark Evans vs Byron Love, etc.).
* **Special Moves (Hissatsu)**: Complete technical cards for each player's 4 special moves, showing category, PT cost, and element.

### 2. 📋 Tactical Interactive Team Builder
* **Pitch & Bench Management**:
  * Organize your full squad: 11 starters on the pitch and 5 substitutes on the bench.
  * Fluid Drag-and-Drop system with collectible card tilt and dynamic cursor tracking (Balatro-inspired visual style).
  * Quick-remove players using `Ctrl + Click`.
  * Customizable visuals: interchangeable card backgrounds, elemental radial aura glows, and adjustable popover opacity.
* **Hover Info Card with Mini-Radar**:
  * Hovering over any slot shows an instant popover with player details, 7-axis mini-radar, moveset, and vital points.
  * Smart positioning automatically locks to the left for bench slots and maintains safe screen margins.
* **Tactical Formations**:
  * Full support for tactical systems (4-4-2, 4-3-3, 3-5-2, etc.) with automatic positional slot recalculation.
* **Saved Teams & Cloudless Backup**:
  * Save unlimited team configurations in browser local storage.
  * **JSON Export & Import**: One-click download/upload to backup or transfer teams between browsers and devices.
* **⚡ QR Code Generation & High-Speed Webcam Scanner**:
  * **Generate QR**: Encodes the entire squad (formation, 11 starters, 5 bench players) into an ultra-compact ~100-character payload, creating a crisp, low-density QR code that can be saved as PNG or scanned instantly.
  * **Read QR with Webcam**: Real-time camera scanner with device selection (integrated webcam, USB cameras, phone cameras) that snapshots the viewfinder, verifies the team structure, displays a success checkmark, and loads the squad onto the pitch in milliseconds.
  * Direct image upload / drag-and-drop also supported inside the scanner.

---

## 🛠️ Tech Stack

* **React 18** + **Vite**: Ultra-fast rendering, Hot Module Replacement (HMR), and optimized production builds.
* **Tailwind CSS**: Utility-first styling with an arcade dark theme and vivid neon accents.
* **Framer Motion**: Smooth micro-interactions, layout transitions, and fluid card drag animations.
* **HTML5 Canvas**: Native 60fps electric shock fractal lightning effects.
* **Lucide React**: Modern icon set.
* **jsQR & QRCode**: Fast QR generation and sub-second browser-based QR decoding.

---

## 🚀 Getting Started

### Method 1: Double-Click Launcher on Windows *(Recommended)*
Simply double-click:
```text
avvia_server.bat
```
The script will verify Node.js, install dependencies if missing, and launch the local server at `http://localhost:3000`.

### Method 2: Command Line / Bash
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```text
IE1/
├── src/
│   ├── components/
│   │   ├── teambuilder/       # Pitch, player slots, hover card, QR modals, settings
│   │   ├── DualSearchSelector # Search dropdowns and duel buttons
│   │   ├── ElectricShockEffect# Canvas lightning VFX overlay
│   │   ├── PlayerCard         # Detailed player summary card
│   │   ├── RadarComparisonChart # 7-axis head-to-head comparison radar
│   │   └── ...
│   ├── constants/             # Elements, formations, positions, moves
│   ├── data/                  # Full IE1 1,013-player database (players.json)
│   └── utils/                 # QR encoding, stat normalization, sprite resolvers
├── public/                    # Static assets and 230+ character sprites
├── avvia_server.bat           # Windows 1-click launcher
├── avvia_server.sh            # Linux/macOS bash launcher
└── package.json
```

---

## 📜 License & Credits
All Inazuma Eleven characters, artwork, and trademarks belong to **LEVEL-5**. This project is an open-source fan creation developed for educational, analytical, and archival purposes.
