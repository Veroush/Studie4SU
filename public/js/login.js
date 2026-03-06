/* ────────────────────────────────────────────────────────────
   STATE
──────────────────────────────────────────────────────────── */
let isLoginMode = true;
let currentLang = localStorage.getItem('language') || 'nl';

const urlParams     = new URLSearchParams(window.location.search);
const redirectParam = urlParams.get('redirect');

/* ────────────────────────────────────────────────────────────
   TRANSLATIONS
──────────────────────────────────────────────────────────── */
const t = {
  nl: {
    heading: 'Welkom terug', headingRegister: 'Maak je account',
    subtitle: 'Log in om verder te gaan met je studiekeuze', subtitleRegister: 'Begin je reis naar de perfecte studie',
    subtitleQuiz: 'Log in of registreer om jouw resultaten te bekijken',
    nameLabel: 'Naam', namePlaceholder: 'Naam',
    emailLabel: 'Email', emailPlaceholder: 'Email',
    phoneLabel: 'WhatsApp-nummer', phonePlaceholder: '+597 8xxxxxxx',
    phoneOptional: '(optioneel)', phoneHint: 'Met landcode, bijv. +597 voor Suriname',
    passwordLabel: 'Wachtwoord', passwordPlaceholder: 'Wachtwoord',
    submitLogin: 'Inloggen', submitRegister: 'Registreren',
    loadingLogin: 'Inloggen...', loadingRegister: 'Registreren...',
    noAccount: 'Nog geen account?', hasAccount: 'Heb je al een account?',
    switchRegister: 'Maak er één aan', switchLogin: 'Log in',
    ariaToggleReg: 'Wisselen naar registratie formulier', ariaToggleLog: 'Wisselen naar inloggen formulier',
    backHome: '← Terug naar home',
    errNameRequired: 'Voer je naam in (minimaal 2 tekens)',
    errEmailInvalid: 'Voer een geldig e-mailadres in',
    errPasswordShort: 'Wachtwoord moet minimaal 6 tekens zijn',
    errPhoneInvalid: 'Vul een geldig nummer in met landcode, bijv. +5978xxxxxxx',
    loginSuccess: 'Succesvol ingelogd! Doorverwijzen...', registerSuccess: 'Account aangemaakt! Doorverwijzen...',
    errServer: 'Er is iets misgegaan. Probeer het opnieuw.',
    errEmailTaken: 'Dit e-mailadres is al in gebruik.', errWrongCreds: 'Onjuist e-mailadres of wachtwoord.',
    quoteTextLogin: '"Every failure is a step to success"',
    quoteBookLogin: 'Lectures on the History of Moral Philosophy in England',
    quoteAuthorLogin: 'by William Whewell',
    quoteTextRegister: '"The strongest principle of growth lies in the human choice."',
    quoteBookRegister: 'Daniel Deronda',
    quoteAuthorRegister: 'by George Eliot',
  },
  en: {
    heading: 'Welcome back', headingRegister: 'Create your account',
    subtitle: 'Login to continue with your study choice', subtitleRegister: 'Start your journey to the perfect study',
    subtitleQuiz: 'Login or register to view your results',
    nameLabel: 'Name', namePlaceholder: 'Name',
    emailLabel: 'Email', emailPlaceholder: 'Email',
    phoneLabel: 'WhatsApp number', phonePlaceholder: '+597 8xxxxxxx',
    phoneOptional: '(optional)', phoneHint: 'With country code, e.g. +597 for Suriname',
    passwordLabel: 'Password', passwordPlaceholder: 'Password',
    submitLogin: 'Login', submitRegister: 'Register',
    loadingLogin: 'Logging in...', loadingRegister: 'Registering...',
    noAccount: "Don't have an account?", hasAccount: 'Already have an account?',
    switchRegister: 'Create one', switchLogin: 'Login',
    ariaToggleReg: 'Switch to registration form', ariaToggleLog: 'Switch to login form',
    backHome: '← Back to home',
    errNameRequired: 'Please enter your name (at least 2 characters)',
    errEmailInvalid: 'Please enter a valid email address',
    errPasswordShort: 'Password must be at least 6 characters',
    errPhoneInvalid: 'Please enter a valid number with country code, e.g. +5978xxxxxxx',
    loginSuccess: 'Successfully logged in! Redirecting...', registerSuccess: 'Account created! Redirecting...',
    errServer: 'Something went wrong. Please try again.',
    errEmailTaken: 'This email address is already in use.', errWrongCreds: 'Incorrect email address or password.',
    quoteTextLogin: '"Every failure is a step to success"',
    quoteBookLogin: 'Lectures on the History of Moral Philosophy in England',
    quoteAuthorLogin: 'by William Whewell',
    quoteTextRegister: '"The strongest principle of growth lies in the human choice."',
    quoteBookRegister: 'Daniel Deronda',
    quoteAuthorRegister: 'by George Eliot',
  }
};

/* ────────────────────────────────────────────────────────────
   DOM REFERENCES
──────────────────────────────────────────────────────────── */
const dom = {
  heading:     document.getElementById('form-heading'),
  subtitle:    document.getElementById('form-subtitle'),
  nameField:   document.getElementById('name-field'),
  nameInput:   document.getElementById('name'),
  nameLabel:   document.getElementById('name-label'),
  emailInput:  document.getElementById('email'),
  emailLabel:  document.getElementById('email-label'),
  phoneField:  document.getElementById('phone-field'),
  phoneInput:  document.getElementById('phone'),
  phoneLabel:  document.getElementById('phone-label'),
  phoneOptional: document.getElementById('phone-optional'),
  phoneHint:   document.getElementById('phone-hint'),
  phoneError:  document.getElementById('phone-error'),
  passInput:   document.getElementById('password'),
  passLabel:   document.getElementById('password-label'),
  submitBtn:   document.getElementById('submit-btn'),
  submitLabel: document.getElementById('submit-label'),
  submitArrow: document.getElementById('submit-arrow'),
  spinner:     document.getElementById('spinner'),
  toggleText:  document.getElementById('toggle-text'),
  toggleLink:  document.getElementById('toggle-link'),
  apiBanner:   document.getElementById('api-banner'),
  backLink:    document.getElementById('back-link'),
  nameError:   document.getElementById('name-error'),
  emailError:  document.getElementById('email-error'),
  passError:   document.getElementById('password-error'),
  srAnnounce:  document.getElementById('sr-announcements'),
  btnNl:       document.getElementById('btn-nl'),
  btnEn:       document.getElementById('btn-en'),
  quoteText:   document.getElementById('quote-text'),
  quoteBook:   document.getElementById('quote-book'),
  quoteAuthor: document.getElementById('quote-author'),
};

/* ────────────────────────────────────────────────────────────
   FUNCTIONS
──────────────────────────────────────────────────────────── */
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('language', lang);
  dom.btnNl.classList.toggle('active', lang === 'nl');
  dom.btnEn.classList.toggle('active', lang === 'en');
  updateFormUI();
}

function toggleMode() {
  isLoginMode = !isLoginMode;
  clearErrors();
  hideBanner();
  updateFormUI();
  announceToSR(isLoginMode ? 'Switched to login mode' : 'Switched to registration mode');
  isLoginMode ? dom.emailInput.focus() : dom.nameInput.focus();
}

function animateQuotes() {
  [dom.quoteText, dom.quoteBook, dom.quoteAuthor].forEach((el) => {
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
  });
}

function updateFormUI() {
  const tx = t[currentLang];

  dom.heading.textContent = isLoginMode ? tx.heading : tx.headingRegister;
  dom.subtitle.textContent = redirectParam === 'quiz-results'
    ? tx.subtitleQuiz
    : (isLoginMode ? tx.subtitle : tx.subtitleRegister);

  dom.nameLabel.textContent    = tx.nameLabel;
  dom.nameInput.placeholder    = tx.namePlaceholder;
  dom.emailLabel.textContent   = tx.emailLabel;
  dom.emailInput.placeholder   = tx.emailPlaceholder;
  dom.phoneLabel.firstChild.textContent = tx.phoneLabel + ' '; // keep the <span> sibling
  dom.phoneOptional.textContent = tx.phoneOptional;
  dom.phoneInput.placeholder   = tx.phonePlaceholder;
  dom.phoneHint.textContent    = tx.phoneHint;
  dom.passLabel.textContent    = tx.passwordLabel;
  dom.passInput.placeholder    = tx.passwordPlaceholder;

  // Show/hide register-only fields
  dom.nameField.style.display  = isLoginMode ? 'none' : 'block';
  dom.phoneField.style.display = isLoginMode ? 'none' : 'block';
  dom.nameInput.required       = !isLoginMode;
  dom.passInput.setAttribute('autocomplete', isLoginMode ? 'current-password' : 'new-password');

  dom.submitLabel.textContent  = isLoginMode ? tx.submitLogin  : tx.submitRegister;
  dom.toggleText.textContent   = isLoginMode ? tx.noAccount    : tx.hasAccount;
  dom.toggleLink.textContent   = isLoginMode ? tx.switchRegister : tx.switchLogin;
  dom.backLink.textContent     = tx.backHome;
  dom.quoteText.textContent    = isLoginMode ? tx.quoteTextLogin   : tx.quoteTextRegister;
  dom.quoteBook.textContent    = isLoginMode ? tx.quoteBookLogin   : tx.quoteBookRegister;
  dom.quoteAuthor.textContent  = isLoginMode ? tx.quoteAuthorLogin : tx.quoteAuthorRegister;
  animateQuotes();
}

function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function isValidPhone(phone) { return /^\+\d{7,15}$/.test(phone.replace(/\s/g, '')); }

function showFieldError(inputEl, errorEl, message) {
  inputEl.classList.add('has-error');
  errorEl.textContent = message;
  errorEl.classList.add('show');
}

function clearFieldError(inputEl, errorEl) {
  inputEl.classList.remove('has-error');
  errorEl.textContent = '';
  errorEl.classList.remove('show');
}

function clearErrors() {
  clearFieldError(dom.nameInput,  dom.nameError);
  clearFieldError(dom.emailInput, dom.emailError);
  clearFieldError(dom.passInput,  dom.passError);
  clearFieldError(dom.phoneInput, dom.phoneError);
}

function validateForm() {
  const tx = t[currentLang];
  let valid = true;
  clearErrors();

  if (!isLoginMode && dom.nameInput.value.trim().length < 2) {
    showFieldError(dom.nameInput, dom.nameError, tx.errNameRequired); valid = false;
  }
  if (!isValidEmail(dom.emailInput.value.trim())) {
    showFieldError(dom.emailInput, dom.emailError, tx.errEmailInvalid); valid = false;
  }
  // Phone is optional — only validate format if something was entered
  const phoneVal = dom.phoneInput.value.trim();
  if (!isLoginMode && phoneVal && !isValidPhone(phoneVal)) {
    showFieldError(dom.phoneInput, dom.phoneError, tx.errPhoneInvalid); valid = false;
  }
  if (dom.passInput.value.length < 6) {
    showFieldError(dom.passInput, dom.passError, tx.errPasswordShort); valid = false;
  }
  return valid;
}

function showBanner(message, type) {
  dom.apiBanner.textContent = message;
  dom.apiBanner.className   = 'api-banner ' + type;
}

function hideBanner() {
  dom.apiBanner.className   = 'api-banner';
  dom.apiBanner.textContent = '';
}

function setLoading(loading) {
  dom.submitBtn.disabled            = loading;
  dom.spinner.style.display         = loading ? 'block' : 'none';
  dom.submitArrow.style.display     = loading ? 'none'  : 'block';
  const tx = t[currentLang];
  dom.submitLabel.textContent = loading
    ? (isLoginMode ? tx.loadingLogin    : tx.loadingRegister)
    : (isLoginMode ? tx.submitLogin     : tx.submitRegister);
}

function announceToSR(message) {
  dom.srAnnounce.textContent = '';
  setTimeout(() => dom.srAnnounce.textContent = message, 50);
}

function getRedirectUrl(role) {
  if (redirectParam === 'quiz-results') return 'quiz.html?showResults=true';
  return role === 'admin' ? 'admin-dashboard.html' : 'index.html';
}

/* ────────────────────────────────────────────────────────────
   EVENTS
──────────────────────────────────────────────────────────── */
document.getElementById('auth-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  hideBanner();
  if (!validateForm()) return;

  const payload = {
    email:    dom.emailInput.value.trim(),
    password: dom.passInput.value,
  };

  if (!isLoginMode) {
    payload.name = dom.nameInput.value.trim();
    const phoneVal = dom.phoneInput.value.trim().replace(/\s/g, '');
    if (phoneVal) payload.phone = phoneVal; // only send if provided
  }

  const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
  setLoading(true);

  try {
    const res  = await fetch(endpoint, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      const tokenPayload = JSON.parse(atob(data.token.split('.')[1]));
      const redirect = getRedirectUrl(tokenPayload.role);
      setTimeout(() => { window.location.href = redirect; }, 1500);
    } else {
      setLoading(false);
      const tx = t[currentLang];
      let errMsg = tx.errServer;
      if (data.error) {
        const msg = data.error.toLowerCase();
        if (msg.includes('email') && msg.includes('use')) errMsg = tx.errEmailTaken;
        if (msg.includes('invalid') || msg.includes('incorrect') || msg.includes('not found') || msg.includes('wrong')) errMsg = tx.errWrongCreds;
      }
      showBanner(errMsg, 'error');
    }
  } catch (err) {
    setLoading(false);
    showBanner(t[currentLang].errServer, 'error');
    console.error('[Studie4SU] Auth fetch error:', err);
  }
});

// Real-time validation
dom.emailInput.addEventListener('blur', () => {
  if (dom.emailInput.value && !isValidEmail(dom.emailInput.value.trim()))
    showFieldError(dom.emailInput, dom.emailError, t[currentLang].errEmailInvalid);
  else clearFieldError(dom.emailInput, dom.emailError);
});
dom.passInput.addEventListener('blur', () => {
  if (dom.passInput.value && dom.passInput.value.length < 6)
    showFieldError(dom.passInput, dom.passError, t[currentLang].errPasswordShort);
  else clearFieldError(dom.passInput, dom.passError);
});
dom.nameInput.addEventListener('blur', () => {
  if (!isLoginMode && dom.nameInput.value && dom.nameInput.value.trim().length < 2)
    showFieldError(dom.nameInput, dom.nameError, t[currentLang].errNameRequired);
  else clearFieldError(dom.nameInput, dom.nameError);
});
dom.phoneInput.addEventListener('blur', () => {
  const val = dom.phoneInput.value.trim();
  if (!isLoginMode && val && !isValidPhone(val))
    showFieldError(dom.phoneInput, dom.phoneError, t[currentLang].errPhoneInvalid);
  else clearFieldError(dom.phoneInput, dom.phoneError);
});

// Init
setLanguage(currentLang);
dom.emailInput.focus();