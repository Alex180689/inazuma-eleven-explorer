# ⚡ Inazuma Eleven Explorer & Team Builder (IE1)

Un'applicazione web moderna, reattiva e ricca di effetti visivi per esplorare il database completo di oltre **1000+ giocatori** del primo videogioco di **Inazuma Eleven** (Nintendo DS), confrontare statistiche testa a testa con grafici radar interattivi e costruire la propria squadra ideale con un Team Builder avanzato.

---

## 🌟 Caratteristiche Principali

### 1. ⚔️ Head-to-Head Player Comparison (Confronto Testa a Testa)
* **Motore di Confronto Statistiche**: Confronta in tempo reale due giocatori su tutte le 7 statistiche chiave (Tiro, Fisico, Controllo, Difesa, Velocità, Resistenza, Grinta) oltre a FP (Fatica) e TP (Tecnica).
* **Grafico Radar a 7 Assi Dinamico**: Radar SVG personalizzato con colorazioni tematiche sincronizzate con l'elemento e i colori della squadra dei giocatori.
* **Valutazione Overall (OVR) & Tier List**:
  * Modalità **"Pesate (Ruolo)"**: calcola l'overall tenendo conto dell'impatto specifico delle statistiche per il ruolo naturale (GK, DF, MF, FW).
  * Modalità **"Senza Pesi (Pure)"**: media aritmetica pura delle statistiche.
  * Assegnazione dinamica del **Tier (S+, S, A, B, C, D)** con soglie tarate sul gioco.
* **Scontro Casuale con VFX Elettrici**: Genera duelli casuali con spettacolari scariche di fulmini ad alta tensione animate su Canvas.
* **Duelli Iconici Storici**: Preset per rivivere al volo le grandi rivalità della serie (Mark Evans vs Joe King, Axel Blaze vs Jude Sharp, Mark Evans vs Byron Love, ecc.).
* **Tecniche Speciali (Hissatsu)**: Schede dettagliate per tutte e 4 le mosse speciali di ciascun giocatore, con tipo, costo TP ed elemento.

### 2. 📋 Team Builder Tattico Interattivo
* **Campo da Calcio e Panchina**:
  * Organizzazione completa degli 11 titolari e delle 5 riserve.
  * Drag & Drop fluido con follower stile carta collezionabile (effetto Balatro con inclinazione dinamica).
  * Rimozione rapida con combinazione tasto `Ctrl` + click.
  * Personalizzazione grafica: sfondi delle icone personalizzabili, alone luminoso radiale elementale, opacità regolabile.
* **Hover Info Card con Mini Radar**:
  * Passando il mouse su qualsiasi giocatore in campo o in panchina compare una finestra in sovrimpressione con statistiche, mini grafico radar a 7 assi, mosse speciali e punti vitali.
  * Adattamento intelligente: finestra forzata a sinistra per la panchina e ancoraggio sicuro ai bordi dello schermo.
* **Gestione Moduli & Formazioni**:
  * Supporto per schemi tattici classici (4-4-2, 4-3-3, 3-5-2, ecc.) con posizionamento automatico degli slot.
* **Salvataggio & Backup Squadre**:
  * Salva e rinomina formazioni illimitate nel `localStorage` del browser.
  * Pulsanti **Esporta** e **Importa** in formato `.json` per conservare, condividere o spostare le squadre tra browser e dispositivi.

---

## 🛠️ Tecnologie Utilizzate

* **React 18** + **Vite**: rendering ultra-rapido, Hot Module Replacement e bundle ottimizzato.
* **Tailwind CSS**: styling atomico responsive con palette scura da sala giochi e accenti neon.
* **Framer Motion**: micro-interazioni, transizioni fluide e animazioni di trascinamento.
* **HTML5 Canvas**: effetti grafici di fulmini e scosse elettriche native a 60fps.
* **Lucide React**: set completo di icone vettoriali moderne.

---

## 🚀 Avvio Rapido

### Metodo 1: Doppio Click su Windows *(Consigliato)*
Fai semplicemente doppio click sul file:
```text
avvia_server.bat
```
Lo script verificherà Node.js e le dipendenze, avviando il server locale su `http://localhost:3000`.

### Metodo 2: Da Riga di Comando / Bash
```bash
# Installa le dipendenze (se non già presenti)
npm install

# Avvia il server di sviluppo
npm run dev
```
Apri poi il browser all'indirizzo [http://localhost:3000](http://localhost:3000).

---

## 📁 Struttura del Progetto

```text
IE1/
├── src/
│   ├── components/
│   │   ├── teambuilder/       # Componenti Team Builder (campo, slot, hover card, panchina)
│   │   ├── DualSearchSelector # Selettori di ricerca e bottoni scontro
│   │   ├── ElectricShockEffect# VFX animazione fulmini su canvas
│   │   ├── PlayerCard         # Scheda giocatore completa
│   │   ├── RadarComparisonChart # Radar chart comparativo a 7 assi
│   │   └── ...
│   ├── constants/             # Elementi, ruoli, tecniche e squadre
│   ├── data/                  # Database JSON dei 1013 giocatori di IE1
│   └── utils/                 # Utility per statistiche, sprite, storage e colori
├── public/                    # Risorse statiche e sprite WebP
├── avvia_server.bat           # Launcher rapido Windows
├── avvia_server.sh            # Launcher bash Linux/macOS
└── package.json
```

---

## 📜 Licenza & Crediti
I diritti del franchise e dei personaggi appartengono a **LEVEL-5**. Questo progetto è sviluppato per scopo amatoriale, di studio e consultazione.
