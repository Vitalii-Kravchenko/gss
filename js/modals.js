let copiedEntry = null;

function validateNumberField(inputId, errorId, excludeId = null) {
  const input = document.getElementById(inputId);
  const value = input.value.trim();
  let message = '';
  if (!/^[0-9Xx]{10}$/.test(value)) message = 'Wpisz 10 znaków: cyfry lub X';
  else if (Object.keys(DB).some(id => id !== excludeId && id.toUpperCase() === value.toUpperCase()))
    message = 'Taka dziesięciocyfrówka już istnieje';
  setFieldError(document.getElementById(errorId), message);
  input.classList.toggle('input-error', !!message);
  input.setAttribute('aria-invalid', String(!!message));
  return !message;
}

function copyEntry(id) {
  if (!DB[id] || !currentMachine || !token) return;
  openModal();
  copiedEntry = JSON.parse(JSON.stringify(DB[id]));
  const prices = copiedEntry.machines?.[currentMachine]?.prices || [0, 0, 0];
  document.getElementById('modalMachineName').textContent =
    currentMachine + ' · Kopia parametrów ' + id + ' (wszystkie maszyny)';
  document.getElementById('fDiam').value = copiedEntry.diameter;
  document.getElementById('fForce').value = copiedEntry.force ?? '';
  ['fP20', 'fP25', 'fP30'].forEach((field, i) => document.getElementById(field).value = prices[i]);
  document.getElementById('fNum').focus();
}

// ── Add modal ──────────────────────────────────
function openModal() {
  if (!currentMachine) { showToast('Najpierw wybierz maszynę', 'error'); return; }
  if (!token)          { showToast('Wprowadź token w ustawieniach', 'error'); return; }
  copiedEntry = null;
  document.getElementById('fNumError').textContent = '';
  document.getElementById('fNum').classList.remove('input-error');
  document.getElementById('fNum').setAttribute('aria-invalid', 'false');
  document.getElementById('modalMachineName').textContent = currentMachine;
  ['fNum','fDiam','fForce','fP20','fP25','fP30'].forEach(id => document.getElementById(id).value = '');
  const nextSlot = getNextSlot();
  document.getElementById('fSlot').value = nextSlot;
  document.getElementById('fSlotError').textContent = '';
  document.getElementById('fSlot').classList.remove('input-error');
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

async function saveEntry() {
  if (document.getElementById('btnSave').disabled) return;
  if (!validateNumberField('fNum', 'fNumError')) return;
  const num    = document.getElementById('fNum').value.trim();
  const diam   = parseFloat(document.getElementById('fDiam').value);
  const force  = parseFloat(document.getElementById('fForce').value);
  const p20    = parseFloat(document.getElementById('fP20').value);
  const p25    = parseFloat(document.getElementById('fP25').value);
  const p30    = parseFloat(document.getElementById('fP30').value);

  const slotRaw = document.getElementById('fSlot').value.trim();
  const slotNum = slotRaw !== '' ? parseInt(slotRaw) : null;
  if (!validateSlotField('fSlot', 'fSlotError', null)) { showToast('Popraw numer schowku', 'error'); return; }

  if (!num || isNaN(diam) || isNaN(p20) || isNaN(p25) || isNaN(p30)) { showToast('Wypełnij wszystkie pola', 'error'); return; }
  if ([p20,p25,p30].some(p => p > 99)) { showToast('Wartość nie może przekraczać 99.0', 'error'); return; }
  if (DB[num]) { showToast('Taki numer już istnieje', 'error'); return; }

  const machines = copiedEntry ? JSON.parse(JSON.stringify(copiedEntry.machines || {})) : {
    'GSS 1': { prices: currentMachine === 'GSS 1' ? [p20,p25,p30] : [0,0,0] },
    'GSS 2': { prices: currentMachine === 'GSS 2' ? [p20,p25,p30] : [0,0,0] },
    'GSS 3': { prices: currentMachine === 'GSS 3' ? [p20,p25,p30] : [0,0,0] }
  };

  machines[currentMachine] = { ...machines[currentMachine], prices: [p20,p25,p30] };

  const btn = document.getElementById('btnSave');
  btn.disabled = true; btn.innerHTML = icon('loader', 'icon-spin') + 'Zapisuję...';
  DB[num] = { ...(copiedEntry || {}), slot: slotNum, diameter: diam, force: isNaN(force) ? null : force, machines };
  const ok = await saveData();

  if (ok) {
    closeModal();
    selectResult(num, DB[num]);
    const msg = slotNum != null
      ? `Numer ${num} zapisany. Wzornik dodany do schowku pod numerem ${slotNum}`
      : `Numer ${num} zapisany`;
    showToast(msg, 'success');
  } else {
    delete DB[num];
    showToast(lastSaveError || 'Błąd. Sprawdź token', 'error');
  }
  btn.disabled = false; btn.innerHTML = icon('save') + 'Zapisz';
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
  validateNumberField('eNum', 'eNumError', id);
  document.getElementById('eDiam').value    = parseFloat(item.diameter).toFixed(3);
  document.getElementById('eForce').value   = item.force ?? '';
  document.getElementById('eSlot').value    = item.slot ?? '';
  document.getElementById('eSlotError').textContent = '';
  document.getElementById('eSlot').classList.remove('input-error');
  document.getElementById('editModalOverlay').classList.add('open');
}

function closeEditModal() {
  document.getElementById('editModalOverlay').classList.remove('open');
}

async function saveEdit() {
  if (document.getElementById('btnEditSave').disabled) return;
  if (!validateNumberField('eNum', 'eNumError', document.getElementById('eOrigNum').value)) return;
  const origNum = document.getElementById('eOrigNum').value;
  const newNum  = document.getElementById('eNum').value.trim();
  const diam    = parseFloat(document.getElementById('eDiam').value);
  const force   = parseFloat(document.getElementById('eForce').value);
  const p20     = parseFloat(document.getElementById('eP20').value);
  const p25     = parseFloat(document.getElementById('eP25').value);
  const p30     = parseFloat(document.getElementById('eP30').value);

  const slotRaw = document.getElementById('eSlot').value.trim();
  const slotNum = slotRaw !== '' ? parseInt(slotRaw) : null;
  if (!validateSlotField('eSlot', 'eSlotError', origNum)) { showToast('Popraw numer schowku', 'error'); return; }

  if (!newNum || isNaN(diam) || isNaN(p20) || isNaN(p25) || isNaN(p30)) { showToast('Wypełnij wszystkie pola', 'error'); return; }
  if ([p20,p25,p30].some(p => p > 99)) { showToast('Wartość nie może przekraczać 99.0', 'error'); return; }
  if (newNum !== origNum && DB[newNum]) { showToast('Taki numer już istnieje', 'error'); return; }

  const btn = document.getElementById('btnEditSave');
  btn.disabled = true; btn.innerHTML = icon('loader', 'icon-spin') + 'Zapisuję...';

  const oldData = JSON.parse(JSON.stringify(DB[origNum]));
  if (newNum !== origNum) { DB[newNum] = { ...DB[origNum] }; delete DB[origNum]; }
  const target = newNum;
  DB[target].slot = slotNum;
  DB[target].diameter = diam;
  DB[target].force = isNaN(force) ? null : force;
  if (!DB[target].machines) DB[target].machines = {};
  DB[target].machines[currentMachine] = { prices: [p20, p25, p30] };

  const ok = await saveData();
  btn.disabled = false; btn.innerHTML = icon('save') + 'Zapisz zmiany';

  if (ok) {
    closeEditModal();
    showToast(`Numer ${newNum} zaktualizowany`, 'success');
    selectResult(newNum, DB[newNum]);
    document.getElementById('searchInput').value = newNum;
  } else {
    if (newNum !== origNum) { delete DB[newNum]; DB[origNum] = oldData; }
    else { DB[origNum] = oldData; }
    showToast(lastSaveError || 'Błąd zapisu', 'error');
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
  showLoading('Usuwam...');
  const ok = await saveData();
  hideLoading();
  if (ok) {
    document.getElementById('results').innerHTML = '<p class="hint">Wpis usunięty. Wpisz nowy numer.</p>';
    document.getElementById('searchInput').value = '';
    showToast(`Numer ${id} usunięty`, 'success');
  } else {
    DB[id] = backup;
    showToast('Błąd usuwania', 'error');
  }
}

