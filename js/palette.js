let _activePaletteId     = null;
let _customTarget        = null;
let _selectedColorToDelete = null;

// ── Render palette ─────────────────────────────
function renderPalette(paletteId, colorsListId, selectedColors) {
  _activePaletteId = paletteId;
  const container  = document.getElementById(paletteId);
  container.innerHTML = '';
  PALETTE.forEach((p, i) => {
    const selected = (selectedColors || []).some(c => c.name === p.name);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'palette-btn' + (selected ? ' selected' : '');
    btn.dataset.index = i;
    btn.innerHTML = `<div class="palette-dot" style="background:${p.color}"></div><span>${p.name}</span>`;
    btn.addEventListener('click', () => togglePaletteColor(i, paletteId, colorsListId));
    container.appendChild(btn);
  });

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'palette-btn-add';
  addBtn.style.cssText = 'border-color:#14532d;color:#4ade80;';
  addBtn.innerHTML = `<span class="palette-add-icon">＋</span><span>Nowy</span>`;
  addBtn.addEventListener('click', () => openCustomColor(paletteId, colorsListId));
  container.appendChild(addBtn);

  const delBtn = document.createElement('button');
  delBtn.type = 'button';
  delBtn.className = 'palette-btn-add';
  delBtn.style.cssText = 'border-color:#7f1d1d;color:#f87171;';
  delBtn.innerHTML = `<span style="font-size:1.2rem;line-height:22px;">🗑️</span><span>Usuń</span>`;
  delBtn.addEventListener('click', () => openDeleteColor());
  container.appendChild(delBtn);
}

function togglePaletteColor(index, paletteId, colorsListId) {
  const p = PALETTE[index];
  const list = document.getElementById(colorsListId);
  const existing = list.querySelector(`[data-color-name="${p.name}"]`);
  if (existing) {
    existing.remove();
    document.querySelector(`#${paletteId} .palette-btn[data-index="${index}"]`)?.classList.remove('selected');
    return;
  }
  addColorEntry(colorsListId, p.name, p.color);
  document.querySelector(`#${paletteId} .palette-btn[data-index="${index}"]`)?.classList.add('selected');
}

function addColorEntry(colorsListId, name, color, thickness = '') {
  const list = document.getElementById(colorsListId);
  const div  = document.createElement('div');
  div.className = 'color-entry';
  div.dataset.colorName = name;
  div.dataset.colorHex  = color;
  const paletteId = colorsListId === 'fColorsList' ? 'fPalette' : 'ePalette';
  div.innerHTML = `
    <div class="color-entry-top">
      <div class="color-entry-dot" style="background:${color}"></div>
      <div class="color-entry-name">${name}</div>
      <button class="btn-remove-color" onclick="removeColorEntry(this,'${paletteId}','${colorsListId}')">✕</button>
    </div>
    <div class="color-entry-thick">
      <label>Grubość (mm):</label>
      <input type="text" placeholder="np. 3.474" value="${thickness ?? ''}">
    </div>`;
  list.appendChild(div);
}

function removeColorEntry(btn, paletteId, colorsListId) {
  const entry = btn.closest('.color-entry');
  const name  = entry.dataset.colorName;
  entry.remove();
  document.querySelectorAll(`#${paletteId} .palette-btn`).forEach(b => {
    const i = parseInt(b.dataset.index);
    if (!isNaN(i) && PALETTE[i]?.name === name) b.classList.remove('selected');
  });
}

function getColorsFromList(colorsListId) {
  const result = [];
  for (const entry of document.querySelectorAll(`#${colorsListId} .color-entry`)) {
    const raw = cleanNum(entry.querySelector('input').value);
    if (!entry.dataset.colorName || raw === '' || isNaN(pf(raw))) return null;
    result.push({ name: entry.dataset.colorName, color: entry.dataset.colorHex, thickness: raw });
  }
  return result;
}

// ── Add custom color ───────────────────────────
function openCustomColor(paletteId, colorsListId) {
  _customTarget = { paletteId, colorsListId };
  document.getElementById('customColorName').value = '';
  document.getElementById('customColorPicker').value = '#888888';
  document.getElementById('customColorPreview').style.background = '#888888';
  document.getElementById('customColorOverlay').classList.add('open');
}

function closeCustomColor() {
  document.getElementById('customColorOverlay').classList.remove('open');
  _customTarget = null;
}

async function confirmCustomColor() {
  const name  = document.getElementById('customColorName').value.trim();
  const color = document.getElementById('customColorPicker').value;
  if (!name) { showToast('⚠️ Podaj nazwę koloru', 'error'); return; }
  if (PALETTE.some(p => p.name.toLowerCase() === name.toLowerCase())) {
    showToast('⚠️ Taki kolor już istnieje', 'error'); return;
  }
  const btnOk = document.getElementById('customColorOverlay').querySelector('.btn-custom-ok');
  btnOk.disabled = true; btnOk.textContent = '⏳...';
  PALETTE.push({ name, color });
  const ok = await saveData();
  btnOk.disabled = false; btnOk.textContent = '✅ Dodaj';
  if (!ok) { PALETTE.pop(); showToast('❌ Błąd zapisu. Sprawdź token', 'error'); return; }
  const target = _customTarget;
  closeCustomColor();
  showToast(`✅ Kolor "${name}" dodany`, 'success');
  if (target) {
    const { paletteId, colorsListId } = target;
    const currentEntries = [];
    document.querySelectorAll(`#${colorsListId} .color-entry`).forEach(entry => {
      currentEntries.push({ name: entry.dataset.colorName, color: entry.dataset.colorHex, thickness: entry.querySelector('input').value });
    });
    renderPalette(paletteId, colorsListId, []);
    document.getElementById(colorsListId).innerHTML = '';
    currentEntries.forEach(e => addColorEntry(colorsListId, e.name, e.color, e.thickness));
    currentEntries.forEach(e => {
      PALETTE.forEach((p, i) => {
        if (p.name === e.name) document.querySelector(`#${paletteId} .palette-btn[data-index="${i}"]`)?.classList.add('selected');
      });
    });
    addColorEntry(colorsListId, name, color);
    const idx = PALETTE.length - 1;
    document.querySelector(`#${paletteId} .palette-btn[data-index="${idx}"]`)?.classList.add('selected');
  }
}

// ── Delete color from palette ──────────────────
function openDeleteColor() {
  _selectedColorToDelete = null;
  const list = document.getElementById('deleteColorList');
  list.innerHTML = '';
  if (!PALETTE.length) {
    list.innerHTML = '<p style="color:#555;text-align:center;font-size:0.85rem;">Brak selekcji do usunięcia</p>';
  } else {
    PALETTE.forEach((p, i) => {
      const item = document.createElement('div');
      item.className = 'delete-color-item';
      item.dataset.index = i;
      item.innerHTML = `<div class="delete-color-item-dot" style="background:${p.color}"></div><div class="delete-color-item-name">${p.name}</div>`;
      item.addEventListener('click', () => {
        document.querySelectorAll('.delete-color-item').forEach(el => el.classList.remove('selected'));
        item.classList.add('selected');
        _selectedColorToDelete = i;
        document.getElementById('btnConfirmDeleteColor').disabled = false;
      });
      list.appendChild(item);
    });
  }
  document.getElementById('btnConfirmDeleteColor').disabled = true;
  document.getElementById('deleteColorOverlay').classList.add('open');
}

function closeDeleteColor() {
  document.getElementById('deleteColorOverlay').classList.remove('open');
  _selectedColorToDelete = null;
}

function closeConfirmColor() {
  document.getElementById('confirmColorOverlay').classList.remove('open');
}

function askConfirmColor() {
  if (_selectedColorToDelete === null) return;
  const name = PALETTE[_selectedColorToDelete].name;
  document.getElementById('confirmColorName').textContent = `"${name}"`;
  document.getElementById('deleteColorOverlay').classList.remove('open');
  document.getElementById('confirmColorOverlay').classList.add('open');
}

async function confirmDeleteColorFinal() {
  closeConfirmColor();
  if (_selectedColorToDelete === null) return;
  showLoading('⏳ Usuwam selekcję...');
  const removed = PALETTE.splice(_selectedColorToDelete, 1)[0];
  const ok = await saveData();
  hideLoading();
  if (!ok) { PALETTE.splice(_selectedColorToDelete, 0, removed); showToast('❌ Błąd zapisu. Sprawdź token', 'error'); return; }
  _selectedColorToDelete = null;
  showToast(`✅ Selekcja "${removed.name}" usunięta`, 'success');
  ['fPalette', 'ePalette'].forEach(paletteId => {
    const el = document.getElementById(paletteId);
    if (!el) return;
    const colorsListId = paletteId === 'fPalette' ? 'fColorsList' : 'eColorsList';
    const currentEntries = [];
    document.querySelectorAll(`#${colorsListId} .color-entry`).forEach(entry => {
      if (entry.dataset.colorName !== removed.name)
        currentEntries.push({ name: entry.dataset.colorName, color: entry.dataset.colorHex, thickness: entry.querySelector('input').value });
    });
    renderPalette(paletteId, colorsListId, []);
    document.getElementById(colorsListId).innerHTML = '';
    currentEntries.forEach(e => addColorEntry(colorsListId, e.name, e.color, e.thickness));
    currentEntries.forEach(e => {
      PALETTE.forEach((p, i) => {
        if (p.name === e.name) document.querySelector(`#${paletteId} .palette-btn[data-index="${i}"]`)?.classList.add('selected');
      });
    });
  });
}
