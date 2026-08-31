// Storage utility for Inazuma Eleven Saved Teams

const SAVED_TEAMS_STORAGE_KEY = 'ie1_saved_teams';
const ACTIVE_TEAM_ID_STORAGE_KEY = 'ie1_active_team_id';

export function getSavedTeams() {
  try {
    const raw = localStorage.getItem(SAVED_TEAMS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load saved teams from localStorage', err);
    return [];
  }
}

export function saveTeamToStorage({ id, name, formationId, fieldPlayers, benchPlayers }) {
  try {
    const teams = getSavedTeams();
    const teamId = id || `team_${Date.now()}`;
    const now = new Date().toISOString();

    const existingIndex = teams.findIndex((t) => t.id === teamId);

    const teamRecord = {
      id: teamId,
      name: name.trim() || 'Squadra Senza Nome',
      formationId: formationId || 'f-base-442',
      fieldPlayers: fieldPlayers || {},
      benchPlayers: benchPlayers || {},
      updatedAt: now,
      createdAt: existingIndex >= 0 ? teams[existingIndex].createdAt : now,
    };

    let updatedTeams;
    if (existingIndex >= 0) {
      updatedTeams = [...teams];
      updatedTeams[existingIndex] = teamRecord;
    } else {
      updatedTeams = [teamRecord, ...teams];
    }

    localStorage.setItem(SAVED_TEAMS_STORAGE_KEY, JSON.stringify(updatedTeams));
    localStorage.setItem(ACTIVE_TEAM_ID_STORAGE_KEY, teamId);

    return { success: true, team: teamRecord, teams: updatedTeams };
  } catch (err) {
    console.error('Failed to save team to localStorage', err);
    return { success: false, error: err.message };
  }
}

export function deleteTeamFromStorage(teamId) {
  try {
    const teams = getSavedTeams();
    const filtered = teams.filter((t) => t.id !== teamId);
    localStorage.setItem(SAVED_TEAMS_STORAGE_KEY, JSON.stringify(filtered));

    const activeId = getActiveTeamId();
    if (activeId === teamId) {
      localStorage.removeItem(ACTIVE_TEAM_ID_STORAGE_KEY);
    }

    return { success: true, teams: filtered };
  } catch (err) {
    console.error('Failed to delete team from localStorage', err);
    return { success: false, error: err.message };
  }
}

export function getActiveTeamId() {
  try {
    return localStorage.getItem(ACTIVE_TEAM_ID_STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

export function setActiveTeamId(teamId) {
  try {
    if (teamId) {
      localStorage.setItem(ACTIVE_TEAM_ID_STORAGE_KEY, teamId);
    } else {
      localStorage.removeItem(ACTIVE_TEAM_ID_STORAGE_KEY);
    }
  } catch {}
}

export function downloadTeamsBackup() {
  try {
    const teams = getSavedTeams();
    if (!teams || teams.length === 0) {
      return { success: false, error: 'Nessuna squadra salvata da esportare.' };
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(teams, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute('download', `inazuma_squadre_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    return { success: true, count: teams.length };
  } catch (err) {
    return { success: false, error: 'Errore durante il download: ' + err.message };
  }
}

export function importTeamsFromJson(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    const incomingList = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === 'object' && parsed.name
      ? [parsed]
      : null;

    if (!incomingList || incomingList.length === 0) {
      return {
        success: false,
        error: 'Il file selezionato non contiene squadre valide in formato JSON.',
      };
    }

    const currentTeams = getSavedTeams();
    const map = new Map(currentTeams.map((t) => [t.id, t]));
    let count = 0;

    for (const t of incomingList) {
      if (t && typeof t === 'object' && t.name) {
        const teamId = t.id || `team_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        map.set(teamId, {
          id: teamId,
          name: t.name,
          formationId: t.formationId || 'f-base-442',
          fieldPlayers: t.fieldPlayers || {},
          benchPlayers: t.benchPlayers || {},
          updatedAt: t.updatedAt || new Date().toISOString(),
          createdAt: t.createdAt || new Date().toISOString(),
        });
        count++;
      }
    }

    if (count === 0) {
      return { success: false, error: 'Nessuna squadra valida trovata nel file.' };
    }

    const updatedTeams = Array.from(map.values());
    localStorage.setItem(SAVED_TEAMS_STORAGE_KEY, JSON.stringify(updatedTeams));
    return { success: true, count, teams: updatedTeams };
  } catch (err) {
    return { success: false, error: 'Errore durante la lettura del file JSON: ' + err.message };
  }
}
