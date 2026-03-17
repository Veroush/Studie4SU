'use strict';

/* ================================================================
   TRANSLATIONS
================================================================ */
const T = {
  nl: {
    title: 'Open Dagen',
    subtitle: 'Bezoek scholen en maak kennis met de opleidingen',
    all: 'Alle', upcoming: 'Aankomend', saved: 'Opgeslagen',
    listView: 'Lijst', calendarView: 'Kalender',
    register: 'Aanmelden', registered: 'Aangemeld ✓', registering: 'Bezig...',
    unregister: 'Afmelden',
    unregSuccess: 'Afgemeld van deze open dag.',
    calendarHint: 'Verwijder het evenement in Google Agenda →',
    loginRequired: 'Log in om je aan te melden',
    noEvents: 'Geen open dagen gevonden',
    addedFav: 'Toegevoegd aan favorieten',
    removedFav: 'Verwijderd uit favorieten',
    viewFavourites: 'Bekijk favorieten \u2192',
    regSuccess: 'Succesvol aangemeld!',
    ariaFavAdd: 'Toevoegen aan favorieten',
    ariaFavRemove: 'Verwijderen uit favorieten',
    months: ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December'],
    monthsShort: ['Jan','Feb','Mrt','Apr','Mei','Jun','Jul','Aug','Sep','Okt','Nov','Dec'],
  },
  en: {
    title: 'Open Houses',
    subtitle: 'Visit schools and get to know the programs',
    all: 'All', upcoming: 'Upcoming', saved: 'Saved',
    listView: 'List', calendarView: 'Calendar',
    register: 'Register', registered: 'Registered ✓', registering: 'Registering...',
    unregister: 'Unregister',
    unregSuccess: 'Unregistered from this open house.',
    calendarHint: 'Delete event in Google Calendar →',
    loginRequired: 'Log in to register',
    noEvents: 'No open houses found',
    addedFav: 'Added to favorites',
    removedFav: 'Removed from favorites',
    viewFavourites: 'View favourites \u2192',
    regSuccess: 'Successfully registered!',
    ariaFavAdd: 'Add to favorites',
    ariaFavRemove: 'Remove from favorites',
    months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    monthsShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  }
};

/* ================================================================
   FALLBACK EVENT DATA — used when backend is unavailable
   Raksha: stable string IDs so favorites work correctly even
   when the API is down — IDs match the seed.js open house IDs
================================================================ */
const FALLBACK_EVENTS = [
  { id: 'oh_adekus_march', school: 'Anton de Kom Universiteit (AdeKUS)', date: '2026-03-14', time: '10:00 – 16:00', location: 'Leysweg 86, Paramaribo', description: 'Ontdek alle universitaire opleidingen en spreek met docenten en studenten van AdeKUS. Rondleidingen door de campus zijn beschikbaar.', registered: false },
  { id: 'oh_natin_march',  school: 'Natuurtechnisch Instituut (NATIN)',   date: '2026-03-21', time: '09:00 – 14:00', location: 'Zwartenhovenbrugstraat, Paramaribo', description: 'Bezoek onze workshops en labs en ervaar technisch onderwijs. Bekijk de ICT- en ingenieursafdelingen van dichtbij.', registered: false },
  { id: 'oh_iol_march',    school: 'Instituut voor de Opleiding van Leraren (IOL)', date: '2026-03-28', time: '10:00 – 15:00', location: 'Dr. Sophie Redmondstraat, Paramaribo', description: 'Leer alles over de lerarenopleiding. Spreek met studenten en docenten over het vak en de toekomstmogelijkheden.', registered: false },
  { id: 'oh_covab_april',  school: 'COVAB', date: '2026-04-11', time: '09:00 – 13:00', location: 'Leysweg, Paramaribo', description: 'Ontdek de agrarische en biologische wetenschappen. Bezoek onze onderzoekstuinen en laboratoria.', registered: false },
  { id: 'oh_imeao_april',  school: 'IMEAO', date: '2026-04-18', time: '10:00 – 15:00', location: 'Paramaribo', description: 'Informeer je over de MBO-opleidingen van IMEAO in economie en bedrijfskunde. Praat met studenten en begeleiders.', registered: false },
  { id: 'oh_ptc_april',    school: 'Polytechnical College Suriname (PTC)', date: '2026-04-25', time: '09:00 – 14:00', location: 'Meerzorgweg, Paramaribo', description: 'Bekijk de technische opleidingen van PTC. Demonstraties van leerlingen in de werkplaatsen en ateliers.', registered: false },
  { id: 'oh_igsr_may',     school: 'IGSR', date: '2026-05-09', time: '10:00 – 16:00', location: 'Paramaribo', description: 'Open dag van IGSR. Ontmoet de studenten en docenten en leer meer over de beschikbare HBO-programma\'s.', registered: false },
  { id: 'oh_adekus_may',   school: 'Anton de Kom Universiteit (AdeKUS)', date: '2026-05-23', time: '09:00 – 17:00', location: 'Leysweg 86, Paramaribo', description: 'Tweede open dag van AdeKUS gericht op internationale studenten en samenwerkingsprogramma\'s.', registered: false },
];

// Raksha: EVENTS is populated from the API (or fallback) via loadEvents()
let EVENTS = [];

// Raksha: fetches live open house data from /openhouses API
async function loadEvents() {
  try {
    const res = await fetch('/openhouses');
    if (!res.ok) throw new Error('API error');
    const raw = await res.json();
    EVENTS = raw.map(ev => {
      // Extract date and time by slicing the ISO string directly.
      // Never use new Date() on a UTC ISO string — it shifts the date in UTC-3 (Suriname).
      // ISO format: "2026-05-08T03:00:00.000Z"
      //              0123456789012345
      let dateStr = '';
      let timeStr = '';
      if (ev.date) {
        dateStr = ev.date.slice(0, 10); // "2026-05-08"
        const rawTime = ev.date.slice(11, 16); // "03:00" (UTC time from DB)
        // Convert UTC time to Suriname local time (UTC-3)
        if (rawTime && rawTime !== '00:00') {
          const [hUtc, mUtc] = rawTime.split(':').map(Number);
          let totalMins = hUtc * 60 + mUtc - 180; // subtract 3 hours for UTC-3
          if (totalMins < 0) {
            totalMins += 1440; // wrap around midnight
            // Date also shifts back one day
            const [y, mo, d] = dateStr.split('-').map(Number);
            const dt = new Date(y, mo - 1, d - 1);
            dateStr = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
          }
          const hLocal = Math.floor(totalMins / 60);
          const mLocal = totalMins % 60;
          timeStr = String(hLocal).padStart(2, '0') + ':' + String(mLocal).padStart(2, '0');
        }
      }
      return {
        ...ev,
        school: ev.school?.name || ev.school || '',
        time:   timeStr,
        date:   dateStr,
      };
    });
  } catch (err) {
    console.warn('Could not load open houses from API, using fallback data', err);
    EVENTS = FALLBACK_EVENTS;
  }
}

/* ================================================================
   STATE
================================================================ */
let currentFilter  = 'all';
let currentView    = 'list';
let currentLang    = localStorage.getItem('language') || 'nl';
let favorites      = JSON.parse(localStorage.getItem('fav_openhouses') || '[]');

// registered is now authoritative from the API.
// We keep a local Set for instant UI updates between fetches.
let registeredSet  = new Set();

let isLoading      = true;
let stateAnimation = null;

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

function getAuthToken() {
  return localStorage.getItem('auth_token') || null;
}

function getAuthHeader() {
  const token = getAuthToken();
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

/* ================================================================
   HELPERS
================================================================ */
function t(key) { return T[currentLang][key] || key; }

function getMonthName(dateStr, short = false) {
  const d = new Date(dateStr + 'T00:00:00');
  return short
    ? T[currentLang].monthsShort[d.getMonth()]
    : T[currentLang].months[d.getMonth()];
}

function getDay(dateStr) { return new Date(dateStr + 'T00:00:00').getDate(); }

function isUpcoming(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
}

function stopStateAnimation() {
  if (!stateAnimation) return;
  clearInterval(stateAnimation);
  stateAnimation = null;
}

function startStateAnimation(kind) {
  const stickman = document.getElementById('state-stickman');
  const chaser = document.getElementById('state-chaser');
  const runner = document.getElementById('state-runner');

  stopStateAnimation();

  if (kind === 'empty' && stickman) {
    let currentFrame = 0;
    stateAnimation = window.setInterval(() => {
      currentFrame = (currentFrame + 1) % STICKMAN_CONFUSED_FRAMES.length;
      stickman.src = STICKMAN_CONFUSED_FRAMES[currentFrame];
    }, 400);
    return;
  }

  if (kind !== 'loading' || !chaser || !runner) return;

  let chaserFrame = 0;
  let runnerFrame = 0;

  stateAnimation = window.setInterval(() => {
    chaser.src = CHASER_FRAMES[chaserFrame];
    runner.src = RUNNER_FRAMES[runnerFrame];
    chaserFrame = (chaserFrame + 1) % CHASER_FRAMES.length;
    runnerFrame = (runnerFrame + 1) % RUNNER_FRAMES.length;
  }, 150);
}

function getFilteredEvents() {
  return EVENTS.filter(ev => {
    if (currentFilter === 'upcoming') return isUpcoming(ev.date);
    if (currentFilter === 'saved')    return favorites.includes(ev.id);
    return true;
  });
}

/* ================================================================
   GOOGLE CALENDAR
================================================================ */
function addToGoogleCalendar(ev) {
  const toGCal = (dateStr, timeStr) => dateStr.replace(/-/g, '') + 'T' + timeStr.replace(':', '') + '00';

  const addMinutes = (timeStr, mins) => {
    const [h, m] = timeStr.split(':').map(Number);
    const total = h * 60 + m + mins;
    return String(Math.floor(total / 60) % 24).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
  };

  const rangeMatch = ev.time && ev.time.match(/(\d{2}:\d{2})\s*[–—-]\s*(\d{2}:\d{2})/);
  const singleMatch = !rangeMatch && ev.time && ev.time.match(/(\d{2}:\d{2})/);

  let startDT, endDT;
  if (rangeMatch) {
    startDT = toGCal(ev.date, rangeMatch[1]);
    endDT   = toGCal(ev.date, rangeMatch[2]);
  } else if (singleMatch) {
    const startTime = singleMatch[1];
    const endTime   = addMinutes(startTime, 60);
    startDT = toGCal(ev.date, startTime);
    endDT   = toGCal(ev.date, endTime);
  } else {
    const [y, mo, d] = ev.date.split('-').map(Number);
    const next = new Date(y, mo - 1, d + 1);
    const pad  = n => String(n).padStart(2, '0');
    const nextStr = `${next.getFullYear()}${pad(next.getMonth() + 1)}${pad(next.getDate())}`;
    startDT = ev.date.replace(/-/g, '');
    endDT   = nextStr;
  }

  const details = [
    ev.description,
    'Toegevoegd via Studie4SU — studie4su.sr'
  ].filter(Boolean).join('\n\n');

  const calUrl = 'https://calendar.google.com/calendar/render'
    + '?action=TEMPLATE'
    + '&text='     + encodeURIComponent('Open Dag – ' + ev.school)
    + '&dates='    + startDT + '%2F' + endDT
    + '&details='  + encodeURIComponent(details)
    + '&location=' + encodeURIComponent(ev.location || '')
    + '&sf=true';

  window.open(calUrl, '_blank', 'noopener,noreferrer');
}

/* ================================================================
   TOAST
================================================================ */
let toastTimer;
function showToast(msg, type = '', showFavLink = false) {
  const el = document.getElementById('toast');
  el.innerHTML = showFavLink
    ? `${msg} &nbsp;<a href="favorites.html" class="toast-fav-link">${t('viewFavourites')}</a>`
    : msg;
  el.className = 'toast show' + (type ? ' ' + type : '');
  el.style.pointerEvents = showFavLink ? 'auto' : '';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.className = 'toast';
    el.style.pointerEvents = '';
  }, showFavLink ? 5000 : 3000);
}

function announce(msg) {
  const el = document.getElementById('sr-announcements');
  el.textContent = '';
  setTimeout(() => el.textContent = msg, 50);
}

/* ================================================================
   BUILD SVG SNIPPETS
================================================================ */
const SVG = {
  clock: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  pin:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  cal:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  heartOutline: `<svg class="heart-outline" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  heartFilled:  `<svg class="heart-filled" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
};

function heartIcons() { return SVG.heartOutline + SVG.heartFilled; }

/* ================================================================
   SCHOOL HEADER IMAGES
================================================================ */
const SCHOOL_IMAGES = {
  'Anton de Kom Universiteit (AdeKUS)':           'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=400&fit=crop',
  'Natuurtechnisch Instituut (NATIN)':             'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=400&fit=crop',
  'Instituut voor de Opleiding van Leraren (IOL)': 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=400&fit=crop',
  'COVAB':                                         'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=400&fit=crop',
  'IMEAO':                                         'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
  'Polytechnical College Suriname (PTC)':          'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800&h=400&fit=crop',
  'IGSR':                                          'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=400&fit=crop',
  'FHR':                                           'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=400&fit=crop',
};

function getSchoolImage(schoolName) {
  if (!schoolName) return null;
  if (SCHOOL_IMAGES[schoolName]) return SCHOOL_IMAGES[schoolName];
  const key = Object.keys(SCHOOL_IMAGES).find(k =>
    schoolName.toLowerCase().includes(k.split(' ')[0].toLowerCase())
  );
  return key ? SCHOOL_IMAGES[key] : null;
}

/* ================================================================
   RENDER — LIST VIEW
================================================================ */
function renderListView(events) {
  const container = document.getElementById('list-view');
  container.innerHTML = events.map(ev => {
    const isFav = favorites.includes(ev.id);
    const isReg = registeredSet.has(ev.id);
    const img   = getSchoolImage(ev.school);
    const headerStyle = img ? ` style="background-image:url('${img}')"` : '';
    return `
    <article class="event-card" role="listitem">
      <div class="event-card-header"${headerStyle}>
        <button class="fav-btn ${isFav ? 'active' : ''}"
                data-event-id="${ev.id}"
                data-fav="list"
                aria-label="${isFav ? t('ariaFavRemove') : t('ariaFavAdd')}"
                aria-pressed="${isFav}"
                onclick="toggleFavorite('${ev.id}')">
          ${heartIcons()}
        </button>

        <div class="event-info-row">
          <div class="date-badge" aria-hidden="true">
            <div class="day">${getDay(ev.date)}</div>
            <div class="mon">${getMonthName(ev.date, true)}</div>
          </div>

          <div class="event-meta">
            <h3 class="event-card-title">${ev.school}</h3>
            <div class="meta-row">${SVG.clock}<span>${ev.time}</span></div>
            <div class="meta-row">${SVG.pin}<span>${ev.location}</span></div>
          </div>
        </div>
      </div>

      <div class="event-card-body">
        <p class="event-description">${ev.description}</p>
        ${isReg
          ? `<button class="register-btn unregister-btn"
                     data-register="${ev.id}"
                     aria-label="${t('unregister')} – ${ev.school}"
                     onclick="unregisterEvent('${ev.id}')">
               ${t('unregister')}
             </button>`
          : `<button class="register-btn"
                     data-register="${ev.id}"
                     aria-label="${t('register')} – ${ev.school}"
                     onclick="registerEvent('${ev.id}')">
               ${t('register')}
             </button>`
        }
      </div>
    </article>`;
  }).join('');
}

/* ================================================================
   RENDER — CALENDAR VIEW
================================================================ */
function renderCalendarView(events) {
  const grouped = {};
  events.forEach(ev => {
    const key = ev.date.slice(0, 7);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(ev);
  });

  const container = document.getElementById('calendar-view');
  container.innerHTML = Object.keys(grouped).sort().map(key => {
    const monthEvents = grouped[key];
    const monthLabel  = getMonthName(key + '-01');

    const rows = monthEvents.map(ev => {
      const isFav = favorites.includes(ev.id);
      const isReg = registeredSet.has(ev.id);
      return `
      <div class="cal-event-row" role="listitem">
        <div class="date-badge-cal" aria-hidden="true">
          <div class="day">${getDay(ev.date)}</div>
          <div class="mon">${getMonthName(ev.date, true)}</div>
        </div>

        <div class="cal-event-details">
          <div class="cal-event-head">
            <h3 class="cal-event-title">${ev.school}</h3>
            <button class="fav-btn-sm ${isFav ? 'active' : ''}"
                    data-event-id="${ev.id}"
                    data-fav="cal"
                    aria-label="${isFav ? t('ariaFavRemove') : t('ariaFavAdd')}"
                    aria-pressed="${isFav}"
                    onclick="toggleFavorite('${ev.id}')">
              ${heartIcons()}
            </button>
          </div>

          <div class="cal-meta-row">
            <span class="meta-item">${SVG.clock}<span>${ev.time}</span></span>
            <span class="meta-item">${SVG.pin}<span>${ev.location}</span></span>
          </div>

          <p class="cal-description">${ev.description}</p>

          ${isReg
            ? `<button class="register-btn-sm unregister-btn"
                       data-register="${ev.id}"
                       aria-label="${t('unregister')} – ${ev.school}"
                       onclick="unregisterEvent('${ev.id}')">
                 ${t('unregister')}
               </button>`
            : `<button class="register-btn-sm"
                       data-register="${ev.id}"
                       aria-label="${t('register')} – ${ev.school}"
                       onclick="registerEvent('${ev.id}')">
                 ${t('register')}
               </button>`
          }
        </div>
      </div>`;
    }).join('');

    return `
    <section class="month-section" aria-label="${monthLabel}">
      <div class="month-header">
        <div class="month-icon">${SVG.cal}</div>
        <h2 class="month-title">${monthLabel}</h2>
      </div>
      ${rows}
    </section>`;
  }).join('');
}

/* ================================================================
   MAIN RENDER
================================================================ */
function render() {
  const events = getFilteredEvents();
  const listEl    = document.getElementById('list-view');
  const calEl     = document.getElementById('calendar-view');
  const emptyEl   = document.getElementById('empty-state');
  const loadingEl = document.getElementById('loading-state');

  stopStateAnimation();

  if (isLoading) {
    listEl.style.display = 'none';
    calEl.style.display = 'none';
    emptyEl.style.display = 'none';
    loadingEl.style.display = 'block';
    document.getElementById('loading-msg').textContent = t('Loading...');
    startStateAnimation('loading');
    return;
  }

  loadingEl.style.display = 'none';

  if (events.length === 0) {
    listEl.style.display  = 'none';
    calEl.style.display   = 'none';
    emptyEl.style.display = 'block';
    document.getElementById('empty-msg').textContent = t('noEvents');
    startStateAnimation('empty');
    return;
  }

  emptyEl.style.display = 'none';

  if (currentView === 'list') {
    listEl.style.display = 'grid';
    calEl.style.display  = 'none';
    renderListView(events);
    animateCards();
  } else {
    listEl.style.display = 'none';
    calEl.style.display  = 'block';
    renderCalendarView(events);
    animateCalendarRows();
  }

  announce(`${events.length} ${currentLang === 'nl' ? 'evenementen' : 'events'}`);
}

/* ================================================================
   CARD ANIMATIONS
================================================================ */
function animateCards() {
  const cards = document.querySelectorAll('#list-view .event-card');
  cards.forEach((card, i) => {
    if (i % 2 !== 0) card.classList.add('card-from-right');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('card-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  cards.forEach(card => observer.observe(card));
}

function animateCalendarRows() {
  const rows = document.querySelectorAll('#calendar-view .cal-event-row');
  rows.forEach((row, i) => {
    if (i % 2 !== 0) row.classList.add('cal-row-from-right');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('cal-row-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  rows.forEach(row => observer.observe(row));
}

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    const sel = btn.dataset.filter === filter;
    btn.classList.toggle('active', sel);
    btn.setAttribute('aria-selected', String(sel));
  });
  render();
}

function setViewMode(mode) {
  currentView = mode;
  document.querySelectorAll('.view-btn').forEach(btn => {
    const sel = btn.dataset.view === mode;
    btn.classList.toggle('active', sel);
    btn.setAttribute('aria-selected', String(sel));
  });
  render();
}

// Raksha: toggleFavorite now syncs to DB via direct API call
async function toggleFavorite(id) {
  const wasAdded = !favorites.includes(id);
  if (wasAdded) {
    favorites.push(id);
  } else {
    favorites = favorites.filter(f => f !== id);
  }
  localStorage.setItem('fav_openhouses', JSON.stringify(favorites));

  document.querySelectorAll(`[data-event-id="${id}"]`).forEach(btn => {
    btn.classList.toggle('active', wasAdded);
    btn.setAttribute('aria-pressed', String(wasAdded));
    btn.setAttribute('aria-label', wasAdded ? t('ariaFavRemove') : t('ariaFavAdd'));
  });

  if (currentFilter === 'saved' && !wasAdded) {
    document.querySelectorAll(`[data-event-id="${id}"]`).forEach(btn => {
      const card = btn.closest('.event-card, .cal-event-row');
      if (card) {
        card.style.transition = 'opacity .2s ease';
        card.style.opacity = '0';
        setTimeout(() => {
          card.remove();
          const remaining = document.querySelectorAll('.event-card, .cal-event-row');
          if (remaining.length === 0) {
            document.getElementById('list-view').style.display = 'none';
            document.getElementById('calendar-view').style.display = 'none';
            const emptyEl = document.getElementById('empty-state');
            emptyEl.style.display = 'block';
            document.getElementById('empty-msg').textContent = t('noEvents');
          }
        }, 200);
      }
    });
  }

  const msg = wasAdded ? t('addedFav') : t('removedFav');
  showToast(msg, '', wasAdded);
  announce(msg);

  const token = getAuthToken();
  if (token) {
    try {
      if (wasAdded) {
        await fetch('/favorites/openhouses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify({ openHouseId: id }),
        });
      } else {
        await fetch('/favorites/openhouses/' + id, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        });
      }
    } catch (err) {
      console.warn('[toggleFavorite] DB sync failed:', err);
    }
  }
}

async function registerEvent(id) {
  if (!getAuthToken()) {
    showToast(t('loginRequired'), '');
    setTimeout(() => { window.location.href = 'login.html'; }, 1200);
    return;
  }

  const ev = EVENTS.find(e => e.id === id);
  if (!ev) return;

  registeredSet.add(id);
  render();

  try {
    const res = await fetch(`/openhouses/${id}/register`, {
      method:  'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    addToGoogleCalendar(ev);

    if (!favorites.includes(id)) {
      await window.FavSync.toggle('openhouses', id);
      favorites = JSON.parse(localStorage.getItem('fav_openhouses') || '[]');
    }

    showToast(t('regSuccess'), 'success');
    announce(t('regSuccess'));
  } catch (err) {
    console.error('[registerEvent]', err);
    registeredSet.delete(id);
    render();
    showToast(currentLang === 'nl' ? 'Aanmelden mislukt. Probeer opnieuw.' : 'Registration failed. Please try again.', '');
  }
}

async function unregisterEvent(id) {
  const ev = EVENTS.find(e => e.id === id);
  if (!ev) return;

  registeredSet.delete(id);
  render();

  try {
    const res = await fetch(`/openhouses/${id}/register`, {
      method:  'DELETE',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const calLink = `https://calendar.google.com/calendar/r/search?q=${encodeURIComponent('Open Dag – ' + ev.school)}`;
    const toastEl = document.getElementById('toast');
    toastEl.innerHTML = `${t('unregSuccess')} &nbsp;<a href="${calLink}" target="_blank" rel="noopener noreferrer" class="toast-fav-link">${t('calendarHint')}</a>`;
    toastEl.className = 'toast show';
    toastEl.style.pointerEvents = 'auto';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.className = 'toast';
      toastEl.style.pointerEvents = '';
    }, 7000);

    announce(t('unregSuccess'));
  } catch (err) {
    console.error('[unregisterEvent]', err);
    registeredSet.add(id);
    render();
    showToast(currentLang === 'nl' ? 'Afmelden mislukt. Probeer opnieuw.' : 'Unregister failed. Please try again.', '');
  }
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('language', lang);
  document.getElementById('btn-nl').classList.toggle('active', lang === 'nl');
  document.getElementById('btn-en').classList.toggle('active', lang === 'en');
  document.documentElement.lang = lang;
  document.getElementById('page-title').textContent    = T[lang].title;
  document.getElementById('page-subtitle').textContent = T[lang].subtitle;
  document.getElementById('lbl-list').textContent      = T[lang].listView;
  document.getElementById('lbl-calendar').textContent  = T[lang].calendarView;
  document.querySelector('[data-filter="all"]').textContent      = T[lang].all;
  document.querySelector('[data-filter="upcoming"]').textContent = T[lang].upcoming;
  document.querySelector('[data-filter="saved"]').textContent    = T[lang].saved;
  render();
}

// ── Hamburger ────────────────────────────────────────────────
document.getElementById('hamburger-btn').addEventListener('click', () => {
  document.getElementById('mobile-nav').classList.toggle('open');
});

// ── Auth / Profile ────────────────────────────────────────────
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

  document.getElementById('login-btn').style.display      = 'none';
  document.getElementById('profile-btn').style.display    = 'flex';
  document.getElementById('mobile-login').style.display   = 'none';
  document.getElementById('mobile-profile').style.display = 'block';

  const displayName = localStorage.getItem('user_display_name') || payload.name || 'Profiel';
  const avatarKey   = localStorage.getItem('user_avatar') || 'graduate';
  const avatarEmoji = AVATARS_MAP[avatarKey] || '🎓';

  document.getElementById('profile-name-label').textContent = displayName;
  document.getElementById('nav-avatar-display').textContent  = avatarEmoji;
  document.getElementById('popup-avatar-lg').textContent     = avatarEmoji;
  document.getElementById('popup-name').textContent          = displayName;
  document.getElementById('popup-email').textContent         = payload.email || '';

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

document.addEventListener('click', (e) => {
  const popup = document.getElementById('profile-popup');
  const wrap  = document.getElementById('profile-btn');
  if (popup && wrap && !wrap.contains(e.target)) popup.classList.remove('open');
});

/* ================================================================
   CONFLICT RESOLUTION — public/js/open-houses.js
   Location: init block at the very bottom of the file

   WHAT THE CONFLICT WAS:
     Veroush's (HEAD / raksha/testing/merge):
       setLanguage(currentLang);
       initAuth();
       Promise.all([
         loadEvents(),
         window.FavSync.loadFromDB(),
       ]).then(() => {
         favorites = JSON.parse(localStorage.getItem('fav_openhouses') || '[]');
         render();
       });

       Key points:
       - setLanguage() and initAuth() run first so the UI is ready
         before data arrives (no flash of untranslated text).
       - loadEvents() and FavSync.loadFromDB() run in parallel via
         Promise.all, which is faster than running them sequentially.
       - favorites is re-read from localStorage AFTER FavSync.loadFromDB()
         completes, so the heart icons reflect the true DB state.
       - render() is called only once, after both promises settle.
       - Uses loadEvents() which contains the UTC→Suriname time conversion
         logic (slicing the ISO string, subtracting 3 hours for UTC-3).

     Val's (feature/settings):
       (async () => {
         initAuth();
         render();           // ← renders BEFORE data loads
         await fetchEvents();
         isLoading = false;
         setLanguage(currentLang);
       })();

       Key points:
       - render() is called immediately before fetchEvents() completes.
         Since isLoading starts as true, this shows the loading spinner,
         which is intentional, but it also means the UI has no language
         applied yet when render() first runs.
       - Uses fetchEvents() instead of loadEvents(). fetchEvents() is a
         simpler version added by Val that does NOT contain the UTC-3 time
         conversion logic. Open house times would appear in UTC instead of
         Suriname local time (e.g. 06:00 instead of 09:00).
       - FavSync.loadFromDB() is never called, meaning favorites are read
         from a potentially stale localStorage cache. Heart icons may not
         reflect the user's actual saved favorites from the DB.
       - setLanguage() runs last, after the data fetch, causing a brief
         flash of Dutch (default) text even if the user prefers English.

   WHY YOURS WAS KEPT:
     1. loadEvents() contains the UTC→Suriname (UTC-3) time conversion
        which is critical for showing correct event times. Val's
        fetchEvents() silently drops this logic and would show wrong times.
     2. FavSync.loadFromDB() must be awaited before reading fav_openhouses
        so that heart icons reflect the true DB state, not stale cache.
     3. setLanguage() running first prevents any language flash on load.
     4. Promise.all is more efficient — both fetches run in parallel.

   RESOLUTION:
     Kept your (HEAD) init block verbatim. Dropped Val's async IIFE.

   OWNERSHIP:
     Promise.all + FavSync + loadEvents() init pattern (kept):
       yours / raksha/testing/merge.
     async IIFE with fetchEvents() (dropped): Val / feature/settings.
================================================================ */

// Raksha: loadEvents() fetches from API, FavSync.loadFromDB() restores favorites from DB.
// setLanguage() and initAuth() run first so the UI is ready before data arrives.
setLanguage(currentLang);
initAuth();
Promise.all([
  loadEvents(),
  window.FavSync.loadFromDB(),
]).then(() => {
  favorites = JSON.parse(localStorage.getItem('fav_openhouses') || '[]');
  render();
});