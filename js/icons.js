// ── SVG icon set (stroke 2px, round caps, 24x24) ──
const ICONS = {
  search:  '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/>',
  calc:    '<rect x="4.5" y="2.5" width="15" height="19" rx="2.5"/><path d="M8 6.5h8"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5h.01M8.5 18h.01M12 18h.01M15.5 18h.01"/>',
  settings:'<path d="M4 6h8"/><circle cx="14" cy="6" r="2"/><path d="M18 6h2"/><path d="M4 12h2"/><circle cx="8" cy="12" r="2"/><path d="M12 12h8"/><path d="M4 18h10"/><circle cx="16" cy="18" r="2"/><path d="M20 18h0.01"/>',
  save:    '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',
  plus:    '<path d="M12 5v14M5 12h14"/>',
  edit:    '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  trash:   '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6M14 11v6"/>',
  box:     '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  warning: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>',
  check:   '<circle cx="12" cy="12" r="9"/><path d="m8.2 12.4 2.6 2.6 5-5.6"/>',
  error:   '<circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/>',
  info:    '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M12 11.5V16"/>',
  x:       '<path d="M18 6 6 18M6 6l12 12"/>',
  loader:  '<path d="M21 12a9 9 0 1 1-9-9"/>'
};

function icon(name, cls = '') {
  return `<svg class="icon${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
}

// hydrate static elements: <button data-icon="search">...</button>
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-icon]').forEach(el => {
    el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon));
  });
});
