/**
 * floating-icons.js — Studie4SU Cinematic Parallax System
 * =========================================================
 * Generates 4 depth layers of floating academic icons.
 * Each layer moves at a different speed to create true parallax depth.
 *
 * ARCHITECTURE
 * ────────────
 * • All icon nodes are created in JS — HTML stays minimal
 * • Icons use CSS custom properties (--x, --dur, --delay, --rot, --sz, --kf)
 * • Click detection via document coordinate hit-test (z-index agnostic)
 * • Float animation runs on .fi-wrap; click animations run on .fi-icon
 *   or SVG children — the two never conflict
 *
 * LAYER SPEED RATIOS (parallax depth)
 * ─────────────────────────────────────
 * L1 far:      50–65s  (slowest)
 * L2 mid-bg:   35–50s
 * L3 ambient:  22–34s
 * L4 interact: 15–25s  (fastest)
 */

'use strict';

/* ════════════════════════════════════════════════════════════
   ICON DEFINITIONS
   Each entry: { type, svg, color }
   svg: SVG inner HTML, must include all interactive child classes
════════════════════════════════════════════════════════════ */
const ICONS = {

  coffee: {
    color: 'fi-gold',
    viewBox: '0 0 28 32',
    svg: `
      <path class="fi-steam fi-steam-1" d="M8 7 Q9.5 4.5 8 1.5" fill="none" stroke-linecap="round"/>
      <path class="fi-steam fi-steam-2" d="M14 7 Q15.5 4.5 14 1.5" fill="none" stroke-linecap="round"/>
      <path class="fi-steam fi-steam-3" d="M20 7 Q21.5 4.5 20 1.5" fill="none" stroke-linecap="round"/>
      <path d="M23 11h2a4 4 0 0 1 0 8h-2" fill="none"/>
      <path d="M3 11h20v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" fill="none"/>`,
  },

  grad: {
    color: 'fi-green',
    viewBox: '0 0 24 24',
    svg: `
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" fill="none"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5" fill="none"/>
      <line class="fi-tassel" x1="22" y1="10" x2="22" y2="16" fill="none"/>`,
  },

  notebook: {
    color: 'fi-gold',
    viewBox: '0 0 24 24',
    svg: `
      <rect x="3" y="3" width="6" height="18" rx="2" fill="none"/>
      <line x1="3" y1="9"  x2="9" y2="9"/>
      <line x1="3" y1="15" x2="9" y2="15"/>
      <rect class="fi-nb-page" x="9" y="3" width="12" height="18" rx="2"
            fill="rgba(232,184,75,0)" stroke="currentColor"/>`,
  },

  pen: {
    color: 'fi-green',
    viewBox: '0 0 40 40',
    svg: `
      <g transform="translate(8,4) scale(0.85)">
        <path d="M12 20h9" fill="none"/>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" fill="none"/>
      </g>
      <path class="fi-draw-line"
            d="M7 24 Q14 31 23 35"
            stroke="#e8b84b" stroke-width="1.7"
            stroke-dasharray="33" stroke-dashoffset="33"
            opacity="0" fill="none" stroke-linecap="round"/>`,
  },

  glasses: {
    color: 'fi-gold',
    viewBox: '0 0 24 24',
    svg: `
      <circle cx="6"  cy="15" r="4" fill="none"/>
      <circle cx="18" cy="15" r="4" fill="none"/>
      <path d="M10 13a2 2 0 0 1 4 0" fill="none"/>
      <path d="M2 13h4M20 13h2" fill="none"/>
      <circle class="fi-eye fi-eye-l" cx="6"  cy="15" r="1.4"
              fill="currentColor" stroke="none" opacity="0"/>
      <circle class="fi-eye fi-eye-r" cx="18" cy="15" r="1.4"
              fill="currentColor" stroke="none" opacity="0"/>`,
  },

  paperclip: {
    color: 'fi-teal',
    viewBox: '0 0 24 24',
    svg: `
      <path class="fi-clip-path"
            d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66
               l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
            fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  backpack: {
    color: 'fi-green',
    viewBox: '0 0 24 24',
    svg: `
      <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" fill="none"/>
      <path d="M9 6V4a3 3 0 0 1 6 0v2" fill="none"/>
      <line x1="4" y1="15" x2="20" y2="15"/>
      <path d="M10 15v2a2 2 0 0 0 4 0v-2" fill="none"/>`,
  },

  calculator: {
    color: 'fi-gold',
    viewBox: '0 0 24 24',
    svg: `
      <rect x="4" y="2" width="16" height="20" rx="2" fill="none"/>
      <rect x="7" y="5" width="10" height="4" rx="1" fill="none"/>
      <circle class="fi-calc-btn" cx="8"  cy="13" r="1.2" fill="currentColor" opacity=".4"/>
      <circle class="fi-calc-btn" cx="12" cy="13" r="1.2" fill="currentColor" opacity=".4"/>
      <circle class="fi-calc-btn" cx="16" cy="13" r="1.2" fill="currentColor" opacity=".4"/>
      <circle class="fi-calc-btn" cx="8"  cy="17" r="1.2" fill="currentColor" opacity=".4"/>
      <circle class="fi-calc-btn" cx="12" cy="17" r="1.2" fill="currentColor" opacity=".4"/>
      <circle class="fi-calc-btn" cx="16" cy="17" r="1.2" fill="currentColor" opacity=".4"/>`,
  },
};

/* ════════════════════════════════════════════════════════════
   LAYER CONFIG
════════════════════════════════════════════════════════════ */
const LAYERS = [
  {
    id: 'fi-l1', num: 1,
    count: 14,           // icons
    durMin: 50, durMax: 65,
    szMin: 14,  szMax: 18,
    kf: 'fi-drift-l1',
    interactive: false,
  },
  {
    id: 'fi-l2', num: 2,
    count: 14,
    durMin: 35, durMax: 50,
    szMin: 20,  szMax: 28,
    kf: 'fi-drift-l2',
    interactive: false,
  },
  {
    id: 'fi-l3', num: 3,
    count: 14,
    durMin: 22, durMax: 34,
    szMin: 28,  szMax: 38,
    kf: 'fi-drift-l3',
    interactive: false,
  },
  {
    id: 'fi-l4', num: 4,
    count: 16,
    durMin: 15, durMax: 25,
    szMin: 40,  szMax: 52,
    kf: 'fi-drift-l4',
    interactive: true,
  },
];

/* How long each click animation lasts (ms) */
const ANIM_MS = {
  coffee:     1200,
  grad:        950,
  notebook:   2600,
  pen:        1900,
  glasses:    1700,
  paperclip:   900,
  backpack:    700,
  calculator:  600,
};

/* ════════════════════════════════════════════════════════════
   UTILITIES
════════════════════════════════════════════════════════════ */
function rand(min, max) {
  return min + Math.random() * (max - min);
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

/* Distribute X positions evenly across 2–96% with randomised jitter */
function distributedX(count) {
  const positions = [];
  const step = 94 / count;
  for (let i = 0; i < count; i++) {
    // Each slot is [2 + i*step, 2 + (i+1)*step]; jitter within ±30% of slot
    const base = 2 + i * step + step * 0.5;
    const jitter = step * 0.28;
    positions.push(Math.max(2, Math.min(96, base + rand(-jitter, jitter))));
  }
  // Shuffle so same type doesn't cluster left-to-right
  for (let i = positions.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  return positions;
}

/* ════════════════════════════════════════════════════════════
   BUILD ICON SVG ELEMENT
════════════════════════════════════════════════════════════ */
function buildSVG(type, def, strokeWidth) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', def.viewBox);
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', strokeWidth.toFixed(2));
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.classList.add('fi-icon', def.color);
  svg.innerHTML = def.svg;
  return svg;
}

/* ════════════════════════════════════════════════════════════
   BUILD WRAP ELEMENT
════════════════════════════════════════════════════════════ */
function buildWrap(layer, type, xPct, isMobile) {
  const def = ICONS[type];
  const dur = rand(layer.durMin, layer.durMax).toFixed(1);
  // Stagger entries: spread delays across full duration so no burst of icons
  const delay = -rand(0, layer.durMax);
  const rot   = rand(-4.5, 4.5).toFixed(2);
  const sz    = rand(layer.szMin, layer.szMax);
  // Stroke thinner for smaller icons, thicker for larger
  const sw    = 1.1 + (sz - layer.szMin) / (layer.szMax - layer.szMin) * 0.5;

  const wrap = document.createElement('div');
  wrap.className = 'fi-wrap';
  wrap.dataset.type = type;

  // CSS variables
  wrap.style.cssText = [
    `--x:${xPct.toFixed(1)}%`,
    `--dur:${dur}s`,
    `--delay:${delay.toFixed(1)}s`,
    `--rot:${rot}deg`,
    `--sz:${sz.toFixed(0)}px`,
    `--kf:${layer.kf}`,
  ].join(';');

  if (layer.interactive) {
    wrap.classList.add('fi-clickable');
  }

  const svg = buildSVG(type, def, sw);
  wrap.appendChild(svg);
  return wrap;
}

/* ════════════════════════════════════════════════════════════
   POPULATE LAYERS
════════════════════════════════════════════════════════════ */
function populateLayers(isMobile) {
  const iconTypes = Object.keys(ICONS);

  LAYERS.forEach(layer => {
    // Skip far/mid layers on mobile for performance
    if (isMobile && (layer.num === 1 || layer.num === 2)) return;

    const el = document.getElementById(layer.id);
    if (!el) return;

    const count  = isMobile ? Math.ceil(layer.count * 0.55) : layer.count;
    const xSlots = distributedX(count);

    // Round-robin through icon types to ensure even distribution
    for (let i = 0; i < count; i++) {
      const type = iconTypes[i % iconTypes.length];
      const wrap = buildWrap(layer, type, xSlots[i], isMobile);
      el.appendChild(wrap);
    }
  });
}

/* ════════════════════════════════════════════════════════════
   HIT TEST — coordinate-based, stacking-context-agnostic
════════════════════════════════════════════════════════════ */
function hitTest(wraps, cx, cy) {
  for (const w of wraps) {
    const r = w.getBoundingClientRect();
    const pad = 14; // generous hit area — icons float and are small
    if (cx >= r.left - pad && cx <= r.right  + pad &&
        cy >= r.top  - pad && cy <= r.bottom + pad) {
      return w;
    }
  }
  return null;
}

/* ════════════════════════════════════════════════════════════
   CLICK INTERACTION HANDLER
════════════════════════════════════════════════════════════ */
const _cooldown = new WeakMap();

function isReady(wrap) {
  return !_cooldown.has(wrap) || Date.now() >= _cooldown.get(wrap);
}

function triggerIcon(wrap) {
  const type = wrap.dataset.type;
  if (!type || !isReady(wrap)) return;

  const cls = `fi--clicked-${type}`;
  _cooldown.set(wrap, Date.now() + (ANIM_MS[type] || 1000));

  // Remove class so re-triggering always restarts
  wrap.classList.remove(cls);

  // Pre-reset pen
  if (type === 'pen') {
    wrap.querySelectorAll('.fi-draw-line').forEach(l => {
      l.style.transition = 'none';
      l.style.strokeDashoffset = '33';
      l.style.opacity = '0';
    });
  }
  // Pre-reset glasses
  if (type === 'glasses') {
    wrap.querySelectorAll('.fi-eye').forEach(e => { e.style.opacity = '0'; });
  }

  // Double rAF: ensures browser paints removal before re-add
  requestAnimationFrame(() => requestAnimationFrame(() => {
    wrap.classList.add(cls);

    // Drive pen draw-line manually (CSS transition on dashoffset)
    if (type === 'pen') {
      wrap.querySelectorAll('.fi-draw-line').forEach(l => {
        requestAnimationFrame(() => {
          l.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1), opacity .2s';
          l.style.strokeDashoffset = '0';
          l.style.opacity = '1';
        });
      });
    }

    // Cleanup
    setTimeout(() => {
      wrap.classList.remove(cls);

      if (type === 'pen') {
        wrap.querySelectorAll('.fi-draw-line').forEach(l => {
          l.style.transition = 'none';
          l.style.strokeDashoffset = '33';
          l.style.opacity = '0';
          requestAnimationFrame(() => { l.style.transition = ''; });
        });
      }
      if (type === 'glasses') {
        setTimeout(() => {
          wrap.querySelectorAll('.fi-eye').forEach(e => { e.style.opacity = ''; });
        }, 300);
      }
    }, ANIM_MS[type] || 1000);
  }));
}

/* ════════════════════════════════════════════════════════════
   EVENT LISTENERS
════════════════════════════════════════════════════════════ */
function bindEvents() {
  // Single document listener — avoids z-index capture entirely
  document.addEventListener('click', e => {
    const wraps = Array.from(document.querySelectorAll('.fi-clickable'));
    const hit = hitTest(wraps, e.clientX, e.clientY);
    if (hit) triggerIcon(hit);
  });

  // Hover feedback: cursor + glow
  let lastHover = null;
  document.addEventListener('mousemove', e => {
    const wraps = Array.from(document.querySelectorAll('.fi-clickable'));
    const found = hitTest(wraps, e.clientX, e.clientY);

    if (found === lastHover) return;

    if (lastHover) {
      const svg = lastHover.querySelector('.fi-icon');
      if (svg) { svg.style.opacity = ''; svg.style.filter = ''; }
      document.body.style.cursor = '';
    }
    if (found) {
      const svg = found.querySelector('.fi-icon');
      if (svg) {
        svg.style.opacity = '0.40';
        svg.style.filter  = 'drop-shadow(0 0 9px rgba(232,184,75,.55))';
      }
      document.body.style.cursor = 'pointer';
    }
    lastHover = found;
  });
}

/* ════════════════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════════════════ */
function init() {
  const isMobile = window.matchMedia('(max-width: 640px)').matches;
  populateLayers(isMobile);
  bindEvents();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}