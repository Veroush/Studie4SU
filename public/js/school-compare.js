'use strict';

// ── State ─────────────────────────────────────────────────────
let language = localStorage.getItem('language') || 'nl';

// Read IDs from URL: school-compare.html?ids=school_adekus,school_natin
const params   = new URLSearchParams(window.location.search);
const urlIds   = params.get('ids') ? params.get('ids').split(',').filter(Boolean) : [];

// Also read from localStorage (set by schools.html compare bar)
const storedIds = JSON.parse(localStorage.getItem('school_compare') || '[]');

// Prefer URL ids, fall back to localStorage
let compareIds = urlIds.length > 0 ? urlIds : storedIds;

// Loaded school objects
let schools = [];
let emptyStateAnimation = null;

// ── Translations ──────────────────────────────────────────────
const T = {
  nl: {
    title:       'Vergelijk Scholen',
    subtitle:    'Bekijk de verschillen tussen jouw geselecteerde scholen',
    comparison:  'Vergelijking',
    remove:      'Verwijder',
    viewDetails: 'Bekijk school',
    browseSchools: 'Bekijk alle scholen',
    emptyTitle:  'Niets te vergelijken',
    emptyDesc:   'Selecteer scholen op de overzichtspagina om ze hier te vergelijken.',
    type:        'Type',
    location:    'Locatie',
    programs:    'Opleidingen',
    duration:    'Gemiddelde duur',
    tuition:     'Collegegeld',
    deadline:    'Aanmelddeadline',
    pros:        'Voordelen',
    cons:        'Nadelen',
    free:        'Gratis',
    public:      'Publiek',
    private:     'Privaat',
    years:       n => `${n} jaar`,
    programCount: n => `${n} opleiding${n === 1 ? '' : 'en'}`,
    loading:     'Laden...',
    prosItems: {
      school_adekus: ['Enige universiteit in Suriname','Breed aanbod van opleidingen','Internationaal erkende diploma\'s','Actief onderzoeksinstituut'],
      school_natin:  ['Sterk technisch onderwijs','Moderne laboratoria','Hoge werkgelegenheid na afstuderen','Kleine klassen'],
      school_iol:    ['Gespecialiseerd in lerarenopleiding','Erkend voor onderwijsbevoegdheid','Betaalbaar collegegeld','Goede stageplekken'],
      school_covab:  ['Unieke agrarische focus','Praktijkgericht onderwijs','Kleine groepen','Nauwe samenwerking met bedrijfsleven'],
      school_imeao:  ['Praktijkgericht MBO','Vlotte doorstroom naar arbeidsmarkt','Gevarieerd cursusaanbod'],
      school_ptc:    ['Technisch MBO','Goed uitgeruste werkplaatsen','Directe arbeidsmarktaansluiting'],
      school_igsr:   ['Gespecialiseerd in zorg','Erkend door Ministerie van Volksgezondheid','Moderne ziekenhuissimulaties'],
    },
    consItems: {
      school_adekus: ['Hoge toelatingsdrempel geneeskunde','Grote klassen bij populaire studies','Parkeren moeilijk'],
      school_natin:  ['Beperkt aanbod buiten techniek','Geen avondonderwijs voor alle vakken'],
      school_iol:    ['Alleen lerarenopleiding','Beperkt aantal studierichtingen'],
      school_covab:  ['Beperkt tot agrarische richtingen','Kleine campus'],
      school_imeao:  ['Alleen MBO-niveau','Beperkt in wetenschappelijke vakken'],
      school_ptc:    ['Alleen MBO-niveau','Beperkt aanbod buiten techniek'],
      school_igsr:   ['Beperkt tot zorgsector','Kleinere campus'],
    },
  },
  en: {
    title:       'Compare Schools',
    subtitle:    'View the differences between your selected schools',
    comparison:  'Comparison',
    remove:      'Remove',
    viewDetails: 'View school',
    browseSchools: 'Browse all schools',
    emptyTitle:  'Nothing to compare',
    emptyDesc:   'Select schools on the browse page to compare them here.',
    type:        'Type',
    location:    'Location',
    programs:    'Programs',
    duration:    'Avg. duration',
    tuition:     'Tuition',
    deadline:    'Registration deadline',
    pros:        'Pros',
    cons:        'Cons',
    free:        'Free',
    public:      'Public',
    private:     'Private',
    years:       n => `${n} year${n === 1 ? '' : 's'}`,
    programCount: n => `${n} program${n === 1 ? '' : 's'}`,
    loading:     'Loading...',
    prosItems: {
      school_adekus: ['Only university in Suriname','Wide range of programs','Internationally recognized degrees','Active research institute'],
      school_natin:  ['Strong technical education','Modern laboratories','High employment after graduation','Small class sizes'],
      school_iol:    ['Specialized teacher training','Recognized for teaching certification','Affordable tuition','Good internship placements'],
      school_covab:  ['Unique agricultural focus','Practice-oriented education','Small groups','Close industry ties'],
      school_imeao:  ['Practice-oriented MBO','Fast track to job market','Varied course offering'],
      school_ptc:    ['Technical MBO','Well-equipped workshops','Direct job market connection'],
      school_igsr:   ['Healthcare specialization','Accredited by Ministry of Health','Modern hospital simulations'],
    },
    consItems: {
      school_adekus: ['High admission threshold for medicine','Large classes for popular programs','Parking difficult'],
      school_natin:  ['Limited programs outside technology','No evening classes for all subjects'],
      school_iol:    ['Teacher training only','Limited number of study directions'],
      school_covab:  ['Limited to agricultural directions','Small campus'],
      school_imeao:  ['MBO level only','Limited in scientific subjects'],
      school_ptc:    ['MBO level only','Limited programs outside technology'],
      school_igsr:   ['Limited to healthcare sector','Smaller campus'],
    },
  },
};

// ── Enrichment: durations, deadlines, tuition ────────────────
const EXTRA = {
  school_adekus: { avgDuration: 4, tuitionFree: true, deadline: { nl: '1 juni 2026',    en: 'June 1, 2026'    } },
  school_natin:  { avgDuration: 4, tuitionFree: true, deadline: { nl: '1 mei 2026',     en: 'May 1, 2026'     } },
  school_iol:    { avgDuration: 4, tuitionFree: true, deadline: { nl: '15 mei 2026',    en: 'May 15, 2026'    } },
  school_covab:  { avgDuration: 4, tuitionFree: true, deadline: { nl: '1 juni 2026',    en: 'June 1, 2026'    } },
  school_imeao:  { avgDuration: 2, tuitionFree: true, deadline: { nl: '1 juni 2026',    en: 'June 1, 2026'    } },
  school_ptc:    { avgDuration: 2, tuitionFree: true, deadline: { nl: '15 juni 2026',   en: 'June 15, 2026'   } },
  school_igsr:   { avgDuration: 4, tuitionFree: true, deadline: { nl: '1 mei 2026',     en: 'May 1, 2026'     } },
};

// ── SVG icons ─────────────────────────────────────────────────
const SVG = {
  school:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  compare:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 012 2v7"/><path d="M11 18H8a2 2 0 01-2-2V9"/></svg>`,
  x:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  mapPin:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  clock:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  dollar:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>`,
  calendar:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  book:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`,
  checkFill: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  xCircle:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  arrow:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
};

// ── Fetch schools from backend ────────────────────────────────
async function loadSchools() {
  if (compareIds.length === 0) { render(); return; }

  const results = [];
  for (const id of compareIds) {
    try {
      const res = await fetch(`/admin/schools/${id}`);
      if (res.ok) results.push(await res.json());
      else throw new Error('not found');
    } catch {
      // Fallback: build minimal object from local data
      const names = {
        school_adekus: 'Anton de Kom Universiteit van Suriname',
        school_natin:  'Natuurtechnisch Instituut',
        school_iol:    'Instituut voor de Opleiding van Leraren',
        school_covab:  'College voor Agrarische en Biologische Wetenschappen',
        school_imeao:  'IMEAO',
        school_ptc:    'Polytechnical College Suriname',
        school_igsr:   'IGSR',
      };
      const types = { school_adekus:'University', school_natin:'HBO', school_iol:'HBO', school_covab:'HBO', school_imeao:'MBO', school_ptc:'MBO', school_igsr:'HBO' };
      results.push({ id, name: names[id] || id, type: types[id] || 'HBO', location: 'Paramaribo', programs: [], _count: { programs: 1 } });
    }
  }
  schools = results;
  render();
}

// ── Remove a school from comparison ──────────────────────────
function removeSchool(id) {
  compareIds = compareIds.filter(i => i !== id);
  schools    = schools.filter(s => s.id !== id);
  // Update localStorage
  localStorage.setItem('school_compare', JSON.stringify(compareIds));
  render();
}

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

function stopEmptyStateAnimation() {
  if (emptyStateAnimation) {
    window.clearInterval(emptyStateAnimation);
    emptyStateAnimation = null;
  }
}

function startEmptyStateAnimation() {
  const chaser = document.getElementById('empty-chaser');
  const runner = document.getElementById('empty-runner');
  if (!chaser || !runner) return;

  stopEmptyStateAnimation();

  let chaserFrame = 0;
  let runnerFrame = 0;

  emptyStateAnimation = window.setInterval(() => {
    chaser.src = CHASER_FRAMES[chaserFrame];
    runner.src = RUNNER_FRAMES[runnerFrame];

    chaserFrame = (chaserFrame + 1) % CHASER_FRAMES.length;
    runnerFrame = (runnerFrame + 1) % RUNNER_FRAMES.length;
  }, 150);
}

// ── Main render ───────────────────────────────────────────────
function render() {
  const tx   = T[language];
  const main = document.getElementById('main-content');
  stopEmptyStateAnimation();

  // ── EMPTY STATE ───────────────────────────────────────────
  if (schools.length === 0) {
    main.innerHTML = `
      <div class="page-wrap">
        <div class="empty-state">
          <div class="empty-inner">
            <div class="empty-animation" aria-hidden="true">
              <img id="empty-chaser" class="empty-chaser" src="img/chasing-1.svg" alt="">
              <img id="empty-runner" class="empty-runner" src="img/running-1.svg" alt="">
            </div>
            <h2>${tx.emptyTitle}</h2>
            <p>${tx.emptyDesc}</p>
            <a href="schools.html" class="btn-primary">
              ${SVG.arrow}
              ${tx.browseSchools}
            </a>
          </div>
        </div>
      </div>`;
    startEmptyStateAnimation();
    return;
  }

  // ── BUILD TABLE HEADER CELLS ──────────────────────────────
  const headerCells = schools.map(s => `
    <th class="px-6 py-4 text-white" style="min-width:210px">
      <div class="th-content">
        <div class="th-icon">${SVG.school}</div>
        <div>
          <div class="th-name">${s.name}</div>
          <div class="th-sub">${s.location || 'Suriname'}</div>
        </div>
        <button class="btn-remove-th" onclick="removeSchool('${s.id}')">
          ${SVG.x} ${tx.remove}
        </button>
      </div>
    </th>`).join('');

  // ── BUILD TABLE ROWS ──────────────────────────────────────
  function dataRow(label, iconSvg, valuesFn, tinted) {
    const cls = tinted ? 'row-tinted' : 'row-white';
    const cells = schools.map(s => `<td class="px-6 py-4 text-center" style="vertical-align:middle">${valuesFn(s)}</td>`).join('');
    return `
      <tr class="border-b border-gray-200 ${cls}">
        <td class="px-6 py-4" style="display:flex;align-items:center;gap:8px;font-weight:500;color:var(--gray-700);white-space:nowrap;vertical-align:middle">
          <span style="color:var(--gray-500);flex-shrink:0;display:flex">${iconSvg}</span>
          ${label}
        </td>
        ${cells}
      </tr>`;
  }

  const rows = [
    dataRow(tx.type, SVG.school, s => s.type || '—', true),
    dataRow(tx.location, SVG.mapPin, s => s.location || 'Suriname', false),
    dataRow(tx.programs, SVG.book, s => tx.programCount(s._count?.programs || s.programs?.length || 0), true),
    dataRow(tx.duration, SVG.clock, s => { const e = EXTRA[s.id]; return e ? tx.years(e.avgDuration) : '—'; }, false),
    dataRow(tx.tuition, SVG.dollar, s => { const e = EXTRA[s.id]; return e?.tuitionFree ? `<span style="color:var(--green-600);font-weight:600">${tx.free}</span>` : 'SRD —'; }, true),
    dataRow(tx.deadline, SVG.calendar, s => { const e = EXTRA[s.id]; return e ? e.deadline[language] : '—'; }, false),
    // Pros row
    `<tr class="border-b border-gray-200 row-white">
      <td class="px-6 py-4" style="display:flex;align-items:center;gap:8px;font-weight:500;color:var(--gray-700);vertical-align:top;white-space:nowrap">
        <span style="color:var(--green-600);flex-shrink:0;display:flex">${SVG.checkFill}</span>${tx.pros}
      </td>
      ${schools.map(s => {
        const items = (tx.prosItems[s.id] || []).map(p => `<li>${SVG.checkFill}<span>${p}</span></li>`).join('');
        return `<td class="px-6 py-4" style="vertical-align:top"><ul class="pros-list">${items}</ul></td>`;
      }).join('')}
    </tr>`,
    // Cons row
    `<tr class="border-b border-gray-200 row-tinted">
      <td class="px-6 py-4" style="display:flex;align-items:center;gap:8px;font-weight:500;color:var(--gray-700);vertical-align:top;white-space:nowrap">
        <span style="color:var(--red-500);flex-shrink:0;display:flex">${SVG.xCircle}</span>${tx.cons}
      </td>
      ${schools.map(s => {
        const items = (tx.consItems[s.id] || []).map(c => `<li>${SVG.xCircle}<span>${c}</span></li>`).join('');
        return `<td class="px-6 py-4" style="vertical-align:top"><ul class="cons-list">${items}</ul></td>`;
      }).join('')}
    </tr>`,
  ].join('');

  // Footer buttons
  const footerBtns = schools.map(s =>
    `<a href="school-detail.html?id=${s.id}" class="btn-view-details">${tx.viewDetails}: ${s.name.split(' ').slice(0,3).join(' ')}</a>`
  ).join('');

  // ── BUILD MOBILE CARDS ────────────────────────────────────
  const mobileCards = schools.map(s => {
    const ex    = EXTRA[s.id] || {};
    const pros  = (tx.prosItems[s.id] || []).map(p => `<li class="flex gap-2" style="align-items:flex-start;font-size:.85rem;color:var(--gray-700)"><span style="color:var(--green-600);flex-shrink:0;display:flex;margin-top:2px">${SVG.checkFill}</span>${p}</li>`).join('');
    const cons  = (tx.consItems[s.id] || []).map(c => `<li class="flex gap-2" style="align-items:flex-start;font-size:.85rem;color:var(--gray-700)"><span style="color:var(--red-500);flex-shrink:0;display:flex;margin-top:2px">${SVG.xCircle}</span>${c}</li>`).join('');

    return `
      <div class="mobile-card">
        <div class="mobile-card-header">
          <div class="mobile-card-header-inner">
            <div class="mobile-card-left">
              <div class="mobile-th-icon">${SVG.school}</div>
              <div>
                <div class="mobile-card-name">${s.name}</div>
                <div class="mobile-card-sub">${s.location || 'Suriname'} · ${s.type}</div>
              </div>
            </div>
            <button class="btn-remove-mobile" onclick="removeSchool('${s.id}')" aria-label="${tx.remove}">
              ${SVG.x}
            </button>
          </div>
        </div>
        <div class="mobile-card-body">
          <div class="info-grid">
            <div>
              <div class="info-item-label">${tx.programs}</div>
              <div class="info-item-value">${tx.programCount(s._count?.programs || s.programs?.length || 0)}</div>
            </div>
            <div>
              <div class="info-item-label">${tx.duration}</div>
              <div class="info-item-value">${ex.avgDuration ? tx.years(ex.avgDuration) : '—'}</div>
            </div>
            <div>
              <div class="info-item-label">${tx.tuition}</div>
              <div class="info-item-value" style="color:var(--green-600)">${ex.tuitionFree ? tx.free : 'SRD —'}</div>
            </div>
            <div>
              <div class="info-item-label">${tx.deadline}</div>
              <div class="info-item-value">${ex.deadline ? ex.deadline[language] : '—'}</div>
            </div>
          </div>

          ${pros ? `
          <div class="pros-cons-section">
            <div class="pros-cons-heading" style="color:var(--green-700)">
              <span style="display:flex">${SVG.checkFill}</span> ${tx.pros}
            </div>
            <ul style="list-style:none;display:flex;flex-direction:column;gap:6px">${pros}</ul>
          </div>` : ''}

          ${cons ? `
          <div class="pros-cons-section">
            <div class="pros-cons-heading" style="color:var(--red-500)">
              <span style="display:flex">${SVG.xCircle}</span> ${tx.cons}
            </div>
            <ul style="list-style:none;display:flex;flex-direction:column;gap:6px">${cons}</ul>
          </div>` : ''}

          <a href="school-detail.html?id=${s.id}" class="btn-view-full">${tx.viewDetails}</a>
        </div>
      </div>`;
  }).join('');

  // ── ASSEMBLE PAGE ─────────────────────────────────────────
  main.innerHTML = `
    <div class="page-wrap">
      <div class="page-title-section">
        <div class="page-title-row">
          <img src="img/school_compare_face1.png" alt="" class="compare-face compare-face-left" aria-hidden="true">
          <div class="page-title-copy">
            <h1>${tx.title}</h1>
            <p>${tx.subtitle}</p>
          </div>
          <img src="img/school_compare_face2.png" alt="" class="compare-face compare-face-right" aria-hidden="true">
        </div>
      </div>

      <div class="desktop-table">
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th class="px-6 py-4 text-left text-white" style="font-family:'Playfair Display',serif;font-size:1.05rem;vertical-align:middle;">${tx.comparison}</th>
                ${headerCells}
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="table-footer">${footerBtns}</div>
      </div>

      <div class="mobile-cards">${mobileCards}</div>
    </div>`;
}

// ── Language toggle ───────────────────────────────────────────
function applyLanguage(lang) {
  language = lang;
  localStorage.setItem('language', lang);
  document.getElementById('btn-nl').classList.toggle('active', lang === 'nl');
  document.getElementById('btn-en').classList.toggle('active', lang === 'en');
  render();
}

document.getElementById('btn-nl').addEventListener('click', () => applyLanguage('nl'));
document.getElementById('btn-en').addEventListener('click', () => applyLanguage('en'));

// ── Hamburger ─────────────────────────────────────────────────
document.getElementById('hamburger-btn').addEventListener('click', () => {
  document.getElementById('mobile-nav').classList.toggle('open');
});

// ── Boot ──────────────────────────────────────────────────────
applyLanguage(language);
loadSchools();
