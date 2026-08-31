#!/usr/bin/env bash
cd "$(dirname "$0")"

echo "==================================================="
echo "  INAZUMA ELEVEN EXPLORER - AVVIO SERVER LOCALE"
echo "==================================================="
echo ""

# Controllo presenza Node.js
if ! command -v node &> /dev/null; then
    echo "[ERRORE] Node.js non è installato o non è nel PATH!"
    read -p "Premi invio per uscire..."
    exit 1
fi

# Controllo dipendenze
if [ ! -d "node_modules" ]; then
    echo "[INFO] Installazione dipendenze in corso..."
    npm install
fi

echo "[INFO] Server pronto all'indirizzo: http://localhost:3000"
echo "[INFO] Avvio server..."
npm run dev
