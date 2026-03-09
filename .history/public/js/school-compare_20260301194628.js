'use strict';

// ── State ─────────────────────────────────────────────────────
let language = localStorage.getItem('language') || 'nl';

// Read IDs from URL
const params   = new URLSearchParams(window.location.search);
const urlIds   = params.get('ids') ? params.get('ids').split(',').filter(Boolean) : [];

// Also read from localStorage
const storedIds = JSON.parse(localStorage.getItem('school_compare') || '[]');

// Prefer URL ids, fall back to localStorage
let compareIds = urlIds.length > 0 ? urlIds : storedIds;

// Loaded school objects
let schools = [];

// ── Translations ──────────────────────────────────────────────
const T = {
  nl: {
    title: 'Vergelijk Scholen',
    subtitle: 'Bekijk de verschillen tussen jouw geselecteerde scholen',
    comparison: 'Vergelijking',
    remove: 'Verwijder',
    viewDetails: 'Bekijk school',
    browseSchools: 'Bekijk alle scholen',
    emptyTitle: 'Niets te vergelijken',
    emptyDesc: 'Selecteer scholen op de overzichtspagina om ze hier te vergelijken.',
    type: 'Type',
    location: 'Locatie',
    programs: 'Opleidingen',
    duration: 'Gemiddelde duur',
    tuition: 'Collegegeld',
    deadline: 'Aanmelddeadline',
    pros: 'Voordelen',
    free: 'Gratis',
    years: n => `${n} jaar`,
    programCount: n => `${n} opleiding${n === 1 ? '' : 'en'}`,
    prosItems: {
      school_adekus: ['Enige universiteit in Suriname','Breed aanbod van opleidingen','Internationaal erkende diploma\'s','Actief onderzoeksinstituut'],
      school_natin: ['Sterk technisch onderwijs','Moderne laboratoria','Hoge werkgelegenheid na afstuderen','Kleine klassen'],
      school_iol: ['Gespecialiseerd in lerarenopleiding','Erkend voor onderwijsbevoegdheid','Betaalbaar collegegeld','Goede stageplekken'],
      school_covab: ['Unieke agrarische focus','Praktijkgericht onderwijs','Kleine groepen','Nauwe samenwerking met bedrijfsleven'],
      school_imeao: ['Praktijkgericht MBO','Vlotte doorstroom naar arbeidsmarkt','Gevarieerd cursusaanbod'],
      school_ptc: ['Technisch MBO','Goed uitgeruste werkplaatsen','Directe arbeidsmarktaansluiting'],
      school_igsr: ['Gespecialiseerd in zorg','Erkend door Ministerie van Volksgezondheid','Moderne ziekenhuissimulaties'],
    },
  },
  en: {
    title: 'Compare Schools',
    subtitle: 'View the differences between your selected schools',
    comparison: 'Comparison',
    remove: 'Remove',
    viewDetails: 'View school',
    browseSchools: 'Browse all schools',
    emptyTitle: 'Nothing to compare',
    emptyDesc: 'Select schools on the browse page to compare them here.',
    type: 'Type',
    location: 'Location',
    programs: 'Programs',
    duration: 'Avg. duration',
    tuition: 'Tuition',
    deadline: 'Registration deadline',
    pros: 'Pros',
    free: 'Free',
    years: n => `${n} year${n === 1 ? '' : 's'}`,
    programCount: n => `${n} program${n === 1 ? '' : 's'}`,
    prosItems: {
      school_adekus: ['Only university in Suriname','Wide range of programs','Internationally recognized degrees','Active research institute'],
      school_natin: ['Strong technical education','Modern laboratories','High employment after graduation','Small class sizes'],
      school_iol: ['Specialized teacher training','Recognized for teaching certification','Affordable tuition','Good internship placements'],
      school_covab: ['Unique agricultural focus','Practice-oriented education','Small groups','Close industry ties'],
      school_imeao: ['Practice-oriented MBO','Fast track to job market','Varied course offering'],
      school_ptc: ['Technical MBO','Well-equipped workshops','Direct job market connection'],
      school_igsr: ['Healthcare specialization','Accredited by Ministry of Health','Modern hospital simulations'],
    },
  },
};

// ── Extra info ────────────────────────────────────────────────
const EXTRA = {
  school_adekus: { avgDuration: 4, tuitionFree: true, deadline: { nl: '1 juni 2026', en: 'June 1, 2026' } },
  school_natin: { avgDuration: 4, tuitionFree: true, deadline: { nl: '1 mei 2026', en: 'May 1, 2026' } },
  school_iol: { avgDuration: 4, tuitionFree: true, deadline: { nl: '15 mei 2026', en: 'May 15, 2026' } },
  school_covab: { avgDuration: 4, tuitionFree: true, deadline: { nl: '1 juni 2026', en: 'June 1, 2026' } },
  school_imeao: { avgDuration: 2, tuitionFree: true, deadline: { nl: '1 juni 2026', en: 'June 1, 2026' } },
  school_ptc: { avgDuration: 2, tuitionFree: true, deadline: { nl: '15 juni 2026', en: 'June 15, 2026' } },
  school_igsr: { avgDuration: 4, tuitionFree: true, deadline: { nl: '1 mei 2026', en: 'May 1, 2026' } },
};

// ── SVG icons (unchanged) ─────────────────────────────────────
const SVG = { /* unchanged SVG object */ };

// ── Fetch schools ─────────────────────────────────────────────
async function loadSchools() {
  if (compareIds.length === 0) { render(); return; }

  const results = [];
  for (const id of compareIds) {
    try {
      const res = await fetch(`/admin/schools/${id}`);
      if (res.ok) results.push(await res.json());
    } catch {
      results.push({ id, name: id, type: 'HBO', location: 'Paramaribo', programs: [], _count: { programs: 1 } });
    }
  }
  schools = results;
  render();
}

// ── Remove school ────────────────────────────────────────────
function removeSchool(id) {
  compareIds = compareIds.filter(i => i !== id);
  schools = schools.filter(s => s.id !== id);
  localStorage.setItem('school_compare', JSON.stringify(compareIds));
  render();
}

// ── Render ────────────────────────────────────────────────────
function render() {
  const tx = T[language];
  const main = document.getElementById('main-content');

  if (schools.length === 0) {
    main.innerHTML = `
      <div class="page-wrap">
        <div class="empty-state">
          <h2>${tx.emptyTitle}</h2>
          <p>${tx.emptyDesc}</p>
          <a href="schools.html" class="btn-primary">${tx.browseSchools}</a>
        </div>
      </div>`;
    return;
  }

  const rows = `
    <tr>
      <td>${tx.pros}</td>
      ${schools.map(s => `
        <td>
          <ul class="pros-list">
            ${(tx.prosItems[s.id] || []).map(p => `<li>${p}</li>`).join('')}
          </ul>
        </td>
      `).join('')}
    </tr>
  `;

  main.innerHTML = `
    <div class="page-wrap">
      <h1>${tx.title}</h1>
      <p>${tx.subtitle}</p>
      <table>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ── Language toggle ───────────────────────────────────────────
function applyLanguage(lang) {
  language = lang;
  localStorage.setItem('language', lang);
  render();
}

applyLanguage(language);
loadSchools();