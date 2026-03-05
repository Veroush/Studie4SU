function checkAdminAccess() {
  const token = localStorage.getItem('auth_token');
  if (!token) { window.location.href = 'login.html'; return; }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role !== 'admin') { window.location.href = 'index.html'; }
    document.getElementById('admin-name').textContent = payload.name || 'Admin';
  } catch {
    window.location.href = 'login.html';
  }
}
checkAdminAccess();

'use strict';

// ── Sidebar & Overlay ─────────────────────────────────────────
const sidebar       = document.getElementById('sidebar');
const overlay       = document.getElementById('sidebar-overlay');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');

mobileMenuBtn.addEventListener('click', () => {
  const isOpen = sidebar.classList.toggle('open');
  overlay.classList.toggle('visible', isOpen);
  mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
});

overlay.addEventListener('click', () => {
  sidebar.classList.remove('open');
  overlay.classList.remove('visible');
  mobileMenuBtn.setAttribute('aria-expanded', 'false');
});

// ── Logout ────────────────────────────────────────────────────
document.getElementById('logout-btn').addEventListener('click', () => {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('auth_token');
    window.location.href = '/login.html';
  }
});

// ── Default Settings ──────────────────────────────────────────
const DEFAULT_SETTINGS = {
  language: {
    available: ['dutch', 'english'],
    default: 'dutch'
  },
  platform: {
    name: 'Studiekeuzegids Suriname',
    contactEmail: '',
    supportEmail: '',
    tagline: ''
  },
  features: {
    enableFavorites: true,
    enableComparison: true,
    enableQuiz: true,
    enableOpenHouse: true
  },
  notifications: {
    email: false,
    dailySummary: false
  },
  data: {
    retentionPeriod: '90'
  }
};

// ── State ─────────────────────────────────────────────────────
let isDirty = false;

// ── Toast ─────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const icon = type === 'success'
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `${icon}<span>${escHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Unsaved changes badge ─────────────────────────────────────
function markDirty() {
  if (!isDirty) {
    isDirty = true;
    document.getElementById('unsaved-badge').hidden = false;
  }
}

function markClean() {
  isDirty = false;
  document.getElementById('unsaved-badge').hidden = true;
}

// ── Populate form from a settings object ──────────────────────
function applySettings(s) {
  // Language
  document.getElementById('lang-nl').checked  = s.language.available.includes('dutch');
  document.getElementById('lang-en').checked  = s.language.available.includes('english');
  document.getElementById('default-lang').value = s.language.default;

  // Platform
  document.getElementById('platform-name').value    = s.platform.name;
  document.getElementById('contact-email').value    = s.platform.contactEmail;
  document.getElementById('support-email').value    = s.platform.supportEmail;
  document.getElementById('platform-tagline').value = s.platform.tagline;

  // Features
  document.getElementById('feat-favorites').checked  = s.features.enableFavorites;
  document.getElementById('feat-compare').checked    = s.features.enableComparison;
  document.getElementById('feat-quiz').checked       = s.features.enableQuiz;
  document.getElementById('feat-openhouse').checked  = s.features.enableOpenHouse;

  // Notifications
  document.getElementById('notif-email').checked   = s.notifications.email;
  document.getElementById('notif-summary').checked = s.notifications.dailySummary;

  // Data
  document.getElementById('data-retention').value = s.data.retentionPeriod;
}

// ── Read form into an object ──────────────────────────────────
function collectFormData() {
  const available = [];
  if (document.getElementById('lang-nl').checked)  available.push('dutch');
  if (document.getElementById('lang-en').checked)  available.push('english');

  return {
    language: {
      available,
      default: document.getElementById('default-lang').value
    },
    platform: {
      name:         document.getElementById('platform-name').value.trim(),
      contactEmail: document.getElementById('contact-email').value.trim(),
      supportEmail: document.getElementById('support-email').value.trim(),
      tagline:      document.getElementById('platform-tagline').value.trim()
    },
    features: {
      enableFavorites:  document.getElementById('feat-favorites').checked,
      enableComparison: document.getElementById('feat-compare').checked,
      enableQuiz:       document.getElementById('feat-quiz').checked,
      enableOpenHouse:  document.getElementById('feat-openhouse').checked
    },
    notifications: {
      email:        document.getElementById('notif-email').checked,
      dailySummary: document.getElementById('notif-summary').checked
    },
    data: {
      retentionPeriod: document.getElementById('data-retention').value
    }
  };
}

// ── Validation ────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  const val   = input.value.trim();
  if (val && !EMAIL_RE.test(val)) {
    input.classList.add('is-invalid');
    error.hidden = false;
    return false;
  }
  input.classList.remove('is-invalid');
  error.hidden = true;
  return true;
}

function validate() {
  const a = validateEmail('contact-email', 'contact-email-error');
  const b = validateEmail('support-email', 'support-email-error');

  // At least one language must be selected
  const langs = [document.getElementById('lang-nl'), document.getElementById('lang-en')];
  if (!langs.some(l => l.checked)) {
    showToast('At least one language must be enabled.', 'error');
    langs[0].focus();
    return false;
  }

  return a && b;
}

// ── Load settings from API (or fall back to localStorage draft) ─
async function loadSettings() {
  // Try to restore saved draft from localStorage
  const draft = localStorage.getItem('settings_draft');
  if (draft) {
    try {
      applySettings(JSON.parse(draft));
      markDirty();
      return;
    } catch { /* ignore corrupt draft */ }
  }

  // Try real API
  try {
    const token = localStorage.getItem('auth_token');
    const res   = await fetch('/admin/settings', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      applySettings(data);
      return;
    }
  } catch { /* API not yet implemented */ }

  // Fall back to defaults
  applySettings(DEFAULT_SETTINGS);
}

// ── Save settings ─────────────────────────────────────────────
async function saveSettings() {
  if (!validate()) return;

  const btn = document.getElementById('save-btn');
  btn.classList.add('loading');
  btn.textContent = 'Saving…';

  const payload = collectFormData();

  try {
    const token = localStorage.getItem('auth_token');
    const res   = await fetch('/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      localStorage.removeItem('settings_draft');
      markClean();
      showToast('Settings saved successfully.', 'success');
    } else {
      // Save draft locally so changes aren't lost
      localStorage.setItem('settings_draft', JSON.stringify(payload));
      showToast('Could not reach the server — changes saved locally.', 'error');
    }
  } catch {
    localStorage.setItem('settings_draft', JSON.stringify(payload));
    showToast('Could not reach the server — changes saved locally.', 'error');
  } finally {
    btn.classList.remove('loading');
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Save Settings`;
  }
}

// ── Reset to defaults ─────────────────────────────────────────
function resetToDefaults() {
  if (!confirm('Reset all settings to their default values? Any unsaved changes will be lost.')) return;
  localStorage.removeItem('settings_draft');
  applySettings(DEFAULT_SETTINGS);
  markClean();
  showToast('Settings reset to defaults.', 'success');
}

// ── Auto-save draft to localStorage ──────────────────────────
let draftTimer = null;
function scheduleDraftSave() {
  clearTimeout(draftTimer);
  draftTimer = setTimeout(() => {
    localStorage.setItem('settings_draft', JSON.stringify(collectFormData()));
  }, 800);
}

// ── Keyboard shortcut: Ctrl+S / Cmd+S ────────────────────────
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveSettings();
  }
});

// ── Unsaved changes warning on navigate away ──────────────────
window.addEventListener('beforeunload', e => {
  if (isDirty) {
    e.preventDefault();
    e.returnValue = '';
  }
});

// ── Attach change listeners ───────────────────────────────────
function attachChangeListeners() {
  const form = document.getElementById('content-area');
  form.addEventListener('change', () => { markDirty(); scheduleDraftSave(); });
  form.addEventListener('input',  () => { markDirty(); scheduleDraftSave(); });

  // Live email validation on blur
  document.getElementById('contact-email').addEventListener('blur', () => validateEmail('contact-email', 'contact-email-error'));
  document.getElementById('support-email').addEventListener('blur', () => validateEmail('support-email', 'support-email-error'));
}

// ── Wire buttons ──────────────────────────────────────────────
document.getElementById('save-btn').addEventListener('click', saveSettings);
document.getElementById('reset-btn').addEventListener('click', resetToDefaults);

// ── Init ──────────────────────────────────────────────────────
async function init() {
  await loadSettings();
  attachChangeListeners();
}

init();