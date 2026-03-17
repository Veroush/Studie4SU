/* ============================================================
   TRANSLATIONS
============================================================ */
const translations = {
  nl: {
    title: 'Studiekeuzequiz',
    subtitle: 'Beantwoord deze vragen om jouw ideale studie te vinden',
    progress: 'Vraag', of: 'van',
    previous: 'Vorige', next: 'Volgende', finish: 'Bekijk Resultaten',
    selectMultiple: 'Selecteer alle die van toepassing zijn',
    selectOne: 'Selecteer één optie',
    resultsTitle: 'Jouw Gepersonaliseerde Aanbevelingen',
    resultsSubtitle: 'Op basis van jouw opleidingsniveau, certificaten en voorkeuren',
    viewProgram: 'Bekijk Programma',
    viewSchool: 'Bekijk School',
    retake: 'Quiz Opnieuw Doen',
    whyRecommended: 'Waarom aanbevolen:',
    requiredLevel: 'Vereist niveau:',
    quizCompleted: 'Quiz voltooid!',
    match: 'match',
    reason_field:    'Past bij jouw gewenste werkveld',
    reason_interest: 'Past bij jouw interesses',
    reason_subjects: 'Past bij jouw sterke vakken',
    reason_certificates: 'Je hebt relevante certificaten',
    reason_learning_style: 'Past bij je leerstijl',
    reason_career:   'Goede carrière- en salarismogelijkheden',
    reason_default:  'Algemene match met jouw profiel',
    noResults: 'Geen programma\'s gevonden voor jouw opleidingsniveau. Probeer de quiz opnieuw.',
    school_label: 'School'
  },
  en: {
    title: 'Study Choice Quiz',
    subtitle: 'Answer these questions to find your ideal study program',
    progress: 'Question', of: 'of',
    previous: 'Previous', next: 'Next', finish: 'View Results',
    selectMultiple: 'Select all that apply',
    selectOne: 'Select one option',
    resultsTitle: 'Your Personalized Recommendations',
    resultsSubtitle: 'Based on your education level, certificates and preferences',
    viewProgram: 'View Program',
    viewSchool: 'View School',
    retake: 'Retake Quiz',
    whyRecommended: 'Why recommended:',
    requiredLevel: 'Required level:',
    quizCompleted: 'Quiz completed!',
    match: 'match',
    reason_field:    'Matches your preferred field',
    reason_interest: 'Matches your interests',
    reason_subjects: 'Matches your strong subjects',
    reason_certificates: 'You have relevant certificates',
    reason_learning_style: 'Matches your learning style',
    reason_career:   'Good career and salary opportunities',
    reason_default:  'General match with your profile',
    noResults: 'No programs found for your education level. Please retake the quiz.',
    school_label: 'School'
  }
};

/* ============================================================
   QUESTIONS DATA (bilingual)
   Each question has an id, type ('multiple'|'single'),
   and translations for question text + options.
============================================================ */
// CHANGED: questionsData is no longer hardcoded.
// Populated by fetchQuestions() on page load.
let questionsData = { nl: [], en: [] };

/* ============================================================
   FETCH QUESTIONS FROM DB
   ADDED: loads questions from /api/quiz/questions and transforms
   the DB shape into the same {nl:[], en:[]} shape the rest of
   quiz.js expects, so nothing else needs to change.
============================================================ */
async function fetchQuestions() {
  try {
    const res = await fetch('/api/quiz/questions');
    if (!res.ok) throw new Error('Failed to fetch questions');
    const data = await res.json();

    // CHANGED: map DB id to camelCase key that matches quizState.answers
    const keyMap = {
      'q_diplomas':         'diplomas',
      'q_certificates':     'certificates',
      'q_educationstatus':  'educationStatus',
      'q_interests':        'interests',
      'q_subjectstrengths': 'subjectStrengths',
      'q_learningstyle':    'learningStyle',
      'q_preferredfield':   'preferredField',
      'q_careerdirection':  'careerDirection',
    };

    questionsData.nl = data.map(q => ({
      id:          keyMap[q.id] || q.id.replace(/^q_/, ''),
      type:        q.type,
      question:    q.text,
      instruction: q.type === 'multiple'
        ? translations.nl.selectMultiple
        : translations.nl.selectOne,
      options: q.options.map(o => o.text),
    }));

    questionsData.en = data.map(q => ({
      id:          keyMap[q.id] || q.id.replace(/^q_/, ''),
      type:        q.type,
      question:    q.textEn || q.text,
      instruction: q.type === 'multiple'
        ? translations.en.selectMultiple
        : translations.en.selectOne,
      options: q.options.map(o => o.textEn || o.text),
    }));

  } catch (err) {
    console.error('Could not load questions from DB:', err);
  }
}

//raksha removed programs data

//raksha removed school id map and program id map

/* ============================================================
   QUIZ STATE
============================================================ */


/* ============================================================
   STICKMAN HEADER ANIMATIONS
   — ADDED BY VALENTINO —
   Full looping frame animator system for the stickman character
   that appears in the quiz header. Valentino added all of the
   HEADER_ANIMATIONS map, QUIZ_ANIMATION_STEPS array,
   LoopingFrameAnimator class, and all associated helper
   functions. None of this existed on our branch.
============================================================ */
const HEADER_ANIMATIONS = {
  confused: [
    'img/stickman-confused1.svg',
    'img/stickman-confused2.svg',
    'img/stickman-confused3.svg',
    'img/stickman-confused4.svg'
  ],
  exploring: [
    'img/stickman-exploring1.svg',
    'img/stickman-exploring2.svg',
    'img/stickman-exploring3.svg',
    'img/stickman-exploring4.svg'
  ],
  following: [
    'img/stickman-following1.svg',
    'img/stickman-following2.svg',
    'img/stickman-following3.svg',
    'img/stickman-following4.svg',
    'img/stickman-following5.svg',
    'img/stickman-following6.svg'
  ],
  celebrating: [
    'img/stickman-celebrating1.svg',
    'img/stickman-celebrating2.svg',
    'img/stickman-celebrating3.svg',
    'img/stickman-celebrating4.svg',
    'img/stickman-celebrating5.svg',
    'img/stickman-celebrating6.svg',
    'img/stickman-celebrating7.svg',
    'img/stickman-celebrating8.svg'
  ]
};

const QUIZ_ANIMATION_STEPS = [
  { key: 'confused', position: 'right' },
  { key: 'confused', position: 'right' },
  { key: 'exploring', position: 'left' },
  { key: 'exploring', position: 'left' },
  { key: 'exploring', position: 'left' },
  { key: 'following', position: 'right' },
  { key: 'following', position: 'right' },
  { key: 'following', position: 'right' }
];

class LoopingFrameAnimator {
  constructor(imgSelector, fps = 8) {
    this.imgEl = document.querySelector(imgSelector);
    this.fps = fps;
    this.timer = null;
    this.frames = [];
    this.index = 0;
  }

  play(frames) {
    if (!this.imgEl || !Array.isArray(frames) || frames.length === 0) return;

    const switchedSequence = this.frames !== frames;
    this.frames = frames;

    if (switchedSequence) this.index = 0;
    this.imgEl.src = this.frames[this.index];

    if (this.timer) return;

    const frameDurationMs = Math.round(1000 / this.fps);
    this.timer = setInterval(() => {
      this.index = (this.index + 1) % this.frames.length;
      this.imgEl.src = this.frames[this.index];
    }, frameDurationMs);
  }
}

let quizHeaderAnimator;
let resultsHeaderAnimator;

function preloadAnimationFrames() {
  Object.values(HEADER_ANIMATIONS).flat().forEach(src => {
    const image = new Image();
    image.src = src;
  });
}

function setHeaderPosition(layoutId, position) {
  const layout = document.getElementById(layoutId);
  if (!layout) return;
  layout.classList.toggle('animation-left', position === 'left');
  layout.classList.toggle('animation-right', position !== 'left');
}

function updateQuizHeaderAnimation() {
  const animationStep = QUIZ_ANIMATION_STEPS[quizState.currentQuestion] || QUIZ_ANIMATION_STEPS[0];
  setHeaderPosition('quiz-header-layout', animationStep.position);
  quizHeaderAnimator.play(HEADER_ANIMATIONS[animationStep.key]);
}

function updateResultsHeaderAnimation() {
  setHeaderPosition('results-header-layout', 'right');
  resultsHeaderAnimator.play(HEADER_ANIMATIONS.celebrating);
}

const quizState = {
  currentQuestion: 0,
  showResults: false,
  answers: {
    diplomas: [],
    certificates: [],
    educationStatus: '',
    interests: [],
    subjectStrengths: [],
    learningStyle: '',
    preferredField: '',
    careerDirection: ''
  }
};

/* ============================================================
   LANGUAGE
============================================================ */
let currentLang = localStorage.getItem('language') || 'nl';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('language', lang);
  updateLangButtons();
  if (quizState.showResults) {
    renderResults();
  } else {
    renderQuestion();
    updateProgressBar();
  }
  updateStaticText();
}

function updateLangButtons() {
  document.getElementById('btn-nl').classList.toggle('active', currentLang === 'nl');
  document.getElementById('btn-en').classList.toggle('active', currentLang === 'en');
}

/* ============================================================
   CONFLICT 1 OF 3 — updateStaticText()
   ─────────────────────────────────────────────────────────────
   LOCATION: the body of updateStaticText(), after the static
   element assignments.

   OUR SIDE (HEAD):
     Added a document.querySelectorAll('[data-nl]').forEach loop
     that applies currentLang to all nav links that carry
     data-nl / data-en attributes. This was added as a bug fix
     (Bug 5 in the session handoff) so the header nav translates
     when the user switches language on the quiz page.

   VALENTINO'S SIDE:
     Added two calls at the end of updateStaticText():
       if (quizState.showResults) {
         updateResultsHeaderAnimation();
       } else {
         updateQuizHeaderAnimation();
       }
     These drive the stickman character — when the language
     button is pressed, the stickman syncs to the correct
     animation state for where the user is in the quiz.

   WHY BOTH ARE KEPT:
     The two additions are completely independent. Our loop
     touches [data-nl] DOM elements in the nav. Valentino's
     calls touch the stickman <img> element in the header.
     They don't share any state or DOM nodes. Dropping either
     one would break something — our side breaks nav translation,
     Valentino's side breaks the animation sync on language swap.

   RESOLUTION:
     Kept our [data-nl] loop first, then appended Valentino's
     animation sync block directly after it.
   ─────────────────────────────────────────────────────────────
*/
function updateStaticText() {
  const t = translations[currentLang];
  document.getElementById('page-title').textContent = t.title;
  document.getElementById('page-subtitle').textContent = t.subtitle;
  document.getElementById('prev-label').textContent = t.previous;
  document.getElementById('results-title').textContent = t.resultsTitle;
  document.getElementById('results-subtitle').textContent = t.resultsSubtitle;
  document.getElementById('badge-text').textContent = t.quizCompleted;
  document.getElementById('retake-btn').textContent = t.retake;

  // OUR CODE — Bug 5 fix: apply language to nav links that carry data-nl/data-en.
  // Without this loop, clicking NL/EN did not update the header navigation text.
  document.querySelectorAll('[data-nl]').forEach(el => {
    el.textContent = currentLang === 'nl' ? el.dataset.nl : el.dataset.en;
  });

  // VALENTINO'S CODE — sync stickman animation state when language is toggled.
  // Ensures the correct animation frame and position are shown for the current
  // quiz step after a language switch, not just on question navigation.
  if (quizState.showResults) {
    updateResultsHeaderAnimation();
  } else {
    updateQuizHeaderAnimation();
  }
}

/* ============================================================
   PROGRESS BAR
============================================================ */
function updateProgressBar() {
  const total   = questionsData[currentLang].length;
  const current = quizState.currentQuestion + 1;
  const pct     = Math.round((current / total) * 100);
  const t       = translations[currentLang];

  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-text').textContent =
    `${t.progress} ${current} ${t.of} ${total}`;
  document.getElementById('percentage-text').textContent = pct + '%';

  const bar = document.querySelector('.progress-track');
  bar.setAttribute('aria-valuenow', pct);
}

/* ============================================================
   RENDER QUESTION
============================================================ */
function renderQuestion(direction = 'forward') {
  const questions = questionsData[currentLang];
  const q   = questions[quizState.currentQuestion];
  const t   = translations[currentLang];
  const ans = quizState.answers[q.id];

  updateQuizHeaderAnimation();

  const card = document.getElementById('question-card');

  // Slide out in the appropriate direction
  const exitClass = direction === 'forward' ? 'card-exit-left' : 'card-exit-right';
  card.classList.remove('card-enter', 'card-enter-left', 'card-enter-right', 'card-exit-left', 'card-exit-right');
  card.classList.add(exitClass);

  setTimeout(() => {
    document.getElementById('question-text').textContent = q.question;
    document.getElementById('question-instruction').textContent = q.instruction;

    const list = document.getElementById('options-list');
    list.innerHTML = '';
    list.setAttribute('role', q.type === 'multiple' ? 'group' : 'radiogroup');

    q.options.forEach(option => {
      const isSelected = q.type === 'multiple'
        ? (Array.isArray(ans) && ans.includes(option))
        : ans === option;

      const btn = document.createElement('button');
      btn.className = 'option-btn' + (isSelected ? ' selected' : '');
      btn.setAttribute('role', q.type === 'multiple' ? 'checkbox' : 'radio');
      btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      btn.setAttribute('aria-label', option);
      btn.setAttribute('data-option', option);

      btn.innerHTML = `
        <div class="indicator">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <span class="option-text">${option}</span>
      `;

      btn.addEventListener('click', () => {
        if (q.type === 'multiple') {
          handleMultipleChoice(q.id, option);
        } else {
          handleSingleChoice(q.id, option);
        }
      });

      list.appendChild(btn);
    });

    // Update next button label
    const isLast = quizState.currentQuestion === questions.length - 1;
    document.getElementById('next-label').textContent = isLast ? t.finish : t.next;

    // Slide in from the opposite direction
    card.classList.remove(exitClass);
    const enterClass = direction === 'forward' ? 'card-enter-right' : 'card-enter-left';
    card.classList.add(enterClass);

    updateNavigationButtons();
  }, 200);
}

/* ============================================================
   ANSWER SELECTION
============================================================ */
function handleMultipleChoice(questionId, option) {
  const current = quizState.answers[questionId] || [];
  if (current.includes(option)) {
    quizState.answers[questionId] = current.filter(i => i !== option);
  } else {
    quizState.answers[questionId] = [...current, option];
  }
  refreshOptionStates(questionId);
  updateNavigationButtons();
}

function handleSingleChoice(questionId, option) {
  quizState.answers[questionId] = option;
  refreshOptionStates(questionId);
  updateNavigationButtons();
}

function refreshOptionStates(questionId) {
  const ans = quizState.answers[questionId];
  document.querySelectorAll('#options-list .option-btn').forEach(btn => {
    const opt = btn.getAttribute('data-option');
    const selected = Array.isArray(ans) ? ans.includes(opt) : ans === opt;
    btn.classList.toggle('selected', selected);
    btn.setAttribute('aria-checked', selected ? 'true' : 'false');
  });
}

/* ============================================================
   NAVIGATION
============================================================ */
function isQuestionAnswered() {
  const q   = questionsData[currentLang][quizState.currentQuestion];
  const ans = quizState.answers[q.id];
  if (q.type === 'multiple') return Array.isArray(ans) && ans.length > 0;
  return ans && ans !== '';
}

function updateNavigationButtons() {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  prevBtn.disabled = quizState.currentQuestion === 0;
  nextBtn.disabled = !isQuestionAnswered();
}

function handleNext() {
  if (!isQuestionAnswered()) return;
  const total = questionsData[currentLang].length;
  if (quizState.currentQuestion < total - 1) {
    quizState.currentQuestion++;
    renderQuestion('forward');
    updateProgressBar();
    announceToScreenReader(
      `${translations[currentLang].progress} ${quizState.currentQuestion + 1}: ${questionsData[currentLang][quizState.currentQuestion].question}`
    );
  } else {
    // Last question — check login before showing results
    quizState.showResults = true;
    submitAndShowResults();
  }
}

function handlePrevious() {
  if (quizState.currentQuestion > 0) {
    quizState.currentQuestion--;
    renderQuestion('back');
    updateProgressBar();
  }
}

/* ============================================================
   AUTH HELPERS
============================================================ */
function isLoggedIn() {
  const token = localStorage.getItem('auth_token');
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Check token hasn't expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('auth_token');
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

//raksha removed buildClusterScores function
//raksha deleted entire calculateRecommendations()

/* ============================================================
   SUBMIT TO BACKEND
   CHANGED: removed local calculateRecommendations().
   Now sends answers to /api/quiz/recommend and gets real
   programs back from the DB, scored by cluster match.
============================================================ */
async function submitAndShowResults() {
  // ── LOGIN GATE ──────────────────────────────────────────────
  if (!isLoggedIn()) {
    localStorage.setItem('quiz_pending_answers', JSON.stringify(quizState.answers));
    localStorage.setItem('quiz_pending_lang', currentLang);
    window.location.href = 'login.html?redirect=quiz-results';
    return;
  }

  // Show loading state
  document.getElementById('quiz-section').style.display = 'none';
  document.getElementById('results-container').style.display = 'block';
  document.getElementById('recommendations-list').innerHTML = `
    <div class="no-results">
      <p>Aanbevelingen worden geladen...</p>
    </div>`;

  try {
    const response = await fetch('/api/quiz/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
      },
      body: JSON.stringify({
        answers: quizState.answers,
        lang: currentLang
      })
    });

    if (!response.ok) {
      throw new Error('Server returned ' + response.status);
    }

    const data = await response.json();

    if (!data.success || !data.results) {
      throw new Error('Invalid response from server');
    }

    // Save scores to backend (fire and forget)
    try {
      await fetch('/api/quiz/submit-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
        },
        body: JSON.stringify({
          answers: quizState.answers,
          topProgramId: data.results[0]?.id || '',
          scores: data.scores
        })
      });
    } catch (e) {
      // Silent fail — results already shown
    }

    renderResults(data.results);

  } catch (err) {
    console.error('Quiz recommend error:', err);
    const t = translations[currentLang];
    document.getElementById('recommendations-list').innerHTML = `
      <div class="no-results">
        <p>${t.noResults}</p>
      </div>`;
  }
}

/* ============================================================
   RENDER RESULTS
   CHANGED: now receives programs array from backend instead
   of calculating locally from hardcoded data.
============================================================ */
function renderResults(programs) {
  const t = translations[currentLang];

  document.getElementById('quiz-section').style.display = 'none';
  document.getElementById('results-container').style.display = 'block';
  document.getElementById('results-title').textContent = t.resultsTitle;
  document.getElementById('results-subtitle').textContent = t.resultsSubtitle;
  document.getElementById('badge-text').textContent = t.quizCompleted;
  document.getElementById('retake-btn').textContent = t.retake;
  updateResultsHeaderAnimation();

  const list = document.getElementById('recommendations-list');

  if (!programs || programs.length === 0) {
    list.innerHTML = `
      <div class="no-results">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p>${t.noResults}</p>
      </div>`;
    return;
  }

  /* ============================================================
     CONFLICT 2 OF 3 — renderResults() programs.map() opening line
     ─────────────────────────────────────────────────────────────
     LOCATION: the opening line of the programs.map() template
     that builds the result cards HTML.

     OUR SIDE (HEAD):
       list.innerHTML = recs.map((rec, i) => {
         const schoolId  = PROGRAM_SCHOOL_MAP[rec.id] || '';
         const programId = PROGRAM_ID_MAP[rec.id] || '';
         const slideDir  = i % 2 === 0 ? 'left' : 'right';
         return `
         <div class="rec-card" data-slide="${slideDir}">

       Used the old variable name `recs` and read from
       PROGRAM_SCHOOL_MAP and PROGRAM_ID_MAP. Both maps were
       deleted by Raksha when he removed the hardcoded data.
       This would throw a ReferenceError and crash renderResults.
       It also included the data-slide attribute for the
       alternating scroll-in animation (which we wanted).

     RAKSHA'S SIDE:
       list.innerHTML = programs.map((rec, i) => `
         <div class="rec-card">

       Used the correct parameter name `programs` matching the
       function signature. No map lookups (backend supplies
       schoolId directly on each result object). No data-slide.

     WHY WE WENT WITH RAKSHA'S VARIABLE NAME:
       `recs` is undefined — the parameter is named `programs`.
       PROGRAM_SCHOOL_MAP and PROGRAM_ID_MAP no longer exist.
       Using our side as-is would crash the page with a
       ReferenceError on every quiz submission.

     WHY data-slide WAS RESTORED:
       The alternating slide animation (Bug 8 fix from the
       handoff) is intentional and the CSS rules for
       [data-slide="left"] and [data-slide="right"] exist in
       quiz.css. It was dropped from Raksha's side simply
       because he didn't have that branch's changes — there
       was no reason to exclude it. We restored it here using
       Raksha's correct variable name.

     RESOLUTION:
       Used Raksha's `programs.map()` opening.
       Kept data-slide="${i % 2 === 0 ? 'left' : 'right'}"
       from our side since the CSS already supports it.
       Dropped `recs`, PROGRAM_SCHOOL_MAP, PROGRAM_ID_MAP.
     ─────────────────────────────────────────────────────────────
  */
  list.innerHTML = programs.map((rec, i) => `
    <div class="rec-card" data-slide="${i % 2 === 0 ? 'left' : 'right'}">
      <div class="rec-layout">
        <div class="rank-badge" aria-label="Rank ${i + 1}">#${i + 1}</div>
        <div class="rec-content">
          <div class="rec-header">
            <div>
              <h3 class="rec-title">${rec.title}</h3>
              <p class="rec-school">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                ${rec.school}
              </p>
            </div>
            <div class="match-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/><path d="M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2"/><path d="M19 11h2m-1 -1v2"/></svg>
              <span>${rec.match}% ${t.match}</span>
            </div>
          </div>

          <p class="rec-desc">${rec.description}</p>

          <div class="info-box">
            <p class="info-box-label"><strong>${t.requiredLevel}</strong> ${rec.requiredLevel}</p>
            <p class="reasons-heading">${t.whyRecommended}</p>
            <ul class="reasons-list">
              ${rec.reasons.map(r => `
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
                  ${r}
                </li>`).join('')}
            </ul>
          </div>

          <div class="action-row">
            <button class="btn-primary" onclick="window.location.href='school-detail.html?id=${rec.schoolId}'">${t.viewSchool}</button>
            <button class="btn-secondary" onclick="window.location.href='program-detail.html?id=${rec.id}'">${t.viewProgram}</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  localStorage.removeItem('quiz_pending_answers');
  localStorage.removeItem('quiz_pending_lang');

  // OUR CODE — scroll-triggered slide-in animation on result cards.
  // IntersectionObserver watches each .rec-card and adds rec-card-visible
  // when the card enters the viewport (threshold 0.12). The data-slide
  // attribute set above drives the direction via quiz.css rules for
  // [data-slide="left"] and [data-slide="right"].
  // Raksha's side had no animation block here — it was simply omitted,
  // not intentionally removed. Kept in full.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('rec-card-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  list.querySelectorAll('.rec-card').forEach(card => observer.observe(card));

  scrollToTop();
  announceToScreenReader(t.resultsTitle);
}

/* ============================================================
   RETAKE QUIZ
============================================================ */
function retakeQuiz() {
  quizState.currentQuestion = 0;
  quizState.showResults = false;
  quizState.answers = {
    diplomas: [], certificates: [], educationStatus: '',
    interests: [], subjectStrengths: [],
    learningStyle: '', preferredField: '', careerDirection: ''
  };
  document.getElementById('results-container').style.display = 'none';
  document.getElementById('quiz-section').style.display = 'block';
  const card = document.getElementById('question-card');
  if (card) {
    card.classList.remove('card-enter-right', 'card-enter-left', 'card-exit-left', 'card-exit-right');
    card.classList.add('card-enter');
  }
  renderQuestion('forward');
  updateProgressBar();
  scrollToTop();
}

/* ============================================================
   HELPERS
============================================================ */
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function announceToScreenReader(msg) {
  const el = document.getElementById('sr-announcements');
  el.textContent = msg;
  setTimeout(() => { el.textContent = ''; }, 1000);
}

/* ============================================================
   HAMBURGER (mobile nav toggle)
============================================================ */
document.getElementById('hamburger-btn').addEventListener('click', () => {
  document.getElementById('mobile-nav').classList.toggle('open');
});

/* ============================================================
   AUTH / PROFILE
============================================================ */
function decodeToken(token) {
  try { return JSON.parse(atob(token.split('.')[1])); }
  catch { return null; }
}

/* Avatar emoji map — matches settings.js */
const AVATARS_MAP = {
  graduate: '🎓', student: '📖', laptop: '💻', owl: '🦉', fox: '🦊',
  panda: '🐼', cat: '🐱', robot: '🤖', dog: '🐶', science: '🔬',
  art: '🎨', rocket: '🚀', star: '⭐', book: '📚', trophy: '🏆', globe: '🌍',
};

function initAuth() {
  const token = localStorage.getItem('auth_token');
  if (!token) return;

  const payload = decodeToken(token);
  if (!payload || payload.exp * 1000 < Date.now()) {
    localStorage.removeItem('auth_token');
    return;
  }

  document.getElementById('login-btn').style.display      = 'none';
  document.getElementById('profile-btn').style.display    = 'flex';
  document.getElementById('mobile-login').style.display   = 'none';
  document.getElementById('mobile-profile').style.display = 'block';

  const displayName = localStorage.getItem('user_display_name') || payload.name || 'Student';
  const avatarId    = localStorage.getItem('user_avatar') || 'graduate';
  const avatarEmoji = AVATARS_MAP[avatarId] || '🎓';

  document.getElementById('profile-name-label').textContent = displayName;
  document.getElementById('popup-name').textContent          = displayName;
  document.getElementById('popup-email').textContent         = payload.email || '';
  const navAv = document.getElementById('nav-avatar-display');
  const popAv = document.getElementById('popup-avatar-lg');
  if (navAv) navAv.textContent = avatarEmoji;
  if (popAv) popAv.textContent = avatarEmoji;
  // dark_mode toggle removed — dark mode feature scrapped
}

function toggleProfilePopup(e) {
  e.stopPropagation();
  document.getElementById('profile-popup').classList.toggle('open');
}

function logout() {
  localStorage.removeItem('auth_token');
  window.location.reload();
}

document.addEventListener('click', (e) => {
  const popup = document.getElementById('profile-popup');
  const wrap  = document.getElementById('profile-btn');
  if (popup && wrap && !wrap.contains(e.target)) popup.classList.remove('open');
});

/* ============================================================
   CONFLICT 3 OF 3 — init() function signature and body opening
   ─────────────────────────────────────────────────────────────
   LOCATION: the IIFE at the bottom of the file that boots the
   quiz on page load.

   OUR SIDE (HEAD):
     (async function init() {
       initAuth();
       updateLangButtons();
       updateStaticText();
       await fetchQuestions();
       ...

     The function was async because it needs to await
     fetchQuestions() before rendering the first question.
     It had no animation setup because Valentino's branch
     didn't exist yet when we wrote this.

   VALENTINO'S SIDE:
     (function init() {
       preloadAnimationFrames();
       quizHeaderAnimator = new LoopingFrameAnimator('#quiz-animation-frame', 8);
       resultsHeaderAnimator = new LoopingFrameAnimator('#results-animation-frame', 8);
       initAuth();
       updateLangButtons();
       updateStaticText();
       ...

     Not async (Valentino didn't have fetchQuestions in his
     branch). Added three animation bootstrap calls at the top:
     preload all SVG frames into the browser cache, and
     instantiate the two LoopingFrameAnimator instances that
     every animation function depends on.

   WHY BOTH ARE KEPT:
     - async is required: without it, `await fetchQuestions()`
       becomes a syntax error and questions never load.
     - Valentino's three lines are required: quizHeaderAnimator
       and resultsHeaderAnimator are module-level variables that
       updateQuizHeaderAnimation() and updateResultsHeaderAnimation()
       call `.play()` on. If they are undefined when those
       functions run, the page throws a TypeError and the
       stickman never appears.
     - preloadAnimationFrames() is optional but harmless —
       it just warms the browser image cache so frames don't
       flicker on first play.

   RESOLUTION:
     Kept `async function init()` from our side.
     Added Valentino's three animation bootstrap lines at the
     very top of the function body, before initAuth(), so the
     animators exist before any function that uses them runs.
   ─────────────────────────────────────────────────────────────
*/
(async function init() {
  // VALENTINO'S CODE — must run first so quizHeaderAnimator and
  // resultsHeaderAnimator exist before updateStaticText() calls them.
  preloadAnimationFrames();
  quizHeaderAnimator    = new LoopingFrameAnimator('#quiz-animation-frame', 8);
  resultsHeaderAnimator = new LoopingFrameAnimator('#results-animation-frame', 8);

  // OUR CODE — auth, language, and question loading.
  initAuth();
  updateLangButtons();
  updateStaticText();

  // CHANGED: fetch questions from DB before rendering
  await fetchQuestions();

  const params = new URLSearchParams(window.location.search);

  if (params.get('showResults') === 'true') {
    // Restore saved answers from before the login redirect
    const savedAnswers = localStorage.getItem('quiz_pending_answers');
    const savedLang    = localStorage.getItem('quiz_pending_lang');

    if (savedAnswers) {
      try {
        quizState.answers = JSON.parse(savedAnswers);
      } catch (e) {
        console.warn('Could not restore quiz answers:', e);
      }
    }

    if (savedLang) {
      currentLang = savedLang;
      updateLangButtons();
    }

    quizState.showResults = true;
    submitAndShowResults();
  } else {
    // Add card-enter before renderQuestion so the card animates in on first paint
    const card = document.getElementById('question-card');
    if (card) card.classList.add('card-enter');
    renderQuestion('forward');
    updateProgressBar();
  }
})();