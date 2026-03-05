// ── Tolerance helpers ──────────────────────────
function readTol(prefix) {
  const c = id => cleanNum(document.getElementById(id).value);
  return {
    grubosc:         { do: c(prefix+'TgDo') },
    wspolsrodkowosc: { od: c(prefix+'TwOd'), do: c(prefix+'TwDo') },
    wysokosc:        { od: c(prefix+'TyOd'), do: c(prefix+'TyDo') }
  };
}

function tolValid(t) {
  const v = s => s !== '' && !isNaN(pf(s));
  return v(t.grubosc.do) && v(t.wspolsrodkowosc.od) && v(t.wspolsrodkowosc.do) && v(t.wysokosc.od) && v(t.wysokosc.do);
}

function fillTol(prefix, tol) {
  const t = tol || {};
  document.getElementById(`${prefix}TgDo`).value = t.grubosc?.do         ?? '';
  document.getElementById(`${prefix}TwOd`).value = t.wspolsrodkowosc?.od ?? '';
  document.getElementById(`${prefix}TwDo`).value = t.wspolsrodkowosc?.do ?? '';
  document.getElementById(`${prefix}TyOd`).value = t.wysokosc?.od        ?? '';
  document.getElementById(`${prefix}TyDo`).value = t.wysokosc?.do        ?? '';
}

// ── Add modal ──────────────────────────────────
function openModal() {
  if (!currentMachine) { showToast('⚠️ Najpierw wybierz maszynę', 'error'); return; }
  if (!token)          { showToast('⚠️ Wprowadź token w ustawieniach ⚙️', 'error'); return; }
  document.getElementById('modalMachineName').textContent = currentMachine;
  ['fNum','fDiam','fForce','fP20','fP25','fP30','fTgDo','fTwOd','fTwDo','fTyOd','fTyDo'].forEach(id => document.getElementById(id).value = '');
  const nextSlot = getNextSlot();
  document.getElementById('fSlot').value = nextSlot;
  document.getElementById('fSlotError').textContent = '';
  document.getElementById('fSlot').classList.remove('input-error');
  document.getElementById('fColorsList').innerHTML = '';
  renderPalette('fPalette', 'fColorsList', []);
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

async function saveEntry() {
  const num    = document.getElementById('fNum').value.trim();
  const diam   = parseFloat(document.getElementById('fDiam').value);
  const force  = parseFloat(document.getElementById('fForce').value);
  const p20    = parseFloat(document.getElementById('fP20').value);
  const p25    = parseFloat(document.getElementById('fP25').value);
  const p30    = parseFloat(document.getElementById('fP30').value);
  const tol    = readTol('f');
  const colors = getColorsFromList('fColorsList');

  const slotRaw = document.getElementById('fSlot').value.trim();
  const slotNum = slotRaw !== '' ? parseInt(slotRaw) : null;
  if (!validateSlotField('fSlot', 'fSlotError', null)) { showToast('⚠️ Popraw numer schowku', 'error'); return; }

  if (!num || isNaN(diam) || isNaN(p20) || isNaN(p25) || isNaN(p30)) { showToast('⚠️ Wypełnij wszystkie pola', 'error'); return; }
  if (!tolValid(tol))    { showToast('⚠️ Wypełnij wszystkie tolerancje', 'error'); return; }
  if (colors === null)   { showToast('⚠️ Wypełnij grubości dla wszystkich selekcji', 'error'); return; }
  if (!colors.length)    { showToast('⚠️ Wybierz przynajmniej jedną selekcję', 'error'); return; }
  if ([p20,p25,p30].some(p => p > 99)) { showToast('⚠️ Wartość nie może przekraczać 99.0', 'error'); return; }
  if (DB[num]) { showToast('Taki numer już istnieje', 'error'); return; }

  const machines = {
    'GSS 1': { prices: currentMachine === 'GSS 1' ? [p20,p25,p30] : [0,0,0] },
    'GSS 2': { prices: currentMachine === 'GSS 2' ? [p20,p25,p30] : [0,0,0] },
    'GSS 3': { prices: currentMachine === 'GSS 3' ? [p20,p25,p30] : [0,0,0] }
  };

  const btn = document.getElementById('btnSave');
  btn.disabled = true; btn.textContent = '⏳ Zapisuję...';
  DB[num] = { slot: slotNum, diameter: diam, force: isNaN(force) ? null : force, tolerancje: tol, colors, machines };
  const ok = await saveData();

  if (ok) {
    closeModal();
    const msg = slotNum != null
      ? `✅ Numer ${num} zapisany. Wzornik dodany do schowku pod numerem ${slotNum}`
      : `✅ Numer ${num} zapisany`;
    showToast(msg, 'success');
  } else {
    delete DB[num];
    showToast('❌ Błąd. Sprawdź token', 'error');
  }
  btn.disabled = false; btn.textContent = '💾 Zapisz';
}

// ── Edit modal ─────────────────────────────────
function openEditModal(id) {
  const item = DB[id];
  if (!item) return;
  const prices = item.machines?.[currentMachine]?.prices || [0, 0, 0];
  document.getElementById('eP20').value = prices[0];
  document.getElementById('eP25').value = prices[1];
  document.getElementById('eP30').value = prices[2];
  document.getElementById('editModalMachine').textContent = currentMachine;
  document.getElementById('eOrigNum').value = id;
  document.getElementById('eNum').value     = id;
  document.getElementById('eDiam').value    = parseFloat(item.diameter).toFixed(3);
  document.getElementById('eForce').value   = item.force ?? '';
  document.getElementById('eSlot').value    = item.slot ?? '';
  document.getElementById('eSlotError').textContent = '';
  document.getElementById('eSlot').classList.remove('input-error');
  fillTol('e', item.tolerancje);
  document.getElementById('eColorsList').innerHTML = '';
  const saved = item.colors || [];
  renderPalette('ePalette', 'eColorsList', saved);
  saved.forEach(c => {
    addColorEntry('eColorsList', c.name, c.color || '#888888', c.thickness);
    PALETTE.forEach((p, i) => {
      if (p.name === c.name) document.querySelector(`#ePalette .palette-btn[data-index="${i}"]`)?.classList.add('selected');
    });
  });
  document.getElementById('editModalOverlay').classList.add('open');
}

function closeEditModal() {
  document.getElementById('editModalOverlay').classList.remove('open');
}

async function saveEdit() {
  const origNum = document.getElementById('eOrigNum').value;
  const newNum  = document.getElementById('eNum').value.trim();
  const diam    = parseFloat(document.getElementById('eDiam').value);
  const force   = parseFloat(document.getElementById('eForce').value);
  const p20     = parseFloat(document.getElementById('eP20').value);
  const p25     = parseFloat(document.getElementById('eP25').value);
  const p30     = parseFloat(document.getElementById('eP30').value);
  const tol     = readTol('e');
  const colors  = getColorsFromList('eColorsList');

  const slotRaw = document.getElementById('eSlot').value.trim();
  const slotNum = slotRaw !== '' ? parseInt(slotRaw) : null;
  if (!validateSlotField('eSlot', 'eSlotError', origNum)) { showToast('⚠️ Popraw numer schowku', 'error'); return; }

  if (!newNum || isNaN(diam) || isNaN(p20) || isNaN(p25) || isNaN(p30)) { showToast('⚠️ Wypełnij wszystkie pola', 'error'); return; }
  if (!tolValid(tol))  { showToast('⚠️ Wypełnij wszystkie tolerancje', 'error'); return; }
  if (colors === null) { showToast('⚠️ Wypełnij grubości dla wszystkich selekcji', 'error'); return; }
  if (!colors.length)  { showToast('⚠️ Wybierz przynajmniej jedną selekcję', 'error'); return; }
  if ([p20,p25,p30].some(p => p > 99)) { showToast('⚠️ Wartość nie może przekraczać 99.0', 'error'); return; }
  if (newNum !== origNum && DB[newNum]) { showToast('⚠️ Taki numer już istnieje', 'error'); return; }

  const btn = document.getElementById('btnEditSave');
  btn.disabled = true; btn.textContent = '⏳ Zapisuję...';

  const oldData = JSON.parse(JSON.stringify(DB[origNum]));
  if (newNum !== origNum) { DB[newNum] = { ...DB[origNum] }; delete DB[origNum]; }
  const target = newNum;
  DB[target].slot = slotNum;
  DB[target].diameter = diam;
  DB[target].force = isNaN(force) ? null : force;
  DB[target].tolerancje = tol;
  DB[target].colors = colors;
  if (!DB[target].machines) DB[target].machines = {};
  DB[target].machines[currentMachine] = { prices: [p20, p25, p30] };

  const ok = await saveData();
  btn.disabled = false; btn.textContent = '💾 Zapisz zmiany';

  if (ok) {
    closeEditModal();
    showToast(`✅ Numer ${newNum} zaktualizowany`, 'success');
    selectResult(newNum, DB[newNum]);
    document.getElementById('searchInput').value = newNum;
  } else {
    if (newNum !== origNum) { delete DB[newNum]; DB[origNum] = oldData; }
    else { DB[origNum] = oldData; }
    showToast('❌ Błąd zapisu', 'error');
  }
}

// ── Delete entry ───────────────────────────────
let pendingDeleteId = null;

function openConfirm(id) {
  pendingDeleteId = id;
  document.getElementById('confirmNum').textContent = `#${id}`;
  document.getElementById('confirmOverlay').classList.add('open');
}

function closeConfirm() {
  pendingDeleteId = null;
  document.getElementById('confirmOverlay').classList.remove('open');
}

async function confirmDelete() {
  if (!pendingDeleteId) return;
  const id     = pendingDeleteId;
  const backup = { ...DB[id] };
  delete DB[id];
  closeConfirm();
  showLoading('⏳ Usuwam...');
  const ok = await saveData();
  hideLoading();
  if (ok) {
    document.getElementById('results').innerHTML = '<p class="hint">Wpis usunięty. Wpisz nowy numer.</p>';
    document.getElementById('searchInput').value = '';
    showToast(`✅ Numer ${id} usunięty`, 'success');
  } else {
    DB[id] = backup;
    showToast('❌ Błąd usuwania', 'error');
  }
}
