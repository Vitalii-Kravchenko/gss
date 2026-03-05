// ── Load data from GitHub ──────────────────────
async function loadData() {
  try {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/data.json`;
    const res = await fetch(url, { headers: { Accept: 'application/vnd.github.v3+json' } });
    if (!res.ok) throw new Error();
    const json = await res.json();
    const parsed = JSON.parse(decodeURIComponent(escape(atob(json.content.replace(/\n/g, '')))));
    if (parsed.palette?.length) PALETTE = parsed.palette;
    if (parsed.entries) {
      DB = parsed.entries;
    } else {
      DB = {};
      ['GSS 1', 'GSS 2', 'GSS 3'].forEach(m => {
        Object.entries(parsed[m] || {}).forEach(([id, item]) => {
          if (!DB[id]) {
            DB[id] = {
              slot: null,
              diameter: item.diameter,
              force: item.force ?? null,
              tolerancje: item.tolerancje,
              colors: item.colors,
              machines: { 'GSS 1': { prices: [0,0,0] }, 'GSS 2': { prices: [0,0,0] }, 'GSS 3': { prices: [0,0,0] } }
            };
          }
          DB[id].machines[m] = { prices: item.prices || [0,0,0] };
        });
      });
    }
    Object.values(DB).forEach(e => { if (!('slot' in e)) e.slot = null; });
  } catch {
    DB = {};
    showToast('Nie udało się załadować danych', 'error');
  }
}

// ── Save data to GitHub (merge-safe) ──────────
async function saveData() {
  if (!token) { showToast('⚠️ Wprowadź token w ustawieniach', 'error'); return false; }
  try {
    const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/data.json`;
    const getRes = await fetch(apiUrl, {
      headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
    });
    const getJson = await getRes.json();
    if (!getRes.ok) throw new Error(getJson.message);

    let freshDB = DB;
    let freshPalette = PALETTE;
    try {
      const freshParsed = JSON.parse(decodeURIComponent(escape(atob(getJson.content.replace(/\n/g, '')))));
      if (freshParsed.entries) {
        freshDB = Object.assign({}, freshParsed.entries, DB);
        for (const k of Object.keys(freshDB)) {
          if (!(k in DB)) delete freshDB[k];
        }
      }
      if (freshParsed.palette?.length) freshPalette = PALETTE;
    } catch(e) { /* use in-memory DB if parse fails */ }

    const payload = { palette: freshPalette, entries: freshDB };
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(payload, null, 2))));
    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Update data.json via GSS app', content, sha: getJson.sha })
    });
    if (!putRes.ok) { const e = await putRes.json(); throw new Error(e.message); }

    DB = freshDB;
    PALETTE = freshPalette;
    return true;
  } catch { return false; }
}
