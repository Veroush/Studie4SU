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
  return window.FavSync.isFav('programs', id);
}

async function toggleProgramFav(id) {
  const added = await window.FavSync.toggle('programs', id);
  showFavToast(added);
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

// ── Cluster labels ────────────────────────────────────────────
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

// ── Get program ID from URL ───────────────────────────────────
function getProgramId() {
  return new URLSearchParams(window.location.search).get('id');
}

// ── Show error state ──────────────────────────────────────────
function showError(title, msg) {
  hide('page-loading');
  hide('main-content');
  setText('error-title', title || t('errorTitle'));
  setText('error-msg',   msg   || t('errorMsg'));
  show('page-error');
}

// ── Render the page with program data ─────────────────────────
function renderProgram(program, school) {

  // Ensure error state is hidden
  hide('page-error');

  // ── Page title
  document.title = `${program.name} | Studie4SU`;

  // ── Breadcrumb
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

  // ── Back link
  const backLink = document.getElementById('back-link');
  if (backLink) {
    backLink.href = schoolUrl;
    setText('back-label', t('backLabel'));
  }

  // ── Cluster tag
  const clusterTag = document.getElementById('cluster-tag');
  if (clusterTag) {
    clusterTag.textContent = clusterLabel(program.cluster);
    clusterTag.setAttribute('data-cluster', program.cluster || '');
  }

  // ── Hero
  setText('program-name', program.name);
  setText('school-name', school?.name || '—');

  // ── Favorite button — button is in HTML, just sync its state
  updateFavButton(program.id);
  document.getElementById('btn-fav-program')
    .addEventListener('click', () => toggleProgramFav(program.id));

  // Duration pill
  if (program.duration) {
    setText('duration-val', program.duration);
    show('meta-duration');
  }

  // Level pill (stored in description as "Niveau: bachelor")
  // We also check if levelRequired has a short summary
  const levelMatch = program.description?.match(/Niveau:\s*([^\|]+)/i);
  const levelText  = levelMatch ? levelMatch[1].trim() : null;
  if (levelText) {
    setText('level-val', levelText);
    show('meta-level');
  }

  // Cost pill
  if (program.tuitionCost) {
    setText('cost-val', program.tuitionCost);
    show('meta-cost');
  }

  // ── CTA button
  if (school?.website) {
    const btnWebsite = document.getElementById('btn-website');
    if (btnWebsite) {
      btnWebsite.href = school.website;
      setText('btn-website-label', t('btnWebsite'));
      show('btn-website');
    }
  }

  // ── Description card
  // description field contains "Vakkenpakket: ... | Niveau: ..."
  // Show just the vakkenpakket part, or full description
  let descText = program.description;
  if (descText) {
    // Strip the "Niveau: X" suffix added by the seed
    descText = descText.replace(/\s*\|\s*Niveau:[^|]*/i, '').trim();
    // Also strip "Vakkenpakket: " prefix for cleaner display
    descText = descText.replace(/^Vakkenpakket:\s*/i, '').trim();
    if (descText) {
      setText('description-val', descText);
      setText('lbl-description', t('labelDescription'));
      show('card-description');
    }
  }

  // ── Admission requirements card
  if (program.levelRequired) {
    const admText = program.levelRequired.endsWith('...')
      ? program.levelRequired.slice(0, -3) + '\n(Zie schoolwebsite voor volledige toelatingseisen)'
      : program.levelRequired;
    setText('admission-val', admText);
    setText('lbl-admission', t('labelAdmission'));
    show('card-admission');
  }

  // ── Career options card
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

  // ── Duration & Schedule card
  const scheduleContainer = document.getElementById('schedule-val');
  if (scheduleContainer && (program.duration)) {
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

  // ── Tuition card
  if (program.tuitionCost) {
    setText('tuition-val', program.tuitionCost);
    setText('lbl-tuition', t('labelTuition'));
    setText('lbl-tuition-note', t('tuitionNote'));
    show('card-tuition');
  }

  // ── School info card
  const schoolInfoContainer = document.getElementById('school-info-val');
  if (schoolInfoContainer && school) {
    const rows = [];
    if (school.name)     rows.push({ icon: schoolSvg(),    text: school.name });
    if (school.type)     rows.push({ icon: levelSvg(),     text: school.type });
    if (school.location) rows.push({ icon: pinSvg(),       text: school.location });
    if (school.website)  rows.push({ icon: linkSvg(),      text: school.website, isLink: true });

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

  // ── Reveal
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
    // Fetch program with school included
    const res = await fetch(`/programs/${encodeURIComponent(programId)}`);

    if (!res.ok) {
      showError(t('errorTitle'), t('errorMsg'));
      return;
    }

    const program = await res.json();

    // school may be nested as program.school
    const school = program.school || null;

    renderProgram(program, school);

  } catch {
    showError(t('errorTitle'), t('errorMsg'));
  }
}

// ── Auth / Profile popup ──────────────────────────────────────
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
  document.getElementById('login-btn').style.display      = 'none';
  document.getElementById('profile-btn').style.display    = 'flex';
  document.getElementById('mobile-login').style.display   = 'none';
  document.getElementById('mobile-profile').style.display = 'block';
  document.getElementById('profile-name-label').textContent = payload.name  || 'Profiel';
  document.getElementById('popup-name').textContent          = payload.name  || 'Student';
  document.getElementById('popup-email').textContent         = payload.email || '';
  document.getElementById('popup-role').textContent          = payload.role === 'admin' ? '🛡️ Admin' : '🎓 Student';
}

function toggleProfilePopup(e) {
  e.stopPropagation();
  document.getElementById('profile-popup').classList.toggle('open');
}

function logout() {
  localStorage.removeItem('auth_token');
  window.location.reload();
}

document.addEventListener('click', () => {
  const popup = document.getElementById('profile-popup');
  if (popup) popup.classList.remove('open');
});

// ── Language switching ────────────────────────────────────────
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('language', lang);
  document.getElementById('btn-nl').classList.toggle('active', lang === 'nl');
  document.getElementById('btn-en').classList.toggle('active', lang === 'en');
  document.documentElement.lang = lang;
  // Re-run init to re-render all translated labels
  init();
}

document.getElementById('btn-nl').addEventListener('click', () => setLanguage('nl'));
document.getElementById('btn-en').addEventListener('click', () => setLanguage('en'));

// ── Hamburger ─────────────────────────────────────────────────
document.getElementById('hamburger-btn').addEventListener('click', () => {
  document.getElementById('mobile-nav').classList.toggle('open');
});

// ── Set initial lang button state ────────────────────────────
document.getElementById('btn-nl').classList.toggle('active', currentLang === 'nl');
document.getElementById('btn-en').classList.toggle('active', currentLang === 'en');
document.documentElement.lang = currentLang;

// ── Go ────────────────────────────────────────────────────────
initAuth();
window.FavSync.loadFromDB().then(() => init());