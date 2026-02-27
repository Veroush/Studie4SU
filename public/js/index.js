// =============================================================
// DATA — Schools and Events
// =============================================================
const featuredSchools = [
  { id: "adekus", emoji: "🎓", name: "Anton de Kom Universiteit", type: "University", location: "Paramaribo", programs: 7, color: "#1a4a32" },
  { id: "natin", emoji: "💻", name: "NATIN", type: "HBO — Technical", location: "Paramaribo", programs: 5, color: "#1a3a4a" },
  { id: "iol", emoji: "📚", name: "IOL — Lerarenopleiding", type: "HBO — Education", location: "Paramaribo", programs: 3, color: "#2a1a4a" },
  { id: "covab", emoji: "🌿", name: "COVAB", type: "HBO — Agriculture", location: "Paramaribo", programs: 4, color: "#1a4a2a" },
  { id: "imeao", emoji: "📊", name: "IMEAO", type: "MBO — Business", location: "Paramaribo", programs: 6, color: "#4a3a1a" },
  { id: "ptc", emoji: "🔧", name: "Polytechnical College", type: "MBO — Technical", location: "Paramaribo", programs: 5, color: "#1a2a4a" },
];

const upcomingEvents = [
  { school: "Anton de Kom Universiteit", day: "15", month: "Mar", time: "14:00 – 17:00", location: "Campus Paramaribo" },
  { school: "NATIN", day: "22", month: "Mar", time: "10:00 – 15:00", location: "Leysweg, Paramaribo" },
  { school: "IOL — Lerarenopleiding", day: "5", month: "Apr", time: "09:00 – 13:00", location: "Paramaribo" },
  { school: "COVAB", day: "12", month: "Apr", time: "10:00 – 14:00", location: "Paramaribo" },
];

// =============================================================
// RENDERING FUNCTIONS
// =============================================================
function renderSchools() {
  const grid = document.getElementById("schools-grid");
  if (!grid) return;
  grid.innerHTML = featuredSchools.map(school => `
    <div class="school-card" onclick="alert('School detail page coming soon!')">
      <div class="school-img" style="background: linear-gradient(135deg, ${school.color}, #0d2b1f);">
        <span style="font-size: 3.5rem; position:relative; z-index:1;">${school.emoji}</span>
      </div>
      <div class="school-card-body">
        <div class="school-type-badge">${school.type}</div>
        <h3>${school.name}</h3>
        <div class="school-meta">
          <span>📍 ${school.location}</span>
          <span>📚 ${school.programs} programs</span>
        </div>
      </div>
    </div>
  `).join("");
}

function renderEvents() {
  const grid = document.getElementById("events-grid");
  if (!grid) return;
  grid.innerHTML = upcomingEvents.map(event => `
    <div class="event-card">
      <div class="event-date-box">
        <div class="event-day">${event.day}</div>
        <div class="event-month">${event.month}</div>
      </div>
      <div class="event-info">
        <div class="event-school">${event.school}</div>
        <div class="event-time">🕐 ${event.time}</div>
        <div class="event-location">📍 ${event.location}</div>
        <div class="event-register">
          <a href="#" class="btn btn-primary btn-sm" onclick="alert('Registration coming soon!'); return false;">Register</a>
        </div>
      </div>
    </div>
  `).join("");
}

// =============================================================
// NAVIGATION & UI
// =============================================================
function toggleMobileNav() {
  document.getElementById("mobile-nav").classList.toggle("open");
}

// Scroll Intersection Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.1 });

// =============================================================
// LANGUAGE SWITCHER
// =============================================================
const translations = {
  nl: {
    "nav.home": "Home", "nav.schools": "Scholen", "nav.openhouses": "Open Dagen", "nav.quiz": "Studie Quiz", "nav.login": "Inloggen",
    "hero.badge": "Jouw toekomst begint hier", "hero.heading": "Vind Jouw <span>Studierichting</span><br/>in Suriname",
    "hero.sub": "Ontdek alle scholen, opleidingen en open dagen in Suriname.", "hero.cta": "Doe de Studie Quiz",
    "hero.explore": "🏫 Verken Scholen", "hero.openhouses": "📅 Open Dagen",
    "stats.schools": "Scholen", "stats.programs": "Opleidingen", "stats.students": "Studenten Geholpen", "stats.quiz": "Gratis Quiz",
    "features.label": "Wat Wij Bieden", "features.schools.title": "Scholen & Instituten", "features.programs.title": "Studierichtingen",
    "features.openhouses.title": "Open Dagen", "schools.label": "Uitgelichte Scholen", "schools.viewall": "Alle scholen →",
    "events.label": "Aankomende Evenementen", "events.viewall": "Alle evenementen →", "about.title": "Over Studie4SU",
    "contact.title": "Contact", "banner.cta": "Start de Studie Quiz", "footer.tagline": "Jouw gids voor de perfecte studiekeuze in Suriname.",
    "footer.copyright": "© 2025 Studie4SU. Alle rechten voorbehouden.",
  },
  en: {
    "nav.home": "Home", "nav.schools": "Schools", "nav.openhouses": "Open Houses", "nav.quiz": "Study Quiz", "nav.login": "Login",
    "hero.badge": "Your future starts here", "hero.heading": "Find Your <span>Study Path</span><br/>in Suriname",
    "hero.sub": "Discover all schools, programs, and open houses in Suriname.", "hero.cta": "Take the Study Quiz",
    "hero.explore": "🏫 Explore Schools", "hero.openhouses": "📅 Open Houses",
    "stats.schools": "Schools", "stats.programs": "Programs", "stats.students": "Students Helped", "stats.quiz": "Free Quiz",
    "features.label": "What We Offer", "features.schools.title": "Schools & Institutes", "features.programs.title": "Study Programs",
    "features.openhouses.title": "Open Houses", "schools.label": "Featured Schools", "schools.viewall": "View all schools →",
    "events.label": "Upcoming Events", "events.viewall": "View all events →", "about.title": "About Studie4SU",
    "contact.title": "Contact Us", "banner.cta": "Start the Study Quiz", "footer.tagline": "Your guide to the perfect study choice in Suriname.",
    "footer.copyright": "© 2025 Studie4SU. All rights reserved.",
  }
};

function setLang(lang) {
  localStorage.setItem("lang", lang);
  document.getElementById("btn-nl").classList.toggle("active", lang === "nl");
  document.getElementById("btn-en").classList.toggle("active", lang === "en");

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang][key]) el.innerHTML = translations[lang][key];
  });
}

// =============================================================
// AUTH — Profile button + popup
// =============================================================
function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

function initAuth() {
  const token = localStorage.getItem('auth_token');
  const loginBtn = document.getElementById('login-btn');
  const profileBtn = document.getElementById('profile-btn');
  const mobileLogin = document.getElementById('mobile-login');
  const mobileProfile = document.getElementById('mobile-profile');

  if (!token) return;

  const payload = decodeToken(token);
  if (!payload || payload.exp * 1000 < Date.now()) {
    localStorage.removeItem('auth_token');
    return;
  }

  // Swap login → profile
  loginBtn.style.display = 'none';
  profileBtn.style.display = 'flex';
  mobileLogin.style.display = 'none';
  mobileProfile.style.display = 'block';

  // Fill popup info
  document.getElementById('popup-name').textContent = payload.name || 'Student';
  document.getElementById('popup-email').textContent = payload.email || '';
  document.getElementById('popup-role').textContent = payload.role === 'admin' ? '🛡️ Admin' : '🎓 Student';
}

function toggleProfilePopup(e) {
  e.stopPropagation();
  document.getElementById('profile-popup').classList.toggle('open');
}

function logout() {
  localStorage.removeItem('auth_token');
  window.location.reload();
}

// Close popup when clicking outside
document.addEventListener('click', () => {
  const popup = document.getElementById('profile-popup');
  if (popup) popup.classList.remove('open');
});

// =============================================================
// INIT
// =============================================================
document.addEventListener("DOMContentLoaded", () => {
  renderSchools();
  renderEvents();
  setLang(localStorage.getItem("lang") || "nl");
  document.querySelectorAll(".fade-in").forEach(el => observer.observe(el));
  initAuth();
  
  // Close mobile nav on click
  document.querySelectorAll(".mobile-nav a").forEach(link => {
    link.addEventListener("click", () => document.getElementById("mobile-nav").classList.remove("open"));
  });
});