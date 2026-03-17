'use strict';

// EN translations stay hardcoded — DB only stores NL content.
// NL content is fetched from GET /api/about and stored in `aboutData`.
const T_EN = {
  aboutLabel:   'About Us',
  aboutTitle:   'Helping Students in Suriname Find Their Future',
  about1:       'Choosing the right school or study program can be confusing. Information is often scattered across different websites, social media pages, or not easy to find at all. As students ourselves, we experienced how difficult it can be to get a clear overview of the educational options available in Suriname.',
  about2:       'That is why we created Studie4SU — a platform designed to make exploring schools and study programs easier. Our website brings information together in one place, allowing students to search for schools in Suriname, explore their options, and even take a study quiz to discover which direction might suit them best.',
  about3:       'What started as a school project quickly became a shared goal: building something useful for future students. By combining design, development, and database management, we worked together to create a platform that helps students make more informed decisions about their education.',
  about4:       'Studie4SU is not just a website — it is our way of helping students take the first step toward their future.',
  teamTitle:    'Meet the Team Behind Studie4SU',
  footerTagline:'Study guidance for Surinamese students',
  footerAbout:  'About us'
};

let lang      = localStorage.getItem('language') || 'nl';
let aboutData = null; // filled by fetchAboutContent()

// ── Auth / Profile popup ──────────────────────────────────────
const AVATARS_MAP = {
  graduate:'🎓', student:'📖', laptop:'💻', owl:'🦉', fox:'🦊',
  panda:'🐼', cat:'🐱', robot:'🤖', dog:'🐶', science:'🔬',
  art:'🎨', rocket:'🚀', star:'⭐', book:'📚', trophy:'🏆', globe:'🌍',
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
  const avatarId    = localStorage.getItem('user_avatar') || 'graduate';
  const avatarEmoji = AVATARS_MAP[avatarId] || '🎓';

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

// ── Fetch about content from DB ───────────────────────────────
// Fetches NL content from AdminSettings.aboutUs via public endpoint.
// Falls back gracefully if the API is unavailable.
async function fetchAboutContent() {
  try {
    const res  = await fetch('/api/about');
    if (!res.ok) throw new Error('API returned ' + res.status);
    aboutData  = await res.json();
  } catch (err) {
    console.warn('Could not load about content from DB, falling back to static text.', err);
    aboutData  = null;
  }
}

// ── Render hero paragraphs ────────────────────────────────────
function renderHero(l) {
  if (l === 'en') {
    document.getElementById('about-label').textContent        = T_EN.aboutLabel;
    document.getElementById('about-title').textContent        = T_EN.aboutTitle;
    document.getElementById('about-description-1').textContent = T_EN.about1;
    document.getElementById('about-description-2').textContent = T_EN.about2;
    document.getElementById('about-description-3').textContent = T_EN.about3;
    document.getElementById('about-description-4').textContent = T_EN.about4;
  } else {
    // NL — use DB data if available, otherwise leave whatever is in the HTML
    if (!aboutData || !aboutData.hero) return;
    document.getElementById('about-label').textContent         = 'Over Ons';
    document.getElementById('about-title').textContent         = 'Studenten in Suriname helpen hun toekomst te vinden';
    document.getElementById('about-description-1').textContent = aboutData.hero.p1;
    document.getElementById('about-description-2').textContent = aboutData.hero.p2;
    document.getElementById('about-description-3').textContent = aboutData.hero.p3;
    document.getElementById('about-description-4').textContent = aboutData.hero.p4;
  }
}

// ── Render team members ───────────────────────────────────────
// Builds team member articles dynamically from DB data.
// EN role/bio are not stored in DB so they fall back to the
// same NL text — acceptable since roles are mostly English anyway.
function renderTeam(l) {
  const container = document.querySelector('.team-section .container');
  if (!container) return;

  // Update section heading
  const heading = document.getElementById('team-title');
  if (heading) heading.textContent = l === 'en' ? T_EN.teamTitle : 'Maak kennis met het team achter Studie4SU';

  // If no DB data, leave the hardcoded HTML in place
  if (!aboutData || !aboutData.team || !aboutData.team.length) return;

  // Remove existing hardcoded member articles
  container.querySelectorAll('.team-member').forEach(el => el.remove());

  // Rebuild from DB data
  aboutData.team.forEach(member => {
    const article = document.createElement('article');
    article.className = 'team-member reveal';
    article.innerHTML = `
      <div class="member-art reveal-media">
        <img src="img/${member.image}" alt="Illustratie van ${member.name}" />
      </div>
      <div class="member-copy">
        <h3>${member.name}</h3>
        <p class="member-role">${member.role}</p>
        <p>${member.bio}</p>
      </div>
    `;
    container.appendChild(article);
  });

  // Re-run reveal animation on newly created elements
  initRevealAnimation();
}

// ── Apply language ────────────────────────────────────────────
function applyLang(l) {
  lang = l;
  localStorage.setItem('language', l);

  document.getElementById('btn-nl').classList.toggle('active', l === 'nl');
  document.getElementById('btn-en').classList.toggle('active', l === 'en');
  document.documentElement.lang = l;

  renderHero(l);
  renderTeam(l);

  document.getElementById('footer-tagline').textContent    = l === 'en' ? T_EN.footerTagline : 'Studiekeuze voor Surinaamse studenten';
  document.getElementById('footer-about-link').textContent = l === 'en' ? T_EN.footerAbout   : 'Over ons';

  document.querySelectorAll('[data-nl]').forEach(el => {
    el.textContent = l === 'nl' ? el.dataset.nl : el.dataset.en;
  });
}

// ── Reveal animation ──────────────────────────────────────────
function initRevealAnimation() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-media');
  const observer  = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  revealEls.forEach(el => observer.observe(el));
}

// ── Event listeners ───────────────────────────────────────────
document.getElementById('btn-nl').addEventListener('click', () => applyLang('nl'));
document.getElementById('btn-en').addEventListener('click', () => applyLang('en'));

document.getElementById('hamburger-btn').addEventListener('click', () => {
  document.getElementById('mobile-nav').classList.toggle('open');
});

document.querySelectorAll('.mobile-nav a').forEach(a => {
  a.addEventListener('click', () => {
    document.getElementById('mobile-nav').classList.remove('open');
  });
});

// ── Init ──────────────────────────────────────────────────────
// Fetch DB content first, then render so the page always shows
// the latest data from the database.
initAuth();
fetchAboutContent().then(() => {
  applyLang(lang);
  initRevealAnimation();
});