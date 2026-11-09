let loadedDB = {};
let lastSaveError = '';

// ── Load data from GitHub ──────────────────────
async function loadData() {
  try {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/data.json`;
    const res = await fetch(url, { headers: { Accept: 'application/vnd.github.v3+json' } });
    if (!res.ok) throw new Error();
    const json = await res.json();
    const parsed = JSON.parse(decodeURIComponent(escape(atob(json.content.replace(/\n/g, '')))));
    DB = {};
    Object.entries(parsed.entries || {}).forEach(([id, e]) => {
      DB[id] = {
        slot: e.slot ?? null,
        diameter: e.diameter,
        force: e.force ?? null,
        machines: e.machines || { 'GSS 1': { prices: [0,0,0] }, 'GSS 2': { prices: [0,0,0] }, 'GSS 3': { prices: [0,0,0] } }
      };
    });
    loadedDB = JSON.parse(JSON.stringify(DB));
  } catch {
    DB = {};
    showToast('Nie udało się załadować danych', 'error');
  }
}

// ── Save data to GitHub (merge-safe) ──────────
async function saveData() {
  lastSaveError = '';
  if (!token) { showToast('Wprowadź token w ustawieniach', 'error'); return false; }
  try {
    const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/data.json`;
    const getRes = await fetch(apiUrl, {
      headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
    });
    const getJson = await getRes.json();
    if (!getRes.ok) throw new Error(getJson.message);

    const freshParsed = JSON.parse(decodeURIComponent(escape(atob(getJson.content.replace(/\n/g, '')))));
    const remoteDB = freshParsed.entries;
    if (!remoteDB || typeof remoteDB !== 'object' || Array.isArray(remoteDB)) throw new Error('Nieprawidłowe dane w bazie');
    const freshDB = JSON.parse(JSON.stringify(remoteDB));
    const changedIds = [...new Set([...Object.keys(loadedDB), ...Object.keys(DB)])]
      .filter(id => JSON.stringify(loadedDB[id]) !== JSON.stringify(DB[id]));
    for (const id of changedIds) {
      if (JSON.stringify(remoteDB[id]) !== JSON.stringify(loadedDB[id])) {
        throw new Error('Dane zostały zmienione przez innego użytkownika. Odśwież stronę przed zapisem');
      }
      if (Object.prototype.hasOwnProperty.call(DB, id)) freshDB[id] = DB[id];
      else delete freshDB[id];
    }
    for (const id of changedIds) {
      const entry = freshDB[id];
      if (!entry || entry.slot == null) continue;
      const slot = Number(entry.slot);
      if (!Number.isSafeInteger(slot) || slot < 1) throw new Error('Wpisz poprawny numer schowku');
      if (Object.entries(freshDB).some(([otherId, other]) =>
        otherId !== id && other.slot != null && Number(other.slot) === slot)) {
        throw new Error('Ten numer wzornika jest już zajęty. Odśwież dane i wybierz wolny numer');
      }
    }

    const payload = { entries: freshDB };
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(payload, null, 2))));
    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Update data.json via GSS app', content, sha: getJson.sha })
    });
    if (!putRes.ok) { const e = await putRes.json(); throw new Error(e.message); }

    DB = freshDB;
    loadedDB = JSON.parse(JSON.stringify(DB));
    return true;
  } catch (error) {
    lastSaveError = error.message || 'Błąd zapisu';
    return false;
  }
}

