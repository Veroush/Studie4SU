'use strict';

/* =============================================
   favorites.js — Studie4SU
   Handles:
   - Loading favorite IDs from localStorage
   - Fetching full data from the real API
   - Rendering cards per tab
   - Removing items, updating badges, empty states
   - Bilingual support (NL / EN)
   =============================================

   localStorage keys used (aligns with schools.js / open-houses.js):
     fav_schools    → JSON array of school IDs    e.g. ["school_adekus","school_ptc"]
     fav_programs   → JSON array of program IDs   e.g. ["prog_aa1","prog_ba2"]
     fav_openhouses → JSON array of openhouse IDs e.g. ["cuid123","cuid456"]
     language       → "nl" | "en"
*/

// ── Translations ────────────────────────────────────────────────────────────
const T = {
  nl: {
    title:           'Mijn Favorieten',
    subtitle:        'Al jouw opgeslagen scholen, opleidingen en evenementen',
    savedItems:      'Opgeslagen items',
    tabSchools:      'Scholen',
    tabPrograms:     'Opleidingen',
    tabOpenHouses:   'Open Dagen',
    emptyHeading:    'Geen favorieten',
    emptySchoolMsg:  'Je hebt nog geen scholen toegevoegd aan je favorieten',
    emptyProgramMsg: 'Je hebt nog geen opleidingen toegevoegd aan je favorieten',
    emptyEventMsg:   'Je hebt nog geen open dagen toegevoegd aan je favorieten',
    exploreSchools:  'Verken Scholen',
    explorePrograms: 'Verken Opleidingen',
    viewOpenHouses:  'Bekijk Open Dagen',
    btnView:         'Bekijk',
    btnRegister:     'Aanmelden',
    programs:        "programma's",
    years:           'jaar',
    loading:         'Laden…',
    error:           'Kon niet laden',
    online:          'Online',
  },
  en: {
    title:           'My Favorites',
    subtitle:        'All your saved schools, programs and events',
    savedItems:      'Saved items',
    tabSchools:      'Schools',
    tabPrograms:     'Programs',
    tabOpenHouses:   'Open Houses',
    emptyHeading:    'No favorites',
    emptySchoolMsg:  "You haven't added any schools to your favorites yet",
    emptyProgramMsg: "You haven't added any programs to your favorites yet",
    emptyEventMsg:   "You haven't added any open houses to your favorites yet",
    exploreSchools:  'Explore Schools',
    explorePrograms: 'Explore Programs',
    viewOpenHouses:  'View Open Houses',
    btnView:         'View',
    btnRegister:     'Register',
    programs:        'programs',
    years:           'years',
    loading:         'Loading…',
    error:           'Could not load',
    online:          'Online',
  }
};

// ── State ────────────────────────────────────────────────────────────────────
let lang      = localStorage.getItem('language') || 'nl';
let activeTab = 'schools';

const favorites = {
  schools:    readFavs('fav_schools'),
  programs:   readFavs('fav_programs'),
  openhouses: readFavs('fav_openhouses'),
};

function readFavs(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
}
function saveFavs(key, arr) {
  localStorage.setItem(key, JSON.stringify(arr));
}

// ── Language ─────────────────────────────────────────────────────────────────
function applyLanguage() {
  const t = T[lang];

  document.getElementById('page-title').textContent        = t.title;
  document.getElementById('page-subtitle').textContent     = t.subtitle;
  document.getElementById('badge-text').textContent        = t.savedItems;
  document.getElementById('tab-schools-label').textContent = t.tabSchools;
  document.getElementById('tab-programs-label').textContent = t.tabPrograms;
  document.getElementById('tab-openhouses-label').textContent = t.tabOpenHouses;

  document.getElementById('empty-schools-heading').textContent  = t.emptyHeading;
  document.getElementById('empty-schools-msg').textContent      = t.emptySchoolMsg;
  document.getElementById('empty-schools-btn').textContent      = t.exploreSchools;

  document.getElementById('empty-programs-heading').textContent = t.emptyHeading;
  document.getElementById('empty-programs-msg').textContent     = t.emptyProgramMsg;
  document.getElementById('empty-programs-btn').textContent     = t.explorePrograms;

  document.getElementById('empty-openhouses-heading').textContent = t.emptyHeading;
  document.getElementById('empty-openhouses-msg').textContent     = t.emptyEventMsg;
  document.getElementById('empty-openhouses-btn').textContent     = t.viewOpenHouses;

  // Nav data attributes
  document.querySelectorAll('[data-nl]').forEach(el => {
    el.textContent = lang === 'nl' ? el.dataset.nl : el.dataset.en;
  });

  // Active lang button
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
  const activeLangBtn = document.getElementById(`btn-${lang}`);
  if (activeLangBtn) activeLangBtn.classList.add('active');
}

function setLang(newLang) {
  lang = newLang;
  localStorage.setItem('language', lang);
  applyLanguage();
  renderAll();
}

// ── Tab Navigation ────────────────────────────────────────────────────────────
function setActiveTab(tab) {
  activeTab = tab;

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  document.querySelectorAll('.tab-content').forEach(el => {
    el.hidden = true;
  });
  document.getElementById(`${tab}-content`).hidden = false;
}

// ── Count Badges ──────────────────────────────────────────────────────────────
function updateCounts() {
  document.getElementById('schools-count').textContent    = favorites.schools.length;
  document.getElementById('programs-count').textContent   = favorites.programs.length;
  document.getElementById('openhouses-count').textContent = favorites.openhouses.length;
}

// ── Render Schools ────────────────────────────────────────────────────────────
async function renderSchools() {
  const grid  = document.getElementById('schools-grid');
  const empty = document.getElementById('schools-empty');
  const t     = T[lang];

  if (favorites.schools.length === 0) {
    grid.innerHTML = '';
    empty.hidden   = false;
    return;
  }
  empty.hidden   = true;
  grid.innerHTML = `<p class="loading-msg">${t.loading}</p>`;

  const results = await Promise.allSettled(
    favorites.schools.map(id => fetch(`/schools/${id}`).then(r => r.ok ? r.json() : null))
  );

  grid.innerHTML = '';
  results.forEach((res, i) => {
    const school = res.status === 'fulfilled' ? res.value : null;
    if (!school) {
      // ID not found — silently skip (could have been deleted from DB)
      return;
    }
    grid.appendChild(buildSchoolCard(school));
  });

  // If all requests failed, show empty state
  if (!grid.hasChildNodes()) empty.hidden = false;
}

function buildSchoolCard(school) {
  const t    = T[lang];
  const count = school._count?.programs ?? (school.programs?.length ?? 0);
  const div  = document.createElement('div');
  div.className = 'fav-card';
  div.dataset.card = `schools-${school.id}`;
  div.innerHTML = `
    <div class="card-header card-header--school">
      <!-- School icon -->
      <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
      <button class="btn-fav" aria-label="Verwijder uit favorieten" onclick="removeFav('schools','${escHtml(school.id)}')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>
    </div>
    <div class="card-body">
      <span class="card-type-badge">${escHtml(school.type || '')}</span>
      <h3>${escHtml(school.name)}</h3>
      ${school.location ? `<p class="card-meta">📍 ${escHtml(school.location)}</p>` : ''}
      <p class="card-meta">${count} ${t.programs}</p>
      <button class="btn-view" onclick="window.location.href='school-detail.html?id=${escHtml(school.id)}'">
        ${t.btnView}
      </button>
    </div>`;
  return div;
}

// ── Render Programs ───────────────────────────────────────────────────────────
async function renderPrograms() {
  const grid  = document.getElementById('programs-grid');
  const empty = document.getElementById('programs-empty');
  const t     = T[lang];

  if (favorites.programs.length === 0) {
    grid.innerHTML = '';
    empty.hidden   = false;
    return;
  }
  empty.hidden   = true;
  grid.innerHTML = `<p class="loading-msg">${t.loading}</p>`;

  const results = await Promise.allSettled(
    favorites.programs.map(id => fetch(`/programs/${id}`).then(r => r.ok ? r.json() : null))
  );

  grid.innerHTML = '';
  results.forEach(res => {
    const program = res.status === 'fulfilled' ? res.value : null;
    if (!program) return;
    grid.appendChild(buildProgramCard(program));
  });

  if (!grid.hasChildNodes()) empty.hidden = false;
}

function buildProgramCard(program) {
  const t   = T[lang];
  const div = document.createElement('div');
  div.className = 'fav-card';
  div.dataset.card = `programs-${program.id}`;
  div.innerHTML = `
    <div class="card-header card-header--program">
      <!-- BookOpen icon -->
      <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
      </svg>
      <button class="btn-fav" aria-label="Verwijder uit favorieten" onclick="removeFav('programs','${escHtml(program.id)}')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>
    </div>
    <div class="card-body">
      ${program.cluster ? `<span class="card-type-badge">${escHtml(program.cluster)}</span>` : ''}
      <h3>${escHtml(program.name)}</h3>
      ${program.school ? `<p class="card-meta">🏫 ${escHtml(program.school.name)}</p>` : ''}
      ${program.duration ? `<p class="card-meta">⏱ ${escHtml(program.duration)} ${t.years}</p>` : ''}
      <button class="btn-view" onclick="window.location.href='program-detail.html?id=${escHtml(program.id)}'">
        ${t.btnView}
      </button>
    </div>`;
  return div;
}

// ── Render Open Houses ────────────────────────────────────────────────────────
async function renderOpenHouses() {
  const grid  = document.getElementById('openhouses-grid');
  const empty = document.getElementById('openhouses-empty');

  if (favorites.openhouses.length === 0) {
    grid.innerHTML = '';
    empty.hidden   = false;
    return;
  }

  // Open houses are from a static EVENTS array (not yet in the API),
  // so we read the full objects saved by open-houses.js into fav_openhouses_data
  let dataMap = {};
  try { dataMap = JSON.parse(localStorage.getItem('fav_openhouses_data') || '{}'); }
  catch { dataMap = {}; }

  empty.hidden   = true;
  grid.innerHTML = '';

  let rendered = 0;
  favorites.openhouses.forEach(id => {
    const ev = dataMap[id];
    if (!ev) return; // data not found — skip silently
    grid.appendChild(buildEventCard(ev));
    rendered++;
  });

  if (rendered === 0) empty.hidden = false;
}

function buildEventCard(ev) {
  const t   = T[lang];
  const div = document.createElement('div');
  div.className = 'fav-card--event';
  div.dataset.card = `openhouses-${ev.id}`;

  // Support both static EVENTS shape {school: string, time: string}
  // and DB shape {school: {name}, startTime, endTime}
  const schoolName = typeof ev.school === 'string' ? ev.school : (ev.school?.name || ev.title || '');
  const time = ev.time || ((ev.startTime && ev.endTime) ? `${ev.startTime} – ${ev.endTime}` : (ev.startTime || ''));
  const loc  = ev.isOnline ? t.online : (ev.location || '');

  div.innerHTML = `
    <div class="event-card-top">
      <span></span>
      <button class="btn-fav" style="position:static" aria-label="Verwijder uit favorieten" onclick="removeFav('openhouses','${escHtml(ev.id)}')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>
    </div>
    <div class="event-card-body">
      <div class="event-icon-badge">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </div>
      <div class="event-details">
        <h3>${escHtml(schoolName)}</h3>
        ${ev.date  ? `<p>📅 ${escHtml(ev.date)}</p>`  : ''}
        ${time     ? `<p>🕐 ${escHtml(time)}</p>`      : ''}
        ${loc      ? `<p>📍 ${escHtml(loc)}</p>`       : ''}
      </div>
    </div>
    <button class="btn-view" onclick="addToGoogleCalendar(${JSON.stringify({
      title:     schoolName,
      date:      ev.date      || '',
      startTime: ev.startTime || (ev.time ? ev.time.split(/[–-]/)[0].trim() : ''),
      endTime:   ev.endTime   || (ev.time ? ev.time.split(/[–-]/)[1]?.trim() : ''),
      location:  loc,
    })})">
      ${t.btnRegister}
    </button>`;
  return div;
}

// ── Remove Favorite ───────────────────────────────────────────────────────────
function removeFav(type, id) {
  const idx = favorites[type].indexOf(id);
  if (idx === -1) return;

  favorites[type].splice(idx, 1);
  saveFavs(`fav_${type}`, favorites[type]);

  // Remove card from DOM
  const card = document.querySelector(`[data-card="${type}-${id}"]`);
  if (card) card.remove();

  updateCounts();

  // Show empty state if nothing left
  if (favorites[type].length === 0) {
    document.getElementById(`${type}-empty`).hidden = false;
  }
}

// ── Google Calendar (same pattern as open-houses.js) ─────────────────────────
function addToGoogleCalendar(ev) {
  try {
    const pad  = n => String(n).padStart(2, '0');
    const toGCal = (dateStr, timeStr) => {
      const d = dateStr ? new Date(dateStr) : new Date();
      if (timeStr) {
        const [h, m] = timeStr.split(':').map(Number);
        d.setHours(h || 0, m || 0, 0, 0);
      }
      return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
    };

    const start = toGCal(ev.date, ev.startTime);
    const end   = ev.endTime ? toGCal(ev.date, ev.endTime) : start;
    const params = new URLSearchParams({
      action:   'TEMPLATE',
      text:     ev.title || 'Open Dag',
      dates:    `${start}/${end}`,
      location: ev.location || '',
      add:      'popup:1440',
    });
    window.open(`https://calendar.google.com/calendar/render?${params}`, '_blank');
  } catch (e) {
    console.error('Calendar error', e);
  }
}

// ── Render All ────────────────────────────────────────────────────────────────
async function renderAll() {
  await Promise.all([renderSchools(), renderPrograms(), renderOpenHouses()]);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function initPainterAnimation() {
  const stickman = document.getElementById('stickman');
  const paintingParts = document.querySelectorAll('.paint');
  if (!stickman || paintingParts.length === 0) return;

  const stickmanFrames = [
    'img/painter-1.svg',
    'img/painter-2.svg',
    'img/painter-3.svg',
    'img/painter-4.svg',
  ];

  paintingParts.forEach(part => {
    part.style.opacity = 0;
  });

  let frameIndex = 0;
  let partIndex = 0;

  const stickmanAnimation = setInterval(() => {
    stickman.src = stickmanFrames[frameIndex];
    frameIndex = (frameIndex + 1) % stickmanFrames.length;
  }, 200);

  const revealPainting = setInterval(() => {
    if (partIndex < paintingParts.length) {
      paintingParts[partIndex].style.opacity = 1;
      partIndex++;
      return;
    }

    clearInterval(revealPainting);
    clearInterval(stickmanAnimation);
    stickman.src = stickmanFrames[0];
  }, 1500);
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Language buttons
  document.getElementById('btn-nl').addEventListener('click', () => setLang('nl'));
  document.getElementById('btn-en').addEventListener('click', () => setLang('en'));

  // Hamburger
  document.getElementById('hamburger-btn').addEventListener('click', () => {
    document.getElementById('mobile-nav').classList.toggle('open');
  });

  applyLanguage();
  updateCounts();
  initPainterAnimation();
  renderAll();
});
