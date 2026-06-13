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
    dropdown.innerHTML = `<div class="dropdown-empty">${icon('error')} Numer "${query}" nie istnieje w bazie</div>`;
    return;
  }
  matched.forEach(([id, item]) => {
    const div = document.createElement('div');
    div.className = 'dropdown-item';
    const slotChip = item.slot != null ? `<span class="slot-chip">${icon('box')} ${item.slot}</span>` : '';
    div.innerHTML = `
      <span># <span class="match-highlight">${id.slice(0, query.length)}</span>${id.slice(query.length)}</span>
      <span class="dim-info">⌀${parseFloat(item.diameter).toFixed(3)}${slotChip}</span>
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
  const slot   = item.slot ?? null;

  const slotEditBtn = token
    ? `<button class="btn-slot-action${slot == null ? ' add' : ''}" onclick="openSlotModal('${id}')" ${slot == null ? '' : 'aria-label="Zmień numer w schowku"'}>
         ${slot == null ? icon('plus') + ' Dodaj wzornik' : icon('edit')}
       </button>`
    : '';

  const slotHTML = `
    <div class="slot-section ${slot != null ? 'stored' : 'missing'}">
      ${slot != null
        ? `<div class="slot-found">${icon('box')} Ten wzornik leży w schowku pod numerem <strong>${slot}</strong></div>`
        : `<div class="slot-missing-text">${icon('warning')} Wzornik gdzieś się zgubił. Może poszukać go w szafce na dole?</div>`}
      ${slotEditBtn}
    </div>`;

  const anglesHTML = [20, 25, 30].map((deg, i) => `
    <div class="angle-box">
      <div class="angle-deg">${deg}°</div>
      <div class="angle-val">${parseFloat(prices[i]).toFixed(1)}</div>
    </div>`).join('');

  const actionsHTML = token ? `
    <div class="card-actions">
      <button class="btn-edit"   onclick="openEditModal('${id}')">${icon('edit')} Edytuj</button>
      <button class="btn-delete" onclick="openConfirm('${id}')">${icon('trash')} Usuń</button>
    </div>` : '';

  document.getElementById('results').innerHTML = `
    <div class="card">
      <div class="card-top">
        <div class="card-id"># ${id}</div>
        <div class="card-machine">${currentMachine}</div>
      </div>
      ${slotHTML}
      <div class="info-row">
        <div class="info-pill">Średnica panewki<span>${parseFloat(item.diameter).toFixed(3)} mm</span></div>
        ${item.force != null ? `<div class="info-pill">Siła docisku<span>${item.force} N</span></div>` : ''}
      </div>
      <div class="angles">${anglesHTML}</div>
      ${actionsHTML}
    </div>`;
}

