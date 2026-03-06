// ── forgot-password.js ────────────────────────────────────────────────────────

const lang = localStorage.getItem('language') || 'nl';

const T = {
  nl: {
    pageHeading:     'Wachtwoord vergeten',
    pageSubtitle:    'Kies hoe je de resetlink wilt ontvangen',
    tabEmail:        'Via e-mail',
    tabWa:           'Via WhatsApp',
    emailLabel:      'E-mailadres',
    emailPlaceholder:'jouw@email.com',
    phoneLabel:      'WhatsApp-nummer',
    waNote:          'Vul je WhatsApp-nummer in met landcode (bijv. +597 voor Suriname).',
    submitEmail:     'Resetlink versturen',
    submitWa:        'Sturen via WhatsApp',
    backLabel:       'Terug naar inloggen',
    successTitle:    'Link verstuurd!',
    successEmail:    'Controleer je inbox en klik op de link om je wachtwoord opnieuw in te stellen. Vergeet ook je spammap te controleren.',
    successWa:       'Controleer je WhatsApp-berichten en klik op de link om je wachtwoord opnieuw in te stellen.',
    errEmailRequired:'Vul je e-mailadres in.',
    errEmailInvalid: 'Vul een geldig e-mailadres in.',
    errPhoneRequired:'Vul je WhatsApp-nummer in.',
    errPhoneInvalid: 'Vul een geldig nummer in met landcode, bijv. +5978xxxxxxx.',
    errServer:       'Er is iets misgegaan. Probeer het later opnieuw.',
  },
  en: {
    pageHeading:     'Forgot password',
    pageSubtitle:    'Choose how you want to receive the reset link',
    tabEmail:        'Via email',
    tabWa:           'Via WhatsApp',
    emailLabel:      'Email address',
    emailPlaceholder:'your@email.com',
    phoneLabel:      'WhatsApp number',
    waNote:          'Enter your WhatsApp number with country code (e.g. +597 for Suriname).',
    submitEmail:     'Send reset link',
    submitWa:        'Send via WhatsApp',
    backLabel:       'Back to login',
    successTitle:    'Link sent!',
    successEmail:    'Check your inbox and click the link to reset your password. Also check your spam folder.',
    successWa:       'Check your WhatsApp messages and click the link to reset your password.',
    errEmailRequired:'Please enter your email address.',
    errEmailInvalid: 'Please enter a valid email address.',
    errPhoneRequired:'Please enter your WhatsApp number.',
    errPhoneInvalid: 'Please enter a valid number with country code, e.g. +5978xxxxxxx.',
    errServer:       'Something went wrong. Please try again later.',
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

  document.getElementById('page-heading').textContent   = t('pageHeading');
  document.getElementById('page-subtitle').textContent  = t('pageSubtitle');
  document.getElementById('tab-email-label').textContent = t('tabEmail');
  document.getElementById('tab-wa-label').textContent    = t('tabWa');
  document.getElementById('email-label').textContent    = t('emailLabel');
  document.getElementById('email').placeholder          = t('emailPlaceholder');
  document.getElementById('phone-label').textContent    = t('phoneLabel');
  document.getElementById('wa-note').textContent        = t('waNote');
  document.getElementById('submit-email-label').textContent = t('submitEmail');
  document.getElementById('submit-wa-label').textContent    = t('submitWa');
  document.getElementById('back-link').querySelector('span') &&
    (document.getElementById('back-link').innerHTML = `← <span id="back-label">${t('backLabel')}</span>`);
}

// ── Tab switching ──────────────────────────────────────────────────────────────

let activeTab = 'email';

function switchTab(tab) {
  activeTab = tab;

  document.getElementById('tab-email').classList.toggle('active', tab === 'email');
  document.getElementById('tab-whatsapp').classList.toggle('active', tab === 'whatsapp');
  document.getElementById('tab-email').setAttribute('aria-selected', tab === 'email');
  document.getElementById('tab-whatsapp').setAttribute('aria-selected', tab === 'whatsapp');

  document.getElementById('panel-email').hidden     = tab !== 'email';
  document.getElementById('panel-whatsapp').hidden  = tab !== 'whatsapp';
  document.getElementById('api-banner').textContent = '';
  document.getElementById('api-banner').style.display = 'none';
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function showBanner(msg) {
  const el = document.getElementById('api-banner');
  el.textContent    = msg;
  el.style.display  = 'block';
  el.style.background = 'rgba(239,68,68,0.12)';
  el.style.border     = '1px solid rgba(239,68,68,0.3)';
  el.style.color      = '#fca5a5';
  el.style.padding    = '0.75rem 1rem';
  el.style.borderRadius = '8px';
  el.style.marginBottom = '1rem';
  el.style.fontSize   = '0.875rem';
}

function setLoading(formId, loading) {
  const isEmail = formId === 'form-email';
  const btnId     = isEmail ? 'submit-email'     : 'submit-whatsapp';
  const spinnerId = isEmail ? 'spinner-email'     : 'spinner-wa';
  const arrowId   = isEmail ? 'submit-email-arrow': 'submit-wa-arrow';
  const btn = document.getElementById(btnId);
  btn.disabled = loading;
  document.getElementById(spinnerId).style.display = loading ? 'block' : 'none';
  document.getElementById(arrowId).style.display   = loading ? 'none'  : 'block';
}

function showSuccess(method) {
  document.getElementById('method-tabs') && (document.querySelector('.method-tabs').style.display = 'none');
  document.getElementById('panel-email').hidden    = true;
  document.getElementById('panel-whatsapp').hidden = true;

  const s = document.getElementById('success-state');
  document.getElementById('success-title').textContent = t('successTitle');
  document.getElementById('success-body').textContent  = method === 'email' ? t('successEmail') : t('successWa');
  s.hidden = false;
}

function validateEmail(val) {
  if (!val) return t('errEmailRequired');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return t('errEmailInvalid');
  return '';
}

function validatePhone(val) {
  if (!val) return t('errPhoneRequired');
  // Must start with + and contain at least 7 digits
  if (!/^\+\d{7,15}$/.test(val.replace(/\s/g, ''))) return t('errPhoneInvalid');
  return '';
}

// ── Form submissions ───────────────────────────────────────────────────────────

document.getElementById('form-email').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const errEl = document.getElementById('email-error');

  const err = validateEmail(email);
  errEl.textContent = err;
  if (err) return;

  setLoading('form-email', true);
  document.getElementById('api-banner').style.display = 'none';

  try {
    const res  = await fetch('/auth/forgot-password', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, lang }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t('errServer'));
    showSuccess('email');
  } catch (err) {
    showBanner(err.message || t('errServer'));
  } finally {
    setLoading('form-email', false);
  }
});

document.getElementById('form-whatsapp').addEventListener('submit', async (e) => {
  e.preventDefault();
  const phone = document.getElementById('phone').value.trim().replace(/\s/g, '');
  const errEl = document.getElementById('phone-error');

  const err = validatePhone(phone);
  errEl.textContent = err;
  if (err) return;

  setLoading('form-whatsapp', true);
  document.getElementById('api-banner').style.display = 'none';

  try {
    const res  = await fetch('/auth/forgot-password', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ phone, lang }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t('errServer'));
    showSuccess('whatsapp');
  } catch (err) {
    showBanner(err.message || t('errServer'));
  } finally {
    setLoading('form-whatsapp', false);
  }
});

// ── Boot ───────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  applyLang();
  // Hide spinners and arrows correctly on load
  document.getElementById('spinner-email').style.display = 'none';
  document.getElementById('spinner-wa').style.display    = 'none';
  document.getElementById('api-banner').style.display    = 'none';
});