// ════════════════════════════════════════════════════════
//  THE GILDED PAGE — script.js
//  Sidebar push behaviour only.
//  (Slider is handled by your own slider code.)
// ════════════════════════════════════════════════════════

var hamburgerBtn = document.getElementById('hamburgerBtn');
var closeBtn     = document.getElementById('closeBtn');
var sidebar      = document.getElementById('sidebar');
var pageWrapper  = document.getElementById('pageWrapper');
var overlay      = document.getElementById('overlay');
var navItems     = document.querySelectorAll('.nav-item');

var isOpen = false;

// ── Open sidebar ─────────────────────────────────────
function openSidebar() {
  isOpen = true;
  sidebar.classList.add('is-open');
  pageWrapper.classList.add('is-pushed');
  overlay.classList.add('is-visible');
  hamburgerBtn.classList.add('is-active');
  hamburgerBtn.setAttribute('aria-expanded', 'true');
  sidebar.setAttribute('aria-hidden', 'false');
}

// ── Close sidebar ─────────────────────────────────────
function closeSidebar() {
  isOpen = false;
  sidebar.classList.remove('is-open');
  pageWrapper.classList.remove('is-pushed');
  overlay.classList.remove('is-visible');
  hamburgerBtn.classList.remove('is-active');
  hamburgerBtn.setAttribute('aria-expanded', 'false');
  sidebar.setAttribute('aria-hidden', 'true');
}

// ── Hamburger click ───────────────────────────────────
//  stopPropagation() is critical here — without it the
//  click bubbles up to the overlay listener (if any) and
//  immediately closes the sidebar that just opened.
hamburgerBtn.addEventListener('click', function (e) {
  e.stopPropagation();
  isOpen ? closeSidebar() : openSidebar();
});

// ── X button ──────────────────────────────────────────
closeBtn.addEventListener('click', function (e) {
  e.stopPropagation();
  closeSidebar();
});

// ── Dim overlay click ─────────────────────────────────
overlay.addEventListener('click', closeSidebar);

// ── Escape key ────────────────────────────────────────
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && isOpen) {
    closeSidebar();
  }
});

// ── Active nav link ───────────────────────────────────
navItems.forEach(function (item) {
  item.addEventListener('click', function () {
    navItems.forEach(function (el) {
      el.classList.remove('active');
    });
    item.classList.add('active');
  });
});