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
    EVENTS = raw.map(ev => ({
      ...ev,
      school: ev.school?.name || ev.school || '',
      time:   ev.date
        ? new Date(ev.date).toLocaleTimeString('nl-SR', { hour: '2-digit', minute: '2-digit', hour12: false })
        : '',
      date:   ev.date ? ev.date.slice(0, 10) : '',
    }));
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

function getAuthToken() {
  return localStorage.getItem('auth_token') || null;
}

function getAuthHeader() {
  const token = getAuthToken();
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

/* ================================================================
   API — FETCH OPEN HOUSES (used by registerEvent / unregisterEvent)
================================================================ */
async function fetchEvents() {
  try {
    const res = await fetch('/openhouses', {
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Normalise API shape to match what the renderers expect
    EVENTS = data.map(oh => ({
      id:          oh.id,
      school:      oh.school,
      date:        oh.date ? oh.date.slice(0, 10) : '',
      time:        oh.time || '',
      location:    oh.location || '',
      description: oh.description || '',
      registered:  oh.registered || false,
    }));

    // Sync registeredSet from API response (source of truth)
    registeredSet = new Set(EVENTS.filter(e => e.registered).map(e => e.id));

  } catch (err) {
    console.warn('[Studie4SU] Backend unavailable, using fallback:', err.message);
    EVENTS = FALLBACK_EVENTS.map(e => ({ ...e }));
    registeredSet = new Set();
  }
}

/* ================================================================
   HELPERS
================================================================ */
function t(key) { return T[currentLang][key] || key; }

function getMonthName(dateStr, short = false) {
  const d = new Date(dateStr);
  return short
    ? T[currentLang].monthsShort[d.getMonth()]
    : T[currentLang].months[d.getMonth()];
}

function getDay(dateStr) { return new Date(dateStr).getDate(); }

function isUpcoming(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
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
  const timeMatch = ev.time && ev.time.match(/(\d{2}:\d{2})\s*[–-]\s*(\d{2}:\d{2})/);
  const dateClean = ev.date.replace(/-/g, '');

  let startDT, endDT;
  if (timeMatch) {
    const toGCal = (d, t) => d + 'T' + t.replace(':', '') + '00';
    startDT = toGCal(dateClean, timeMatch[1]);
    endDT   = toGCal(dateClean, timeMatch[2]);
  } else {
    startDT = dateClean;
    const d = new Date(ev.date + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    endDT = d.toISOString().slice(0, 10).replace(/-/g, '');
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
   One image per school — card header background.
   Keyed by exact school name strings from FALLBACK_EVENTS / API.
   Falls back to green gradient if no match.
================================================================ */
const SCHOOL_IMAGES = {
  // picsum.photos IDs are stable and always load — no API key needed
  'Anton de Kom Universiteit (AdeKUS)':           'https://picsum.photos/id/1067/800/400',  // campus/building
  'Natuurtechnisch Instituut (NATIN)':             'https://picsum.photos/id/0/800/400',     // tech/electronics
  'Instituut voor de Opleiding van Leraren (IOL)': 'https://picsum.photos/id/20/800/400',    // classroom/education
  'COVAB':                                         'https://picsum.photos/id/145/800/400',   // nature/agriculture
  'IMEAO':                                         'https://picsum.photos/id/1060/800/400',  // business/office
  'Polytechnical College Suriname (PTC)':          'https://picsum.photos/id/119/800/400',   // industrial/workshop
  'IGSR':                                          'https://picsum.photos/id/1031/800/400',  // college building
  'FHR':                                           'https://picsum.photos/id/305/800/400',   // healthcare/medical
};

function getSchoolImage(schoolName) {
  if (!schoolName) return null;
  if (SCHOOL_IMAGES[schoolName]) return SCHOOL_IMAGES[schoolName];
  // Partial match for API names that may differ slightly
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
  const listEl   = document.getElementById('list-view');
  const calEl    = document.getElementById('calendar-view');
  const emptyEl  = document.getElementById('empty-state');

  if (events.length === 0) {
    listEl.style.display  = 'none';
    calEl.style.display   = 'none';
    emptyEl.style.display = 'block';
    document.getElementById('empty-msg').textContent = t('noEvents');
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
  }

  announce(`${events.length} ${currentLang === 'nl' ? 'evenementen' : 'events'}`);
}

/* ================================================================
   INTERACTIONS (Filters, View, Favs, Register, Lang)
================================================================ */
/* ================================================================
   CARD ANIMATIONS — flip in from alternating sides via IntersectionObserver
================================================================ */
function animateCards() {
  const cards = document.querySelectorAll('#list-view .event-card');
  cards.forEach((card, i) => {
    // Mark right-origin cards before observing
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

// Raksha: toggleFavorite now syncs to DB via FavSync
async function toggleFavorite(id) {
  // Instant UI update — don't wait for DB
  const wasAdded = !favorites.includes(id);
  if (wasAdded) {
    favorites.push(id);
    localStorage.setItem('fav_openhouses', JSON.stringify(favorites));
  } else {
    favorites = favorites.filter(f => f !== id);
    localStorage.setItem('fav_openhouses', JSON.stringify(favorites));
  }

  // Update heart buttons immediately
  if (currentFilter === 'saved') {
    render();
  } else {
    document.querySelectorAll(`[data-event-id="${id}"]`).forEach(btn => {
      btn.classList.toggle('active', wasAdded);
      btn.setAttribute('aria-pressed', String(wasAdded));
      btn.setAttribute('aria-label', wasAdded ? t('ariaFavRemove') : t('ariaFavAdd'));
    });
  }

  const msg = wasAdded ? t('addedFav') : t('removedFav');
  showToast(msg, 'success', wasAdded);
  announce(msg);

  // Sync to DB in background
  await window.FavSync.toggle('openhouses', id);
  favorites = JSON.parse(localStorage.getItem('fav_openhouses') || '[]');
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

    // Auto-favourite when registering
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
/* Avatar emoji map — must match settings.js exactly */
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

  // Notifications toggle state
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

// ── Init ─────────────────────────────────────────────────────
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