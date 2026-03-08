// ── reset-password.js ─────────────────────────────────────────────────────────

const lang = localStorage.getItem('language') || 'nl';

const T = {
  nl: {
    pageHeading:      'Nieuw wachtwoord',
    pageSubtitle:     'Kies een nieuw wachtwoord voor je account',
    loadingLabel:     'Link controleren…',
    invalidMsg:       'Deze resetlink is verlopen of al gebruikt. Vraag een nieuwe link aan.',
    newPwLabel:       'Nieuw wachtwoord',
    confirmLabel:     'Bevestig wachtwoord',
    submitLabel:      'Wachtwoord opslaan',
    newLinkLabel:     'Nieuwe link aanvragen',
    goLoginLabel:     'Naar inloggen',
    successTitle:     'Wachtwoord gewijzigd!',
    successBody:      'Je kunt nu inloggen met je nieuwe wachtwoord.',
    errPwRequired:    'Vul een wachtwoord in.',
    errPwShort:       'Wachtwoord moet minimaal 8 tekens bevatten.',
    errPwNoMatch:     'Wachtwoorden komen niet overeen.',
    errServer:        'Er is iets misgegaan. Probeer het later opnieuw.',
    pwWeak:           'Zwak',
    pwFair:           'Matig',
    pwStrong:         'Sterk',
  },
  en: {
    pageHeading:      'New password',
    pageSubtitle:     'Choose a new password for your account',
    loadingLabel:     'Checking link…',
    invalidMsg:       'This reset link has expired or already been used. Please request a new one.',
    newPwLabel:       'New password',
    confirmLabel:     'Confirm password',
    submitLabel:      'Save password',
    newLinkLabel:     'Request new link',
    goLoginLabel:     'Go to login',
    successTitle:     'Password changed!',
    successBody:      'You can now log in with your new password.',
    errPwRequired:    'Please enter a password.',
    errPwShort:       'Password must be at least 8 characters.',
    errPwNoMatch:     'Passwords do not match.',
    errServer:        'Something went wrong. Please try again later.',
    pwWeak:           'Weak',
    pwFair:           'Fair',
    pwStrong:         'Strong',
  },
};

function t(key) { return (T[lang] || T.nl)[key] || key; }

// ── Language ───────────────────────────────────────────────────────────────────

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
  document.getElementById('loading-label').textContent  = t('loadingLabel');
  document.getElementById('invalid-msg').textContent    = t('invalidMsg');
  document.getElementById('new-password-label').textContent = t('newPwLabel');
  document.getElementById('confirm-label').textContent      = t('confirmLabel');
  document.getElementById('submit-reset-label').textContent = t('submitLabel');
  document.getElementById('new-link-label').textContent     = t('newLinkLabel');
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function showState(id) {
  ['state-loading', 'state-invalid', 'state-form', 'state-success'].forEach(s => {
    const el = document.getElementById(s);
    if (el) el.hidden = (s !== id);
  });
}

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
  const btn = document.getElementById('submit-reset');
  btn.disabled = loading;
  document.getElementById('spinner-reset').style.display      = loading ? 'block' : 'none';
  document.getElementById('submit-reset-arrow').style.display = loading ? 'none'  : 'block';
}

// ── Show/hide password ─────────────────────────────────────────────────────────

function togglePw(inputId, btnId) {
  const input = document.getElementById(inputId);
  input.type  = input.type === 'password' ? 'text' : 'password';
}

// ── Password strength ─────────────────────────────────────────────────────────

function checkStrength(pw) {
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw))   score++;
  if (/[0-9]/.test(pw))   score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

document.addEventListener('DOMContentLoaded', () => {
  const pwInput   = document.getElementById('new-password');
  const strengthEl = document.getElementById('pw-strength');

  pwInput.addEventListener('input', () => {
    const val   = pwInput.value;
    const score = checkStrength(val);
    if (!val) { strengthEl.textContent = ''; strengthEl.className = 'pw-strength'; return; }
    if (score <= 2) { strengthEl.textContent = t('pwWeak');   strengthEl.className = 'pw-strength weak'; }
    else if (score <= 3) { strengthEl.textContent = t('pwFair');   strengthEl.className = 'pw-strength fair'; }
    else              { strengthEl.textContent = t('pwStrong'); strengthEl.className = 'pw-strength strong'; }
  });
});

// ── Token from URL ─────────────────────────────────────────────────────────────

function getToken() {
  return new URLSearchParams(window.location.search).get('token');
}

// ── Validate token on load ─────────────────────────────────────────────────────

async function validateToken(token) {
  try {
    const res  = await fetch(`/auth/validate-reset-token?token=${encodeURIComponent(token)}`);
    const data = await res.json();
    return data.valid === true;
  } catch {
    return false;
  }
}

// ── Form submission ────────────────────────────────────────────────────────────

document.getElementById('reset-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const pw      = document.getElementById('new-password').value;
  const confirm = document.getElementById('confirm-password').value;
  const pwErr   = document.getElementById('new-password-error');
  const cfErr   = document.getElementById('confirm-error');

  pwErr.textContent = '';
  cfErr.textContent = '';

  if (!pw)        { pwErr.textContent = t('errPwRequired'); return; }
  if (pw.length < 8) { pwErr.textContent = t('errPwShort');    return; }
  if (pw !== confirm) { cfErr.textContent = t('errPwNoMatch');  return; }

  const token = getToken();
  if (!token) { showState('state-invalid'); return; }

  setLoading(true);
  document.getElementById('api-banner').style.display = 'none';

  try {
    const res  = await fetch('/auth/reset-password', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token, password: pw }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t('errServer'));

    // Success — update copy and show success state
    document.getElementById('success-title').textContent = t('successTitle');
    document.getElementById('success-body').textContent  = t('successBody');
    document.getElementById('go-login-label').textContent = t('goLoginLabel');
    showState('state-success');

    // Auto-redirect after 3 seconds
    setTimeout(() => { window.location.href = 'login.html'; }, 3000);

  } catch (err) {
    showBanner(err.message || t('errServer'));
  } finally {
    setLoading(false);
  }
});

// ── Boot ───────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  applyLang();

  document.getElementById('spinner-reset').style.display      = 'none';
  document.getElementById('submit-reset-arrow').style.display = 'block';
  document.getElementById('api-banner').style.display         = 'none';

  const token = getToken();

  if (!token) {
    showState('state-invalid');
    return;
  }

  showState('state-loading');
  const valid = await validateToken(token);

  if (valid) {
    showState('state-form');
  } else {
    document.getElementById('invalid-msg').textContent    = t('invalidMsg');
    document.getElementById('new-link-label').textContent = t('newLinkLabel');
    showState('state-invalid');
  }
});