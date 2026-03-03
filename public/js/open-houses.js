/* ================================================================
   TRANSLATIONS
================================================================ */
const T = {
  nl: {
    title: 'Open Dagen',
    subtitle: 'Bezoek scholen en maak kennis met de opleidingen',
    all: 'Alle', upcoming: 'Aankomend', saved: 'Opgeslagen',
    listView: 'Lijst', calendarView: 'Kalender',
    register: 'Aanmelden', registered: 'Aangemeld', registering: 'Bezig...',
    noEvents: 'Geen open dagen gevonden',
    addedFav: 'Toegevoegd aan favorieten',
    removedFav: 'Verwijderd uit favorieten',
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
    register: 'Register', registered: 'Registered', registering: 'Registering...',
    noEvents: 'No open houses found',
    addedFav: 'Added to favorites',
    removedFav: 'Removed from favorites',
    regSuccess: 'Successfully registered!',
    ariaFavAdd: 'Add to favorites',
    ariaFavRemove: 'Remove from favorites',
    months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    monthsShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  }
};

/* ================================================================
   EVENT DATA  — 8 events across 3 months
================================================================ */
const EVENTS = [
  {
    id: '1',
    school: 'Anton de Kom Universiteit (AdeKUS)',
    date: '2026-03-14',
    time: '10:00 – 16:00',
    location: 'Leysweg 86, Paramaribo',
    description: 'Ontdek alle universitaire opleidingen en spreek met docenten en studenten van AdeKUS. Rondleidingen door de campus zijn beschikbaar.',
    registered: false,
  },
  {
    id: '2',
    school: 'Natuurtechnisch Instituut (NATIN)',
    date: '2026-03-21',
    time: '09:00 – 14:00',
    location: 'Zwartenhovenbrugstraat, Paramaribo',
    description: 'Bezoek onze workshops en labs en ervaar technisch onderwijs. Bekijk de ICT- en ingenieursafdelingen van dichtbij.',
    registered: false,
  },
  {
    id: '3',
    school: 'Instituut voor de Opleiding van Leraren (IOL)',
    date: '2026-03-28',
    time: '10:00 – 15:00',
    location: 'Dr. Sophie Redmondstraat, Paramaribo',
    description: 'Leer alles over de lerarenopleiding. Spreek met studenten en docenten over het vak en de toekomstmogelijkheden.',
    registered: false,
  },
  {
    id: '4',
    school: 'COVAB',
    date: '2026-04-11',
    time: '09:00 – 13:00',
    location: 'Leysweg, Paramaribo',
    description: 'Ontdek de agrarische en biologische wetenschappen. Bezoek onze onderzoekstuinen en laboratoria.',
    registered: false,
  },
  {
    id: '5',
    school: 'IMEAO',
    date: '2026-04-18',
    time: '10:00 – 15:00',
    location: 'Paramaribo',
    description: 'Informeer je over de MBO-opleidingen van IMEAO in economie en bedrijfskunde. Praat met studenten en begeleiders.',
    registered: false,
  },
  {
    id: '6',
    school: 'Polytechnical College Suriname (PTC)',
    date: '2026-04-25',
    time: '09:00 – 14:00',
    location: 'Meerzorgweg, Paramaribo',
    description: 'Bekijk de technische opleidingen van PTC. Demonstraties van leerlingen in de werkplaatsen en ateliers.',
    registered: false,
  },
  {
    id: '7',
    school: 'IGSR',
    date: '2026-05-09',
    time: '10:00 – 16:00',
    location: 'Paramaribo',
    description: 'Open dag van IGSR. Ontmoet de studenten en docenten en leer meer over de beschikbare HBO-programma\'s.',
    registered: false,
  },
  {
    id: '8',
    school: 'Anton de Kom Universiteit (AdeKUS)',
    date: '2026-05-23',
    time: '09:00 – 17:00',
    location: 'Leysweg 86, Paramaribo',
    description: 'Tweede open dag van AdeKUS gericht op internationale studenten en samenwerkingsprogramma\'s.',
    registered: false,
  },
];

/* ================================================================
   STATE
================================================================ */
let currentFilter  = 'all';
let currentView    = 'list';
let currentLang    = localStorage.getItem('language') || 'nl';
let favorites      = JSON.parse(localStorage.getItem('fav_openhouses') || '[]');
let registered     = JSON.parse(localStorage.getItem('oh_registered') || '[]');

function saveFavData() {
  // Store the full event objects so favorites.html can display them without an API call
  const data = {};
  favorites.forEach(id => {
    const ev = EVENTS.find(e => e.id === id);
    if (ev) data[id] = ev;
  });
  localStorage.setItem('fav_openhouses_data', JSON.stringify(data));
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
  // Parse "09:00 – 14:00" or "10:00 – 16:00" into start/end
  const timeMatch = ev.time && ev.time.match(/(\d{2}:\d{2})\s*[–-]\s*(\d{2}:\d{2})/);
  const dateClean = ev.date.replace(/-/g, ''); // "20260314"

  let startDT, endDT;
  if (timeMatch) {
    const toGCal = (d, t) => d + 'T' + t.replace(':', '') + '00';
    startDT = toGCal(dateClean, timeMatch[1]);
    endDT   = toGCal(dateClean, timeMatch[2]);
  } else {
    // No parseable time — all-day event
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
    + '&dates='    + encodeURIComponent(startDT + '/' + endDT)
    + '&details='  + encodeURIComponent(details)
    + '&location=' + encodeURIComponent(ev.location || '')
    + '&add='      + encodeURIComponent('POPUP:1440')   // 1-day reminder
    + '&sf=true&output=xml';

  window.open(calUrl, '_blank', 'noopener,noreferrer');
}

/* ================================================================
   TOAST
================================================================ */
let toastTimer;
function showToast(msg, type = '', showFavLink = false) {
  const el = document.getElementById('toast');
  el.innerHTML = showFavLink
    ? `${msg} &nbsp;<a href="favorites.html" class="toast-fav-link">Bekijk favorieten →</a>`
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
   RENDER — LIST VIEW
================================================================ */
function renderListView(events) {
  const container = document.getElementById('list-view');
  container.innerHTML = events.map(ev => {
    const isFav = favorites.includes(ev.id);
    const isReg = registered.includes(ev.id);
    return `
    <article class="event-card" role="listitem">
      <div class="event-card-header">
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
        <button class="register-btn ${isReg ? 'registered' : ''}"
                data-register="${ev.id}"
                ${isReg ? 'disabled' : ''}
                aria-label="${isReg ? t('registered') : t('register') + ' – ' + ev.school}"
                onclick="registerEvent('${ev.id}')">
          ${isReg ? t('registered') : t('register')}
        </button>
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
      const isReg = registered.includes(ev.id);
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

          <button class="register-btn-sm ${isReg ? 'registered' : ''}"
                  data-register="${ev.id}"
                  ${isReg ? 'disabled' : ''}
                  aria-label="${isReg ? t('registered') : t('register') + ' – ' + ev.school}"
                  onclick="registerEvent('${ev.id}')">
            ${isReg ? t('registered') : t('register')}
          </button>
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

function toggleFavorite(id) {
  const idx      = favorites.indexOf(id);
  const justAdded = idx === -1;
  let msg;
  if (idx > -1) {
    favorites.splice(idx, 1);
    msg = t('removedFav');
  } else {
    favorites.push(id);
    msg = t('addedFav');
  }
  localStorage.setItem('fav_openhouses', JSON.stringify(favorites));
  saveFavData();
  showToast(msg, 'success', justAdded);
  announce(msg);

  if (currentFilter === 'saved') {
    render();
  } else {
    document.querySelectorAll(`[data-event-id="${id}"]`).forEach(btn => {
      const isFav = favorites.includes(id);
      btn.classList.toggle('active', isFav);
      btn.setAttribute('aria-pressed', String(isFav));
      btn.setAttribute('aria-label', isFav ? t('ariaFavRemove') : t('ariaFavAdd'));
    });
  }
}

function registerEvent(id) {
  const ev = EVENTS.find(e => e.id === id);
  if (!ev) return;
  addToGoogleCalendar(ev);
  // Mark as registered locally so the button updates
  if (!registered.includes(id)) {
    registered.push(id);
    localStorage.setItem('oh_registered', JSON.stringify(registered));
    document.querySelectorAll(`[data-register="${id}"]`).forEach(btn => {
      btn.textContent = t('registered');
      btn.classList.add('registered');
      btn.disabled = true;
    });
    if (!favorites.includes(id)) {
      favorites.push(id);
      localStorage.setItem('fav_openhouses', JSON.stringify(favorites));
      saveFavData();
      document.querySelectorAll(`[data-event-id="${id}"]`).forEach(btn => {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      });
    }
    showToast(t('regSuccess'), 'success');
    announce(t('regSuccess'));
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

// Init
setLanguage(currentLang);