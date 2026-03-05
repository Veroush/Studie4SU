'use strict';

/* ════════════════════════════════════════════════════════════
   school-compare.js
   Reads compare_school_a and compare_school_b from localStorage,
   loads both schools, renders side-by-side columns + comparison table.
════════════════════════════════════════════════════════════ */

let language = localStorage.getItem('language') || 'nl';

// ── Translations ──────────────────────────────────────────────
const T = {
  nl: {
    pageTitle:    'Scholen <span>Vergelijken</span>',
    pageSub:      'Vergelijk twee scholen naast elkaar',
    back:         'Terug naar scholen',
    emptyTitle:   'Voeg een school toe',
    emptySub:     'Kies een school om te vergelijken',
    btnPick:      'Kies een school',
    btnDetail:    'Bekijk school',
    btnSwap:      'Andere school',
    btnReset:     'Opnieuw vergelijken',
    // Table row labels
    rowType:      'Type',
    rowLocation:  'Locatie',
    rowPrograms:  'Opleidingen',
    rowContact:   'Contactpersoon',
    rowWebsite:   'Website',
    rowDeadline:  'Aanmelding',
    rowFacilities:'Faciliteiten',
    rowServices:  'Diensten',
    rowAccred:    'Accreditatie',
    tableSchoolA: 'School A',
    tableSchoolB: 'School B',
    na:           '—',
    programs:     n => `${n} opleiding${n === 1 ? '' : 'en'}`,
  },
  en: {
    pageTitle:    'Compare <span>Schools</span>',
    pageSub:      'Compare two schools side by side',
    back:         'Back to schools',
    emptyTitle:   'Add a school',
    emptySub:     'Choose a school to compare',
    btnPick:      'Choose a school',
    btnDetail:    'View school',
    btnSwap:      'Change school',
    btnReset:     'Start over',
    rowType:      'Type',
    rowLocation:  'Location',
    rowPrograms:  'Programs',
    rowContact:   'Contact',
    rowWebsite:   'Website',
    rowDeadline:  'Registration',
    rowFacilities:'Facilities',
    rowServices:  'Services',
    rowAccred:    'Accreditation',
    tableSchoolA: 'School A',
    tableSchoolB: 'School B',
    na:           '—',
    programs:     n => `${n} program${n === 1 ? '' : 's'}`,
  },
};

// ── Enrichment data (mirrors school-detail.js SCHOOL_DATA) ────
const SCHOOL_DATA = {
  school_adekus: {
    type: 'University',
    description: { nl: 'De enige universiteit van Suriname, met opleidingen in geneeskunde, rechten, technologie en meer.', en: 'The only university in Suriname, offering programs in medicine, law, technology and more.' },
    contact: { address: 'Leysweg 86, Paramaribo', phone: '+597 465 558', email: 'info@adekus.edu.sr', website: 'adekus.edu.sr' },
    facilities: { nl: ['Medisch Laboratorium','Bibliotheek','Sportfaciliteiten','Computercentra','WiFi campus'], en: ['Medical Laboratory','Library','Sports Facilities','Computer Centers','WiFi campus'] },
    services:   { nl: ['Studiebegeleiding','Beurzen & financiering','Internationale uitwisseling','Loopbaandiensten'], en: ['Academic Guidance','Scholarships & Funding','International Exchange','Career Services'] },
    accreditation: { nl: 'Erkend door het Ministerie van Onderwijs van Suriname.', en: 'Accredited by the Surinamese Ministry of Education.' },
    deadlines: { nl: '1 april 2026', en: 'April 1, 2026' },
  },
  school_natin: {
    type: 'HBO',
    description: { nl: 'Technisch HBO-instituut met sterke focus op ICT, engineering en natuurwetenschappen.', en: 'Technical HBO institute with a strong focus on ICT, engineering and natural sciences.' },
    contact: { address: 'Dr. Sophie Redmondstraat 118, Paramaribo', phone: '+597 490 420', email: 'info@natin.edu.sr', website: 'natin.edu.sr' },
    facilities: { nl: ['ICT-laboratoria','Technische werkplaatsen','Bibliotheek','WiFi campus'], en: ['ICT Labs','Technical Workshops','Library','WiFi campus'] },
    services:   { nl: ['Technische studiebegeleiding','Stageplaatsing','Beurzen'], en: ['Technical Academic Support','Internship Placement','Scholarships'] },
    accreditation: { nl: 'Erkend door het Ministerie van Onderwijs.', en: 'Accredited by the Ministry of Education.' },
    deadlines: { nl: '1 mei 2026', en: 'May 1, 2026' },
  },
  school_iol: {
    type: 'HBO',
    description: { nl: 'Lerarenopleidingsinstituut dat toekomstige docenten voorbereidt voor het Surinaamse onderwijs.', en: 'Teacher training institute preparing future educators for the Surinamese education system.' },
    contact: { address: 'Heerenstraat 14, Paramaribo', phone: '+597 472 241', email: 'info@iol.edu.sr', website: 'iol.edu.sr' },
    facilities: { nl: ['Onderwijslaboratoria','Bibliotheek','Oefenklassen','WiFi campus'], en: ['Teaching Labs','Library','Practice Classrooms','WiFi campus'] },
    services:   { nl: ['Mentorprogramma','Stageplaatsing','Studiebegeleiding'], en: ['Mentor Program','Internship Placement','Academic Guidance'] },
    accreditation: { nl: 'Erkend door het Ministerie van Onderwijs van Suriname.', en: 'Accredited by the Surinamese Ministry of Education.' },
    deadlines: { nl: '15 mei 2026', en: 'May 15, 2026' },
  },
  school_covab: {
    type: 'HBO',
    description: { nl: 'Agrarisch HBO-college voor opleidingen in landbouw, biologie en milieuwetenschappen.', en: 'Agricultural HBO college offering programs in agriculture, biology and environmental sciences.' },
    contact: { address: 'Leysweg 86, Paramaribo', phone: '+597 465 558', email: 'info@covab.edu.sr', website: 'covab.edu.sr' },
    facilities: { nl: ['Biologische laboratoria','Proefvelden','Bibliotheek'], en: ['Biology Labs','Experimental Fields','Library'] },
    services:   { nl: ['Onderzoeksbegeleiding','Stageplaatsing','Beurzen'], en: ['Research Guidance','Internship Placement','Scholarships'] },
    accreditation: { nl: 'Erkend door het Ministerie van Onderwijs.', en: 'Accredited by the Ministry of Education.' },
    deadlines: { nl: '1 juni 2026', en: 'June 1, 2026' },
  },
  school_imeao: {
    type: 'MBO',
    description: { nl: 'MBO-instelling met praktijkgerichte opleidingen in economie, administratie en handel.', en: 'MBO institution with practice-oriented programs in economics, administration and commerce.' },
    contact: { address: 'Heerenstraat 26, Paramaribo', phone: '+597 472 356', email: 'info@imeao.edu.sr', website: 'imeao.edu.sr' },
    facilities: { nl: ['Kantoorsimulatie','Computerruimten','Bibliotheek'], en: ['Office Simulation','Computer Rooms','Library'] },
    services:   { nl: ['Stageplaatsing','Loopbaanbegeleiding','Studiebegeleiding'], en: ['Internship Placement','Career Guidance','Academic Support'] },
    accreditation: { nl: 'Erkend door het Ministerie van Onderwijs van Suriname.', en: 'Accredited by the Surinamese Ministry of Education.' },
    deadlines: { nl: '1 juni 2026', en: 'June 1, 2026' },
  },
  school_ptc: {
    type: 'MBO',
    description: { nl: 'Polytechnisch college dat studenten opleidt in technische vakken op MBO-niveau.', en: 'Polytechnic college training students in technical disciplines at MBO level.' },
    contact: { address: 'Jagernath Lachmonstraat 92, Paramaribo', phone: '+597 432 100', email: 'info@ptc.edu.sr', website: 'ptc.edu.sr' },
    facilities: { nl: ['Technische werkplaatsen','Elektrische labo\'s','Computerruimten'], en: ['Technical Workshops','Electrical Labs','Computer Rooms'] },
    services:   { nl: ['Stageplaatsing','Praktijkbegeleiding','Loopbaandiensten'], en: ['Internship Placement','Practical Guidance','Career Services'] },
    accreditation: { nl: 'Erkend door het Ministerie van Onderwijs.', en: 'Accredited by the Ministry of Education.' },
    deadlines: { nl: '15 juni 2026', en: 'June 15, 2026' },
  },
  school_igsr: {
    type: 'HBO',
    description: { nl: 'HBO-instituut voor gezondheidszorg met verpleegkunde, paramedische en zorgopleidingen.', en: 'HBO health sciences institute offering nursing, paramedical and care programs.' },
    contact: { address: 'Tourtonnelaan 4, Paramaribo', phone: '+597 471 200', email: 'info@igsr.edu.sr', website: 'igsr.edu.sr' },
    facilities: { nl: ['Ziekenhuissimulaties','Medische laboratoria','Bibliotheek'], en: ['Hospital Simulations','Medical Labs','Library'] },
    services:   { nl: ['Zorgstages','Studiebegeleiding','Loopbaandiensten'], en: ['Healthcare Internships','Academic Support','Career Services'] },
    accreditation: { nl: 'Erkend door het Ministerie van Volksgezondheid.', en: 'Accredited by the Ministry of Public Health.' },
    deadlines: { nl: '1 mei 2026', en: 'May 1, 2026' },
  },
};

const SCHOOL_NAMES = {
  school_adekus: 'Anton de Kom Universiteit van Suriname',
  school_natin:  'Natuurtechnisch Instituut',
  school_iol:    'Instituut voor de Opleiding van Leraren',
  school_covab:  'College voor Agrarische en Biologische Wetenschappen',
  school_imeao:  'IMEAO',
  school_ptc:    'Polytechnical College Suriname',
  school_igsr:   'IGSR',
};

/* ════════════════════════════════════════════════════════════
   DATA LOADING
════════════════════════════════════════════════════════════ */
async function fetchSchool(id) {
  try {
    const res = await fetch(`/schools/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    // Build from local enrichment data
    const local = SCHOOL_DATA[id];
    if (!local) return null;
    return {
      id,
      name:     SCHOOL_NAMES[id] || id,
      type:     local.type,
      location: 'Paramaribo',
      programs: [],
      _local:   true,
    };
  }
}

/* ════════════════════════════════════════════════════════════
   RENDER SCHOOL COLUMN
════════════════════════════════════════════════════════════ */
function renderCol(school, slot, tx) {
  if (!school) return;
  const local = SCHOOL_DATA[school.id] || {};
  const progCount = Array.isArray(school.programs)
    ? school.programs.length
    : (school._count?.programs ?? 0);

  const colEl = document.getElementById(`col-${slot}`);
  if (!colEl) return;

  // Remove empty styling if still present
  colEl.classList.remove('compare-col--empty');

  const schoolIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>`;

  const swapUrl = `schools.html?picking=true&slot=${slot}`;

  colEl.innerHTML = `
    <div class="col-header">
      <div class="col-header-icon">${schoolIcon}</div>
      <div class="col-school-name">${school.name}</div>
      <div class="col-school-meta">
        <span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          ${school.location || 'Suriname'}
        </span>
        <span class="col-type-badge">${school.type || local.type || 'HBO'}</span>
      </div>
    </div>
    <div class="col-body">
      <ul class="col-stat-list">
        <li class="col-stat-item">
          <span class="col-stat-label">${tx.rowPrograms}</span>
          <span class="col-stat-value">${tx.programs(progCount)}</span>
        </li>
        <li class="col-stat-item">
          <span class="col-stat-label">${tx.rowLocation}</span>
          <span class="col-stat-value">${school.location || 'Paramaribo'}</span>
        </li>
        <li class="col-stat-item">
          <span class="col-stat-label">${tx.rowDeadline}</span>
          <span class="col-stat-value">${local.deadlines?.[language] || tx.na}</span>
        </li>
        <li class="col-stat-item">
          <span class="col-stat-label">${tx.rowWebsite}</span>
          <span class="col-stat-value">
            ${local.contact?.website
              ? `<a href="https://${local.contact.website}" target="_blank" rel="noopener"
                    style="color:var(--green-700);text-decoration:none;">${local.contact.website}</a>`
              : tx.na}
          </span>
        </li>
      </ul>
    </div>
    <div class="col-cta">
      <a href="school-detail.html?id=${school.id}" class="btn-col-detail">${tx.btnDetail}</a>
      <a href="${swapUrl}" class="btn-col-swap">${tx.btnSwap}</a>
    </div>`;
}

/* ════════════════════════════════════════════════════════════
   RENDER COMPARISON TABLE
════════════════════════════════════════════════════════════ */
function renderTable(schoolA, schoolB, tx) {
  const tableWrap = document.getElementById('compare-table-wrap');
  const table     = document.getElementById('compare-table');
  const resetEl   = document.getElementById('compare-reset');
  if (!tableWrap || !table) return;

  const localA = SCHOOL_DATA[schoolA.id] || {};
  const localB = SCHOOL_DATA[schoolB.id] || {};

  const progA = Array.isArray(schoolA.programs) ? schoolA.programs.length : (schoolA._count?.programs ?? 0);
  const progB = Array.isArray(schoolB.programs) ? schoolB.programs.length : (schoolB._count?.programs ?? 0);

  function tagList(arr) {
    if (!arr || arr.length === 0) return '<span style="color:var(--gray-400)">—</span>';
    return `<div class="tag-list">${arr.slice(0, 4).map(t => `<span class="tag">${t}</span>`).join('')}${arr.length > 4 ? `<span class="tag" style="background:var(--gray-100);color:var(--gray-500)">+${arr.length - 4}</span>` : ''}</div>`;
  }

  // A row: [ label, valueA, valueB, compare? ]
  const rows = [
    [ tx.rowType,      schoolA.type || localA.type || '—', schoolB.type || localB.type || '—', true  ],
    [ tx.rowLocation,  schoolA.location || 'Paramaribo',   schoolB.location || 'Paramaribo',   true  ],
    [ tx.rowPrograms,  tx.programs(progA),                  tx.programs(progB),                  true  ],
    [ tx.rowDeadline,  localA.deadlines?.[language] || '—', localB.deadlines?.[language] || '—', true  ],
    [ tx.rowWebsite,
      localA.contact?.website ? `<a href="https://${localA.contact.website}" target="_blank" rel="noopener" style="color:var(--green-700)">${localA.contact.website}</a>` : '—',
      localB.contact?.website ? `<a href="https://${localB.contact.website}" target="_blank" rel="noopener" style="color:var(--green-700)">${localB.contact.website}</a>` : '—',
      false
    ],
    [ tx.rowFacilities, tagList(localA.facilities?.[language]), tagList(localB.facilities?.[language]), false ],
    [ tx.rowServices,   tagList(localA.services?.[language]),   tagList(localB.services?.[language]),   false ],
    [ tx.rowAccred,
      `<span style="font-size:.8rem;color:var(--gray-600)">${localA.accreditation?.[language] || '—'}</span>`,
      `<span style="font-size:.8rem;color:var(--gray-600)">${localB.accreditation?.[language] || '—'}</span>`,
      false
    ],
  ];

  table.innerHTML = `
    <thead>
      <tr class="thead-row">
        <th></th>
        <th>${schoolA.name}</th>
        <th>${schoolB.name}</th>
      </tr>
    </thead>
    <tbody>
      ${rows.map(([label, valA, valB, compare]) => {
        const differs = compare && valA !== valB;
        return `<tr${differs ? ' class="differs"' : ''}>
          <th>${label}</th>
          <td>${valA}</td>
          <td>${valB}</td>
        </tr>`;
      }).join('')}
    </tbody>`;

  tableWrap.style.display = 'block';
  if (resetEl) resetEl.style.display = 'block';
}

/* ════════════════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════════════════ */
async function init() {
  applyLang(language);

  const idA = localStorage.getItem('compare_school_a');
  const idB = localStorage.getItem('compare_school_b');

  // ── Load school A ────────────────────────────────────────
  if (idA) {
    const schoolA = await fetchSchool(idA);
    const tx = T[language];
    if (schoolA) {
      renderCol(schoolA, 'a', tx);
      // If school B also loaded, render table
      if (idB) {
        const schoolB = await fetchSchool(idB);
        if (schoolB) {
          renderCol(schoolB, 'b', tx);
          renderTable(schoolA, schoolB, tx);
        }
      }
    }
  } else {
    // No school A — redirect back to schools
    window.location.href = 'schools.html';
  }

  // ── Empty slot B: update link with slot param ────────────
  const btnPick = document.getElementById('btn-pick');
  if (btnPick && !idB) {
    btnPick.href = 'schools.html?picking=true';
  }
}

/* ════════════════════════════════════════════════════════════
   LANGUAGE
════════════════════════════════════════════════════════════ */
function applyLang(lang) {
  language = lang;
  localStorage.setItem('language', lang);
  const tx = T[lang];

  document.getElementById('btn-nl').classList.toggle('active', lang === 'nl');
  document.getElementById('btn-en').classList.toggle('active', lang === 'en');

  document.getElementById('page-subtitle').textContent = tx.pageSub;

  // Back link
  const backSpan = document.querySelector('.back-link span');
  if (backSpan) backSpan.textContent = tx.back;

  // Empty slot text
  const emptyTitle = document.getElementById('empty-title');
  const emptySub   = document.getElementById('empty-sub');
  const btnPickText = document.getElementById('btn-pick-text');
  if (emptyTitle)  emptyTitle.textContent  = tx.emptyTitle;
  if (emptySub)    emptySub.textContent    = tx.emptySub;
  if (btnPickText) btnPickText.textContent = tx.btnPick;

  // Reset button
  const resetText = document.getElementById('btn-reset-text');
  if (resetText) resetText.textContent = tx.btnReset;

  // data-nl / data-en nav links
  document.querySelectorAll('[data-nl]').forEach(el => {
    el.textContent = lang === 'nl' ? el.dataset.nl : el.dataset.en;
  });
}

/* ════════════════════════════════════════════════════════════
   RESET
════════════════════════════════════════════════════════════ */
document.getElementById('btn-reset')?.addEventListener('click', () => {
  localStorage.removeItem('compare_school_a');
  localStorage.removeItem('compare_school_b');
  window.location.href = 'schools.html';
});

/* ════════════════════════════════════════════════════════════
   LANGUAGE BUTTONS
════════════════════════════════════════════════════════════ */
document.getElementById('btn-nl').addEventListener('click', () => applyLang('nl'));
document.getElementById('btn-en').addEventListener('click', () => applyLang('en'));

/* ════════════════════════════════════════════════════════════
   HAMBURGER
════════════════════════════════════════════════════════════ */
document.getElementById('hamburger-btn').addEventListener('click', () => {
  document.getElementById('mobile-nav').classList.toggle('open');
});

/* ════════════════════════════════════════════════════════════
   AUTH
════════════════════════════════════════════════════════════ */
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
  document.getElementById('profile-name-label').textContent = payload.name  || 'Profiel';
  document.getElementById('popup-name').textContent          = payload.name  || 'Student';
  document.getElementById('popup-email').textContent         = payload.email || '';
  document.getElementById('popup-role').textContent          = payload.role === 'admin' ? '🛡️ Admin' : '🎓 Student';
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

/* ════════════════════════════════════════════════════════════
   BOOT
════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  init();
});