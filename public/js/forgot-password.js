// ── forgot-password.js ────────────────────────────────────────────────────────

const lang = localStorage.getItem('language') || 'nl';

const T = {
  nl: {
    pageHeading:      'Wachtwoord vergeten',
    pageSubtitle:     'Vul je e-mailadres in om een resetlink te ontvangen',
    emailLabel:       'E-mailadres',
    emailPlaceholder: 'jouw@email.com',
    submitEmail:      'Resetlink versturen',
    backLabel:        'Terug naar inloggen',
    successTitle:     'Link verstuurd!',
    successEmail:     'Controleer je inbox en klik op de link om je wachtwoord opnieuw in te stellen. Vergeet ook je spammap te controleren.',
    errEmailRequired: 'Vul je e-mailadres in.',
    errEmailInvalid:  'Vul een geldig e-mailadres in.',
    errServer:        'Er is iets misgegaan. Probeer het later opnieuw.',
  },
  en: {
    pageHeading:      'Forgot password',
    pageSubtitle:     'Enter your email address to receive a reset link',
    emailLabel:       'Email address',
    emailPlaceholder: 'your@email.com',
    submitEmail:      'Send reset link',
    backLabel:        'Back to login',
    successTitle:     'Link sent!',
    successEmail:     'Check your inbox and click the link to reset your password. Also check your spam folder.',
    errEmailRequired: 'Please enter your email address.',
    errEmailInvalid:  'Please enter a valid email address.',
    errServer:        'Something went wrong. Please try again later.',
  },
};

function t(key) { return (T[lang] || T.nl)[key] || key; }

// ── Language setup ─────────────────────────────────────────────────────────────

function setLanguage(l) {
  localStorage.setItem('language', l);
  location.reload();
}

function applyLang() {
  document.getElementById('btn-nl').classList.toggle('active', lang === 'nl');
  document.getElementById('btn-en').classList.toggle('active', lang === 'en');
  document.getElementById('btn-nl').setAttribute('aria-pressed', lang === 'nl');
  document.getElementById('btn-en').setAttribute('aria-pressed', lang === 'en');

  document.getElementById('page-heading').textContent  = t('pageHeading');
  document.getElementById('page-subtitle').textContent = t('pageSubtitle');
  document.getElementById('email-label').textContent   = t('emailLabel');
  document.getElementById('email').placeholder         = t('emailPlaceholder');
  document.getElementById('submit-email-label').textContent = t('submitEmail');
  document.getElementById('back-link').innerHTML = `← <span id="back-label">${t('backLabel')}</span>`;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function showBanner(msg) {
  const el = document.getElementById('api-banner');
  el.textContent      = msg;
  el.style.display    = 'block';
  el.style.background = 'rgba(239,68,68,0.12)';
  el.style.border     = '1px solid rgba(239,68,68,0.3)';
  el.style.color      = '#fca5a5';
  el.style.padding    = '0.75rem 1rem';
  el.style.borderRadius = '8px';
  el.style.marginBottom = '1rem';
  el.style.fontSize   = '0.875rem';
}

function setLoading(loading) {
  const btn = document.getElementById('submit-email');
  btn.disabled = loading;
  document.getElementById('spinner-email').style.display     = loading ? 'block' : 'none';
  document.getElementById('submit-email-arrow').style.display = loading ? 'none'  : 'block';
}

function showSuccess() {
  document.getElementById('panel-email').hidden = true;
  const s = document.getElementById('success-state');
  document.getElementById('success-title').textContent = t('successTitle');
  document.getElementById('success-body').textContent  = t('successEmail');
  s.hidden = false;
}

function validateEmail(val) {
  if (!val) return t('errEmailRequired');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return t('errEmailInvalid');
  return '';
}

// ── Form submission ────────────────────────────────────────────────────────────

document.getElementById('form-email').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const errEl = document.getElementById('email-error');

  const err = validateEmail(email);
  errEl.textContent = err;
  if (err) return;

  setLoading(true);
  document.getElementById('api-banner').style.display = 'none';

  try {
    const res  = await fetch('/auth/forgot-password', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, lang }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t('errServer'));
    showSuccess();
  } catch (err) {
    showBanner(err.message || t('errServer'));
  } finally {
    setLoading(false);
  }
});

// ── Boot ───────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  applyLang();
  document.getElementById('spinner-email').style.display = 'none';
  document.getElementById('api-banner').style.display    = 'none';
});