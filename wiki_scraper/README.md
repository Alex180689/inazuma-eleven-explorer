# ⚡ Inazuma Eleven 1 Wiki Scraper & Binder Extractor

Questo strumento automatizzato estrae i dati ufficiali dei giocatori di *Inazuma Eleven 1* direttamente dalle 10 pagine del **Player Binder** su Fandom Wiki.

## 📁 Struttura della Cartella (`wiki_scraper/`)

* **`scrape.cjs`**: Script Node.js principale per lo scraping dei giocatori, sprite e parametri.
* **`sprites/`**: Cartella dove vengono salvati gli sprite di ciascun giocatore col rispettivo cognome (es. `neptune.webp`, `nettles.webp`).
* **`scraped_players.csv`**: File CSV generato con le stesse colonne di `IE1.csv`, arricchito con la colonna **`Freedom`**.
* **`cache/`**: Cache locale delle pagine HTML scaricate (permette di riprendere lo script in qualsiasi momento senza riscaricare le pagine già elaborate e senza appesantire i server Fandom).

---

## 🚀 Come Eseguire lo Script

Puoi avviare lo script da terminale (PowerShell o CMD) dalla cartella principale del progetto:

### 1. Esecuzione Completa (Tutte le 10 linee del Binder)
```bash
node wiki_scraper/scrape.cjs
```

### 2. Esecuzione per Singola Linea
Puoi elaborare una lettera alla volta:
```bash
node wiki_scraper/scrape.cjs --line A
node wiki_scraper/scrape.cjs --line Ka
node wiki_scraper/scrape.cjs --line Sa
node wiki_scraper/scrape.cjs --line Ta
node wiki_scraper/scrape.cjs --line Na
node wiki_scraper/scrape.cjs --line Ha
node wiki_scraper/scrape.cjs --line Ma
node wiki_scraper/scrape.cjs --line Ya
node wiki_scraper/scrape.cjs --line Ra
node wiki_scraper/scrape.cjs --line Wa
```

### 3. Test Rapido (Es. primi 5 giocatori)
```bash
node wiki_scraper/scrape.cjs --limit 5
```

---

## 📊 Formato CSV Estratto

Il CSV salvato in `wiki_scraper/scraped_players.csv` ha il seguente schema:
```csv
Name,Team,Position,Element,FP,TP,Kick,Body,Control,Guard,Speed,Stamina,Guts,Freedom,1st Move,2nd Move,3rd Move,4th Move
```
* **Name**: Nome Dub (es. `Bert Neptune`)
* **Surname**: Usato per il file dello sprite (es. `neptune.webp`)
* **Stats**: Parametri al livello 99 della versione europea (**European version**), inclusa la statistica reale **Freedom**.
* **Moves**: Fino a 4 tecniche Hissatsu estratte dalla tabella del gioco *Inazuma Eleven 1*.
