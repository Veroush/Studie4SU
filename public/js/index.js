'use strict';

/* ============================================================
   PINNED FEATURED SCHOOLS
   Always shows exactly these 3 schools in this order.
   Images use the same Unsplash pattern as schools.js.
   To swap an image: change the photo-XXXXXXX part of the URL.
============================================================ */
const FEATURED_SCHOOL_IDS = ['school_adekus', 'school_ptc', 'school_fhr'];

const FEATURED_SCHOOL_IMAGES = {
  school_adekus: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=800&h=400&fit=crop',
  school_ptc:    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=400&fit=crop',
  school_fhr:    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop',
};

const FEATURED_SCHOOL_COLORS = {
  school_adekus: '#1a4a32',
  school_ptc:    '#1a2a4a',
  school_fhr:    '#3a1a2a',
};

/* Hero slideshow images — rotating campus visuals */
const HERO_SLIDES = [
  'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=900&h=600&fit=crop',
  'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=900&h=600&fit=crop',
  'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=900&h=600&fit=crop',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&h=600&fit=crop',
];

/* ============================================================
   FALLBACK DATA — used only when API is unreachable
============================================================ */
const FALLBACK_SCHOOLS = [
  { id: 'school_adekus', emoji: '🎓', name: 'Anton de Kom Universiteit van Suriname', shortName: 'AdeKUS', type: 'HBO', location: 'Paramaribo', programs: 39 },
  { id: 'school_ptc',    emoji: '🔧', name: 'Polytechnic College Suriname',           shortName: 'PTC',    type: 'HBO', location: 'Slangenhoutstraat, Saron', programs: 14 },
  { id: 'school_fhr',    emoji: '📊', name: 'Frederik Hendrik Rudolf Lim A Po Institute', shortName: 'FHR', type: 'HBO', location: 'Paramaribo', programs: 16 },
];

const FALLBACK_EVENTS = [
  { id: 'oh_adekus_march', title: 'Open Dag AdeKUS',  schoolName: 'Anton de Kom Universiteit van Suriname', dateStr: '2026-03-14', time: '10:00', location: 'Leysweg 86, Paramaribo' },
  { id: 'oh_natin_march',  title: 'Open Dag NATIN',   schoolName: 'Natuurtechnisch Instituut',              dateStr: '2026-03-21', time: '09:00', location: 'Zwartenhovenbrugstraat' },
  { id: 'oh_iol_march',    title: 'Open Dag IOL',     schoolName: 'Instituut voor de Opleiding van Leraren',dateStr: '2026-03-28', time: '10:00', location: 'Paramaribo' },
  { id: 'oh_covab_april',  title: 'Open Dag COVAB',   schoolName: 'College voor Agrarische Wetenschappen',  dateStr: '2026-04-11', time: '09:00', location: 'Leysweg, Paramaribo' },
];

const TYPE_EMOJI = { University: '🎓', HBO: '📚', MBO: '🔧' };

let featuredSchools = FALLBACK_SCHOOLS;
let upcomingEvents  = FALLBACK_EVENTS;

/* ============================================================
   TRANSLATIONS
============================================================ */
const T = {
  nl: {
    heroBadge:      'Jouw toekomst begint hier',
    heroHeading:    'Vind Jouw <span>Studierichting</span><br/>in Suriname',
    heroSub:        'Ontdek alle scholen, opleidingen en open dagen in Suriname. Weet je nog niet wat je wil studeren? Doe onze gratis quiz en vind je match in 2 minuten.',
    heroCta:        '✨ Doe de Studie Quiz',
    heroExplore:    '🏫 Verken Scholen',
    heroOpenhouses: '📅 Open Dagen',
    heroFav:        '❤️ Mijn Favorieten',
    statSchools:    'Scholen',
    statPrograms:   'Opleidingen',
    statQuiz:       'Gratis Quiz',
    featuresLabel:  'Wat Wij Bieden',
    schoolsLabel:   'Uitgelichte Scholen',
    schoolsViewall: 'Alle scholen →',
    eventsLabel:    'Aankomende Evenementen',
    eventsViewall:  'Alle evenementen →',
    quizBadge:      'Gratis & Duurt 2 Minuten',
    quizSub:        'Beantwoord 10 korte vragen en wij matchen jou met het juiste programma.',
    quizCta:        '✨ Start de Studie Quiz',
    register:       'Bekijk Event',
    programs:       n => `${n} opleidingen`,
    MONTHS:         ['Jan','Feb','Mrt','Apr','Mei','Jun','Jul','Aug','Sep','Okt','Nov','Dec'],
    daysLeft:       n => n === 1 ? 'Morgen!' : `${n} dagen`,
    today:          'Vandaag!',
  },
  en: {
    heroBadge:      'Your future starts here',
    heroHeading:    'Find Your <span>Study Path</span><br/>in Suriname',
    heroSub:        'Discover all schools, programs and open houses in Suriname. Not sure what to study? Take our free quiz and find your match in 2 minutes.',
    heroCta:        '✨ Take the Study Quiz',
    heroExplore:    '🏫 Explore Schools',
    heroOpenhouses: '📅 Open Houses',
    heroFav:        '❤️ My Favourites',
    statSchools:    'Schools',
    statPrograms:   'Programs',
    statQuiz:       'Free Quiz',
    featuresLabel:  'What We Offer',
    schoolsLabel:   'Featured Schools',
    schoolsViewall: 'View all schools →',
    eventsLabel:    'Upcoming Events',
    eventsViewall:  'View all events →',
    quizBadge:      'Free & Takes 2 Minutes',
    quizSub:        "Answer 10 short questions and we'll match you with the right program.",
    quizCta:        '✨ Start the Study Quiz',
    register:       'View Event',
    programs:       n => `${n} programs`,
    MONTHS:         ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    daysLeft:       n => n === 1 ? 'Tomorrow!' : `${n} days`,
    today:          'Today!',
  }
};

/* ============================================================
   LANGUAGE
============================================================ */
let lang = localStorage.getItem('language') || 'nl';

function applyLang(l) {
  lang = l;
  localStorage.setItem('language', l);
  const t = T[l];

  document.getElementById('btn-nl').classList.toggle('active', l === 'nl');
  document.getElementById('btn-en').classList.toggle('active', l === 'en');

  document.getElementById('hero-badge-text').textContent  = t.heroBadge;
  document.getElementById('hero-heading').innerHTML        = t.heroHeading;
  document.getElementById('hero-sub').textContent          = t.heroSub;
  document.getElementById('hero-cta').textContent          = t.heroCta;
  document.getElementById('hero-explore').textContent      = t.heroExplore;
  document.getElementById('hero-openhouses').textContent   = t.heroOpenhouses;
  document.getElementById('hero-fav-text').textContent     = t.heroFav.replace('❤️ ', '');
  document.getElementById('stat-schools').textContent      = t.statSchools;
  document.getElementById('stat-programs').textContent     = t.statPrograms;
  document.getElementById('stat-quiz').textContent         = t.statQuiz;

  document.getElementById('features-label').textContent    = t.featuresLabel;
  document.getElementById('schools-label').textContent     = t.schoolsLabel;
  document.getElementById('schools-viewall').textContent   = t.schoolsViewall;
  document.getElementById('events-label').textContent      = t.eventsLabel;
  document.getElementById('events-viewall').textContent    = t.eventsViewall;
  document.getElementById('quiz-banner-badge').textContent = t.quizBadge;
  document.getElementById('quiz-banner-sub').textContent   = t.quizSub;
  document.getElementById('quiz-banner-cta').textContent   = t.quizCta;

  document.querySelectorAll('[data-nl]').forEach(el => {
    el.textContent = l === 'nl' ? el.dataset.nl : el.dataset.en;
  });

  renderSchools();
  renderEvents();
}

/* ============================================================
   HERO SLIDESHOW
============================================================ */
let currentSlide   = 0;
let slideInterval  = null;

function initHeroSlideshow() {
  const visual = document.getElementById('hero-visual');
  const dotsEl = document.getElementById('hero-dots');
  if (!visual || !dotsEl) return;

  const overlay = visual.querySelector('.hero-visual-overlay');

  HERO_SLIDES.forEach((url, i) => {
    const slide = document.createElement('div');
    slide.className = 'hero-slide' + (i === 0 ? ' active' : '');
    slide.style.backgroundImage = `url('${url}')`;
    visual.insertBefore(slide, overlay);
  });

  HERO_SLIDES.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsEl.appendChild(dot);
  });

  slideInterval = setInterval(() => {
    goToSlide((currentSlide + 1) % HERO_SLIDES.length);
  }, 4000);
}

function goToSlide(index) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hero-dot');
  slides.forEach((s, i) => s.classList.toggle('active', i === index));
  dots.forEach((d, i)   => d.classList.toggle('active', i === index));
  currentSlide = index;
}

/* ============================================================
   FETCH SCHOOLS FROM API
============================================================ */
async function fetchSchools() {
  try {
    const res = await fetch('/schools');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Empty response');

    // API returns _count: { programs: N } from Prisma include
    const totalPrograms = data.reduce((sum, s) =>
      sum + (s._count?.programs ?? 0), 0);

    const schoolCountEl  = document.getElementById('stat-school-count');
    const programCountEl = document.getElementById('stat-program-count');
    if (schoolCountEl)  schoolCountEl.textContent = data.length + '+';
    if (programCountEl) programCountEl.textContent = totalPrograms;

    const schoolMap = {};
    data.forEach(s => {
      schoolMap[s.id] = {
        id:        s.id,
        emoji:     s.emoji || TYPE_EMOJI[s.type] || '🏫',
        name:      s.name,
        shortName: s.shortName || s.name,
        type:      s.type || 'HBO',
        location:  s.location || 'Paramaribo',
        programs:  s._count?.programs ?? 0,
      };
    });

    featuredSchools = FEATURED_SCHOOL_IDS
      .map(id => schoolMap[id] || FALLBACK_SCHOOLS.find(f => f.id === id))
      .filter(Boolean);

  } catch (err) {
    console.warn('[Studie4SU] Backend unavailable, using fallback school data:', err.message);
    featuredSchools = FALLBACK_SCHOOLS;
  }
  renderSchools();
}

/* ============================================================
   FETCH OPEN HOUSES FROM API
============================================================ */
async function fetchEvents() {
  try {
    const res = await fetch('/openhouses');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Empty response');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    upcomingEvents = data
      .filter(oh => {
        const dateStr = oh.date ? oh.date.slice(0, 10) : null;
        if (!dateStr) return false;
        const d = new Date(dateStr + 'T00:00:00');
        return d >= today && oh.isActive !== false;
      })
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4)
      .map(oh => ({
        id:         oh.id,
        title:      oh.title,
        schoolName: oh.school?.name || oh.schoolName || '',
        dateStr:    oh.date.slice(0, 10),
        time:       oh.date.slice(11, 16),
        location:   oh.location || 'Paramaribo',
      }));

    if (upcomingEvents.length === 0) upcomingEvents = FALLBACK_EVENTS;

  } catch (err) {
    console.warn('[Studie4SU] Could not fetch open houses, using fallback:', err.message);
    upcomingEvents = FALLBACK_EVENTS;
  }
  renderEvents();
}

/* ============================================================
   RENDER SCHOOLS
============================================================ */
function renderSchools() {
  const grid = document.getElementById('schools-grid');
  if (!grid) return;
  const t = T[lang];

  if (!featuredSchools || featuredSchools.length === 0) {
    grid.innerHTML = `<p style="color:var(--text-muted)">${lang === 'nl' ? 'Geen scholen gevonden.' : 'No schools found.'}</p>`;
    return;
  }

  grid.innerHTML = featuredSchools.map(school => {
    const imgUrl   = FEATURED_SCHOOL_IMAGES[school.id];
    const fallback = FEATURED_SCHOOL_COLORS[school.id] || '#1a4a32';

    return `
      <a class="school-preview-card" href="school-detail.html?id=${school.id}">
        <div class="school-card-img" style="${imgUrl ? '' : `background: linear-gradient(135deg, ${fallback}, #0d2b1f);`}">
          ${imgUrl ? `<div class="school-card-img-inner" style="background-image:url('${imgUrl}')"></div>` : ''}
          <div class="card-img-overlay"></div>
          <span class="school-type-pill">${school.type}</span>
          <span style="position:absolute;top:14px;right:16px;font-size:2rem;z-index:1">${school.emoji}</span>
        </div>
        <div class="school-card-body">
          <h3>${school.name}</h3>
          <div class="school-card-meta">
            <span>📍 ${school.location}</span>
            <span>📚 ${t.programs(school.programs)}</span>
          </div>
        </div>
      </a>
    `;
  }).join('');

  animateCards('.schools-preview-grid .school-preview-card');
  wireSchoolCards();
}

/* ============================================================
   RENDER EVENTS — with countdown badges
============================================================ */
function renderEvents() {
  const grid = document.getElementById('events-grid');
  if (!grid) return;
  const t = T[lang];

  if (!upcomingEvents || upcomingEvents.length === 0) {
    grid.innerHTML = `<p style="color:var(--text-muted)">${lang === 'nl' ? 'Geen aankomende evenementen.' : 'No upcoming events.'}</p>`;
    return;
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayMs = todayStart.getTime();

  grid.innerHTML = upcomingEvents.map(ev => {
    const [year, month, day] = ev.dateStr.split('-').map(Number);
    const dayStr   = String(day);
    const monthStr = t.MONTHS[month - 1];

    const eventMs  = new Date(ev.dateStr + 'T00:00:00').getTime();
    const daysLeft = Math.round((eventMs - todayMs) / 86400000);
    const isUrgent = daysLeft <= 7;
    const countdownText = daysLeft === 0 ? t.today : t.daysLeft(daysLeft);

    return `
      <div class="event-preview-card">
        <div class="event-date-box">
          <div class="event-day">${dayStr}</div>
          <div class="event-month">${monthStr}</div>
        </div>
        <div class="event-info">
          <div class="event-school">${ev.schoolName || ev.title}</div>
          <div class="event-time">🕐 ${ev.time || ''}</div>
          <div class="event-location">📍 ${ev.location}</div>
          <div class="event-countdown${isUrgent ? ' urgent' : ''}">
            ${isUrgent ? '🔥' : '📅'} ${countdownText}
          </div>
          <div class="event-register">
            <a href="open-houses.html" class="btn-register">${t.register} →</a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  animateCards('.events-preview-grid .event-preview-card');
  wireEventButtons();
}

/* ============================================================
   SCROLL-REVEAL — staggered card entrance animations
============================================================ */
function animateCards(selector) {
  const cards = document.querySelectorAll(selector);
  if (!cards.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const card  = entry.target;
      const index = Array.from(cards).indexOf(card);
      card.style.transitionDelay = `${(index % 3) * 80}ms`;
      card.classList.add('card-visible');
      io.unobserve(card);
    });
  }, { threshold: 0.1 });

  cards.forEach(card => io.observe(card));
}

function observeFeatureCards() {
  const cards = document.querySelectorAll('.features-grid .feature-card');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const card  = entry.target;
      const index = Array.from(cards).indexOf(card);
      card.style.transitionDelay = `${index * 100}ms`;
      card.classList.add('card-visible');
      io.unobserve(card);
    });
  }, { threshold: 0.1 });
  cards.forEach(card => io.observe(card));
}

/* ============================================================
   LOGIN-REDIRECT UTILITY
   Call requireAuth(destination) anywhere the user must be
   logged in. If they have a valid token → navigate directly.
   If not → store the destination in sessionStorage and send
   them to login.html, which will redirect back after login.
============================================================ */
function isLoggedIn() {
  const token = localStorage.getItem('auth_token');
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch { return false; }
}

function requireAuth(destination) {
  if (isLoggedIn()) {
    window.location.href = destination;
  } else {
    sessionStorage.setItem('redirect_after_login', destination);
    window.location.href = 'login.html';
  }
}

/* Wire all protected navigation links after DOM is ready.
   Called once in DOMContentLoaded after cards are rendered. */
function wireProtectedLinks() {
  // "Mijn Favorieten" hero button
  const favBtn = document.getElementById('hero-fav');
  if (favBtn) {
    favBtn.addEventListener('click', (e) => {
      e.preventDefault();
      requireAuth('favorites.html');
    });
  }

  // Feature section discovery cards (Scholen, Studierichtingen, Open Dagen)
  const featureLinks = [
    { id: 'feat-schools-link',    dest: 'schools.html'      },
    { id: 'feat-programs-link',   dest: 'schools.html'      },
    { id: 'feat-openhouses-link', dest: 'open-houses.html'  },
  ];
  featureLinks.forEach(({ id, dest }) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Intercept clicks on the whole card too, not just the link
    const card = el.closest('.feature-card');
    const targets = [el, card].filter(Boolean);
    targets.forEach(target => {
      target.addEventListener('click', (e) => {
        if (isLoggedIn()) return;
        e.preventDefault();
        requireAuth(dest);
      });
    });
  });
}

/* Wire school cards — called after renderSchools() injects them */
function wireSchoolCards() {
  document.querySelectorAll('.school-preview-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (isLoggedIn()) return; // let the <a> navigate normally
      e.preventDefault();
      requireAuth(card.getAttribute('href'));
    });
  });
}

/* Wire event "Bekijk Event" buttons — called after renderEvents() */
function wireEventButtons() {
  document.querySelectorAll('.btn-register').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (isLoggedIn()) return;
      e.preventDefault();
      requireAuth('open-houses.html');
    });
  });
}
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

  document.getElementById('login-btn').style.display     = 'none';
  document.getElementById('profile-btn').style.display   = 'flex';
  document.getElementById('mobile-login').style.display  = 'none';
  document.getElementById('mobile-profile').style.display = 'block';

  const displayName = localStorage.getItem('user_display_name') || payload.name || 'Student';
  const avatarId    = localStorage.getItem('user_avatar') || 'graduate';
  const avatarEmoji = AVATARS_MAP[avatarId] || '🎓';

  document.getElementById('profile-name-label').textContent = displayName;
  document.getElementById('popup-name').textContent          = displayName;
  document.getElementById('popup-email').textContent         = payload.email || '';

  const navAv = document.getElementById('nav-avatar-display');
  const popAv = document.getElementById('popup-avatar-lg');
  if (navAv) navAv.textContent = avatarEmoji;
  if (popAv) popAv.textContent = avatarEmoji;
  // dark_mode toggle state removed — dark mode feature scrapped
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
  if (popup && wrap && !wrap.contains(e.target)) {
    popup.classList.remove('open');
  }
});

/* ============================================================
   HAMBURGER
============================================================ */
document.getElementById('hamburger-btn').addEventListener('click', () => {
  document.getElementById('mobile-nav').classList.toggle('open');
});
document.querySelectorAll('.mobile-nav a').forEach(a => {
  a.addEventListener('click', () => document.getElementById('mobile-nav').classList.remove('open'));
});

/* ============================================================
   FADE-IN SECTION OBSERVER
============================================================ */
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08 });

/* ============================================================
   LANG BUTTONS
============================================================ */
document.getElementById('btn-nl').addEventListener('click', () => applyLang('nl'));
document.getElementById('btn-en').addEventListener('click', () => applyLang('en'));

/* ============================================================
   INIT
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  applyLang(lang);
  initAuth();
  wireProtectedLinks();
  observeFeatureCards();
  document.querySelectorAll('.fade-in').forEach(el => sectionObserver.observe(el));
  fetchSchools();
  fetchEvents();
});