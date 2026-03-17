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
const questionsData = {
  nl: [
    {
      id: 'diplomas',
      type: 'multiple',
      question: 'Welke diploma\'s heb jij behaald?',
      instruction: 'Selecteer alle die van toepassing zijn',
      options: ['MULO', 'LBO / LTO', 'HAVO', 'VWO', 'MBO', 'HBO', 'Universitair diploma', 'NATIN diploma', 'Geen diploma']
    },
    {
      id: 'certificates',
      type: 'multiple',
      question: 'Heb je certificaten of extra opleidingen gevolgd?',
      instruction: 'Selecteer alle die van toepassing zijn',
      options: ['ICT certificaten (bijv. CISCO, CompTIA)', 'Talenopleidingen (bijv. Engels, Spaans)', 'Bedrijfskunde / Management cursus', 'Gezondheidszorg cursus', 'Technische cursus (bijv. lassen, elektra)', 'Landbouw / Natuur cursus', 'Juridische / Bestuurskunde cursus', 'Onderwijscursus / Pedagogie', 'Geen certificaten']
    },
    {
      id: 'educationStatus',
      type: 'single',
      question: 'Wat is jouw huidige situatie?',
      instruction: 'Selecteer één optie',
      options: ['Ik studeer momenteel', 'Ik heb mijn studie net afgerond', 'Ik werk en wil verder studeren', 'Ik ben op zoek naar mijn eerste studie', 'Ik wil wisselen van studierichting']
    },
    {
      id: 'interests',
      type: 'multiple',
      question: 'Wat zijn jouw interesses?',
      instruction: 'Selecteer alle die van toepassing zijn',
      options: ['Technologie en computers', 'Gezondheidszorg en medisch', 'Economie en business', 'Onderwijs en jongeren', 'Natuur en milieu', 'Recht en bestuur', 'Kunst en creatief', 'Landbouw en biologie', 'Sociale wetenschappen en hulpverlening']
    },
    {
      id: 'subjectStrengths',
      type: 'multiple',
      question: 'In welke vakken ben jij sterk?',
      instruction: 'Selecteer alle die van toepassing zijn',
      options: ['Wiskunde', 'Informatica / Computer Science', 'Biologie', 'Scheikunde', 'Natuur- en Scheikunde', 'Economie', 'Geschiedenis', 'Talen (Nederlands, Engels)', 'Aardrijkskunde', 'Maatschappijleer']
    },
    {
      id: 'learningStyle',
      type: 'single',
      question: 'Hoe leer jij het liefst?',
      instruction: 'Selecteer één optie',
      options: ['Praktisch: met mijn handen werken en direct toepassen', 'Theoretisch: lezen, schrijven en analyseren', 'Mix van theorie en praktijk', 'Door samenwerken in groepsverband', 'Door opdrachten zelfstandig uit te voeren']
    },
    {
      id: 'preferredField',
      type: 'single',
      question: 'In welk werkveld wil jij later werken?',
      instruction: 'Selecteer één optie',
      options: ['ICT en Technologie', 'Gezondheidszorg en Medisch', 'Business en Economie', 'Onderwijs en Pedagogie', 'Natuur- en Milieuwetenschappen', 'Recht en Bestuur', 'Landbouw en Biologie', 'Sociale Wetenschappen']
    },
    {
      id: 'careerDirection',
      type: 'single',
      question: 'Wat is voor jou het belangrijkst in je toekomstige carrière?',
      instruction: 'Selecteer één optie',
      options: ['Hoog salaris en carrièremogelijkheden', 'Mensen helpen en sociaal werk doen', 'Creatief en innovatief werk', 'Maatschappelijke impact maken', 'Stabiliteit en zekerheid', 'Ondernemerschap en vrijheid']
    }
  ],
  en: [
    {
      id: 'diplomas',
      type: 'multiple',
      question: 'Which diplomas have you completed?',
      instruction: 'Select all that apply',
      options: ['MULO', 'LBO / LTO', 'HAVO', 'VWO', 'MBO', 'HBO', 'University degree', 'NATIN diploma', 'No diploma']
    },
    {
      id: 'certificates',
      type: 'multiple',
      question: 'Do you have any certificates or extra training?',
      instruction: 'Select all that apply',
      options: ['ICT certificates (e.g. CISCO, CompTIA)', 'Language courses (e.g. English, Spanish)', 'Business / Management course', 'Healthcare course', 'Technical course (e.g. welding, electrical)', 'Agriculture / Nature course', 'Legal / Public Administration course', 'Education course / Pedagogy', 'No certificates']
    },
    {
      id: 'educationStatus',
      type: 'single',
      question: 'What is your current situation?',
      instruction: 'Select one option',
      options: ['I am currently studying', 'I recently finished my studies', 'I am working and want to continue studying', 'I am looking for my first study program', 'I want to change my field of study']
    },
    {
      id: 'interests',
      type: 'multiple',
      question: 'What are your interests?',
      instruction: 'Select all that apply',
      options: ['Technology and computers', 'Healthcare and medical', 'Economics and business', 'Education and youth', 'Nature and environment', 'Law and governance', 'Art and creative work', 'Agriculture and biology', 'Social sciences and welfare']
    },
    {
      id: 'subjectStrengths',
      type: 'multiple',
      question: 'Which subjects are you strong in?',
      instruction: 'Select all that apply',
      options: ['Mathematics', 'Computer Science / ICT', 'Biology', 'Chemistry', 'Physics', 'Economics', 'History', 'Languages (Dutch, English)', 'Geography', 'Social Studies']
    },
    {
      id: 'learningStyle',
      type: 'single',
      question: 'How do you prefer to learn?',
      instruction: 'Select one option',
      options: ['Practically: hands-on and direct application', 'Theoretically: reading, writing and analysis', 'Mix of theory and practice', 'Through collaboration in groups', 'By completing tasks independently']
    },
    {
      id: 'preferredField',
      type: 'single',
      question: 'Which field do you want to work in?',
      instruction: 'Select one option',
      options: ['ICT and Technology', 'Healthcare and Medical', 'Business and Economics', 'Education and Pedagogy', 'Natural and Environmental Sciences', 'Law and Governance', 'Agriculture and Biology', 'Social Sciences']
    },
    {
      id: 'careerDirection',
      type: 'single',
      question: 'What matters most to you in your future career?',
      instruction: 'Select one option',
      options: ['High salary and career opportunities', 'Helping people and social work', 'Creative and innovative work', 'Making a social impact', 'Stability and security', 'Entrepreneurship and freedom']
    }
  ]
};

//raksha removed programs data

//raksha removed school id map and program id map

/* ============================================================
   QUIZ STATE
============================================================ */
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

function updateStaticText() {
  const t = translations[currentLang];
  document.getElementById('page-title').textContent = t.title;
  document.getElementById('page-subtitle').textContent = t.subtitle;
  document.getElementById('prev-label').textContent = t.previous;
  document.getElementById('results-title').textContent = t.resultsTitle;
  document.getElementById('results-subtitle').textContent = t.resultsSubtitle;
  document.getElementById('badge-text').textContent = t.quizCompleted;
  document.getElementById('retake-btn').textContent = t.retake;
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
function renderQuestion() {
  const questions = questionsData[currentLang];
  const q   = questions[quizState.currentQuestion];
  const t   = translations[currentLang];
  const ans = quizState.answers[q.id];

  // Fade out
  const card = document.getElementById('question-card');
  card.style.opacity = '0';

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

    // Fade in
    card.style.opacity = '1';

    updateNavigationButtons();
  }, 150);
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
    renderQuestion();
    updateProgressBar();
    scrollToTop();
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
    renderQuestion();
    updateProgressBar();
    scrollToTop();
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
//raksha deleted eniter calculateRecommendations()
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

  const list = document.getElementById('recommendations-list');

  if (!programs || programs.length === 0) {
    list.innerHTML = `
      <div class="no-results">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p>${t.noResults}</p>
      </div>`;
    return;
  }

  list.innerHTML = programs.map((rec, i) => `
    <div class="rec-card">
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
  renderQuestion();
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
  // popup-role removed — not present in the rich popup
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

document.addEventListener('click', () => {
  const popup = document.getElementById('profile-popup');
  if (popup) popup.classList.remove('open');
});

/* ============================================================
   INIT
   — If the URL has ?showResults=true, the user was redirected
     back here after logging in. Restore their saved answers
     and go straight to results.
============================================================ */
(function init() {
  initAuth();
  updateLangButtons();
  updateStaticText();

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
    renderQuestion();
    updateProgressBar();
  }
})();