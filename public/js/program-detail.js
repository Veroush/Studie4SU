/* ================================================================
   program-detail.js
   Loads a single study program by ?id= query param from the API.
   Links to this page from: schools.html, school-detail.html,
   quiz results — all pass ?id=<programId> in the URL.
================================================================ */

'use strict';

// ── Language ──────────────────────────────────────────────────
let currentLang = localStorage.getItem('language') || 'nl';

const T = {
  nl: {
    backLabel:       'Terug naar school',
    bcSchools:       'Scholen',
    btnWebsite:      'Bezoek schoolwebsite',
    btnWebsiteCard:  'Bezoek website',
    labelDescription:'Over deze opleiding',
    labelAdmission:  'Toelatingseisen',
    labelCareers:    'Carrièremogelijkheden',
    labelSchedule:   'Duur & Rooster',
    labelTuition:    'Collegegeld',
    labelSchoolInfo: 'Schoolinformatie',
    tuitionNote:     'Per academisch jaar. Bedragen kunnen wijzigen.',
    compareAdd:      'Vergelijk opleiding',
    compareAdded:    'Toegevoegd aan vergelijking',
    compareMax:      'Je kunt maximaal 3 opleidingen vergelijken.',
    compareView:     'Bekijk vergelijking →',
    compareToast:    'Toegevoegd aan vergelijking',
    loading:         'Laden...',
    errorTitle:      'Opleiding niet gevonden',
    errorMsg:        'Deze opleiding bestaat niet of is verwijderd.',
    noData:          'Geen informatie beschikbaar.',
    duration:        'Duur',
    level:           'Niveau',
    location:        'Locatie',
    website:         'Website',
  },
  en: {
    backLabel:       'Back to school',
    bcSchools:       'Schools',
    btnWebsite:      'Visit school website',
    btnWebsiteCard:  'Visit website',
    labelDescription:'About this program',
    labelAdmission:  'Admission requirements',
    labelCareers:    'Career options',
    labelSchedule:   'Duration & Schedule',
    labelTuition:    'Tuition fee',
    labelSchoolInfo: 'School information',
    tuitionNote:     'Per academic year. Amounts may change.',
    compareAdd:      'Compare program',
    compareAdded:    'Added to comparison',
    compareMax:      'You can compare a maximum of 3 programs.',
    compareView:     'View comparison →',
    compareToast:    'Added to comparison',
    loading:         'Loading...',
    errorTitle:      'Program not found',
    errorMsg:        'This program does not exist or has been removed.',
    noData:          'No information available.',
    duration:        'Duration',
    level:           'Level',
    location:        'Location',
    website:         'Website',
  }
};

function t(key) { return T[currentLang][key] || key; }

// ── Toast ─────────────────────────────────────────────────────
let _pdToastTimer;
function showFavToast(added) {
  let el = document.getElementById('fav-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'fav-toast';
    el.className = 'fav-toast';
    document.body.appendChild(el);
  }
  const lang = currentLang;
  const msg = added
    ? (lang === 'nl' ? 'Toegevoegd aan favorieten' : 'Added to favourites')
    : (lang === 'nl' ? 'Verwijderd uit favorieten' : 'Removed from favourites');
  el.innerHTML = added
    ? `${msg} &nbsp;<a href="favorites.html" class="toast-fav-link">${lang === 'nl' ? 'Bekijk favorieten →' : 'View favourites →'}</a>`
    : msg;
  el.classList.add('show');
  clearTimeout(_pdToastTimer);
  _pdToastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}

// ── Favorites ─────────────────────────────────────────────────
function isProgramFav(id) {
  try { return (JSON.parse(localStorage.getItem('fav_programs') || '[]')).includes(id); }
  catch { return false; }
}

function toggleProgramFav(id) {
  let favs;
  try { favs = JSON.parse(localStorage.getItem('fav_programs') || '[]'); }
  catch { favs = []; }
  const idx = favs.indexOf(id);
  if (idx === -1) favs.push(id);
  else favs.splice(idx, 1);
  localStorage.setItem('fav_programs', JSON.stringify(favs));
  showFavToast(idx === -1);
  updateFavButton(id);
}

function updateFavButton(id) {
  const btn = document.getElementById('btn-fav-program');
  if (!btn) return;
  const isFav = isProgramFav(id);
  btn.classList.toggle('active', isFav);
  btn.setAttribute('aria-label', isFav ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten');
  const path = btn.querySelector('path');
  if (path) path.setAttribute('fill', isFav ? 'currentColor' : 'none');
}

// ── Compare ───────────────────────────────────────────────────
function getCompareItems() {
  try { return JSON.parse(localStorage.getItem('program_compare') || '[]'); }
  catch { return []; }
}

function isProgramInCompare(id) {
  return getCompareItems().includes(id);
}

function toggleProgramCompare(id) {
  let items = getCompareItems();
  const idx = items.indexOf(id);
  if (idx === -1) {
    if (items.length >= 3) {
      window.location.href = `program-compare.html?ids=${items.join(',')}&replace=${encodeURIComponent(id)}`;
      return;
    }
    items.push(id);
    localStorage.setItem('program_compare', JSON.stringify(items));
    window.location.href = `program-compare.html?ids=${items.join(',')}`;
  } else {
    items.splice(idx, 1);
    localStorage.setItem('program_compare', JSON.stringify(items));
    updateCompareButton(id);
    showCompareToast(false, items);
  }
}

function updateCompareButton(id) {
  const btn = document.getElementById('btn-compare-program');
  if (!btn) return;
  const inCompare = isProgramInCompare(id);
  btn.classList.toggle('active', inCompare);
  btn.setAttribute('title', inCompare ? t('compareAdded') : t('compareAdd'));
  btn.setAttribute('aria-label', inCompare ? t('compareAdded') : t('compareAdd'));
  const label = btn.querySelector('.compare-btn-label');
  if (label) label.textContent = inCompare ? t('compareAdded') : t('compareAdd');
}

let _cmpToastTimer;
function showCompareToast(added, items) {
  let el = document.getElementById('compare-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'compare-toast';
    el.className = 'fav-toast';
    document.body.appendChild(el);
  }
  if (added && items.length >= 2) {
    const ids = items.join(',');
    el.innerHTML = `${t('compareToast')} &nbsp;<a href="program-compare.html?ids=${ids}" class="toast-fav-link">${t('compareView')}</a>`;
  } else if (added) {
    el.textContent = t('compareToast');
  } else {
    el.textContent = currentLang === 'nl' ? 'Verwijderd uit vergelijking' : 'Removed from comparison';
  }
  el.classList.add('show');
  clearTimeout(_cmpToastTimer);
  _cmpToastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}

const CLUSTER_LABELS = {
  nl: { TECH: 'Technologie', MED: 'Gezondheidszorg', BUS: 'Economie & Business',
        SOC: 'Sociale Wetenschappen', EDU: 'Onderwijs', SCI: 'Wetenschap', LAW: 'Recht' },
  en: { TECH: 'Technology', MED: 'Healthcare', BUS: 'Economics & Business',
        SOC: 'Social Sciences', EDU: 'Education', SCI: 'Science', LAW: 'Law' }
};

function clusterLabel(code) {
  return (CLUSTER_LABELS[currentLang] || CLUSTER_LABELS.nl)[code] || code;
}

// ── Helpers ───────────────────────────────────────────────────
function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function show(id)  { const el = document.getElementById(id); if (el) { el.hidden = false; el.style.removeProperty("display"); } }
function hide(id)  { const el = document.getElementById(id); if (el) { el.hidden = true; el.style.setProperty('display', 'none', 'important'); } }
function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

function getProgramId() {
  return new URLSearchParams(window.location.search).get('id');
}

function showError(title, msg) {
  hide('page-loading');
  hide('main-content');
  setText('error-title', title || t('errorTitle'));
  setText('error-msg',   msg   || t('errorMsg'));
  show('page-error');
}

const CLUSTER_IMAGES = {
  TECH: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80',
  MED:  'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&q=80',
  BUS:  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
  SOC:  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80',
  EDU:  'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&q=80',
  SCI:  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=80',
  LAW:  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=80',
};

// ── Render ────────────────────────────────────────────────────
function renderProgram(program, school) {
  hide('page-error');
  document.title = `${program.name} | Studie4SU`;

  const schoolUrl = school
    ? `school-detail.html?id=${encodeURIComponent(school.id)}`
    : 'schools.html';

  const bcSchoolEl = document.getElementById('bc-school');
  if (bcSchoolEl) {
    bcSchoolEl.textContent = school?.shortName || school?.name || '—';
    bcSchoolEl.href = schoolUrl;
  }
  setText('bc-program', program.name);
  setText('bc-schools', t('bcSchools'));

  const backLink = document.getElementById('back-link');
  if (backLink) {
    backLink.href = schoolUrl;
    setText('back-label', t('backLabel'));
  }

  const clusterTag = document.getElementById('cluster-tag');
  if (clusterTag) {
    clusterTag.textContent = clusterLabel(program.cluster);
    clusterTag.setAttribute('data-cluster', program.cluster || '');
  }

  const heroBgUrl = CLUSTER_IMAGES[program.cluster] || '';
  if (heroBgUrl) {
    document.querySelector('.hero').style.setProperty('--hero-bg-img', `url('${heroBgUrl}')`);
  }

  setText('program-name', program.name);
  setText('school-name', school?.name || '—');

  updateFavButton(program.id);
  document.getElementById('btn-fav-program')
    .addEventListener('click', () => toggleProgramFav(program.id));

  updateCompareButton(program.id);
  const cmpBtn = document.getElementById('btn-compare-program');
  if (cmpBtn) cmpBtn.addEventListener('click', () => toggleProgramCompare(program.id));

  if (program.duration) {
    setText('duration-val', program.duration);
    show('meta-duration');
  }

  const levelMatch = program.description?.match(/Niveau:\s*([^\|]+)/i);
  const levelText  = levelMatch ? levelMatch[1].trim() : null;
  if (levelText) {
    setText('level-val', levelText);
    show('meta-level');
  }

  if (program.tuitionCost) {
    setText('cost-val', program.tuitionCost);
    show('meta-cost');
  }

  if (school?.website) {
    const btnWebsite = document.getElementById('btn-website');
    if (btnWebsite) {
      btnWebsite.href = school.website;
      setText('btn-website-label', t('btnWebsite'));
      show('btn-website');
    }
  }

  let descText = program.description;
  if (descText) {
    descText = descText.replace(/\s*\|\s*Niveau:[^|]*/i, '').trim();
    descText = descText.replace(/^Vakkenpakket:\s*/i, '').trim();
    if (descText) {
      setText('description-val', descText);
      setText('lbl-description', t('labelDescription'));
      show('card-description');
    }
  }

  if (program.levelRequired) {
    const admText = program.levelRequired.endsWith('...')
      ? program.levelRequired.slice(0, -3) + '\n(Zie schoolwebsite voor volledige toelatingseisen)'
      : program.levelRequired;
    setText('admission-val', admText);
    setText('lbl-admission', t('labelAdmission'));
    show('card-admission');
  }

  if (program.careers) {
    const careersContainer = document.getElementById('careers-val');
    if (careersContainer) {
      const items = program.careers.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
      if (items.length) {
        careersContainer.innerHTML = items
          .map(c => `<span class="career-pill">${escHtml(c)}</span>`)
          .join('');
        setText('lbl-careers', t('labelCareers'));
        show('card-careers');
      }
    }
  }

  const scheduleContainer = document.getElementById('schedule-val');
  if (scheduleContainer && program.duration) {
    const rows = [];
    if (program.duration) {
      rows.push({ icon: clockSvg(), label: `${t('duration')}: ${program.duration}` });
    }
    if (rows.length) {
      scheduleContainer.innerHTML = rows
        .map(r => `<div class="schedule-row">${r.icon}<span>${escHtml(r.label)}</span></div>`)
        .join('');
      setText('lbl-schedule', t('labelSchedule'));
      show('card-schedule');
    }
  }

  if (program.tuitionCost) {
    setText('tuition-val', program.tuitionCost);
    setText('lbl-tuition', t('labelTuition'));
    setText('lbl-tuition-note', t('tuitionNote'));
    show('card-tuition');
  }

  const schoolInfoContainer = document.getElementById('school-info-val');
  if (schoolInfoContainer && school) {
    const rows = [];
    if (school.name)     rows.push({ icon: schoolSvg(), text: school.name });
    if (school.type)     rows.push({ icon: levelSvg(),  text: school.type });
    if (school.location) rows.push({ icon: pinSvg(),    text: school.location });
    if (school.website)  rows.push({ icon: linkSvg(),   text: school.website, isLink: true });

    schoolInfoContainer.innerHTML = rows.map(r =>
      `<div class="school-info-row">
        ${r.icon}
        ${r.isLink
          ? `<a href="${escHtml(r.text)}" target="_blank" rel="noopener" style="color:var(--green-600)">${escHtml(r.text)}</a>`
          : `<span>${escHtml(r.text)}</span>`
        }
      </div>`
    ).join('');

    setText('lbl-school-info', t('labelSchoolInfo'));

    if (school.website) {
      const btnCard = document.getElementById('btn-website-card');
      if (btnCard) {
        btnCard.href = school.website;
        setText('btn-website-card-label', t('btnWebsiteCard'));
        show('btn-website-card');
      }
    }
  }

  hide('page-loading');
  show('main-content');
}

// ── SVG helpers ───────────────────────────────────────────────
function clockSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
}
function schoolSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
}
function levelSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;
}
function pinSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
}
function linkSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
}

// ── Fetch & init ──────────────────────────────────────────────
async function init() {
  const programId = getProgramId();

  if (!programId) {
    showError(t('errorTitle'), t('errorMsg'));
    return;
  }

  try {
    const res = await fetch(`/programs/${encodeURIComponent(programId)}`);
    if (!res.ok) {
      showError(t('errorTitle'), t('errorMsg'));
      return;
    }
    const program = await res.json();
    const school = program.school || null;
    renderProgram(program, school);
  } catch {
    showError(t('errorTitle'), t('errorMsg'));
  }
}

// ── Auth / Rich profile popup ─────────────────────────────────

// Canonical avatar map — must match settings.js exactly.
// Default fallback key: 'graduate'
const AVATARS_MAP = {
  graduate: '🎓', student: '📖', laptop: '💻', owl: '🦉', fox: '🦊',
  panda: '🐼', cat: '🐱', robot: '🤖', dog: '🐶', science: '🔬',
  art: '🎨', rocket: '🚀', star: '⭐', book: '📚', trophy: '🏆', globe: '🌍',
};

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

  // Show profile button, hide login button
  // (CSS .is-logged-in rules handle the flash prevention;
  //  these lines sync the full state once JS has fully loaded)
  document.getElementById('login-btn').style.display      = 'none';
  document.getElementById('profile-btn').style.display    = 'flex';
  document.getElementById('mobile-login').style.display   = 'none';
  document.getElementById('mobile-profile').style.display = 'block';

  // Display name — prefer localStorage value set in settings.html
  const displayName = localStorage.getItem('user_display_name') || payload.name || 'Profiel';
  document.getElementById('profile-name-label').textContent = displayName;

  // Popup name & email from JWT
  document.getElementById('popup-name').textContent  = payload.name  || 'Student';
  document.getElementById('popup-email').textContent = payload.email || '';

  // Avatar — read from localStorage, fall back to 'graduate'
  const avatarId    = localStorage.getItem('user_avatar') || 'graduate';
  const avatarEmoji = AVATARS_MAP[avatarId] || '🎓';
  document.getElementById('nav-avatar-display').textContent = avatarEmoji;
  document.getElementById('popup-avatar-lg').textContent    = avatarEmoji;

  // NOTE: popup-role element has been removed from the rich popup HTML.
  // Role display is no longer shown in the popup per the new design standard.

  // Notifications toggle — sync with localStorage
  const notifToggle = document.getElementById('popup-notif-toggle');
  if (notifToggle) {
    notifToggle.checked = localStorage.getItem('user_notif_general') === 'true';
    notifToggle.addEventListener('change', () => {
      localStorage.setItem('user_notif_general', notifToggle.checked);
    });
  }
}

function toggleProfilePopup(e) {
  e.stopPropagation();
  document.getElementById('profile-popup').classList.toggle('open');
}

function logout() {
  localStorage.removeItem('auth_token');
  window.location.reload();
}

// Click-outside handler — closes popup only when clicking outside
// the entire profile-wrap (button + popup together).
// FIX: old version used `document.addEventListener('click', ...)` with no
// contains() check, so it closed the popup on ANY click including inside it.
document.addEventListener('click', (e) => {
  const wrap = document.getElementById('profile-btn');
  const popup = document.getElementById('profile-popup');
  if (popup && wrap && !wrap.contains(e.target)) {
    popup.classList.remove('open');
  }
});

// ── Language switching ────────────────────────────────────────
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('language', lang);

  document.querySelectorAll('[data-nl]').forEach(el => {
    el.textContent = el.dataset[lang] || el.textContent;
  });

  document.getElementById('btn-nl').classList.toggle('active', lang === 'nl');
  document.getElementById('btn-en').classList.toggle('active', lang === 'en');
  document.documentElement.lang = lang;
  init();
}

document.getElementById('btn-nl').addEventListener('click', () => setLanguage('nl'));
document.getElementById('btn-en').addEventListener('click', () => setLanguage('en'));

// ── Hamburger ─────────────────────────────────────────────────
document.getElementById('hamburger-btn').addEventListener('click', () => {
  document.getElementById('mobile-nav').classList.toggle('open');
});

// ── Set initial lang button state ─────────────────────────────
document.getElementById('btn-nl').classList.toggle('active', currentLang === 'nl');
document.getElementById('btn-en').classList.toggle('active', currentLang === 'en');
document.documentElement.lang = currentLang;

// ── Go ────────────────────────────────────────────────────────
initAuth();
init();