// ── Machine selector ───────────────────────────
function selectMachine(machine, btn) {
  currentMachine = machine;
  document.querySelectorAll('.machine-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const inp = document.getElementById('searchInput');
  inp.disabled = false;
  inp.placeholder = 'Szukaj numeru...';
  document.getElementById('dropdown').innerHTML = '';
  const currentId = inp.value.trim();
  if (currentId && DB[currentId]) {
    selectResult(currentId, DB[currentId]);
  } else {
    document.getElementById('results').innerHTML = '<p class="hint">Wpisz numer, aby wyszukać</p>';
  }
}

function clearSearch() {
  const inp = document.getElementById('searchInput');
  inp.value = '';
  document.getElementById('dropdown').innerHTML = '';
  document.getElementById('results').innerHTML = '<p class="hint">Wpisz numer, aby wyszukać</p>';
  document.getElementById('searchClear').style.display = 'none';
  inp.focus();
}

// ── Search handler ─────────────────────────────
function handleInput(e) {
  const query = e.target.value.trim();
  document.getElementById('searchClear').style.display = query ? 'block' : 'none';
  const dropdown = document.getElementById('dropdown');
  document.getElementById('results').innerHTML = '';
  dropdown.innerHTML = '';
  if (!query) {
    document.getElementById('results').innerHTML = '<p class="hint">Wpisz numer, aby wyszukać</p>';
    return;
  }
  const matched = Object.entries(DB).filter(([id]) => id.toLowerCase().startsWith(query.toLowerCase()));
  if (!matched.length) {
    dropdown.innerHTML = `<div class="dropdown-empty">❌ Numer "${query}" nie istnieje w bazie</div>`;
    return;
  }
  matched.forEach(([id, item]) => {
    const div = document.createElement('div');
    div.className = 'dropdown-item';
    div.innerHTML = `
      <span># <span class="match-highlight">${id.slice(0, query.length)}</span>${id.slice(query.length)}</span>
      <span class="dim-info">⌀${parseFloat(item.diameter).toFixed(3)} · ${(item.colors||[]).length} sel.</span>
    `;
    div.addEventListener('click', () => selectResult(id, item));
    dropdown.appendChild(div);
  });
}

// ── Card rendering ─────────────────────────────
function selectResult(id, item) {
  document.getElementById('dropdown').innerHTML = '';
  document.getElementById('searchInput').value = id;

  const prices = item.machines?.[currentMachine]?.prices || [0, 0, 0];
  const colors = item.colors || [];
  const tol    = item.tolerancje || {};
  const slot   = item.slot ?? null;

  const slotEditBtn = token
    ? `<button class="btn-slot-action${slot == null ? ' add' : ''}" onclick="openSlotModal('${id}')">
         ${slot == null
           ? '<span style="font-size:1.15em;font-weight:900;line-height:1">+</span> Dodaj wzornik'
           : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>'}
       </button>`
    : '';

  const slotHTML = `
    <div class="slot-section">
      ${slot != null
        ? `<div class="slot-found">📦 Ten wzornik leży w schowku pod numerem <strong>${slot}</strong></div>`
        : `<div class="slot-missing-text">⚠️ Wzornik gdzieś się zgubił. Może poszukać go w szafce na dole?</div>`}
      ${slotEditBtn}
    </div>`;

  const colorsHTML = colors.length ? `
    <div class="colors-section">
      <div class="colors-label">🎨 Selekcje i grubości</div>
      ${colors.map(c => `
        <div class="color-row">
          <div class="color-dot" style="background:${c.color}"></div>
          <div class="color-name">${c.name}</div>
          <div class="color-thick">${c.thickness} mm</div>
        </div>`).join('')}
    </div>` : '';

  const fmt = v => (v !== undefined && v !== '') ? v : '—';
  const tolHTML = `
    <div class="info-row">
      <div class="info-pill">Tol. grubości<span>${tol.grubosc ? fmt(tol.grubosc.do)+' mm' : '—'}</span></div>
      <div class="info-pill">Tol. wsp.środ.<span>${tol.wspolsrodkowosc ? fmt(tol.wspolsrodkowosc.od)+' / '+fmt(tol.wspolsrodkowosc.do)+' mm' : '—'}</span></div>
      <div class="info-pill">Tol. wysokości<span>${tol.wysokosc ? fmt(tol.wysokosc.od)+' / '+fmt(tol.wysokosc.do)+' mm' : '—'}</span></div>
    </div>`;

  const anglesHTML = [20, 25, 30].map((deg, i) => `
    <div class="angle-box">
      <div class="angle-deg">${deg}°</div>
      <div class="angle-val">${parseFloat(prices[i]).toFixed(1)}</div>
    </div>`).join('');

  const actionsHTML = token ? `
    <div class="card-actions">
      <button class="btn-edit"   onclick="openEditModal('${id}')">✏️ Edytuj</button>
      <button class="btn-delete" onclick="openConfirm('${id}')">🗑️ Usuń</button>
    </div>` : '';

  document.getElementById('results').innerHTML = `
    <div class="card">
      <div class="card-top">
        <div><div class="card-id"># ${id}</div><div class="card-machine">${currentMachine}</div></div>
        ${bushingIcon()}
      </div>
      ${slotHTML}
      <div class="info-row">
        <div class="info-pill">Średnica panewki<span>${parseFloat(item.diameter).toFixed(3)} mm</span></div>
        ${item.force != null ? `<div class="info-pill">Siła docisku<span>${item.force} N</span></div>` : ''}
      </div>
      ${colorsHTML}
      ${tolHTML}
      <div class="angles">${anglesHTML}</div>
      ${actionsHTML}
    </div>`;
}

// ── SVG icon ───────────────────────────────────
function bushingIcon() {
  return `<svg class="bushing-icon" viewBox="0 0 60 44" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="mg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#d0d8e8"/><stop offset="40%" stop-color="#a8b4c8"/><stop offset="100%" stop-color="#6a7a90"/></linearGradient>
      <linearGradient id="ig" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#8a9ab0"/><stop offset="100%" stop-color="#4a5a6e"/></linearGradient>
      <linearGradient id="sg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="rgba(255,255,255,0.45)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></linearGradient>
    </defs>
    <path d="M 4,34 A 26,26 0 0,1 56,34 L 48,34 A 18,18 0 0,0 12,34 Z" fill="url(#mg)" stroke="#8a9ab0" stroke-width="0.8"/>
    <rect x="4" y="34" width="8" height="6" rx="1" fill="url(#ig)" stroke="#6a7a90" stroke-width="0.5"/>
    <rect x="48" y="34" width="8" height="6" rx="1" fill="url(#ig)" stroke="#6a7a90" stroke-width="0.5"/>
    <rect x="4" y="40" width="52" height="3" rx="1.5" fill="#5a6a80" stroke="#4a5a6e" stroke-width="0.5"/>
    <path d="M 8,34 A 22,22 0 0,1 52,34 L 48,34 A 18,18 0 0,0 12,34 Z" fill="url(#sg)" opacity="0.6"/>
    <path d="M 6,26 A 24,24 0 0,1 54,26" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`;
}
