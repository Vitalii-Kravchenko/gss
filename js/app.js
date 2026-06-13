// ── Toast & Loading ────────────────────────────
function showLoading(msg) {
  document.getElementById('loadingMsg').innerHTML = icon('loader', 'icon-spin') + msg;
  document.getElementById('loadingOverlay').classList.add('show');
}

function hideLoading() {
  document.getElementById('loadingOverlay').classList.remove('show');
}

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  const name = type === 'success' ? 'check' : type === 'error' ? 'error' : 'info';
  t.innerHTML = icon(name) + `<span>${msg}</span>`;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3500);
}

// ── Inline field error with warning icon ───────
function setFieldError(el, msg) {
  el.innerHTML = msg ? icon('warning') + `<span>${msg}</span>` : '';
}

// ── Tabs ───────────────────────────────────────
function switchTab(name, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  btn.classList.add('active');
  const fab = document.getElementById('fabAdd');
  if (fab) fab.style.display = name === 'search' ? 'flex' : 'none';
}

// ── Init ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('gss_token')) {
    token = localStorage.getItem('gss_token');
    document.getElementById('cfgToken').value = token;
  }
  loadData();

  document.addEventListener('click', e => {
    if (!document.getElementById('searchWrap').contains(e.target))
      document.getElementById('dropdown').innerHTML = '';
  });
});
