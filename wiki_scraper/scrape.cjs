const fs = require('fs');
const path = require('path');
const https = require('https');

// Target binder lines
const BINDER_PAGES = [
  { key: 'A', name: 'A line', page: 'Player_Binder_(Inazuma_Eleven)/A_line' },
  { key: 'Ka', name: 'Ka line', page: 'Player_Binder_(Inazuma_Eleven)/Ka_line' },
  { key: 'Sa', name: 'Sa line', page: 'Player_Binder_(Inazuma_Eleven)/Sa_line' },
  { key: 'Ta', name: 'Ta line', page: 'Player_Binder_(Inazuma_Eleven)/Ta_line' },
  { key: 'Na', name: 'Na line', page: 'Player_Binder_(Inazuma_Eleven)/Na_line' },
  { key: 'Ha', name: 'Ha line', page: 'Player_Binder_(Inazuma_Eleven)/Ha_line' },
  { key: 'Ma', name: 'Ma line', page: 'Player_Binder_(Inazuma_Eleven)/Ma_line' },
  { key: 'Ya', name: 'Ya line', page: 'Player_Binder_(Inazuma_Eleven)/Ya_line' },
  { key: 'Ra', name: 'Ra line', page: 'Player_Binder_(Inazuma_Eleven)/Ra_line' },
  { key: 'Wa', name: 'Wa line', page: 'Player_Binder_(Inazuma_Eleven)/Wa_line' },
  { key: 'Main', name: 'Wi-Fi & Campaigns', page: 'Player_Binder_(Inazuma_Eleven)' },
];

const BASE_DIR = __dirname;
const SPRITES_DIR = path.join(BASE_DIR, 'sprites');
const CACHE_DIR = path.join(BASE_DIR, 'cache');
const CSV_FILE = path.join(BASE_DIR, 'scraped_players.csv');

// Load canonical teams from original IE1.csv if available
const canonicalTeamMap = {};
const origCsvPath = path.join(BASE_DIR, '..', 'IE1.csv');
if (fs.existsSync(origCsvPath)) {
  try {
    const origCsv = fs.readFileSync(origCsvPath, 'utf8');
    origCsv.split('\n').slice(1).forEach((l) => {
      const parts = l.split(',');
      const name = parts[0]?.trim();
      const team = parts[1]?.trim();
      if (name && team) canonicalTeamMap[name.toLowerCase()] = team;
    });
  } catch (e) {}
}

const campPageTitles = new Set(['kite', 'cool', 'goggle', 'star', 'nano', 'narita_(scout_character)', 'hijikata_(scout_character)', 'maica']);

// Delay helper
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Fetch JSON from Fandom MediaWiki API with caching
function fetchApiPage(pageTitle, retries = 3) {
  const safeFilename = encodeURIComponent(pageTitle).replace(/[^a-zA-Z0-9_-]/g, '_') + '.json';
  const cachePath = path.join(CACHE_DIR, safeFilename);

  if (fs.existsSync(cachePath)) {
    try {
      const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      return Promise.resolve(cached);
    } catch (e) {}
  }

  const url = `https://inazuma-eleven.fandom.com/api.php?action=parse&page=${encodeURIComponent(pageTitle)}&format=json`;

  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'InazumaElevenScraperBot/1.0 (educational research tool)',
          Accept: 'application/json',
        },
      },
      (res) => {
        if (res.statusCode !== 200) {
          if (retries > 0) {
            return sleep(1000).then(() => fetchApiPage(pageTitle, retries - 1).then(resolve).catch(reject));
          }
          return reject(new Error(`HTTP ${res.statusCode} for ${pageTitle}`));
        }

        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          try {
            const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
            if (data && data.parse && data.parse.text) {
              fs.writeFileSync(cachePath, JSON.stringify(data), 'utf8');
            }
            resolve(data);
          } catch (err) {
            reject(err);
          }
        });
      }
    );
    req.on('error', (err) => {
      if (retries > 0) {
        return sleep(1000).then(() => fetchApiPage(pageTitle, retries - 1).then(resolve).catch(reject));
      }
      reject(err);
    });
  });
}

// Download binary image
function downloadImage(url, destPath, retries = 3) {
  if (fs.existsSync(destPath)) {
    return Promise.resolve(true); // already downloaded
  }

  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return downloadImage(res.headers.location, destPath, retries).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          if (retries > 0) {
            return sleep(800).then(() => downloadImage(url, destPath, retries - 1).then(resolve).catch(reject));
          }
          return reject(new Error(`Image HTTP ${res.statusCode}`));
        }

        const fileStream = fs.createWriteStream(destPath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(true);
        });
        fileStream.on('error', (e) => {
          fs.unlink(destPath, () => {});
          reject(e);
        });
      }
    );
    req.on('error', (err) => {
      if (retries > 0) {
        return sleep(800).then(() => downloadImage(url, destPath, retries - 1).then(resolve).catch(reject));
      }
      reject(err);
    });
  });
}

// Parse Player Binder page HTML to list of players
function parseBinderPage(html) {
  const items = html.split('<div class="item">').slice(1);
  const players = [];

  for (const it of items) {
    const nameMatch = it.match(/<span class="name"><a href="\/wiki\/([^"]+)" title="([^"]+)">/);
    if (!nameMatch) continue;

    const pageTitle = decodeURIComponent(nameMatch[1]);
    const wikiName = nameMatch[2].trim();

    // Sprite image url inside <span class="file">
    let spriteUrl = null;
    const fileSpan = it.match(/<span class="file">([\s\S]*?)<\/span>\s*<\/span>/);
    if (fileSpan) {
      const srcM = fileSpan[1].match(/data-src="([^"]+)"/) || fileSpan[1].match(/src="([^"]+)"/);
      if (srcM) {
        // Clean revision url to get high-res image
        spriteUrl = srcM[1].split('/revision')[0] + '/revision/latest';
      }
    }

    // Element from clist
    let element = 'Earth';
    if (it.includes('title="Fire"')) element = 'Fire';
    else if (it.includes('title="Wind"')) element = 'Wind';
    else if (it.includes('title="Forest"') || it.includes('title="Wood"')) element = 'Wood';
    else if (it.includes('title="Mountain"') || it.includes('title="Earth"')) element = 'Earth';

    // Position from clist
    let position = 'MF';
    if (it.includes('title="Goalkeeper"')) position = 'GK';
    else if (it.includes('title="Defender"')) position = 'DF';
    else if (it.includes('title="Midfielder"')) position = 'MF';
    else if (it.includes('title="Forward"')) position = 'FW';

    players.push({
      pageTitle,
      wikiName,
      spriteUrl,
      binderElement: element,
      binderPosition: position,
    });
  }

  return players;
}

// Extract Dub name from Portable Infobox or scout header
function extractDubName(html) {
  // 1. Portable Infobox Dub Name (Main/Story/Team characters)
  const piMatch = html.match(/Dub name<\/h3>[\s\S]*?<div class="pi-data-value[^"]*">([\s\S]*?)<\/div>/i)
               || html.match(/data-source="dub[^"]*"[\s\S]*?<div class="pi-data-value[^"]*">([\s\S]*?)<\/div>/i);
  if (piMatch) {
    let raw = piMatch[1];
    const liMatch = raw.match(/<li>([\s\S]*?)<\/li>/i);
    if (liMatch) {
      raw = liMatch[1];
    } else {
      raw = raw.split(/<br\s*\/?>/i)[0];
    }
    const clean = raw.replace(/<[^>]+>/g, '').replace(/\([^)]*\)/g, '').replace(/\[\d+\]/g, '').trim();
    if (clean) return clean;
  }

  // 2. Scout style: <div class="dub"><b>Dub</b>: Dan Nettles</div>
  const scoutMatch = html.match(/<div class="dub">\s*<b>Dub<\/b>\s*:\s*([^<]+)<\/div>/i);
  if (scoutMatch) {
    let raw = scoutMatch[1];
    const clean = raw.replace(/<[^>]+>/g, '').replace(/\([^)]*\)/g, '').replace(/\[\d+\]/g, '').trim();
    if (clean) return clean;
  }

  // 3. Generic "Dub:" or "English name:" in tables or lists
  const genericMatch = html.match(/(?:Dub|English)\s*name\s*<\/b>\s*:\s*([^<,\n\r]+)/i)
                    || html.match(/<b>Dub<\/b>\s*:\s*<i>([^<]+)<\/i>/i);
  if (genericMatch) {
    let raw = genericMatch[1];
    const clean = raw.replace(/<[^>]+>/g, '').replace(/\([^)]*\)/g, '').replace(/\[\d+\]/g, '').trim();
    if (clean) return clean;
  }

  return null;
}

// Parse individual player page HTML
function parsePlayerPage(html, binderInfo, lineKey) {
  // 1. Dub Name
  const dubName = extractDubName(html);
  const finalName = dubName || binderInfo.wikiName;

  // Extract surname
  const nameParts = finalName.trim().split(/\s+/);
  const rawSurname = nameParts[nameParts.length - 1].toLowerCase();
  const cleanSurname = rawSurname.replace(/[^a-z0-9']/g, '');

  // 2. Element & Position
  let element = binderInfo.binderElement;
  let position = binderInfo.binderPosition;

  // 3. Team
  let team = 'Scouting';
  const nameLower = finalName.toLowerCase();
  const titleLower = binderInfo.pageTitle.toLowerCase();

  if (canonicalTeamMap[nameLower]) {
    team = canonicalTeamMap[nameLower];
  } else if (lineKey === 'Main') {
    if (campPageTitles && campPageTitles.has(titleLower)) {
      team = 'Campaign';
    } else {
      team = 'Wi-Fi Download';
    }
  } else {
    team = 'Scouting';
  }

  // 4. European Version Parameters (Under Inazuma Eleven)
  const stats = { fp: 0, tp: 0, kick: 0, body: 0, control: 0, guard: 0, speed: 0, stamina: 0, guts: 0, freedom: 0 };

  const pIndex = html.indexOf('id="Parameters"');
  let paramBlock = '';
  if (pIndex !== -1) {
    const section = html.slice(pIndex, pIndex + 4000);
    const euIndex = section.indexOf('European version');
    if (euIndex !== -1) {
      paramBlock = section.slice(euIndex, euIndex + 800);
    } else {
      const ie2Idx = section.indexOf('Inazuma Eleven 2');
      if (section.includes('Japanese/American version') && ie2Idx !== -1) {
        paramBlock = section.slice(ie2Idx, ie2Idx + 800);
      } else {
        paramBlock = section.slice(0, 1200);
      }
    }
  } else {
    const euIndex = html.indexOf('European version');
    if (euIndex !== -1) {
      paramBlock = html.slice(euIndex, euIndex + 800);
    }
  }

  if (paramBlock) {
    const getVal = (label) => {
      const m = paramBlock.match(new RegExp(`<b>${label}<\\/b>:\\s*(\\d+)`, 'i'));
      return m ? Number(m[1]) : 0;
    };
    stats.fp = getVal('GP') || getVal('FP');
    stats.tp = getVal('TP');
    stats.kick = getVal('Kick');
    stats.body = getVal('Body');
    stats.control = getVal('Control');
    stats.guard = getVal('Guard');
    stats.speed = getVal('Speed');
    stats.stamina = getVal('Stamina');
    stats.guts = getVal('Guts');
    stats.freedom = getVal('Freedom');
  }

  // 5. Hissatsu Techniques (Inazuma Eleven 1)
  const moves = [];
  const ieMoveIdx = html.indexOf('Hissatsu - <i><a href="/wiki/Inazuma_Eleven_(game)"');
  if (ieMoveIdx !== -1) {
    const endTableIdx = html.indexOf('</table>', ieMoveIdx + 500);
    const moveBlock = endTableIdx !== -1
      ? html.slice(ieMoveIdx, endTableIdx)
      : html.slice(ieMoveIdx, ieMoveIdx + 8000);
    const rows = moveBlock.split('<tr');
    for (const row of rows) {
      const m = row.match(/<td[^>]*><a href="\/wiki\/[^"]+" title="([^"]+)">/i);
      if (m && !moves.includes(m[1].trim()) && moves.length < 4) {
        moves.push(m[1].trim());
      }
    }
  }

  return {
    name: finalName,
    dubName,
    surname: cleanSurname,
    team,
    position,
    element,
    stats,
    moves: [moves[0] || '', moves[1] || '', moves[2] || '', moves[3] || ''],
  };
}

// Format CSV line
function formatCsvRow(p) {
  const escapeCsv = (str) => {
    if (String(str).includes(',') || String(str).includes('"')) {
      return `"${String(str).replace(/"/g, '""')}"`;
    }
    return str;
  };

  return [
    escapeCsv(p.name),
    escapeCsv(p.team),
    escapeCsv(p.position),
    escapeCsv(p.element),
    p.stats.fp,
    p.stats.tp,
    p.stats.kick,
    p.stats.body,
    p.stats.control,
    p.stats.guard,
    p.stats.speed,
    p.stats.stamina,
    p.stats.guts,
    p.stats.freedom,
    escapeCsv(p.moves[0]),
    escapeCsv(p.moves[1]),
    escapeCsv(p.moves[2]),
    escapeCsv(p.moves[3]),
  ].join(',');
}

// Main scraping routine
async function run() {
  console.log('=====================================================');
  console.log('⚡ INAZUMA ELEVEN 1 - BINDER SCRAPER & STAT EXTRACTOR');
  console.log('=====================================================\n');

  // Command-line args: e.g. --line A or --limit 5
  const args = process.argv.slice(2);
  let targetLine = null;
  let limit = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--line' && args[i + 1]) targetLine = args[i + 1];
    if (args[i] === '--limit' && args[i + 1]) limit = parseInt(args[i + 1], 10);
  }

  // Init CSV if not present
  if (!fs.existsSync(CSV_FILE)) {
    const header = 'Name,Team,Position,Element,FP,TP,Kick,Body,Control,Guard,Speed,Stamina,Guts,Freedom,1st Move,2nd Move,3rd Move,4th Move\n';
    fs.writeFileSync(CSV_FILE, header, 'utf8');
    console.log(`📄 Initialized CSV at: ${CSV_FILE}`);
  }

  // Read already processed players to avoid duplicates
  const existingNames = new Set();
  if (fs.existsSync(CSV_FILE)) {
    const lines = fs.readFileSync(CSV_FILE, 'utf8').split('\n').slice(1);
    for (const l of lines) {
      if (!l.trim()) continue;
      const firstCol = l.split(',')[0].replace(/^"|"$/g, '').trim();
      if (firstCol) existingNames.add(firstCol);
    }
  }
  console.log(`ℹ️ Already processed ${existingNames.size} players in CSV.\n`);

  const linesToProcess = targetLine
    ? BINDER_PAGES.filter((p) => p.key.toLowerCase() === targetLine.toLowerCase() || p.page.toLowerCase().includes(targetLine.toLowerCase()))
    : BINDER_PAGES;

  if (linesToProcess.length === 0) {
    console.error(`❌ No binder line matching '${targetLine}'. Valid keys: ${BINDER_PAGES.map((p) => p.key).join(', ')}`);
    return;
  }

  let totalProcessed = 0;

  for (const line of linesToProcess) {
    console.log(`\n-----------------------------------------------------`);
    console.log(`📖 Fetching Binder Line: ${line.name} (${line.page})...`);
    console.log(`-----------------------------------------------------`);

    let binderData;
    try {
      binderData = await fetchApiPage(line.page);
    } catch (err) {
      console.error(`❌ Failed to fetch binder page ${line.page}: ${err.message}`);
      continue;
    }

    if (!binderData?.parse?.text?.['*']) {
      console.error(`❌ Invalid response for ${line.page}`);
      continue;
    }

    const binderPlayers = parseBinderPage(binderData.parse.text['*']);
    console.log(`✅ Found ${binderPlayers.length} players in ${line.name}.`);

    const playersToProcess = limit ? binderPlayers.slice(0, limit) : binderPlayers;

    for (let i = 0; i < playersToProcess.length; i++) {
      const bp = playersToProcess[i];
      console.log(`[ ${i + 1}/${playersToProcess.length} in ${line.key} ] Processing ${bp.wikiName}...`);

      // Fetch player page
      let playerData;
      try {
        playerData = await fetchApiPage(bp.pageTitle);
      } catch (err) {
        console.warn(`⚠️ Could not fetch ${bp.pageTitle}: ${err.message}`);
        continue;
      }

      if (!playerData?.parse?.text?.['*']) {
        console.warn(`⚠️ No content for ${bp.pageTitle}`);
        continue;
      }

      const parsed = parsePlayerPage(playerData.parse.text['*'], bp, line.key);

      // Download sprite if available (single .webp file)
      if (bp.spriteUrl && parsed.surname) {
        const spriteWebpDest = path.join(SPRITES_DIR, `${parsed.surname}.webp`);

        try {
          await downloadImage(bp.spriteUrl, spriteWebpDest);
        } catch (imgErr) {
          console.warn(`  ⚠️ Could not download sprite: ${imgErr.message}`);
        }
      }

      // Append to CSV if not already in CSV
      if (!existingNames.has(parsed.name)) {
        const csvLine = formatCsvRow(parsed) + '\n';
        try {
          fs.appendFileSync(CSV_FILE, csvLine, 'utf8');
        } catch (csvErr) {
          if (csvErr.code === 'EBUSY') {
            const fallbackFile = CSV_FILE.replace('.csv', '_new.csv');
            if (!fs.existsSync(fallbackFile)) {
              fs.writeFileSync(fallbackFile, 'Name,Team,Position,Element,FP,TP,Kick,Body,Control,Guard,Speed,Stamina,Guts,Freedom,1st Move,2nd Move,3rd Move,4th Move\n', 'utf8');
            }
            fs.appendFileSync(fallbackFile, csvLine, 'utf8');
            console.warn(`  ⚠️ scraped_players.csv is open in another program. Appended to ${path.basename(fallbackFile)}`);
          } else {
            throw csvErr;
          }
        }
        existingNames.add(parsed.name);
        console.log(`  ✨ Saved: ${parsed.name} | Surname: ${parsed.surname} | Freedom: ${parsed.stats.freedom} | Moves: ${parsed.moves.filter(Boolean).length}`);
      } else {
        console.log(`  ⏭️ Already in CSV: ${parsed.name}`);
      }

      totalProcessed++;
      await sleep(150); // Polite rate limit between page fetches
    }
  }

  console.log(`\n🎉 FINISHED! Total players processed: ${totalProcessed}`);
  console.log(`📂 Sprites saved in: ${SPRITES_DIR}`);
  console.log(`📊 CSV saved at: ${CSV_FILE}`);
}

run().catch((err) => {
  console.error('Fatal error:', err);
});
