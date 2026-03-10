'use strict';

// ── State ──────────────────────────────────────────────────────
let allSchools   = [];   // raw data from backend
let favorites    = JSON.parse(localStorage.getItem('fav_schools') || '[]');
let compareItems = [];   // max 3 school IDs
let stateAnimation = null;
let isLoading = true;

let currentFilters = { type: 'all', location: 'all', level: 'all' };
let searchTerm = '';
let language = localStorage.getItem('language') || 'nl';

// ── Translations ───────────────────────────────────────────────
const t = {
  nl: {
    pageTitle:       'Alle Scholen',
    pageSubtitle:    'Ontdek en vergelijk scholen in Suriname',
    filterHeading:   'Filters',
    searchLabel: 'Zoek school',
    labelType:       'Schooltype',
    labelLocation:   'Locatie',
    labelLevel:      'Niveau',
    loading:         'Scholen laden...',
    errorTitle:      'Kon scholen niet laden',
    errorSub:        'Controleer of je server actief is.',
    noResults:       'Geen scholen gevonden met deze filters',
    programs:        n => `${n} opleiding${n === 1 ? '' : 'en'}`,
    viewDetails:     'Bekijk school',
    compare:         'Vergelijk',
    compareCount:    n => `${n} school${n === 1 ? '' : 'en'} geselecteerd`,
    viewComparison:  'Vergelijk',
    clearCompare:    'Wis',
    results:         n => `<strong>${n}</strong> school${n === 1 ? '' : 'en'} gevonden`,
    badgePublic:     'Publiek',
    badgePrivate:    'Privaat',
    login:           'Inloggen',
    openDays:        'Open Dagen',
  },
  en: {
    pageTitle:       'All Schools',
    pageSubtitle:    'Discover and compare schools in Suriname',
    filterHeading:   'Filters',
    searchLabel: 'Search school',
    labelType:       'School Type',
    labelLocation:   'Location',
    labelLevel:      'Level',
    loading:         'Loading schools...',
    errorTitle:      'Could not load schools',
    errorSub:        'Check that your server is running.',
    noResults:       'No schools found with these filters',
    programs:        n => `${n} program${n === 1 ? '' : 's'}`,
    viewDetails:     'View Details',
    compare:         'Compare',
    compareCount:    n => `${n} school${n === 1 ? '' : 's'} selected`,
    viewComparison:  'Compare',
    clearCompare:    'Clear',
    results:         n => `<strong>${n}</strong> school${n === 1 ? '' : 's'} found`,
    badgePublic:     'Public',
    badgePrivate:    'Private',
    login:           'Login',
    openDays:        'Open Days',
  }
};

// ── Descriptions per school (NL/EN) ───────────────────────────
const descriptions = {
  school_adekus: {
    nl: 'De enige universiteit van Suriname, met opleidingen in geneeskunde, rechten, technologie en meer.',
    en: 'The only university in Suriname, offering programs in medicine, law, technology and more.',
  },
  school_natin: {
    nl: 'Technisch HBO-instituut met sterke focus op ICT, engineering en natuurwetenschappen.',
    en: 'Technical HBO institute with a strong focus on ICT, engineering and natural sciences.',
  },
  school_iol: {
    nl: 'Lerarenopleidingsinstituut dat toekomstige docenten voorbereidt voor het Surinaamse onderwijs.',
    en: 'Teacher training institute preparing future educators for the Surinamese education system.',
  },
  school_covab: {
    nl: 'Agrarisch HBO-college voor opleidingen in landbouw, biologie en milieuwetenschappen.',
    en: 'Agricultural HBO college offering programs in agriculture, biology and environmental sciences.',
  },
  school_imeao: {
    nl: 'MBO-instelling met praktijkgerichte opleidingen in economie, administratie en handel.',
    en: 'MBO institution with practice-oriented programs in economics, administration and commerce.',
  },
  school_ptc: {
    nl: 'Polytechnisch college dat studenten opleidt in technische vakken op MBO-niveau.',
    en: 'Polytechnic college training students in technical disciplines at MBO level.',
  },
  school_igsr: {
    nl: 'HBO-instituut voor gezondheidszorg met verpleegkunde, paramedische en zorgopleidingen.',
    en: 'HBO health sciences institute offering nursing, paramedical and care programs.',
  },
};

// Default fallback description
const defaultDesc = {
  nl: 'Een erkende onderwijsinstelling in Suriname met hoogwaardige opleidingen.',
  en: 'A recognized educational institution in Suriname with high-quality programs.',
};

function getDescription(id) {
  const d = descriptions[id] || defaultDesc;
  return d[language] || d.nl;
}

// ── School Icons (SVG paths) ───────────────────────────────────
const SCHOOL_ICON = `
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>`;

const STICKMAN_CONFUSED_FRAMES = [
  'img/stickman-confused1.svg',
  'img/stickman-confused2.svg',
  'img/stickman-confused3.svg',
  'img/stickman-confused4.svg',
];


const CHASER_FRAMES = [
  'img/chasing-1.svg',
  'img/chasing-2.svg',
  'img/chasing-3.svg',
  'img/chasing-4.svg',
  'img/chasing-5.svg',
  'img/chasing-6.svg',
];

const RUNNER_FRAMES = [
  'img/running-1.svg',
  'img/running-2.svg',
  'img/running-3.svg',
  'img/running-4.svg',
  'img/running-5.svg',
  'img/running-6.svg',
];

function stopStateAnimation() {
  if (!stateAnimation) return;
  clearInterval(stateAnimation);
  stateAnimation = null;
}

function startStateAnimation() {
  const stickman = document.getElementById('state-stickman');
  const chaser = document.getElementById('state-chaser');
  const runner = document.getElementById('state-runner');

  stopStateAnimation();

  if (stickman) {
    let currentFrame = 0;

    stateAnimation = window.setInterval(() => {
      currentFrame = (currentFrame + 1) % STICKMAN_CONFUSED_FRAMES.length;
      stickman.src = STICKMAN_CONFUSED_FRAMES[currentFrame];
    }, 400);
    return;
  }

  if (!chaser || !runner) return;

  let chaserFrame = 0;
  let runnerFrame = 0;

  stateAnimation = window.setInterval(() => {
    chaser.src = CHASER_FRAMES[chaserFrame];
    runner.src = RUNNER_FRAMES[runnerFrame];

    chaserFrame = (chaserFrame + 1) % CHASER_FRAMES.length;
    runnerFrame = (runnerFrame + 1) % RUNNER_FRAMES.length;
  }, 150);
}

// ── Fetch schools from backend ─────────────────────────────────
async function fetchSchools() {
  isLoading = true;
  renderGrid();

  try {
    const res = await fetch('/admin/schools');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // /admin/schools returns array with _count.programs
    allSchools = data;
    isLoading = false;
    renderGrid();
  } catch (err) {
    console.warn('[Studie4SU] Could not load schools from backend:', err.message);
    // Fall back to seeded static data so the page still works during development
    allSchools = FALLBACK_SCHOOLS;
    isLoading = false;
    renderGrid();
  }
}

// ── Fallback static data (mirrors your seed.js) ───────────────
const FALLBACK_SCHOOLS = [
  { id: 'school_adekus', name: 'Anton de Kom Universiteit van Suriname', shortName: 'AdeKUS', type: 'University', location: 'Paramaribo', _count: { programs: 4 } },
  { id: 'school_natin',  name: 'Natuurtechnisch Instituut',              shortName: 'NATIN',  type: 'HBO',        location: 'Paramaribo', _count: { programs: 1 } },
  { id: 'school_iol',    name: 'Instituut voor de Opleiding van Leraren', shortName: 'IOL',   type: 'HBO',        location: 'Paramaribo', _count: { programs: 1 } },
  { id: 'school_covab',  name: 'College voor Agrarische en Biologische Wetenschappen', shortName: 'COVAB', type: 'HBO', location: 'Paramaribo', _count: { programs: 1 } },
  { id: 'school_imeao',  name: 'IMEAO',                                  shortName: 'IMEAO',  type: 'MBO',        location: 'Paramaribo', _count: { programs: 1 } },
  { id: 'school_ptc',    name: 'Polytechnical College Suriname',          shortName: 'PTC',    type: 'MBO',        location: 'Paramaribo', _count: { programs: 1 } },
  { id: 'school_igsr',   name: 'IGSR',                                   shortName: 'IGSR',   type: 'HBO',        location: 'Paramaribo', _count: { programs: 1 } },
];

// ── Filter logic ──────────────────────────────────────────────
function getFiltered() {
  return allSchools.filter(school => {
    const { type, location, level } = currentFilters;
    if (type     !== 'all' && school.type     !== type)     return false;
    if (location !== 'all' && school.location !== location) return false;
    if (level !== 'all' && school.type !== level) return false;
    if (searchTerm && !school.name.toLowerCase().includes(searchTerm)) return false;
    return true;
  });
}

// ── Render grid ───────────────────────────────────────────────
function renderGrid() {
  const grid     = document.getElementById('schools-grid');
  const countEl  = document.getElementById('results-count');
  const tx       = t[language];

  stopStateAnimation();

  if (isLoading) {
    countEl.innerHTML = '';
    grid.innerHTML = `
      <div class="state-center" style="grid-column:1/-1">
        <div class="state-animation" aria-hidden="true">
          <img id="state-chaser" class="state-chaser" src="img/chasing-1.svg" alt="">
          <img id="state-runner" class="state-runner" src="img/running-1.svg" alt="">
        </div>
        <p>${tx.loading}</p>
      </div>`;
    startStateAnimation();
    return;
  }

const filtered = getFiltered();

  // Results count
  countEl.innerHTML = tx.results(filtered.length);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="state-center" style="grid-column:1/-1">
      <div class="state-animation state-animation-stickman" aria-hidden="true">
        <img id="state-stickman" class="state-stickman" src="img/stickman-confused1.svg" alt="">
      </div>
        <p>${tx.noResults}</p>
      </div>`;
      startStateAnimation();
    return;
  }

  grid.innerHTML = filtered.map((school, i) => {
    const isFav     = favorites.includes(school.id);
    const isCmp     = compareItems.includes(school.id);
    const progCount = school._count?.programs ?? 0;
    const typeLabel = school.type === 'University'
      ? (language === 'nl' ? 'Universiteit' : 'University')
      : school.type;
    const desc      = getDescription(school.id);
    const locText   = school.location || 'Suriname';

    return `
      <div class="school-card" style="animation-delay:${i * 0.06}s">
        <div class="card-header">
          <div class="card-school-icon">${SCHOOL_ICON}</div>

          <span class="card-type-badge badge-${school.type?.toLowerCase()}">${typeLabel}</span>

          <button
            class="btn-favorite ${isFav ? 'active' : ''}"
            data-id="${school.id}"
            aria-label="${isFav ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}"
            onclick="toggleFavorite('${school.id}', this)">
            <svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </button>
        </div>

        <div class="card-content">
          <h3 class="card-name">${school.name}</h3>

          <div class="card-meta">
            <div class="card-meta-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              ${locText}
            </div>
            <div class="card-meta-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
              ${tx.programs(progCount)}
            </div>
          </div>

          <div class="card-badges">
            <span class="badge badge-public">${tx.badgePublic}</span>
            <span class="badge badge-level">${typeLabel}</span>
          </div>

          <p class="card-description">${desc}</p>

          <div class="card-actions">
            <a href="school-detail.html?id=${school.id}" class="btn-details">${tx.viewDetails}</a>
            <button
              class="btn-compare ${isCmp ? 'active' : ''}"
              data-id="${school.id}"
              aria-label="${tx.compare}"
              title="${tx.compare}"
              onclick="toggleCompare('${school.id}', this)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/>
                <path d="M13 6h3a2 2 0 012 2v7"/><path d="M11 18H8a2 2 0 01-2-2V9"/>
              </svg>
            </button>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ── Toast ─────────────────────────────────────────────────────
let _toastTimer;
function showFavToast(added) {
  let el = document.getElementById('fav-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'fav-toast';
    el.className = 'fav-toast';
    document.body.appendChild(el);
  }
  const msg = added
    ? (language === 'nl' ? 'Toegevoegd aan favorieten' : 'Added to favourites')
    : (language === 'nl' ? 'Verwijderd uit favorieten' : 'Removed from favourites');
  el.innerHTML = added
    ? `${msg} &nbsp;<a href="favorites.html" class="toast-fav-link">${language === 'nl' ? 'Bekijk favorieten →' : 'View favourites →'}</a>`
    : msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}

// ── Favorite toggle ───────────────────────────────────────────
function toggleFavorite(id, btn) {
  const idx = favorites.indexOf(id);
  if (idx === -1) {
    favorites.push(id);
  } else {
    favorites.splice(idx, 1);
  }
  localStorage.setItem('fav_schools', JSON.stringify(favorites));

  const isFav = favorites.includes(id);
  showFavToast(isFav);
  btn.classList.toggle('active', isFav);
  const path = btn.querySelector('path');
  if (path) path.setAttribute('fill', isFav ? 'currentColor' : 'none');
  btn.setAttribute('aria-label', isFav ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten');
}

// ── Compare toggle ────────────────────────────────────────────
function toggleCompare(id, btn) {
  const idx = compareItems.indexOf(id);
  if (idx === -1) {
    if (compareItems.length >= 3) {
      alert(language === 'nl'
        ? 'Je kunt maximaal 3 scholen vergelijken.'
        : 'You can compare a maximum of 3 schools.');
      return;
    }
    compareItems.push(id);
  } else {
    compareItems.splice(idx, 1);
  }

  btn.classList.toggle('active', compareItems.includes(id));
  updateCompareBar();
}

function updateCompareBar() {
  const bar  = document.getElementById('compare-bar');
  const text = document.getElementById('compare-count-text');
  const tx   = t[language];

  if (compareItems.length === 0) {
    bar.style.display = 'none';
  } else {
    bar.style.display = 'flex';
    text.textContent  = tx.compareCount(compareItems.length);
  }
}

// ── Clear compare ─────────────────────────────────────────────
document.getElementById('btn-clear-compare').addEventListener('click', () => {
  compareItems = [];
  updateCompareBar();
  // reset all compare buttons
  document.querySelectorAll('.btn-compare').forEach(b => b.classList.remove('active'));
});

// ── View comparison ───────────────────────────────────────────
document.getElementById('btn-view-comparison').addEventListener('click', () => {
  if (compareItems.length < 2) {
    alert(language === 'nl'
      ? 'Selecteer minimaal 2 scholen om te vergelijken.'
      : 'Please select at least 2 schools to compare.');
    return;
  }
  const ids = compareItems.join(',');
  window.location.href = `school-compare.html?ids=${ids}`;
});

// ── Filter listeners ──────────────────────────────────────────
document.getElementById('filter-type').addEventListener('change', e => {
  currentFilters.type = e.target.value;
  renderGrid();
});
document.getElementById('school-search').addEventListener('input', e => {
  searchTerm = e.target.value.trim().toLowerCase();
  renderGrid();
});
document.getElementById('filter-location').addEventListener('change', e => {
  currentFilters.location = e.target.value;
  renderGrid();
});
document.getElementById('filter-level').addEventListener('change', e => {
  currentFilters.level = e.target.value;
  renderGrid();
});

// ── Language toggle ───────────────────────────────────────────
function applyLanguage(lang) {
  language = lang;
  localStorage.setItem('language', lang);

  const tx = t[lang];

  // Page title & subtitle
  document.getElementById('page-title').textContent    = tx.pageTitle;
  document.getElementById('page-subtitle').textContent = tx.pageSubtitle;
  document.getElementById('search-label').textContent = tx.searchLabel;
  document.getElementById('filter-heading').textContent = tx.filterHeading;
  document.getElementById('label-type').textContent    = tx.labelType;
  document.getElementById('label-location').textContent = tx.labelLocation;
  document.getElementById('label-level').textContent   = tx.labelLevel;

  // Nav links & login btn
  document.querySelectorAll('[data-nl]').forEach(el => {
    el.textContent = el.dataset[lang] || el.textContent;
  });

  const searchInput = document.getElementById('school-search');
  searchInput.placeholder =
    lang === 'nl'
      ? searchInput.dataset.nlPlaceholder
      : searchInput.dataset.enPlaceholder;

  // Active state on lang buttons
  document.getElementById('btn-nl').classList.toggle('active', lang === 'nl');
  document.getElementById('btn-en').classList.toggle('active', lang === 'en');

  // Re-render grid with new language
  renderGrid();
  updateCompareBar();
}

document.getElementById('btn-nl').addEventListener('click', () => applyLanguage('nl'));
document.getElementById('btn-en').addEventListener('click', () => applyLanguage('en'));

// ── Auth / Profile ────────────────────────────────────────────
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

  document.getElementById('login-btn').style.display     = 'none';
  document.getElementById('profile-btn').style.display   = 'flex';
  document.getElementById('mobile-login').style.display  = 'none';
  document.getElementById('mobile-profile').style.display = 'block';

  document.getElementById('profile-name-label').textContent = payload.name || 'Profiel';
  document.getElementById('popup-name').textContent  = payload.name  || 'Student';
  document.getElementById('popup-email').textContent = payload.email || '';
  document.getElementById('popup-role').textContent  = payload.role === 'admin' ? '🛡️ Admin' : '🎓 Student';
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

// ── Hamburger menu ────────────────────────────────────────────
document.getElementById('hamburger-btn').addEventListener('click', () => {
  document.getElementById('mobile-nav').classList.toggle('open');
});

// ── Boot ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyLanguage(language);  // set initial language state
  fetchSchools();           // load schools from backend (or fallback)
  initAuth();               // show profile button if logged in
});