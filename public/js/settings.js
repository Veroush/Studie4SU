'use strict';

/* ============================================================
   CONSTANTS
============================================================ */
const AVATARS = [
  { id: 'graduate',  emoji: '🎓', label: 'Graduate' },
  { id: 'student',   emoji: '📖', label: 'Student' },
  { id: 'laptop',    emoji: '💻', label: 'Laptop' },
  { id: 'owl',       emoji: '🦉', label: 'Owl' },
  { id: 'fox',       emoji: '🦊', label: 'Fox' },
  { id: 'panda',     emoji: '🐼', label: 'Panda' },
  { id: 'cat',       emoji: '🐱', label: 'Cat' },
  { id: 'robot',     emoji: '🤖', label: 'Robot' },
  { id: 'dog',       emoji: '🐶', label: 'Dog' },
  { id: 'science',   emoji: '🔬', label: 'Science' },
  { id: 'art',       emoji: '🎨', label: 'Art' },
  { id: 'rocket',    emoji: '🚀', label: 'Rocket' },
  { id: 'star',      emoji: '⭐', label: 'Star' },
  { id: 'book',      emoji: '📚', label: 'Books' },
  { id: 'trophy',    emoji: '🏆', label: 'Trophy' },
  { id: 'globe',     emoji: '🌍', label: 'Globe' },
];

const ACCENT_COLORS = [
  { id: 'gold',   value: '#e8b84b', rgb: '232,184,75',  label: 'Goud' },
  { id: 'blue',   value: '#3b82f6', rgb: '59,130,246',  label: 'Blauw' },
  { id: 'purple', value: '#8b5cf6', rgb: '139,92,246',  label: 'Paars' },
  { id: 'green',  value: '#22c55e', rgb: '34,197,94',   label: 'Groen' },
  { id: 'orange', value: '#f97316', rgb: '249,115,22',  label: 'Oranje' },
  { id: 'red',    value: '#ef4444', rgb: '239,68,68',   label: 'Rood' },
  { id: 'teal',   value: '#14b8a6', rgb: '20,184,166',  label: 'Teal' },
];

/* ============================================================
   USER SETTINGS — stored in localStorage
   Keys: user_avatar, user_display_name, user_theme,
         user_accent, user_notif_*, dark_mode
============================================================ */
function getSetting(key, fallback = null) {
  const v = localStorage.getItem(key);
  if (v === null) return fallback;
  if (v === 'true') return true;
  if (v === 'false') return false;
  return v;
}
function setSetting(key, value) {
  localStorage.setItem(key, String(value));
}

/* ============================================================
   LANGUAGE
============================================================ */
let lang = localStorage.getItem('language') || 'nl';

function applyLang(l) {
  lang = l;
  localStorage.setItem('language', l);
  document.getElementById('btn-nl').classList.toggle('active', l === 'nl');
  document.getElementById('btn-en').classList.toggle('active', l === 'en');
  document.querySelectorAll('[data-nl]').forEach(el => {
    const isInput = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';
    if (!isInput) el.textContent = l === 'nl' ? el.dataset.nl : el.dataset.en;
  });
  // Placeholders
  document.querySelectorAll('[data-nl-placeholder]').forEach(el => {
    el.placeholder = l === 'nl' ? el.dataset.nlPlaceholder : el.dataset.enPlaceholder;
  });
}

/* ============================================================
   AUTH
============================================================ */
function decodeToken(token) {
  try { return JSON.parse(atob(token.split('.')[1])); }
  catch { return null; }
}

function initAuth() {
  const token = localStorage.getItem('auth_token');
  if (!token) return;
  const payload = decodeToken(token);
  if (!payload || payload.exp * 1000 < Date.now()) {
    localStorage.removeItem('auth_token');
    return;
  }

  // Show profile, hide login
  document.getElementById('login-btn').style.display     = 'none';
  document.getElementById('profile-btn').style.display   = 'flex';
  document.getElementById('mobile-login').style.display  = 'none';
  document.getElementById('mobile-profile').style.display = 'block';

  const displayName = getSetting('user_display_name') || payload.name || 'Student';
  const avatar      = getSetting('user_avatar') || 'graduate';
  const avatarObj   = AVATARS.find(a => a.id === avatar) || AVATARS[0];

  document.getElementById('profile-name-label').textContent = displayName;
  document.getElementById('popup-name').textContent          = displayName;
  document.getElementById('popup-email').textContent         = payload.email || '';

  // Set avatar emoji in nav and popup
  const navAv = document.getElementById('nav-avatar-display');
  const popAv = document.getElementById('popup-avatar-lg');
  if (navAv) navAv.textContent = avatarObj.emoji;
  if (popAv) popAv.textContent = avatarObj.emoji;

  // Pre-fill display name input
  const nameInput = document.getElementById('display-name-input');
  if (nameInput) nameInput.value = displayName;
}

function toggleProfilePopup(e) {
  e.stopPropagation();
  document.getElementById('profile-popup').classList.toggle('open');
}

function logout() {
  localStorage.removeItem('auth_token');
  window.location.href = 'index.html';
}

document.addEventListener('click', (e) => {
  const popup = document.getElementById('profile-popup');
  const wrap  = document.getElementById('profile-btn');
  if (popup && wrap && !wrap.contains(e.target)) {
    popup.classList.remove('open');
  }
});

/* ============================================================
   TOAST
============================================================ */
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('settings-toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ============================================================
   AVATAR SECTION
============================================================ */
function renderAvatarGrid() {
  const grid = document.getElementById('avatar-grid');
  if (!grid) return;
  const currentAvatar = getSetting('user_avatar', 'graduate');
  grid.innerHTML = AVATARS.map(av => `
    <div class="avatar-option${av.id === currentAvatar ? ' selected' : ''}"
         data-avatar="${av.id}"
         title="${av.label}"
         onclick="selectAvatar('${av.id}')">
      ${av.emoji}
    </div>
  `).join('');
}

function selectAvatar(id) {
  setSetting('user_avatar', id);
  // Refresh grid selection
  document.querySelectorAll('.avatar-option').forEach(el => {
    el.classList.toggle('selected', el.dataset.avatar === id);
  });
  // Update nav + popup avatar
  const avatarObj = AVATARS.find(a => a.id === id) || AVATARS[0];
  const navAv = document.getElementById('nav-avatar-display');
  const popAv = document.getElementById('popup-avatar-lg');
  if (navAv) navAv.textContent = avatarObj.emoji;
  if (popAv) popAv.textContent = avatarObj.emoji;

  const msg = lang === 'nl' ? '✓ Avatar opgeslagen' : '✓ Avatar saved';
  showToast(msg);
}

/* ============================================================
   DISPLAY NAME
============================================================ */
function initDisplayName() {
  const btn = document.getElementById('save-name-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const input = document.getElementById('display-name-input');
    const val = input.value.trim();
    if (!val) return;
    setSetting('user_display_name', val);
    document.getElementById('profile-name-label').textContent = val;
    document.getElementById('popup-name').textContent = val;
    const msg = lang === 'nl' ? '✓ Naam opgeslagen' : '✓ Name saved';
    showToast(msg);
  });
}

/* ============================================================
   THEME
============================================================ */
function applyTheme(theme) {
  // For now this is stored — actual light/dark CSS switching
  // would be added per-page. This stores the preference.
  setSetting('user_theme', theme);
  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.remove('theme-light');
    document.documentElement.classList.add('theme-dark');
  } else if (theme === 'light') {
    document.documentElement.classList.remove('theme-dark');
    document.documentElement.classList.add('theme-light');
  }
}

function renderThemeOptions() {
  const current = getSetting('user_theme', 'dark');
  document.querySelectorAll('.theme-option').forEach(el => {
    const radio = el.querySelector('input[type=radio]');
    const val   = radio ? radio.value : null;
    if (!val) return;
    radio.checked = val === current;
    el.classList.toggle('selected', val === current);
    radio.addEventListener('change', () => {
      applyTheme(val);
      document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('selected'));
      el.classList.add('selected');
      const msg = lang === 'nl' ? '✓ Thema opgeslagen' : '✓ Theme saved';
      showToast(msg);
    });
  });
}

/* ============================================================
   ACCENT COLOR
============================================================ */
function applyAccent(colorObj) {
  document.documentElement.style.setProperty('--accent', colorObj.value);
  document.documentElement.style.setProperty('--accent-rgb', colorObj.rgb);
  setSetting('user_accent', colorObj.id);
}

function renderAccentGrid() {
  const grid = document.getElementById('accent-grid');
  if (!grid) return;
  const current = getSetting('user_accent', 'gold');
  grid.innerHTML = ACCENT_COLORS.map(c => `
    <div class="accent-swatch${c.id === current ? ' selected' : ''}"
         data-accent="${c.id}"
         style="background:${c.value}"
         title="${c.label}"
         onclick="selectAccent('${c.id}')">
    </div>
  `).join('');
  // Apply current accent
  const current_obj = ACCENT_COLORS.find(c => c.id === current) || ACCENT_COLORS[0];
  applyAccent(current_obj);
}

function selectAccent(id) {
  const colorObj = ACCENT_COLORS.find(c => c.id === id);
  if (!colorObj) return;
  applyAccent(colorObj);
  document.querySelectorAll('.accent-swatch').forEach(el => {
    el.classList.toggle('selected', el.dataset.accent === id);
  });
  const msg = lang === 'nl' ? '✓ Kleur opgeslagen' : '✓ Color saved';
  showToast(msg);
}

/* ============================================================
   DARK MODE TOGGLE (in popup + init)
============================================================ */
function handleDarkToggle(checked) {
  setSetting('dark_mode', checked);
  const msg = checked
    ? (lang === 'nl' ? '🌙 Donkere modus aan' : '🌙 Dark mode on')
    : (lang === 'nl' ? '☀️ Lichte modus aan'  : '☀️ Light mode on');
  showToast(msg);
}

function initDarkToggle() {
  const t = document.getElementById('popup-dark-toggle');
  if (t) t.checked = getSetting('dark_mode', false);
}

/* ============================================================
   NOTIFICATIONS
============================================================ */
const NOTIF_KEYS = [
  'email_announcements',
  'email_resources',
  'email_important',
  'platform_replies',
  'platform_updates',
  'platform_alerts',
];

function saveNotifPref(key, value) {
  setSetting(`notif_${key}`, value);
  const msg = value
    ? (lang === 'nl' ? '🔔 Melding ingeschakeld' : '🔔 Notification enabled')
    : (lang === 'nl' ? '🔕 Melding uitgeschakeld' : '🔕 Notification disabled');
  showToast(msg);
}

function initNotifToggles() {
  NOTIF_KEYS.forEach(key => {
    const el = document.getElementById(`notif-${key.replace('_', '-')}`);
    if (el) el.checked = getSetting(`notif_${key}`, key.includes('important') || key.includes('alerts'));
  });
}

function initNotifToggle() {
  const t = document.getElementById('popup-notif-toggle');
  if (t) {
    t.checked = getSetting('notif_platform_alerts', true);
    t.addEventListener('change', () => {
      setSetting('notif_platform_alerts', t.checked);
    });
  }
}

/* ============================================================
   PASSWORD CHANGE
============================================================ */
function initPasswordForm() {
  const btn = document.getElementById('change-pw-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const oldPw = document.getElementById('pw-old').value;
    const newPw = document.getElementById('pw-new').value;
    const cfPw  = document.getElementById('pw-confirm').value;
    const fb    = document.getElementById('pw-feedback');

    fb.className = 'pw-feedback';
    if (!oldPw || !newPw || !cfPw) {
      fb.textContent = lang === 'nl' ? 'Vul alle velden in.' : 'Please fill in all fields.';
      fb.classList.add('error');
      return;
    }
    if (newPw !== cfPw) {
      fb.textContent = lang === 'nl' ? 'Wachtwoorden komen niet overeen.' : 'Passwords do not match.';
      fb.classList.add('error');
      return;
    }
    if (newPw.length < 6) {
      fb.textContent = lang === 'nl' ? 'Wachtwoord moet minimaal 6 tekens zijn.' : 'Password must be at least 6 characters.';
      fb.classList.add('error');
      return;
    }

    btn.disabled = true;
    btn.textContent = lang === 'nl' ? 'Bezig...' : 'Saving...';

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw }),
      });
      if (res.ok) {
        fb.textContent = lang === 'nl' ? '✓ Wachtwoord bijgewerkt!' : '✓ Password updated!';
        fb.classList.add('success');
        document.getElementById('pw-old').value = '';
        document.getElementById('pw-new').value = '';
        document.getElementById('pw-confirm').value = '';
      } else {
        const d = await res.json().catch(() => ({}));
        fb.textContent = d.message || (lang === 'nl' ? 'Fout: controleer je wachtwoord.' : 'Error: check your password.');
        fb.classList.add('error');
      }
    } catch {
      fb.textContent = lang === 'nl' ? 'Kan server niet bereiken.' : 'Cannot reach server.';
      fb.classList.add('error');
    } finally {
      btn.disabled = false;
      btn.textContent = lang === 'nl' ? 'Wachtwoord bijwerken' : 'Update Password';
    }
  });
}

/* ============================================================
   DELETE ACCOUNT
============================================================ */
function openDeleteModal() {
  document.getElementById('delete-modal').style.display = 'flex';
}
function closeDeleteModal() {
  document.getElementById('delete-modal').style.display = 'none';
}
async function confirmDeleteAccount() {
  const token = localStorage.getItem('auth_token');
  try {
    await fetch('/auth/delete-account', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch { /* best-effort */ }
  localStorage.clear();
  window.location.href = 'index.html';
}

/* ============================================================
   SIDEBAR NAV — smooth highlight on scroll
============================================================ */
function initSidenavScroll() {
  const sections = document.querySelectorAll('.settings-section[id]');
  const navItems = document.querySelectorAll('.sidenav-item');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navItems.forEach(n => {
          n.classList.toggle('active', n.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  sections.forEach(s => obs.observe(s));
}

/* ============================================================
   HAMBURGER
============================================================ */
document.getElementById('hamburger-btn').addEventListener('click', () => {
  document.getElementById('mobile-nav').classList.toggle('open');
});

/* ============================================================
   LANG BUTTONS
============================================================ */
document.getElementById('btn-nl').addEventListener('click', () => applyLang('nl'));
document.getElementById('btn-en').addEventListener('click', () => applyLang('en'));

/* ============================================================
   DELETE BUTTON
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const delBtn = document.getElementById('delete-account-btn');
  if (delBtn) delBtn.addEventListener('click', openDeleteModal);
});

/* ============================================================
   INIT
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  applyLang(lang);

  renderAvatarGrid();
  renderThemeOptions();
  renderAccentGrid();
  initDisplayName();
  initNotifToggles();
  initNotifToggle();
  initDarkToggle();
  initPasswordForm();
  initSidenavScroll();

  // Apply saved theme & accent on load
  applyTheme(getSetting('user_theme', 'dark'));
});