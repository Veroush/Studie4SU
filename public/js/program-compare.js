'use strict';

/* ════════════════════════════════════════════════════════════
   program-compare.js
   Reads ?ids= from URL (and program_compare from localStorage),
   loads up to 3 programs, renders side-by-side cards + comparison
   table. If only 1 program is loaded, shows an empty-slot prompt
   so the user can go pick a second program.
════════════════════════════════════════════════════════════ */

let language = localStorage.getItem('language') || 'nl';

// ── Translations ──────────────────────────────────────────────
const T = {
  nl: {
    pageTitle:    'Opleidingen <span>Vergelijken</span>',
    pageSub:      'Vergelijk opleidingen naast elkaar',
    back:         'Terug naar scholen',
    emptyTitle:   'Voeg een opleiding toe',
    emptySub:     'Ga naar een opleiding en klik "Vergelijk opleiding"',
    btnBrowse:    'Bekijk opleidingen',
    btnRemove:    'Verwijder',
    btnDetail:    'Bekijk opleiding',
    btnReset:     'Vergelijking wissen',
    loading:      'Laden...',
    rowSchool:    'School',
    rowCluster:   'Cluster',
    rowDuration:  'Duur',
    rowTuition:   'Collegegeld',
    rowLevel:     'Toelatingsniveau',
    rowCareers:   'Carrièremogelijkheden',
    free:         'Gratis',
    na:           '—',
    addSecond:    'Voeg een tweede opleiding toe',
    addSecondSub: 'Bezoek een opleiding en klik "Vergelijk opleiding" om te vergelijken.',
    replaceTitle: 'Vergelijking vol',
    replaceSub:   'Kies welke opleiding je wilt vervangen door',
    replaceBtn:   'Vervang',
    replaceCancelBtn: 'Annuleren',
    leaveTitle:   'Vergelijking wissen?',
    leaveMsg:     'Wil je de vergelijking wissen zodat je opnieuw kunt beginnen?',
    leaveYes:     'Ja, wis vergelijking',
    leaveNo:      'Nee, bewaar',
  },
  en: {
    pageTitle:    'Compare <span>Programs</span>',
    pageSub:      'Compare programs side by side',
    back:         'Back to schools',
    emptyTitle:   'Add a program',
    emptySub:     'Go to a program and click "Compare program"',
    btnBrowse:    'Browse programs',
    btnRemove:    'Remove',
    btnDetail:    'View program',
    btnReset:     'Clear comparison',
    loading:      'Loading...',
    rowSchool:    'School',
    rowCluster:   'Cluster',
    rowDuration:  'Duration',
    rowTuition:   'Tuition',
    rowLevel:     'Entry level',
    rowCareers:   'Career options',
    free:         'Free',
    na:           '—',
    addSecond:    'Add a second program',
    addSecondSub: 'Visit a program page and click "Compare program" to add it.',
    replaceTitle: 'Comparison full',
    replaceSub:   'Choose which program to replace with',
    replaceBtn:   'Replace',
    replaceCancelBtn: 'Cancel',
    leaveTitle:   'Clear comparison?',
    leaveMsg:     'Do you want to clear the comparison so you can start fresh?',
    leaveYes:     'Yes, clear',
    leaveNo:      'No, keep it',
  },
};

const CLUSTER_LABELS = {
  nl: { TECH: 'Technologie', MED: 'Gezondheidszorg', BUS: 'Economie & Business',
        SOC: 'Sociale Wetenschappen', EDU: 'Onderwijs', SCI: 'Wetenschap', LAW: 'Recht' },
  en: { TECH: 'Technology', MED: 'Healthcare', BUS: 'Economics & Business',
        SOC: 'Social Sciences', EDU: 'Education', SCI: 'Science', LAW: 'Law' }
};

function clusterLabel(code) {
  return (CLUSTER_LABELS[language] || CLUSTER_LABELS.nl)[code] || code || '—';
}

function tx(key) { return T[language][key] || key; }

// ── SVG icons ─────────────────────────────────────────────────
const ICON_PROGRAM = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
</svg>`;

const ICON_CLOSE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
</svg>`;

/* ════════════════════════════════════════════════════════════
   DATA LOADING
════════════════════════════════════════════════════════════ */
async function fetchProgram(id) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout
    const res = await fetch(`/programs/${encodeURIComponent(id)}`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) {
      console.warn(`[program-compare] fetch /programs/${id} → HTTP ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn(`[program-compare] fetch /programs/${id} failed:`, err.message);
    return null;
  }
}

/* ════════════════════════════════════════════════════════════
   REMOVE PROGRAM FROM COMPARE
════════════════════════════════════════════════════════════ */
function removeProgramFromCompare(id) {
  let items;
  try { items = JSON.parse(localStorage.getItem('program_compare') || '[]'); }
  catch { items = []; }
  items = items.filter(i => i !== id);
  localStorage.setItem('program_compare', JSON.stringify(items));
  // Re-render with updated URL
  const remaining = items.join(',');
  const newUrl = remaining
    ? `${location.pathname}?ids=${remaining}`
    : location.pathname;
  history.replaceState(null, '', newUrl);
  renderPage(items).then(() => initLeavePrompt());
}

/* ════════════════════════════════════════════════════════════
   RENDER ONE PROGRAM CARD (column)
════════════════════════════════════════════════════════════ */
function renderProgramCard(program, index) {
  const school = program.school || {};
  const tuition = program.tuitionCost && program.tuitionCost !== '0' && program.tuitionCost !== 'free'
    ? program.tuitionCost
    : tx('free');

  // Strip "Vakkenpakket: " and "| Niveau: X" from description for display
  let desc = program.description || '';
  desc = desc.replace(/\s*\|\s*Niveau:[^|]*/i, '').replace(/^Vakkenpakket:\s*/i, '').trim();
  const descShort = desc.length > 120 ? desc.slice(0, 120).trimEnd() + '…' : desc;

  return `
    <div class="pc-card" id="pc-card-${index}" style="animation-delay:${index * 0.07}s">
      <div class="pc-card-header">
        <div class="pc-card-header-inner">
          <div class="pc-card-left">
            <div class="pc-icon">${ICON_PROGRAM}</div>
            <div>
              <div class="pc-program-name">${program.name}</div>
              <div class="pc-school-name">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                ${school.name || '—'}
              </div>
            </div>
          </div>
          <button class="pc-remove-btn" onclick="removeProgramFromCompare('${program.id}')" title="${tx('btnRemove')}">
            ${ICON_CLOSE}
          </button>
        </div>
        <div class="pc-meta-row">
          ${program.cluster ? `<span class="pc-cluster-tag">${clusterLabel(program.cluster)}</span>` : ''}
          ${program.duration ? `<span class="pc-meta-pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${program.duration}
          </span>` : ''}
          ${program.tuitionCost && program.tuitionCost !== '0' && program.tuitionCost !== 'free'
            ? `<span class="pc-meta-pill pc-meta-pill--cost">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                ${program.tuitionCost}
              </span>`
            : `<span class="pc-meta-pill pc-meta-pill--free">${tx('free')}</span>`}
        </div>
      </div>
      <div class="pc-card-body">
        ${descShort ? `<p class="pc-desc">${descShort}</p>` : ''}
        <a href="program-detail.html?id=${program.id}" class="pc-detail-link">${tx('btnDetail')} →</a>
      </div>
    </div>`;
}

/* ════════════════════════════════════════════════════════════
   RENDER EMPTY SLOT (when only 1 program selected)
════════════════════════════════════════════════════════════ */
function renderEmptySlot() {
  return `
    <div class="pc-card pc-card--empty" id="pc-card-empty">
      <div class="pc-empty-inner">
        <div class="pc-empty-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </div>
        <h3 class="pc-empty-title">${tx('addSecond')}</h3>
        <p class="pc-empty-sub">${tx('addSecondSub')}</p>
        <a href="schools.html" class="pc-browse-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          ${tx('btnBrowse')}
        </a>
      </div>
    </div>`;
}

/* ════════════════════════════════════════════════════════════
   RENDER COMPARISON TABLE (2 or 3 programs)
════════════════════════════════════════════════════════════ */
function renderTable(programs) {
  if (programs.length < 2) return '';

  function cell(val) {
    return val && val !== '0' ? val : `<span style="color:var(--gray-400)">—</span>`;
  }

  function careersCell(careers) {
    if (!careers) return `<span style="color:var(--gray-400)">—</span>`;
    const items = careers.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
    if (!items.length) return `<span style="color:var(--gray-400)">—</span>`;
    return `<div class="pc-tag-list">${items.slice(0,4).map(c => `<span class="pc-tag">${c}</span>`).join('')}${items.length > 4 ? `<span class="pc-tag pc-tag--more">+${items.length - 4}</span>` : ''}</div>`;
  }

  function levelCell(p) {
    const levelMatch = p.description?.match(/Niveau:\s*([^\|]+)/i);
    const fromDesc = levelMatch ? levelMatch[1].trim() : null;
    return cell(p.levelRequired || fromDesc);
  }

  function tuitionCell(p) {
    if (!p.tuitionCost || p.tuitionCost === '0' || p.tuitionCost === 'free') {
      return `<span class="pc-free-badge">${tx('free')}</span>`;
    }
    return p.tuitionCost;
  }

  const rows = [
    { label: tx('rowSchool'),   vals: programs.map(p => cell(p.school?.name)) },
    { label: tx('rowCluster'),  vals: programs.map(p => clusterLabel(p.cluster)) },
    { label: tx('rowDuration'), vals: programs.map(p => cell(p.duration)) },
    { label: tx('rowTuition'),  vals: programs.map(p => tuitionCell(p)) },
    { label: tx('rowLevel'),    vals: programs.map(p => levelCell(p)) },
    { label: tx('rowCareers'),  vals: programs.map(p => careersCell(p.careers)) },
  ];

  const colCount = programs.length;
  const colWidth = colCount === 3 ? '28%' : '35%';

  return `
    <div class="pc-table-wrap">
      <div class="pc-table-scroll">
        <table class="pc-table">
          <thead>
            <tr class="pc-thead-row">
              <th style="width:160px"></th>
              ${programs.map((p, i) => `
                <th style="width:${colWidth}">
                  <div class="pc-th-content">
                    <div class="pc-th-icon">${ICON_PROGRAM}</div>
                    <div class="pc-th-name">${p.name}</div>
                    <div class="pc-th-school">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                      ${p.school?.name || '—'}
                    </div>
                    <button class="pc-remove-th-btn" onclick="removeProgramFromCompare('${p.id}')">
                      ${ICON_CLOSE} ${tx('btnRemove')}
                    </button>
                  </div>
                </th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map((row, ri) => {
              const allSame = row.vals.every(v => v === row.vals[0]);
              return `
              <tr class="${ri % 2 === 0 ? 'pc-row-white' : 'pc-row-tinted'}${!allSame ? ' pc-row-differs' : ''}">
                <td class="pc-row-label">${row.label}</td>
                ${row.vals.map(v => `<td class="pc-row-val">${v}</td>`).join('')}
              </tr>`;
            }).join('')}
            <tr class="pc-row-white">
              <td class="pc-row-label"></td>
              ${programs.map(p => `
                <td class="pc-row-val">
                  <a href="program-detail.html?id=${p.id}" class="pc-table-detail-btn">${tx('btnDetail')}</a>
                </td>`).join('')}
            </tr>
          </tbody>
        </table>
      </div>
    </div>`;
}

/* ════════════════════════════════════════════════════════════
   RENDER EMPTY STATE (no programs at all)
════════════════════════════════════════════════════════════ */
function renderNoPrograms() {
  return `
    <div class="pc-no-programs">
      <div class="empty-animation">
        <img src="img/chasing-1.svg" class="empty-chaser" alt="" aria-hidden="true" onerror="this.style.display='none'">
        <img src="img/running-1.svg" class="empty-runner" alt="" aria-hidden="true" onerror="this.style.display='none'">
      </div>
      <h2 class="pc-no-title">${tx('emptyTitle')}</h2>
      <p class="pc-no-sub">${tx('emptySub')}</p>
      <a href="schools.html" class="pc-browse-btn pc-browse-btn--lg">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        ${tx('btnBrowse')}
      </a>
    </div>`;
}

/* ════════════════════════════════════════════════════════════
   MAIN RENDER
════════════════════════════════════════════════════════════ */
async function renderPage(ids) {
  const main = document.getElementById('main-content');

  if (!ids || ids.length === 0) {
    main.innerHTML = `<div class="page-wrap">${renderNoPrograms()}</div>`;
    return;
  }

  // Show loading
  main.innerHTML = `
    <div class="page-wrap">
      <div class="loading-state">
        <div class="spinner"></div>
        <p style="color:var(--gray-500)">${tx('loading')}</p>
      </div>
    </div>`;

  // Fetch all programs in parallel (each has an 8s timeout via fetchProgram)
  const results = await Promise.all(ids.map(fetchProgram));
  const programs = results.filter(Boolean);

  // If ALL fetches failed — show a server error state
  if (programs.length === 0) {
    main.innerHTML = `
      <div class="page-wrap">
        <div class="pc-no-programs">
          <div class="pc-fetch-error-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2 class="pc-no-title">${language === 'nl' ? 'Kan opleidingen niet laden' : 'Could not load programs'}</h2>
          <p class="pc-no-sub">${language === 'nl'
            ? 'Controleer of de server actief is en probeer het opnieuw.'
            : 'Check that the server is running and try again.'}</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:8px;">
            <button class="pc-browse-btn pc-browse-btn--lg" id="pc-retry-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 100-.49"/>
              </svg>
              ${language === 'nl' ? 'Opnieuw proberen' : 'Try again'}
            </button>
            <a href="schools.html" class="pc-browse-btn pc-browse-btn--lg" style="background:var(--gray-600)">
              ${language === 'nl' ? 'Terug naar scholen' : 'Back to schools'}
            </a>
          </div>
        </div>
      </div>`;
    document.getElementById('pc-retry-btn')?.addEventListener('click', () => {
      renderPage(ids).then(() => initLeavePrompt());
    });
    return;
  }

  // Build page title row
  const titleHTML = `
    <div class="pc-title-section">
      <a href="schools.html" class="pc-back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        <span>${tx('back')}</span>
      </a>
      <div class="pc-title-row">
        <img src="img/school_compare_face1.png" class="compare-face compare-face-left"  alt="" aria-hidden="true" onerror="this.style.display='none'">
        <div class="page-title-copy">
          <h1>${tx('pageTitle')}</h1>
          <p>${tx('pageSub')}</p>
        </div>
        <img src="img/school_compare_face2.png" class="compare-face compare-face-right" alt="" aria-hidden="true" onerror="this.style.display='none'">
      </div>
    </div>`;

  // When only 1 program: show a prompt to pick a second one
  // When 2-3 programs: go straight to the table (no mini cards above)
  let midHTML = '';
  if (programs.length === 1) {
    midHTML = `
      <div class="pc-one-program-prompt">
        <div class="pc-one-prompt-inner">
          <div class="pc-one-prompt-name">${programs[0].name}</div>
          <div class="pc-one-prompt-school">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            ${programs[0].school?.name || '—'}
          </div>
        </div>
        <div class="pc-vs-badge">VS</div>
        <div class="pc-empty-prompt">
          <div class="pc-empty-prompt-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div class="pc-empty-prompt-text">
            <strong>${tx('addSecond')}</strong>
            <span>${tx('addSecondSub')}</span>
          </div>
          <a href="schools.html" class="pc-browse-btn">${tx('btnBrowse')}</a>
        </div>
      </div>`;
  }

  // Reset button
  const resetHTML = `
    <div class="pc-reset-row">
      <button class="pc-reset-btn" id="pc-reset-btn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 100-.49"/>
        </svg>
        ${tx('btnReset')}
      </button>
    </div>`;

  main.innerHTML = `
    <div class="page-wrap">
      ${titleHTML}
      ${midHTML}
      ${programs.length >= 2 ? renderTable(programs) : ''}
      ${resetHTML}
    </div>`;

  // Bind reset button
  document.getElementById('pc-reset-btn')?.addEventListener('click', () => {
    localStorage.removeItem('program_compare');
    history.replaceState(null, '', location.pathname);
    renderPage([]).then(() => initLeavePrompt());
  });
}

/* ════════════════════════════════════════════════════════════
   REPLACE FLOW (triggered when compare is full and user adds a 4th)
════════════════════════════════════════════════════════════ */
let _pendingReplaceId = null; // ID of the new program that wants to be added

function showReplaceUI(programs, newProgramName) {
  // Inject a banner above the table asking which to replace
  document.getElementById('pc-replace-banner')?.remove();

  const banner = document.createElement('div');
  banner.id = 'pc-replace-banner';
  banner.className = 'pc-replace-banner';
  banner.innerHTML = `
    <div class="pc-replace-banner-inner">
      <div class="pc-replace-banner-text">
        <strong>${tx('replaceTitle')}</strong>
        <span>${tx('replaceSub')}: <em>${newProgramName}</em></span>
      </div>
      <div class="pc-replace-choices">
        ${programs.map(p => `
          <button class="pc-replace-choice-btn" onclick="confirmReplace('${p.id}')">
            ${ICON_CLOSE}
            <span>${p.name}</span>
            <small>${p.school?.name || ''}</small>
          </button>`).join('')}
        <button class="pc-replace-cancel-btn" onclick="cancelReplace()">
          ${tx('replaceCancelBtn')}
        </button>
      </div>
    </div>`;

  const tableWrap = document.querySelector('.pc-table-wrap');
  if (tableWrap) {
    tableWrap.insertAdjacentElement('beforebegin', banner);
    banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    document.querySelector('.page-wrap')?.prepend(banner);
  }

  // Highlight table columns so user sees what they're replacing
  document.querySelectorAll('.pc-thead-row th:not(:first-child)').forEach(th => {
    th.classList.add('pc-col-replaceable');
  });
}

function confirmReplace(removeId) {
  if (!_pendingReplaceId) return;
  let items;
  try { items = JSON.parse(localStorage.getItem('program_compare') || '[]'); }
  catch { items = []; }

  items = items.filter(id => id !== removeId);
  items.push(_pendingReplaceId);
  _pendingReplaceId = null;

  localStorage.setItem('program_compare', JSON.stringify(items));
  const newUrl = `${location.pathname}?ids=${items.join(',')}`;
  history.replaceState(null, '', newUrl);
  renderPage(items);
}

function cancelReplace() {
  _pendingReplaceId = null;
  document.getElementById('pc-replace-banner')?.remove();
  document.querySelectorAll('.pc-col-replaceable').forEach(el => el.classList.remove('pc-col-replaceable'));
}

/* ════════════════════════════════════════════════════════════
   LEAVE PAGE PROMPT
   When the user navigates away from program-compare.html,
   ask if they want to wipe the comparison clean.
════════════════════════════════════════════════════════════ */
function initLeavePrompt() {
  // We use a custom in-page modal so it works on mobile too
  // (beforeunload dialogs are unreliable on mobile browsers)
  document.querySelectorAll('a[href]').forEach(link => {
    // Only intercept links that leave this page
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript')) return;
    // Skip reset button links (no href) and program-detail links inside the table
    link.addEventListener('click', _onLeaveLinkClick);
  });
}

function _onLeaveLinkClick(e) {
  // If fewer than 2 programs in compare, let them leave freely — nothing worth protecting
  let items;
  try { items = JSON.parse(localStorage.getItem('program_compare') || '[]'); }
  catch { items = []; }
  if (items.length < 2) return;

  e.preventDefault();
  const destination = e.currentTarget.href;
  showLeaveModal(destination);
}

function showLeaveModal(destination) {
  document.getElementById('pc-leave-modal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'pc-leave-modal';
  modal.className = 'pc-leave-overlay';
  modal.innerHTML = `
    <div class="pc-leave-modal">
      <div class="pc-leave-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h3 class="pc-leave-title">${tx('leaveTitle')}</h3>
      <p class="pc-leave-msg">${tx('leaveMsg')}</p>
      <div class="pc-leave-actions">
        <button class="pc-leave-btn-yes" id="pc-leave-yes">${tx('leaveYes')}</button>
        <button class="pc-leave-btn-no"  id="pc-leave-no">${tx('leaveNo')}</button>
      </div>
    </div>`;

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('pc-leave-visible'));

  document.getElementById('pc-leave-yes').addEventListener('click', () => {
    localStorage.removeItem('program_compare');
    modal.remove();
    window.location.href = destination;
  });

  document.getElementById('pc-leave-no').addEventListener('click', () => {
    modal.classList.remove('pc-leave-visible');
    setTimeout(() => modal.remove(), 200);
    window.location.href = destination;
  });
}
function applyLang(lang) {
  language = lang;
  localStorage.setItem('language', lang);
  document.getElementById('btn-nl').classList.toggle('active', lang === 'nl');
  document.getElementById('btn-en').classList.toggle('active', lang === 'en');
  document.querySelectorAll('[data-nl]').forEach(el => {
    el.textContent = lang === 'nl' ? el.dataset.nl : el.dataset.en;
  });
  // Re-render with current IDs
  const ids = getIdsFromUrl();
  renderPage(ids).then(() => initLeavePrompt());
}

/* ════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════ */
function getIdsFromUrl() {
  const params = new URLSearchParams(location.search);
  const raw = params.get('ids') || '';
  const urlIds = raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : [];
  // Also check localStorage in case URL is missing but LS has items
  let lsIds = [];
  try { lsIds = JSON.parse(localStorage.getItem('program_compare') || '[]'); }
  catch { lsIds = []; }
  // Merge: URL wins, but fall back to LS
  const ids = urlIds.length ? urlIds : lsIds;
  // Sync LS to match what we're actually showing (max 3)
  const capped = ids.slice(0, 3);
  localStorage.setItem('program_compare', JSON.stringify(capped));

  // Check for pending replace ID
  const replaceId = params.get('replace');
  if (replaceId) {
    _pendingReplaceId = replaceId;
    // Clean replace param from URL without reload
    params.delete('replace');
    const cleanUrl = `${location.pathname}?ids=${capped.join(',')}`;
    history.replaceState(null, '', cleanUrl);
  }

  return capped;
}

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
  const loginBtn   = document.getElementById('login-btn');
  const profileBtn = document.getElementById('profile-btn');
  const mobileLogin   = document.getElementById('mobile-login');
  const mobileProfile = document.getElementById('mobile-profile');
  if (loginBtn)    loginBtn.style.display    = 'none';
  if (profileBtn)  profileBtn.style.display  = 'flex';
  if (mobileLogin)    mobileLogin.style.display    = 'none';
  if (mobileProfile)  mobileProfile.style.display  = 'block';
  const nameLabel = document.getElementById('profile-name-label');
  const popupName  = document.getElementById('popup-name');
  const popupEmail = document.getElementById('popup-email');
  const popupRole  = document.getElementById('popup-role');
  if (nameLabel)  nameLabel.textContent  = payload.name  || 'Profiel';
  if (popupName)  popupName.textContent  = payload.name  || 'Student';
  if (popupEmail) popupEmail.textContent = payload.email || '';
  if (popupRole)  popupRole.textContent  = payload.role === 'admin' ? '🛡️ Admin' : '🎓 Student';
}

function toggleProfilePopup(e) {
  e.stopPropagation();
  document.getElementById('profile-popup')?.classList.toggle('open');
}

function logout() {
  localStorage.removeItem('auth_token');
  window.location.reload();
}

document.addEventListener('click', () => {
  document.getElementById('profile-popup')?.classList.remove('open');
});

/* ════════════════════════════════════════════════════════════
   BOOT
════════════════════════════════════════════════════════════ */
document.getElementById('btn-nl').addEventListener('click', () => applyLang('nl'));
document.getElementById('btn-en').addEventListener('click', () => applyLang('en'));
document.getElementById('hamburger-btn').addEventListener('click', () => {
  document.getElementById('mobile-nav').classList.toggle('open');
});

// Set initial lang button state
document.getElementById('btn-nl').classList.toggle('active', language === 'nl');
document.getElementById('btn-en').classList.toggle('active', language === 'en');

initAuth();

const _bootIds = getIdsFromUrl();
renderPage(_bootIds).then(() => {
  // If a replace was pending, fetch the new program's name and show the UI
  if (_pendingReplaceId) {
    fetchProgram(_pendingReplaceId).then(newProg => {
      // Get the currently rendered programs from the page
      let currentItems;
      try { currentItems = JSON.parse(localStorage.getItem('program_compare') || '[]'); }
      catch { currentItems = []; }
      // We need the full program objects — re-use what was fetched by renderPage
      // by fetching all in parallel (they're cached by the browser)
      Promise.all(currentItems.map(fetchProgram)).then(progs => {
        const validProgs = progs.filter(Boolean);
        const name = newProg?.name || _pendingReplaceId;
        showReplaceUI(validProgs, name);
        initLeavePrompt();
      });
    });
  } else {
    initLeavePrompt();
  }
});