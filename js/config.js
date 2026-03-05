// ── GitHub config ──────────────────────────────
const REPO_OWNER = 'Vitalii-Kravchenko';
const REPO_NAME  = 'gss';

// ── App state ──────────────────────────────────
let token = localStorage.getItem('gss_token') || '';
let DB = {};
let PALETTE = [];
let currentMachine = null;

// ── Helpers ────────────────────────────────────
const pf       = v => parseFloat(String(v).replace(',', '.').replace('+', '').trim());
const cleanNum  = v => String(v).replace(',', '.').replace('+', '').trim();

// ── Config save ────────────────────────────────
async function saveConfig() {
  const t = document.getElementById('cfgToken').value.trim();
  if (!t) { showToast('⚠️ Wprowadź token', 'error'); return; }
  const test = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`, {
    headers: { Authorization: `token ${t}` }
  });
  if (!test.ok) { showToast('❌ Token nieprawidłowy!', 'error'); return; }
  token = t;
  localStorage.setItem('gss_token', token);
  showToast('✅ Token zapisany', 'success');
  document.getElementById('configBar').removeAttribute('open');
}
