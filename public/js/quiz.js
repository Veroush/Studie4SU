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

/* ============================================================
   PROGRAMS DATA
   These match your actual seeded programs.
   field and keywords drive the scoring algorithm.
============================================================ */
const programsData = {
  nl: [
    {
      id: 'program_technology',
      title: 'HBO Informatica / Software Engineering',
      school: 'NATIN',
      description: 'Geavanceerde opleiding in softwareontwikkeling, netwerken en IT-infrastructuur. Je leert programmeren, databases beheren en IT-systemen bouwen.',
      requiredDiploma: 'HAVO/VWO/NATIN',
      field: 'ICT en Technologie',
      keywords: ['technologie', 'computers', 'wiskunde', 'informatica', 'ict'],
      level: 'HBO'
    },
    {
      id: 'program_medical',
      title: 'Geneeskunde & Gezondheidswetenschappen',
      school: 'Anton de Kom Universiteit (AdeKUS)',
      description: 'Opleiding tot arts of gezondheidsspecialist. Gericht op biologie, scheikunde en het helpen van patiënten.',
      requiredDiploma: 'HAVO/VWO',
      field: 'Gezondheidszorg en Medisch',
      keywords: ['gezondheidszorg', 'medisch', 'biologie', 'scheikunde', 'mensen helpen'],
      level: 'Universiteit'
    },
    {
      id: 'program_business',
      title: 'Bedrijfskunde / Business Administration',
      school: 'Anton de Kom Universiteit (AdeKUS)',
      description: 'Leer bedrijven leiden, financiën beheren en strategieën ontwikkelen. Ideaal voor toekomstige managers en ondernemers.',
      requiredDiploma: 'HAVO/VWO',
      field: 'Business en Economie',
      keywords: ['economie', 'business', 'management', 'hoog salaris', 'ondernemen'],
      level: 'Universiteit'
    },
    {
      id: 'program_social_work',
      title: 'Sociaal Werk',
      school: 'Anton de Kom Universiteit (AdeKUS)',
      description: 'Help kwetsbare groepen in de samenleving. Leer sociale problemen analyseren en oplossingen bieden voor individuen en gemeenschappen.',
      requiredDiploma: 'HAVO/VWO',
      field: 'Sociale Wetenschappen',
      keywords: ['sociaal', 'mensen helpen', 'maatschappij', 'welzijn', 'jongeren'],
      level: 'HBO'
    },
    {
      id: 'program_education',
      title: 'Lerarenopleiding',
      school: 'Instituut voor de Opleiding van Leraren (IOL)',
      description: 'Word een gecertificeerde leraar voor het basis- of voortgezet onderwijs. Leer lesgeven, didactiek en pedagogiek.',
      requiredDiploma: 'HAVO/VWO',
      field: 'Onderwijs en Pedagogie',
      keywords: ['onderwijs', 'jongeren', 'talen', 'pedagogie', 'maatschappijleer'],
      level: 'HBO'
    },
    {
      id: 'program_science',
      title: 'Agronomie & Natuurwetenschappen',
      school: 'COVAB',
      description: 'Bestudeer landbouw, ecologie en biologische wetenschappen. Werk aan voedselzekerheid en milieubeheer in Suriname.',
      requiredDiploma: 'HAVO/VWO',
      field: 'Natuur- en Milieuwetenschappen',
      keywords: ['natuur', 'landbouw', 'biologie', 'milieu', 'scheikunde', 'aardrijkskunde'],
      level: 'HBO'
    },
    {
      id: 'program_law',
      title: 'Rechten & Bestuurskunde',
      school: 'Anton de Kom Universiteit (AdeKUS)',
      description: 'Leer de juridische en bestuurlijke grondslagen van Suriname. Werk als advocaat, rechter of overheidsambtenaar.',
      requiredDiploma: 'HAVO/VWO',
      field: 'Recht en Bestuur',
      keywords: ['recht', 'bestuur', 'maatschappijleer', 'geschiedenis', 'talen'],
      level: 'Universiteit'
    }
  ],
  en: [
    {
      id: 'program_technology',
      title: 'HBO Computer Science / Software Engineering',
      school: 'NATIN',
      description: 'Advanced training in software development, networking, and IT infrastructure. You will learn programming, database management, and building IT systems.',
      requiredDiploma: 'HAVO/VWO/NATIN',
      field: 'ICT and Technology',
      keywords: ['technology', 'computers', 'mathematics', 'computer science', 'ict'],
      level: 'HBO'
    },
    {
      id: 'program_medical',
      title: 'Medicine & Health Sciences',
      school: 'Anton de Kom University (AdeKUS)',
      description: 'Training to become a doctor or health specialist. Focused on biology, chemistry and helping patients.',
      requiredDiploma: 'HAVO/VWO',
      field: 'Healthcare and Medical',
      keywords: ['healthcare', 'medical', 'biology', 'chemistry', 'helping people'],
      level: 'University'
    },
    {
      id: 'program_business',
      title: 'Business Administration',
      school: 'Anton de Kom University (AdeKUS)',
      description: 'Learn to manage businesses, handle finances and develop strategies. Ideal for future managers and entrepreneurs.',
      requiredDiploma: 'HAVO/VWO',
      field: 'Business and Economics',
      keywords: ['economics', 'business', 'management', 'high salary', 'entrepreneurship'],
      level: 'University'
    },
    {
      id: 'program_social_work',
      title: 'Social Work',
      school: 'Anton de Kom University (AdeKUS)',
      description: 'Help vulnerable groups in society. Learn to analyse social problems and provide solutions for individuals and communities.',
      requiredDiploma: 'HAVO/VWO',
      field: 'Social Sciences',
      keywords: ['social', 'helping people', 'society', 'welfare', 'youth'],
      level: 'HBO'
    },
    {
      id: 'program_education',
      title: 'Teacher Training',
      school: 'Instituut voor de Opleiding van Leraren (IOL)',
      description: 'Become a certified teacher for primary or secondary education. Learn teaching methods, didactics, and pedagogy.',
      requiredDiploma: 'HAVO/VWO',
      field: 'Education and Pedagogy',
      keywords: ['education', 'youth', 'languages', 'pedagogy', 'social studies'],
      level: 'HBO'
    },
    {
      id: 'program_science',
      title: 'Agronomy & Natural Sciences',
      school: 'COVAB',
      description: 'Study agriculture, ecology and biological sciences. Work on food security and environmental management in Suriname.',
      requiredDiploma: 'HAVO/VWO',
      field: 'Natural and Environmental Sciences',
      keywords: ['nature', 'agriculture', 'biology', 'environment', 'chemistry', 'geography'],
      level: 'HBO'
    },
    {
      id: 'program_law',
      title: 'Law & Governance',
      school: 'Anton de Kom University (AdeKUS)',
      description: 'Learn the legal and administrative foundations of Suriname. Work as a lawyer, judge, or civil servant.',
      requiredDiploma: 'HAVO/VWO',
      field: 'Law and Governance',
      keywords: ['law', 'governance', 'social studies', 'history', 'languages'],
      level: 'University'
    }
  ]
};

/* ============================================================
   SCHOOL ID MAP
   Maps quiz program IDs to real DB school IDs for linking
============================================================ */
const PROGRAM_SCHOOL_MAP = {
  program_technology:  'school_natin',
  program_medical:     'school_adekus',
  program_business:    'school_adekus',
  program_social_work: 'school_adekus',
  program_education:   'school_iol',
  program_science:     'school_covab',
  program_law:         'school_adekus',
};

/* ============================================================
   PROGRAM ID MAP
   Maps quiz program IDs to real seeded DB program IDs.
   Used to link "Bekijk Programma" button to program-detail.html
============================================================ */
const PROGRAM_ID_MAP = {
  program_technology:  'prog_aa6',   // Electrotechniek — AdekUS
  program_medical:     'prog_aa8',   // Geneeskunde — AdekUS
  program_business:    'prog_aa2',   // Bedrijfskunde — AdekUS
  program_social_work: 'prog_aa17',  // Psychologie — AdekUS
  program_education:   'prog_aa16',  // Onderwijs- en Pedagogische Wetenschappen — AdekUS
  program_science:     'prog_aa3',   // Biologie — AdekUS
  program_law:         'prog_aa20',  // Rechtswetenschappen — AdekUS
};

/* ============================================================
   QUIZ STATE
============================================================ */


/* ============================================================
   STICKMAN HEADER ANIMATIONS
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

function updateStaticText() {
  const t = translations[currentLang];
  document.getElementById('page-title').textContent = t.title;
  document.getElementById('page-subtitle').textContent = t.subtitle;
  document.getElementById('prev-label').textContent = t.previous;
  document.getElementById('results-title').textContent = t.resultsTitle;
  document.getElementById('results-subtitle').textContent = t.resultsSubtitle;
  document.getElementById('badge-text').textContent = t.quizCompleted;
  document.getElementById('retake-btn').textContent = t.retake;

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

/* ============================================================
   SUBMIT TO BACKEND (optional — falls back gracefully)
============================================================ */
async function submitAndShowResults() {
  // ── LOGIN GATE ──────────────────────────────────────────────
  // If the user is not logged in, save their answers and redirect
  // to the login page. After login/register they'll be sent back
  // here with ?showResults=true and the answers will be restored.
  if (!isLoggedIn()) {
    localStorage.setItem('quiz_pending_answers', JSON.stringify(quizState.answers));
    localStorage.setItem('quiz_pending_lang', currentLang);
    window.location.href = 'login.html?redirect=quiz-results';
    return;
  }

  // User is logged in — show results immediately
  renderResults();

  // Also try to save to backend (fire-and-forget, won't break the page)
  try {
    const recs = calculateRecommendations();
    if (recs.length > 0) {
      const topProgramId = recs[0].id;
      await fetch('/api/quiz/submit-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: quizState.answers,
          topProgramId: topProgramId,
          scores: buildClusterScores(recs)
        })
      });
    }
  } catch (err) {
    // Silent fail — results are already shown locally
    console.log('Backend save skipped:', err.message);
  }
}

// Helper: build rough cluster scores from recommendation matches
function buildClusterScores(recs) {
  const clusterMap = {
    'program_technology': 'TECH',
    'program_medical':    'MED',
    'program_business':   'BUS',
    'program_social_work':'SOC',
    'program_education':  'EDU',
    'program_science':    'SCI',
    'program_law':        'LAW'
  };
  const scores = { TECH:0, MED:0, BUS:0, SOC:0, EDU:0, SCI:0, LAW:0 };
  recs.forEach(r => {
    const cluster = clusterMap[r.id];
    if (cluster) scores[cluster] = r.match;
  });
  return scores;
}

/* ============================================================
   SCORING ALGORITHM
============================================================ */
function calculateRecommendations() {
  const programs = programsData[currentLang];
  const t = translations[currentLang];
  const a = quizState.answers;

  // 1. Determine user's education level
  const highLevelKeywords = ['HAVO', 'VWO', 'HBO', 'Universit', 'NATIN'];
  const hasHighLevel = a.diplomas.some(d =>
    highLevelKeywords.some(k => d.toUpperCase().includes(k.toUpperCase()))
  );
  const midLevelKeywords = ['MULO', 'LBO', 'LTO', 'MBO'];
  const hasMidLevel = a.diplomas.some(d =>
    midLevelKeywords.some(k => d.toUpperCase().includes(k.toUpperCase()))
  );

  // 2. Filter eligible programs
  const eligible = programs.filter(p => {
    const req = p.requiredDiploma.toUpperCase();
    if (req.includes('HAVO') || req.includes('VWO')) return hasHighLevel;
    return hasMidLevel || hasHighLevel; // MBO-level programs open to all
  });

  if (eligible.length === 0) return [];

  // 3. Score each program
  const scored = eligible.map(p => {
    let score = 0;
    const reasons = [];

    // Preferred field (30 pts)
    if (a.preferredField && p.field.toLowerCase().includes(a.preferredField.toLowerCase().split(' ')[0])) {
      score += 30;
      reasons.push(t.reason_field);
    }

    // Interest match (25 pts)
    const interestMatch = a.interests.some(interest =>
      p.keywords.some(kw => interest.toLowerCase().includes(kw) || kw.includes(interest.toLowerCase().split(' ')[0]))
    );
    if (interestMatch) { score += 25; reasons.push(t.reason_interest); }

    // Subject strengths (20 pts)
    const subjectMatch = a.subjectStrengths.some(subj =>
      p.keywords.some(kw => subj.toLowerCase().includes(kw) || kw.includes(subj.toLowerCase().split(' ')[0]))
    );
    if (subjectMatch) { score += 20; reasons.push(t.reason_subjects); }

    // Certificates (15 pts)
    const certMatch = a.certificates.some(cert =>
      p.keywords.some(kw => cert.toLowerCase().includes(kw) || kw.includes(cert.toLowerCase().split(' ')[0]))
    );
    if (certMatch) { score += 15; reasons.push(t.reason_certificates); }

    // Learning style (10 pts)
    if (a.learningStyle && a.learningStyle.toLowerCase().includes('praktisch') || (a.learningStyle && a.learningStyle.toLowerCase().includes('hands'))) {
      if (p.level === 'HBO' || p.level === 'MBO') {
        score += 10; reasons.push(t.reason_learning_style);
      }
    }

    // Career direction (10 pts)
    if (a.careerDirection && (a.careerDirection.toLowerCase().includes('salaris') || a.careerDirection.toLowerCase().includes('salary'))) {
      if (p.keywords.some(k => k.includes('business') || k.includes('ict') || k.includes('management') || k.includes('economie'))) {
        score += 10; reasons.push(t.reason_career);
      }
    }

    const finalScore = Math.min(95, score + 40);

    return {
      ...p,
      match: finalScore,
      reasons: reasons.length > 0 ? reasons : [t.reason_default]
    };
  });

  // 4. Sort by score, take top 5
  return scored.sort((a, b) => b.match - a.match).slice(0, 5);
}

/* ============================================================
   RENDER RESULTS
============================================================ */
function renderResults() {
  const t = translations[currentLang];
  const recs = calculateRecommendations();

  // Hide quiz, show results
  document.getElementById('quiz-section').style.display = 'none';
  document.getElementById('results-container').style.display = 'block';

  // Update header text
  document.getElementById('results-title').textContent = t.resultsTitle;
  document.getElementById('results-subtitle').textContent = t.resultsSubtitle;
  document.getElementById('badge-text').textContent = t.quizCompleted;
  document.getElementById('retake-btn').textContent = t.retake;
  updateResultsHeaderAnimation();

  const list = document.getElementById('recommendations-list');

  if (recs.length === 0) {
    list.innerHTML = `
      <div class="no-results">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p>${t.noResults}</p>
      </div>`;
    return;
  }

  list.innerHTML = recs.map((rec, i) => {
    const schoolId  = PROGRAM_SCHOOL_MAP[rec.id] || '';
    const programId = PROGRAM_ID_MAP[rec.id] || '';
    const slideDir  = i % 2 === 0 ? 'left' : 'right';
    return `
    <div class="rec-card" data-slide="${slideDir}">
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
            <p class="info-box-label"><strong>${t.requiredLevel}</strong> ${rec.requiredDiploma}</p>
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
            <button class="btn-primary" onclick="window.location.href='school-detail.html?id=${schoolId}'">${t.viewSchool}</button>
            <button class="btn-secondary" onclick="window.location.href='program-detail.html?id=${programId}'" ${!programId ? 'disabled' : ''}>${t.viewProgram}</button>
          </div>
        </div>
      </div>
    </div>
  `;}
  ).join('');

  // Clean up pending answers from localStorage now that we've shown results
  localStorage.removeItem('quiz_pending_answers');
  localStorage.removeItem('quiz_pending_lang');

  // Scroll-triggered slide-in for each rec-card
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

document.addEventListener('click', (e) => {
  const popup = document.getElementById('profile-popup');
  const wrap  = document.getElementById('profile-btn');
  if (popup && wrap && !wrap.contains(e.target)) popup.classList.remove('open');
});

/* ============================================================
   INIT
   — If the URL has ?showResults=true, the user was redirected
     back here after logging in. Restore their saved answers
     and go straight to results.
============================================================ */
(function init() {
  preloadAnimationFrames();
  quizHeaderAnimator = new LoopingFrameAnimator('#quiz-animation-frame', 8);
  resultsHeaderAnimator = new LoopingFrameAnimator('#results-animation-frame', 8);

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
    renderResults();
  } else {
    // Add card-enter before renderQuestion so the card animates in on first paint
    const card = document.getElementById('question-card');
    if (card) card.classList.add('card-enter');
    renderQuestion('forward');
    updateProgressBar();
  }
})();