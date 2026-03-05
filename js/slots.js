let _slotTargetId = null;

// ── Slot helpers ───────────────────────────────
function getUsedSlots(excludeId = null) {
  return Object.entries(DB)
    .filter(([id]) => id !== excludeId)
    .map(([, e]) => e.slot)
    .filter(s => s != null);
}

function getNextSlot(excludeId = null) {
  const used = new Set(getUsedSlots(excludeId));
  let n = 1;
  while (used.has(n)) n++;
  return n;
}

function isSlotUsed(num, excludeId = null) {
  return getUsedSlots(excludeId).includes(num);
}

// ── Validation ─────────────────────────────────
function validateSlotField(inputId, errorId, excludeId) {
  const val  = document.getElementById(inputId).value.trim();
  const errEl = document.getElementById(errorId);
  const inp   = document.getElementById(inputId);
  if (val === '') { errEl.textContent = ''; inp.classList.remove('input-error'); return true; }
  const num = parseInt(val);
  if (isNaN(num) || num < 1) {
    errEl.textContent = '⚠️ Wpisz poprawny numer (min. 1)';
    inp.classList.add('input-error'); return false;
  }
  if (isSlotUsed(num, excludeId)) {
    errEl.textContent = `⚠️ Numer ${num} jest już zajęty w schowku`;
    inp.classList.add('input-error'); return false;
  }
  errEl.textContent = '';
  inp.classList.remove('input-error');
  return true;
}

function validateSlotInput() {
  const val  = document.getElementById('slotInput').value.trim();
  const errEl = document.getElementById('slotInputError');
  const inp   = document.getElementById('slotInput');
  if (val === '') { errEl.textContent = ''; inp.classList.remove('input-error'); return false; }
  const num = parseInt(val);
  if (isNaN(num) || num < 1) {
    errEl.textContent = '⚠️ Wpisz poprawny numer (min. 1)';
    inp.classList.add('input-error'); return false;
  }
  if (isSlotUsed(num, _slotTargetId)) {
    errEl.textContent = `⚠️ Numer ${num} jest już zajęty w schowku`;
    inp.classList.add('input-error'); return false;
  }
  errEl.textContent = '';
  inp.classList.remove('input-error');
  return true;
}

// ── Slot modal ─────────────────────────────────
function openSlotModal(id) {
  _slotTargetId = id;
  const item    = DB[id];
  const hasSlot = item.slot != null;
  const nextSlot = getNextSlot();
  document.getElementById('slotModalTitle').textContent = hasSlot ? '📦 Zmień numer w schowku' : '📦 Dodaj wzornik do schowku';
  document.getElementById('slotInput').value = hasSlot ? item.slot : nextSlot;
  document.getElementById('slotInput').classList.remove('input-error');
  document.getElementById('slotInputError').textContent = '';
  document.getElementById('slotHint').textContent = hasSlot
    ? `Aktualny numer: ${item.slot}. Następny wolny: ${nextSlot}`
    : `Następny wolny numer: ${nextSlot}`;
  document.getElementById('btnSlotDelete').style.display = hasSlot ? 'block' : 'none';
  document.getElementById('slotModalOverlay').classList.add('open');
}

function closeSlotModal() {
  document.getElementById('slotModalOverlay').classList.remove('open');
  _slotTargetId = null;
}

async function saveSlot() {
  if (!_slotTargetId) return;
  if (!validateSlotInput()) { showToast('⚠️ Popraw numer schowku', 'error'); return; }

  const num      = parseInt(document.getElementById('slotInput').value.trim());
  const oldSlot  = DB[_slotTargetId].slot;

  if (num === oldSlot) {
    showToast(`ℹ️ Wzornik już jest pod numerem ${num} — nic nie zmieniono`, '');
    return;
  }

  const btn = document.getElementById('btnSlotSave');
  btn.disabled = true; btn.textContent = '⏳...';
  DB[_slotTargetId].slot = num;
  const ok = await saveData();
  btn.disabled = false; btn.textContent = '💾 Zapisz';

  if (ok) {
    const id = _slotTargetId;
    closeSlotModal();
    showToast(`✅ Wzornik dodany do schowku pod numerem ${num}`, 'success');
    selectResult(id, DB[id]);
  } else {
    DB[_slotTargetId].slot = oldSlot;
    showToast('❌ Błąd zapisu. Sprawdź token', 'error');
  }
}

// ── Delete slot ────────────────────────────────
function deleteSlot() {
  if (!_slotTargetId) return;
  document.getElementById('confirmSlotNum').textContent = DB[_slotTargetId].slot;
  document.getElementById('slotModalOverlay').classList.remove('open');
  document.getElementById('confirmSlotOverlay').classList.add('open');
}

function closeConfirmSlot() {
  document.getElementById('confirmSlotOverlay').classList.remove('open');
}

async function confirmDeleteSlot() {
  closeConfirmSlot();
  const id      = _slotTargetId;
  const oldSlot = DB[id].slot;
  showLoading('⏳ Usuwam wzornik ze schowku...');
  DB[id].slot = null;
  const ok = await saveData();
  hideLoading();
  if (ok) {
    _slotTargetId = null;
    showToast('✅ Wzornik usunięty ze schowku', 'success');
    selectResult(id, DB[id]);
  } else {
    DB[id].slot = oldSlot;
    _slotTargetId = null;
    showToast('❌ Błąd zapisu. Sprawdź token', 'error');
  }
}
