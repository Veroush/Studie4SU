/**
 * theme-init.js — include in <head> on every page that supports dark mode.
 * Runs immediately (before paint) so there's no flash of wrong theme.
 * Also exposes window.applyTheme() for pages that have a toggle.
 */
(function () {
  function _applyTheme(theme) {
    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    document.documentElement.classList.toggle('theme-dark',  isDark);
    document.documentElement.classList.toggle('theme-light', !isDark);

    // Keep dark_mode key in sync (used by popup toggle)
    try { localStorage.setItem('dark_mode', String(isDark)); } catch (_) {}
  }

  // Restore saved preference immediately to prevent FOUC
  try {
    const saved = localStorage.getItem('user_theme') || 'light';
    _applyTheme(saved);
  } catch (_) {}

  // Expose globally so any inline onclick / other scripts can call it
  window.applyTheme = _applyTheme;

  // React to OS-level changes when theme is set to 'system'
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    try {
      const saved = localStorage.getItem('user_theme') || 'light';
      if (saved === 'system') _applyTheme('system');
    } catch (_) {}
  });
})();