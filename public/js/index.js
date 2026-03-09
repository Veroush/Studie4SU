'use strict';

/* ============================================================
   DATA — fallback used when API is unreachable
============================================================ */
const FALLBACK_SCHOOLS = [
  { id: 'school_adekus', emoji: '🎓', name: 'Anton de Kom Universiteit', type: 'University', location: 'Paramaribo', programs: 7,  color: '#1a4a32' },
  { id: 'school_natin',  emoji: '💻', name: 'NATIN',                      type: 'HBO',        location: 'Paramaribo', programs: 5,  color: '#1a3a4a' },
  { id: 'school_iol',    emoji: '📚', name: 'IOL — Lerarenopleiding',      type: 'HBO',        location: 'Paramaribo', programs: 3,  color: '#2a1a4a' },
  { id: 'school_covab',  emoji: '🌿', name: 'COVAB',                       type: 'HBO',        location: 'Paramaribo', programs: 4,  color: '#1a4a2a' },
  { id: 'school_imeao',  emoji: '📊', name: 'IMEAO',                       type: 'MBO',        location: 'Paramaribo', programs: 6,  color: '#4a3a1a' },
  { id: 'school_ptc',    emoji: '🔧', name: 'Polytechnical College',        type: 'MBO',        location: 'Paramaribo', programs: 5,  color: '#1a2a4a' },
];

/* Colour palette cycled for DB schools that don't store a display colour */
const SCHOOL_COLORS = ['#1a4a32','#1a3a4a','#2a1a4a','#1a4a2a','#4a3a1a','#1a2a4a','#3a1a3a','#1a3a3a'];

/* Fallback emoji by school type */
const TYPE_EMOJI = { University: '🎓', HBO: '📚', MBO: '🔧' };

/* Active school list — starts as fallback, replaced by API response */
let featuredSchools = FALLBACK_SCHOOLS;

const upcomingEvents = [
  { school: 'Anton de Kom Universiteit', day: '14', month: 'Mar', time: '10:00 – 16:00', location: 'Leysweg 86, Paramaribo' },
  { school: 'NATIN',                     day: '21', month: 'Mar', time: '09:00 – 14:00', location: 'Zwartenhovenbrugstraat' },
  { school: 'IOL — Lerarenopleiding',    day: '28', month: 'Mar', time: '10:00 – 15:00', location: 'Paramaribo' },
  { school: 'COVAB',                     day: '11', month: 'Apr', time: '09:00 – 13:00', location: 'Leysweg, Paramaribo' },
];

/* ============================================================
   TRANSLATIONS
============================================================ */
const T = {
  nl: {
    heroBadge:        'Jouw toekomst begint hier',
    heroHeading:      'Vind Jouw <span>Studierichting</span><br/>in Suriname',
    heroSub:          'Ontdek alle scholen, opleidingen en open dagen in Suriname. Weet je nog niet wat je wil studeren? Doe onze gratis quiz en vind je match in 2 minuten.',
    heroCta:          '✨ Doe de Studie Quiz',
    heroExplore:      '🏫 Verken Scholen',
    heroOpenhouses:   '📅 Open Dagen',
    heroFav:          '❤️ Mijn Favorieten',
    statSchools:      'Scholen',
    statPrograms:     'Opleidingen',
    statQuiz:         'Gratis Quiz',
    featuresLabel:    'Wat Wij Bieden',
    schoolsLabel:     'Uitgelichte Scholen',
    schoolsViewall:   'Alle scholen →',
    eventsLabel:      'Aankomende Evenementen',
    eventsViewall:    'Alle evenementen →',
    quizBadge:        'Gratis & Duurt 2 Minuten',
    quizSub:          'Beantwoord 10 korte vragen en wij matchen jou met het juiste programma.',
    quizCta:          '✨ Start de Studie Quiz',
    register:         'Aanmelden',
    programs:         n => `${n} opleidingen`,
  },
  en: {
    heroBadge:        'Your future starts here',
    heroHeading:      'Find Your <span>Study Path</span><br/>in Suriname',
    heroSub:          'Discover all schools, programs and open houses in Suriname. Not sure what to study? Take our free quiz and find your match in 2 minutes.',
    heroCta:          '✨ Take the Study Quiz',
    heroExplore:      '🏫 Explore Schools',
    heroOpenhouses:   '📅 Open Houses',
    heroFav:          '❤️ My Favourites',
    statSchools:      'Schools',
    statPrograms:     'Programs',
    statQuiz:         'Free Quiz',
    featuresLabel:    'What We Offer',
    schoolsLabel:     'Featured Schools',
    schoolsViewall:   'View all schools →',
    eventsLabel:      'Upcoming Events',
    eventsViewall:    'View all events →',
    quizBadge:        'Free & Takes 2 Minutes',
    quizSub:          'Answer 10 short questions and we\'ll match you with the right program.',
    quizCta:          '✨ Start the Study Quiz',
    register:         'Register',
    programs:         n => `${n} programs`,
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

  // Hero
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

  // Sections
  document.getElementById('features-label').textContent   = t.featuresLabel;
  document.getElementById('schools-label').textContent    = t.schoolsLabel;
  document.getElementById('schools-viewall').textContent  = t.schoolsViewall;
  document.getElementById('events-label').textContent     = t.eventsLabel;
  document.getElementById('events-viewall').textContent   = t.eventsViewall;
  document.getElementById('quiz-banner-badge').textContent = t.quizBadge;
  document.getElementById('quiz-banner-sub').textContent  = t.quizSub;
  document.getElementById('quiz-banner-cta').textContent  = t.quizCta;

  // data-nl / data-en nav links
  document.querySelectorAll('[data-nl]').forEach(el => {
    el.textContent = l === 'nl' ? el.dataset.nl : el.dataset.en;
  });

  // Re-render cards with correct language
  renderSchools();
  renderEvents();
}

/* ============================================================
   FETCH SCHOOLS FROM API
   Falls back to FALLBACK_SCHOOLS if backend is unreachable.
============================================================ */
async function fetchSchools() {
  try {
    const res = await fetch('/schools');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Empty response');

    // Normalise DB documents to the shape renderSchools() expects
    featuredSchools = data.map((s, i) => ({
      id:       s._id || s.id,
      emoji:    s.emoji || TYPE_EMOJI[s.type] || '\u{1F3EB}',
      name:     s.name,
      type:     s.type || 'HBO',
      location: s.location || s.city || 'Suriname',
      programs: Array.isArray(s.programs) ? s.programs.length : (s.programCount ?? 0),
      color:    s.color || SCHOOL_COLORS[i % SCHOOL_COLORS.length],
    }));

  } catch (err) {
    console.warn('[Studie4SU] Backend unavailable, using fallback school data:', err.message);
    featuredSchools = FALLBACK_SCHOOLS;
  }
  renderSchools();
}

/* ============================================================
   RENDER SCHOOLS
============================================================ */
function renderSchools() {
  const grid = document.getElementById('schools-grid');
  if (!grid) return;
  const t = T[lang];

  if (featuredSchools.length === 0) {
    grid.innerHTML = `<p class="schools-empty">${lang === 'nl' ? 'Geen scholen gevonden.' : 'No schools found.'}</p>`;
    return;
  }

  grid.innerHTML = featuredSchools.map(school => `
    <a class="school-preview-card" href="school-detail.html?id=${school.id}">
      <div class="school-card-img" style="background: linear-gradient(135deg, ${school.color}, #0d2b1f);">
        <span>${school.emoji}</span>
        <span class="school-type-pill">${school.type}</span>
      </div>
      <div class="school-card-body">
        <h3>${school.name}</h3>
        <div class="school-card-meta">
          <span>📍 ${school.location}</span>
          <span>📚 ${t.programs(school.programs)}</span>
        </div>
      </div>
    </a>
  `).join('');
}

/* ============================================================
   RENDER EVENTS
============================================================ */
function renderEvents() {
  const grid = document.getElementById('events-grid');
  if (!grid) return;
  const t = T[lang];
  grid.innerHTML = upcomingEvents.map(ev => `
    <div class="event-preview-card">
      <div class="event-date-box">
        <div class="event-day">${ev.day}</div>
        <div class="event-month">${ev.month}</div>
      </div>
      <div class="event-info">
        <div class="event-school">${ev.school}</div>
        <div class="event-time">🕐 ${ev.time}</div>
        <div class="event-location">📍 ${ev.location}</div>
        <div class="event-register">
          <a href="open-houses.html" class="btn-register">${t.register}</a>
        </div>
      </div>
    </div>
  `).join('');
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

  document.getElementById('login-btn').style.display    = 'none';
  document.getElementById('profile-btn').style.display  = 'flex';
  document.getElementById('mobile-login').style.display   = 'none';
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
   FADE-IN OBSERVER
============================================================ */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });

/* ============================================================
   LANG BUTTONS
============================================================ */
document.getElementById('btn-nl').addEventListener('click', () => applyLang('nl'));
document.getElementById('btn-en').addEventListener('click', () => applyLang('en'));

/* ============================================================
   INIT
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Apply language first (renders fallback school cards immediately)
  applyLang(lang);
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  initAuth();
  // Then fetch live schools from API and re-render the grid
  fetchSchools();
});