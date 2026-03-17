'use strict';

const T = {
  nl: {
    aboutLabel: 'Over Ons',
    aboutTitle: 'Studenten in Suriname helpen hun toekomst te vinden',
    about1: 'Het kiezen van de juiste school of studierichting kan verwarrend zijn. Informatie is vaak verspreid over verschillende websites, social-mediapagina’s of is simpelweg moeilijk te vinden. Als studenten hebben wij zelf ervaren hoe lastig het kan zijn om een duidelijk overzicht te krijgen van de opleidingsmogelijkheden in Suriname.',
    about2: 'Daarom hebben wij Studie4SU ontwikkeld — een platform dat het verkennen van scholen en studierichtingen eenvoudiger maakt. Onze website brengt informatie samen op één plek, waardoor studenten gemakkelijk scholen in Suriname kunnen zoeken, hun opties kunnen bekijken en zelfs een studiekeuzequiz kunnen doen om te ontdekken welke richting het beste bij hen past.',
    about3: 'Wat begon als een schoolproject groeide al snel uit tot een gezamenlijk doel: iets bouwen dat echt nuttig kan zijn voor toekomstige studenten. Door design, ontwikkeling en databasebeheer te combineren, hebben wij samen een platform gecreëerd dat studenten helpt beter geïnformeerde keuzes te maken over hun opleiding.',
    about4: 'Studie4SU is niet zomaar een website — het is onze manier om studenten te helpen de eerste stap richting hun toekomst te zetten.',
    teamTitle: 'Maak kennis met het team achter Studie4SU',
    roleValentino: 'UI Designer • Animator • Frontend Developer',
    roleVeroushka: 'Backend Developer • Frontend Developer',
    roleRaksha: 'Database Designer • Backend Developer',
    roleAmerie: 'Project Manager',
    descValentino: 'Valentino was verantwoordelijk voor het ontwerpen van de visuele ervaring van de website. Hij ontwikkelde de gebruikersinterface, animaties en interactieve elementen die het platform aantrekkelijk en gebruiksvriendelijk maken. Door te focussen op gebruiksgemak en een modern ontwerp zorgde hij ervoor dat studenten soepel door de website kunnen navigeren en eenvoudig de beschikbare scholen en studierichtingen kunnen ontdekken.',
    descVeroushka: 'Veroushka werkte aan de kernfunctionaliteiten van de website. Door zowel backend- als frontend-onderdelen te ontwikkelen, hielp zij de gebruikersinterface te verbinden met het systeem achter de website. Haar werk zorgt ervoor dat zoekfuncties, quizzes en andere onderdelen soepel werken en de juiste informatie aan gebruikers tonen.',
    descRaksha: 'Raksha ontwierp en structureerde de database die het platform aandrijft. Hij verzamelde en organiseerde informatie over verschillende scholen en studierichtingen, zodat deze efficiënt kan worden doorzocht en weergegeven. Dankzij zijn werk kunnen gebruikers snel en gemakkelijk betrouwbare informatie vinden over onderwijsopties in Suriname.',
    descAmerie: 'Amerie speelde een belangrijke rol in het organiseren en begeleiden van de ontwikkeling van het project. Als projectmanager was zij verantwoordelijk voor het plannen van taken, het opstellen van doelen en het ervoor zorgen dat het team gedurende het ontwikkelingsproces op schema bleef. Door de workflow te coördineren en de voortgang te bewaken, zorgde zij ervoor dat elk onderdeel van het project op tijd werd afgerond en dat het team efficiënt naar het eindresultaat toewerkte.',
    footerTagline: 'Studiekeuze voor Surinaamse studenten',
    footerAbout: 'Over ons'
  },
  en: {
    aboutLabel: 'About Us',
    aboutTitle: 'Helping Students in Suriname Find Their Future',
    about1: 'Choosing the right school or study program can be confusing. Information is often scattered across different websites, social media pages, or not easy to find at all. As students ourselves, we experienced how difficult it can be to get a clear overview of the educational options available in Suriname.',
    about2: 'That is why we created Studie4SU — a platform designed to make exploring schools and study programs easier. Our website brings information together in one place, allowing students to search for schools in Suriname, explore their options, and even take a study quiz to discover which direction might suit them best.',
    about3: 'What started as a school project quickly became a shared goal: building something useful for future students. By combining design, development, and database management, we worked together to create a platform that helps students make more informed decisions about their education.',
    about4: 'Studie4SU is not just a website — it is our way of helping students take the first step toward their future.',
    teamTitle: 'Meet the Team Behind Studie4SU',
    roleValentino: 'UI Designer • Animator • Frontend Developer',
    roleVeroushka: 'Backend Developer • Frontend Developer',
    roleRaksha: 'Database Designer • Backend Developer',
    roleAmerie: 'Project Manager',
    descValentino: 'Valentino was responsible for designing the visual experience of the website. He created the user interface, animations, and interactive elements that make the platform engaging and easy to use. By focusing on usability and modern design, he ensured that students can navigate the website smoothly and enjoy exploring the available schools and studies.',
    descVeroushka: 'Veroushka worked on the core functionality of the website. By developing both backend and frontend features, she helped connect the user interface with the system behind it. Her work ensures that searches, quizzes, and other features run smoothly and deliver the right information to users.',
    descRaksha: 'Raksha designed and structured the database that powers the platform. He gathered and organized the information about different schools and study programs so that it can be searched and displayed efficiently. His work makes it possible for users to quickly find accurate information about educational options in Suriname.',
    descAmerie: 'Amerie played an important role in organizing and guiding the development of the project. As the project manager, she was responsible for planning tasks, setting goals, and making sure the team stayed on track throughout the development process. By coordinating the workflow and monitoring progress, she helped ensure that each part of the project was completed on time and that the team worked efficiently toward the final result.',
    footerTagline: 'Study guidance for Surinamese students',
    footerAbout: 'About us'
  }
};

let lang = localStorage.getItem('language') || 'nl';
// ── Auth / Profile popup ──────────────────────────────────────
// Mirrors the pattern used on schools.js, school-detail.js etc.
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



function applyLang(l) {
  lang = l;
  localStorage.setItem('language', l);
  const t = T[l];

  document.getElementById('btn-nl').classList.toggle('active', l === 'nl');
  document.getElementById('btn-en').classList.toggle('active', l === 'en');

  document.documentElement.lang = l;
  document.getElementById('about-label').textContent = t.aboutLabel;
  document.getElementById('about-title').textContent = t.aboutTitle;
  document.getElementById('about-description-1').textContent = t.about1;
  document.getElementById('about-description-2').textContent = t.about2;
  document.getElementById('about-description-3').textContent = t.about3;
  document.getElementById('about-description-4').textContent = t.about4;

  document.getElementById('team-title').textContent = t.teamTitle;
  document.getElementById('role-valentino').textContent = t.roleValentino;
  document.getElementById('role-veroushka').textContent = t.roleVeroushka;
  document.getElementById('role-raksha').textContent = t.roleRaksha;
  document.getElementById('role-amerie').textContent = t.roleAmerie;
  document.getElementById('desc-valentino').textContent = t.descValentino;
  document.getElementById('desc-veroushka').textContent = t.descVeroushka;
  document.getElementById('desc-raksha').textContent = t.descRaksha;
  document.getElementById('desc-amerie').textContent = t.descAmerie;

  document.getElementById('footer-tagline').textContent = t.footerTagline;
  document.getElementById('footer-about-link').textContent = t.footerAbout;

  document.querySelectorAll('[data-nl]').forEach(el => {
    el.textContent = l === 'nl' ? el.dataset.nl : el.dataset.en;
  });
}

function initRevealAnimation() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-media');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  revealEls.forEach(el => observer.observe(el));
}

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

initAuth();
applyLang(lang);
initRevealAnimation();