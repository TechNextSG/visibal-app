/* VISIBAL shared runtime — loaded before inline scripts */

// ── DARK MODE ─────────────────────────────────────────────
function _applyTheme() {
  const dark = localStorage.getItem('visibal_dark') === '1';
  const app = document.querySelector('.app');
  if (app) app.setAttribute('data-theme', dark ? 'dark' : 'light');
  const toggle = document.getElementById('darkModeToggle');
  if (toggle) toggle.checked = dark;
  const sub = document.getElementById('darkModeSubText');
  if (sub) sub.textContent = dark ? 'Ein' : 'Aus';
}

function toggleDarkMode() {
  const isDark = localStorage.getItem('visibal_dark') === '1';
  localStorage.setItem('visibal_dark', isDark ? '0' : '1');
  _applyTheme();
  _trackEvent('dark_mode_toggle');
}

// ── ANALYTICS (localStorage-based event counting) ────────
function _trackEvent(name) {
  try {
    const stats = JSON.parse(localStorage.getItem('visibal_analytics') || '{}');
    stats[name] = (stats[name] || 0) + 1;
    stats._last = new Date().toISOString();
    localStorage.setItem('visibal_analytics', JSON.stringify(stats));
  } catch(e) {}
}

// ── ERROR TRACKING (ring-buffer of last 20 JS errors) ────
window.onerror = function(msg, src, line, col) {
  try {
    const errors = JSON.parse(localStorage.getItem('visibal_errors') || '[]');
    errors.unshift({ msg: String(msg), src: (src || '').split('/').pop(), line, time: new Date().toISOString() });
    localStorage.setItem('visibal_errors', JSON.stringify(errors.slice(0, 20)));
  } catch(e) {}
};
window.addEventListener('unhandledrejection', function(e) {
  try {
    const errors = JSON.parse(localStorage.getItem('visibal_errors') || '[]');
    errors.unshift({ msg: (e.reason && e.reason.message) || String(e.reason), src: 'promise', time: new Date().toISOString() });
    localStorage.setItem('visibal_errors', JSON.stringify(errors.slice(0, 20)));
  } catch(err) {}
});

// ── OFFLINE DETECTION ─────────────────────────────────────
(function() {
  function _setOnline(val) {
    document.body.dataset.online = val ? 'true' : 'false';
    if (!val) _trackEvent('went_offline');
  }
  window.addEventListener('online',  function() { _setOnline(true); });
  window.addEventListener('offline', function() { _setOnline(false); });
  _setOnline(navigator.onLine);
})();

// Apply theme immediately so there's no flash
_applyTheme();
