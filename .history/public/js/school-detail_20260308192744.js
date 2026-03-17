'use strict';

// ── State ─────────────────────────────────────────────────────
let language     = localStorage.getItem('language') || 'nl';
let favorites    = JSON.parse(localStorage.getItem('fav_schools') || '[]');
let compareItems = JSON.parse(localStorage.getItem('school_compare')   || '[]');
let currentSchool = null;
let currentOpenHouses = [];

// Get school ID from URL ?id=school_adekus
const params   = new URLSearchParams(window.location.search);
const schoolId = params.get('id') || '';

// ── Translations ──────────────────────────────────────────────
const T = {
  nl: {
    back:            '← Terug naar scholen',
    addFav:          'Favoriet',
    removeFav:       'Verwijder favoriet',
    addCompare:      'Vergelijk',
    removeCompare:   'Stop vergelijking',
    about:           'Over deze school',
    programs:        'Aangeboden opleidingen',
    facilities:      'Faciliteiten',
    services:        'Studentendiensten',
    accreditation:   'Accreditatie',
    contact:         'Contactgegevens',
    social:          'Sociale media',
    deadlines:       'Belangrijke deadlines',
    openHouses:      'Open Dagen',
    registerBtn:     'Aanmelden voor open dag',
    noOpenHouses:    'Geen open dagen gepland.',
    careers:         'Carrièremogelijkheden:',
    free:            'Gratis (overheidsbekostiging)',
    noPrograms:      'Geen opleidingen gevonden.',
    address:         'Adres',
    phone:           'Telefoon',
    email:           'E-mail',
    website:         'Website',
    errorTitle:      'School niet gevonden',
    errorSub:        'Controleer of de URL correct is en de server actief.',
    online:          'Online',
  },
  en: {
    back:            '← Back to schools',
    addFav:          'Favorite',
    removeFav:       'Remove favorite',
    addCompare:      'Compare',
    removeCompare:   'Stop comparing',
    about:           'About this school',
    programs:        'Offered Programs',
    facilities:      'Facilities',
    services:        'Student Services',
    accreditation:   'Accreditation',
    contact:         'Contact Information',
    social:          'Social Media',
    deadlines:       'Important Deadlines',
    openHouses:      'Open Houses',
    registerBtn:     'Register for open house',
    noOpenHouses:    'No open houses scheduled.',
    careers:         'Career paths:',
    free:            'Free (Government Funded)',
    noPrograms:      'No programs found.',
    errorTitle:      'School not found',
    errorSub:        'Check that the URL is correct and the server is running.',
    address:         'Address',
    phone:           'Phone',
    email:           'Email',
    website:         'Website',
    online:          'Online',
  }
};

// ── Enrichment data (descriptions, contact, facilities etc.) ──
// Since the backend doesn't store all this info yet, we enrich
// with local data keyed by school ID.
const SCHOOL_DATA = {
  school_adekus: {
    description: {
      nl: 'De Anton de Kom Universiteit van Suriname (AdeKUS) is de enige universiteit in Suriname. Opgericht in 1968, biedt zij opleidingen aan in geneeskunde, rechten, technologie, sociale wetenschappen en meer. De universiteit streeft naar excellentie in onderwijs en onderzoek voor de Surinaamse samenleving.',
      en: 'Anton de Kom University of Suriname (AdeKUS) is the only university in Suriname. Founded in 1968, it offers programs in medicine, law, technology, social sciences and more. The university strives for excellence in education and research for Surinamese society.',
    },
    contact: { address: 'Leysweg 86, Paramaribo, Suriname', phone: '+597 465 558', email: 'info@adekus.edu.sr', website: 'adekus.edu.sr' },
    social: { facebook: 'adekusofficial', instagram: 'adekus_sr', youtube: 'adekusSuriname' },
    facilities: { nl: ['Medisch Laboratorium','Bibliotheek','Sportfaciliteiten','Computercentra','Studentenlounge','Auditoria','Cafetaria','WiFi campus'], en: ['Medical Laboratory','Library','Sports Facilities','Computer Centers','Student Lounge','Auditoriums','Cafeteria','WiFi campus'] },
    services:   { nl: ['Studiebegeleiding','Studentenadvies','Beurzen & financiering','Internationale uitwisseling','Loopbaandiensten','Psychologische hulp'], en: ['Academic Guidance','Student Counseling','Scholarships & Funding','International Exchange','Career Services','Psychological Support'] },
    accreditation: { nl: 'Erkend door het Ministerie van Onderwijs van Suriname. AdeKUS-diploma\'s worden internationaal erkend via samenwerkingsovereenkomsten met universiteiten in Nederland, de VS en de Cariben.', en: 'Accredited by the Surinamese Ministry of Education. AdeKUS degrees are internationally recognized through partnerships with universities in the Netherlands, USA and the Caribbean.' },
    deadlines: {
      nl: [{ title: 'Aanmelding geneeskunde', date: '1 april 2026' },{ title: 'Aanmelding overige opleidingen', date: '1 juni 2026' },{ title: 'Collegegeld betaling', date: '1 augustus 2026' }],
      en: [{ title: 'Medicine registration', date: 'April 1, 2026' },{ title: 'Other programs registration', date: 'June 1, 2026' },{ title: 'Tuition payment', date: 'August 1, 2026' }],
    },
    type: 'University',
  },
  school_natin: {
    description: {
      nl: 'Het Natuurtechnisch Instituut (NATIN) is een toonaangevend HBO-instituut gespecialiseerd in technische en exacte vakken. NATIN leidt studenten op tot competente professionals in ICT, engineering en de exacte wetenschappen.',
      en: 'The Natural Technical Institute (NATIN) is a leading HBO institute specializing in technical and exact sciences. NATIN trains students to become competent professionals in ICT, engineering and the exact sciences.',
    },
    contact: { address: 'Dr. Sophie Redmondstraat 118, Paramaribo', phone: '+597 490 420', email: 'info@natin.edu.sr', website: 'natin.edu.sr' },
    social: { facebook: 'natinsuriname', instagram: 'natin_sr', youtube: null },
    facilities: { nl: ['ICT-laboratoria','Technische werkplaatsen','Bibliotheek','WiFi campus','Computercentra','Studieruimten'], en: ['ICT Labs','Technical Workshops','Library','WiFi campus','Computer Centers','Study Rooms'] },
    services:   { nl: ['Technische studiebegeleiding','Stageplaatsing','Beurzen','Loopbaanbegeleiding'], en: ['Technical Academic Support','Internship Placement','Scholarships','Career Guidance'] },
    accreditation: { nl: 'Erkend door het Ministerie van Onderwijs. NATIN-diploma\'s worden erkend door technische instellingen in de regio en zijn gericht op de arbeidsmarkt van Suriname en de Cariben.', en: 'Accredited by the Ministry of Education. NATIN degrees are recognized by technical institutions in the region and are aimed at the Surinamese and Caribbean labor market.' },
    deadlines: {
      nl: [{ title: 'Aanmelding nieuwe studenten', date: '1 mei 2026' },{ title: 'Inschrijving heraanmelders', date: '1 juli 2026' }],
      en: [{ title: 'New student registration', date: 'May 1, 2026' },{ title: 'Re-enrollment deadline', date: 'July 1, 2026' }],
    },
    type: 'HBO',
  },
  school_iol: {
    description: {
      nl: 'Het Instituut voor de Opleiding van Leraren (IOL) verzorgt de lerarenopleiding voor het Surinaamse onderwijs. IOL leidt bekwame docenten op die klaar zijn voor het moderne onderwijs in Suriname.',
      en: 'The Institute for Teacher Training (IOL) provides teacher education for the Surinamese education system. IOL trains competent teachers ready for modern education in Suriname.',
    },
    contact: { address: 'Heerenstraat 14, Paramaribo', phone: '+597 472 241', email: 'info@iol.edu.sr', website: 'iol.edu.sr' },
    social: { facebook: 'iolsuriname', instagram: null, youtube: null },
    facilities: { nl: ['Onderwijslaboratoria','Bibliotheek','Oefenklassen','WiFi campus'], en: ['Teaching Labs','Library','Practice Classrooms','WiFi campus'] },
    services:   { nl: ['Mentorprogramma','Stageplaatsing','Studiebegeleiding'], en: ['Mentor Program','Internship Placement','Academic Guidance'] },
    accreditation: { nl: 'Erkend door het Ministerie van Onderwijs van Suriname. IOL-diploma\'s zijn vereist voor onderwijsbevoegdheid in Suriname.', en: 'Accredited by the Surinamese Ministry of Education. IOL degrees are required for teaching certification in Suriname.' },
    deadlines: {
      nl: [{ title: 'Aanmelding nieuwe studenten', date: '15 mei 2026' }],
      en: [{ title: 'New student registration', date: 'May 15, 2026' }],
    },
    type: 'HBO',
  },
  school_covab: {
    description: {
      nl: 'Het College voor Agrarische en Biologische Wetenschappen (COVAB) biedt HBO-opleidingen in agronomie, biologie en milieuwetenschappen. COVAB speelt een sleutelrol in de agrarische ontwikkeling van Suriname.',
      en: 'The College for Agricultural and Biological Sciences (COVAB) offers HBO programs in agronomy, biology and environmental sciences. COVAB plays a key role in the agricultural development of Suriname.',
    },
    contact: { address: 'Leysweg 86, Paramaribo', phone: '+597 465 558', email: 'info@covab.edu.sr', website: 'covab.edu.sr' },
    social: { facebook: 'covabsuriname', instagram: null, youtube: null },
    facilities: { nl: ['Biologische laboratoria','Proefvelden','Bibliotheek','Gewasenkwekerij'], en: ['Biology Labs','Experimental Fields','Library','Plant Nursery'] },
    services:   { nl: ['Onderzoeksbegeleiding','Stageplaatsing','Beurzen'], en: ['Research Guidance','Internship Placement','Scholarships'] },
    accreditation: { nl: 'Erkend door het Ministerie van Onderwijs. Gelieerd aan de AdeKUS voor wetenschappelijk onderzoek.', en: 'Accredited by the Ministry of Education. Affiliated with AdeKUS for scientific research.' },
    deadlines: {
      nl: [{ title: 'Aanmelding nieuwe studenten', date: '1 juni 2026' }],
      en: [{ title: 'New student registration', date: 'June 1, 2026' }],
    },
    type: 'HBO',
  },
  school_imeao: {
    description: {
      nl: 'IMEAO is een MBO-instelling die praktijkgerichte opleidingen aanbiedt in economie, administratie, handel en secretariaat. IMEAO bereidt studenten voor op de beroepspraktijk in het Surinaamse bedrijfsleven.',
      en: 'IMEAO is an MBO institution offering practice-oriented programs in economics, administration, commerce and secretarial work. IMEAO prepares students for the professional world in Surinamese business.',
    },
    contact: { address: 'Heerenstraat 26, Paramaribo', phone: '+597 472 356', email: 'info@imeao.edu.sr', website: 'imeao.edu.sr' },
    social: { facebook: 'imeaosuriname', instagram: null, youtube: null },
    facilities: { nl: ['Kantoorsimulatie','Computerruimten','Bibliotheek','Studiezalen'], en: ['Office Simulation','Computer Rooms','Library','Study Halls'] },
    services:   { nl: ['Stageplaatsing','Loopbaanbegeleiding','Studiebegeleiding'], en: ['Internship Placement','Career Guidance','Academic Support'] },
    accreditation: { nl: 'Erkend door het Ministerie van Onderwijs van Suriname als MBO-instelling.', en: 'Accredited by the Surinamese Ministry of Education as an MBO institution.' },
    deadlines: {
      nl: [{ title: 'Aanmelding nieuwe studenten', date: '1 juni 2026' }],
      en: [{ title: 'New student registration', date: 'June 1, 2026' }],
    },
    type: 'MBO',
  },
  school_ptc: {
    description: {
      nl: 'Het Polytechnisch College Suriname (PTC) biedt technische MBO-opleidingen in bouwkunde, elektrotechniek, werktuigbouwkunde en meer. PTC bereidt studenten voor op praktijkwerk in de technische sector.',
      en: 'Polytechnical College Suriname (PTC) offers technical MBO programs in construction, electrical engineering, mechanical engineering and more. PTC prepares students for hands-on work in the technical sector.',
    },
    contact: { address: 'Jagernath Lachmonstraat 92, Paramaribo', phone: '+597 432 100', email: 'info@ptc.edu.sr', website: 'ptc.edu.sr' },
    social: { facebook: 'ptcsuriname', instagram: null, youtube: null },
    facilities: { nl: ['Technische werkplaatsen','Elektrische labo\'s','Computerruimten','Bouwlokalen'], en: ['Technical Workshops','Electrical Labs','Computer Rooms','Construction Classrooms'] },
    services:   { nl: ['Stageplaatsing','Praktijkbegeleiding','Loopbaandiensten'], en: ['Internship Placement','Practical Guidance','Career Services'] },
    accreditation: { nl: 'Erkend door het Ministerie van Onderwijs als erkend technisch MBO-college.', en: 'Accredited by the Ministry of Education as an accredited technical MBO college.' },
    deadlines: {
      nl: [{ title: 'Aanmelding nieuwe studenten', date: '15 juni 2026' }],
      en: [{ title: 'New student registration', date: 'June 15, 2026' }],
    },
    type: 'MBO',
  },
  school_igsr: {
    description: {
      nl: 'Het IGSR is een HBO-instituut voor gezondheidszorg dat opleidingen aanbiedt in verpleegkunde, verloskunde, paramedische zorg en andere zorgsectoren. IGSR levert een bijdrage aan de gezondheidszorg van Suriname.',
      en: 'IGSR is an HBO health sciences institute offering programs in nursing, midwifery, paramedical care and other healthcare sectors. IGSR contributes to healthcare in Suriname.',
    },
    contact: { address: 'Tourtonnelaan 4, Paramaribo', phone: '+597 471 200', email: 'info@igsr.edu.sr', website: 'igsr.edu.sr' },
    social: { facebook: 'igsrsuriname', instagram: 'igsr_sr', youtube: null },
    facilities: { nl: ['Ziekenhuissimulaties','Medische laboratoria','Bibliotheek','Studieruimten'], en: ['Hospital Simulations','Medical Labs','Library','Study Rooms'] },
    services:   { nl: ['Zorgstages','Studiebegeleiding','Loopbaandiensten','Beurzen'], en: ['Healthcare Internships','Academic Support','Career Services','Scholarships'] },
    accreditation: { nl: 'Erkend door het Ministerie van Volksgezondheid en het Ministerie van Onderwijs van Suriname.', en: 'Accredited by the Ministry of Public Health and the Ministry of Education of Suriname.' },
    deadlines: {
      nl: [{ title: 'Aanmelding verpleegkunde', date: '1 mei 2026' },{ title: 'Aanmelding overige zorgopleidingen', date: '1 juni 2026' }],
      en: [{ title: 'Nursing registration', date: 'May 1, 2026' },{ title: 'Other care programs registration', date: 'June 1, 2026' }],
    },
    type: 'HBO',
  },
};

// ── SVG Icons ─────────────────────────────────────────────────
const icons = {
  school:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  mapPin:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  heart:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
  heartFill:    `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
  compare:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 012 2v7"/><path d="M11 18H8a2 2 0 01-2-2V9"/></svg>`,
  building:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="2" width="18" height="20" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="10" y1="2" x2="10" y2="22"/></svg>`,
  graduation:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  wrench:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>`,
  users:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
  award:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>`,
  phone:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 11.5a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`,
  mail:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  globe:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>`,
  extLink:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
  calendar:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  alert:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  check:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  clock:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  briefcase:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>`,
  facebook:     `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>`,
  instagram:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
  youtube:      `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon fill="#fff" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>`,
};

// ── Format date ───────────────────────────────────────────────
function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return dateStr; }
}

// ── Fetch school from backend ─────────────────────────────────
async function loadSchool() {
  if (!schoolId) { renderError(); return; }

  try {
    const res = await fetch(`/admin/schools/${schoolId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    currentSchool = data;
  } catch (err) {
    console.warn('[Studie4SU] Backend unavailable, using fallback data:', err.message);
    const local = SCHOOL_DATA[schoolId];
    if (!local) { renderError(); return; }
    currentSchool = {
      id: schoolId,
      name: schoolId.replace('school_', '').toUpperCase(),
      type: local.type,
      location: 'Paramaribo',
      programs: [],
    };
    const names = { school_adekus: 'Anton de Kom Universiteit van Suriname', school_natin: 'Natuurtechnisch Instituut', school_iol: 'Instituut voor de Opleiding van Leraren', school_covab: 'College voor Agrarische en Biologische Wetenschappen', school_imeao: 'IMEAO', school_ptc: 'Polytechnical College Suriname', school_igsr: 'IGSR' };
    currentSchool.name = names[schoolId] || currentSchool.name;
  }

  // Load open houses for this school
  try {
    const res = await fetch(`/openhouses?schoolId=${schoolId}`);
    if (res.ok) currentOpenHouses = await res.json();
  } catch { /* silent */ }

  renderPage();
}

// ── Render error state ────────────────────────────────────────
function renderError() {
  const tx = T[language];
  document.getElementById('hero-section').innerHTML = `
    <div style="background:linear-gradient(to right,#16a34a,#15803d);padding:48px 24px;">
      <div style="max-width:1280px;margin:0 auto;text-align:center;color:#fff;padding:40px 0;">
        <div style="font-size:3rem;margin-bottom:16px;">🏫</div>
        <h1 style="font-family:'Playfair Display',serif;font-size:1.75rem;margin-bottom:8px;">${tx.errorTitle}</h1>
        <p style="color:rgba(255,255,255,.8);margin-bottom:20px;">${tx.errorSub}</p>
        <a href="schools.html" style="display:inline-block;padding:10px 20px;background:rgba(255,255,255,.2);color:#fff;border-radius:10px;text-decoration:none;">${tx.back}</a>
      </div>
    </div>`;
  document.getElementById('content-section').innerHTML = '';
}

// ── Render full page ──────────────────────────────────────────
function renderPage() {
  const tx     = T[language];
  const school = currentSchool;
  const local  = SCHOOL_DATA[schoolId] || {};
  const isFav  = favorites.includes(school.id);
  const isCmp  = compareItems.includes(school.id);

  document.title = `${school.name} – Studie4SU`;

  // ── HERO ──────────────────────────────────────────────────
  document.getElementById('hero-section').innerHTML = `
    <div class="hero">
      <div class="hero-inner">
        <a href="schools.html" class="back-link">
          ${icons.mapPin.replace('viewBox','style="width:16px;height:16px;" viewBox')} ${tx.back}
        </a>
        <div class="hero-layout">
          <div class="hero-left">
            <div class="school-icon-box">${icons.school}</div>
            <div>
              <h1 class="hero-title">${school.name}</h1>
              <div class="hero-meta">
                <span class="hero-meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  ${school.location || 'Suriname'}
                </span>
                <span class="type-badge">${school.type || 'HBO'}</span>
                <span class="hero-meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                  ${(school.programs?.length || school._count?.programs || 0)} ${language === 'nl' ? 'opleidingen' : 'programs'}
                </span>
              </div>
            </div>
          </div>
          <div class="hero-actions">
            <button class="btn-hero ${isFav ? 'fav-active' : ''}" id="btn-fav" onclick="toggleFavorite()">
              ${isFav ? icons.heartFill : icons.heart}
              <span>${isFav ? tx.removeFav : tx.addFav}</span>
            </button>
            <button class="btn-hero ${isCmp ? 'cmp-active' : ''}" id="btn-cmp" onclick="toggleCompare()">
              ${icons.compare}
              <span>${isCmp ? tx.removeCompare : tx.addCompare}</span>
            </button>
          </div>
        </div>
      </div>
    </div>`;

  // ── PROGRAMS CAROUSEL ────────────────────────────────────
  const programs = school.programs || [];
  const programsHTML = programs.length === 0
    ? `<p style="color:var(--gray-500);font-size:.9rem;">${tx.noPrograms}</p>`
    : `<div class="carousel" id="prog-carousel">
        <div class="carousel-track" id="carousel-track">
          ${programs.map((p, i) => `
          <div class="carousel-slide${i === 0 ? ' active' : ''}" data-index="${i}">
            <div class="program-card">
              <div class="program-header">
                <h3 class="program-name">${p.name}</h3>
                <div class="program-badges">
                  ${p.duration    ? `<span class="badge-duration">${p.duration}</span>` : ''}
                  ${p.tuitionCost ? `<span class="badge-tuition">${p.tuitionCost === '0' || p.tuitionCost === 'free' ? tx.free : p.tuitionCost}</span>` : `<span class="badge-tuition">${tx.free}</span>`}
                  ${p.levelRequired ? `<span class="badge-level-req">${p.levelRequired}</span>` : ''}
                </div>
              </div>
              ${p.description ? `<p class="program-desc">${p.description}</p>` : ''}
              ${p.careers ? `
              <div class="program-careers">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
                <span><strong>${tx.careers}</strong> ${p.careers}</span>
              </div>` : ''}
              <div style="margin-top:14px;">
                <a href="program-detail.html?id=${p.id}" class="prog-detail-link">
                  ${language === 'nl' ? 'Bekijk opleiding' : 'View program'} →
                </a>
              </div>
            </div>
          </div>`).join('')}
        </div>

        ${programs.length > 1 ? `
        <button class="carousel-btn carousel-prev" id="carousel-prev" aria-label="Vorige">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button class="carousel-btn carousel-next" id="carousel-next" aria-label="Volgende">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <div class="carousel-dots" id="carousel-dots">
          ${programs.map((_, i) => `<button class="carousel-dot${i === 0 ? ' active' : ''}" data-dot="${i}" aria-label="Opleiding ${i+1}"></button>`).join('')}
        </div>
        <div class="carousel-counter" id="carousel-counter">1 / ${programs.length}</div>
        ` : ''}
      </div>`;

  // ── FACILITIES / SERVICES ────────────────────────────────
  const facs = local.facilities?.[language] || local.facilities?.nl || [];
  const servs = local.services?.[language] || local.services?.nl || [];

  const facilitiesHTML = facs.map(f => `
    <div class="check-item">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--green-600);flex-shrink:0;">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      ${f}
    </div>`).join('');

  const servicesHTML = servs.map(s => `
    <div class="check-item">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--green-600);flex-shrink:0;">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      ${s}
    </div>`).join('');

  // ── OPEN HOUSES ──────────────────────────────────────────
  const openHousesHTML = currentOpenHouses.length === 0
    ? `<p class="oh-empty">${tx.noOpenHouses}</p>`
    : currentOpenHouses.slice(0, 2).map(oh => `
      <div class="oh-event">
        <div class="oh-date">${formatDate(oh.date)}</div>
        <div class="oh-meta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${oh.isOnline ? tx.online : (oh.location || school.location || 'Suriname')}
        </div>
        ${oh.description ? `<p class="oh-desc">${oh.description}</p>` : ''}
        <button class="btn-register" onclick="registerOH('${oh.id}', '${oh.title?.replace(/'/g,"\\'")}')">
          ${tx.registerBtn}
        </button>
      </div>`).join('');

  // ── CONTACT ──────────────────────────────────────────────
  const contact = local.contact || {};
  const social  = local.social  || {};
  const deadlines = local.deadlines?.[language] || local.deadlines?.nl || [];
  const accredText = local.accreditation?.[language] || local.accreditation?.nl || '';
  const description = local.description?.[language] || local.description?.nl || '';

  // ── ASSEMBLE CONTENT ──────────────────────────────────────
  document.getElementById('content-section').innerHTML = `

    <div class="content-wrapper">
      <div class="content-grid">

        <!-- ── MAIN COLUMN ── -->
        <div class="main-col">

          <!-- Open Houses (moved to top of main col) -->
          <div class="card" style="animation-delay:.05s">
            <h2 class="section-heading">
              ${icons.calendar}
              ${tx.openHouses}
            </h2>
            ${openHousesHTML}
          </div>

          <!-- About -->
          <div class="card" style="animation-delay:.1s">
            <h2 class="section-heading">
              ${icons.building}
              ${tx.about}
            </h2>
            <p class="about-text">${description || school.name}</p>
          </div>

          ${facs.length > 0 ? `
          <!-- Facilities -->
          <div class="card" style="animation-delay:.15s">
            <h2 class="section-heading">
              ${icons.wrench}
              ${tx.facilities}
            </h2>
            <div class="check-grid">${facilitiesHTML}</div>
          </div>` : ''}

          ${servs.length > 0 ? `
          <!-- Services -->
          <div class="card" style="animation-delay:.2s">
            <h2 class="section-heading">
              ${icons.users}
              ${tx.services}
            </h2>
            <div class="check-grid">${servicesHTML}</div>
          </div>` : ''}

          ${accredText ? `
          <!-- Accreditation -->
          <div class="accred-card" style="animation:fadeInUp .4s ease .25s both;">
            ${icons.award}
            <div>
              <div class="accred-title">${tx.accreditation}</div>
              <p class="accred-text">${accredText}</p>
            </div>
          </div>` : ''}

        </div><!-- /main col -->

        <!-- ── SIDEBAR ── -->
        <div class="side-col">

          <!-- Contact -->
          ${contact.phone || contact.email ? `
          <div class="card card-side" style="animation-delay:.08s">
            <h3 class="sidebar-heading">
              ${icons.phone}
              ${tx.contact}
            </h3>
            <div class="contact-list">
              ${contact.address ? `
              <div>
                <div class="contact-item-label">${tx.address}</div>
                <div class="contact-item-value">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>${contact.address}</span>
                </div>
              </div>` : ''}
              ${contact.phone ? `
              <div>
                <div class="contact-item-label">${tx.phone}</div>
                <div class="contact-item-value">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 11.5 19.79 19.79 0 01-.01 2.82A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  <a href="tel:${contact.phone}">${contact.phone}</a>
                </div>
              </div>` : ''}
              ${contact.email ? `
              <div>
                <div class="contact-item-label">${tx.email}</div>
                <div class="contact-item-value">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <a href="mailto:${contact.email}">${contact.email}</a>
                </div>
              </div>` : ''}
              ${contact.website ? `
              <div>
                <div class="contact-item-label">${tx.website}</div>
                <a href="https://${contact.website}" target="_blank" rel="noopener noreferrer" class="website-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                  ${contact.website}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              </div>` : ''}
            </div>
          </div>` : ''}

          <!-- Social media -->
          ${(social.facebook || social.instagram || social.youtube) ? `
          <div class="card card-side" style="animation-delay:.12s">
            <h3 class="sidebar-heading" style="gap:8px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--green-700)"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              ${tx.social}
            </h3>
            <div class="social-list">
              ${social.facebook ? `<a href="https://facebook.com/${social.facebook}" target="_blank" rel="noopener noreferrer" class="social-link social-fb">${icons.facebook} Facebook</a>` : ''}
              ${social.instagram ? `<a href="https://instagram.com/${social.instagram}" target="_blank" rel="noopener noreferrer" class="social-link social-ig">${icons.instagram} Instagram</a>` : ''}
              ${social.youtube   ? `<a href="https://youtube.com/${social.youtube}"   target="_blank" rel="noopener noreferrer" class="social-link social-yt">${icons.youtube} YouTube</a>`   : ''}
            </div>
          </div>` : ''}

          <!-- Deadlines -->
          ${deadlines.length > 0 ? `
          <div class="card card-side" style="animation-delay:.16s">
            <h3 class="sidebar-heading">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--green-700)"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              ${tx.deadlines}
            </h3>
            <div class="deadline-list">
              ${deadlines.map(d => `
              <div class="deadline-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <div>
                  <div class="deadline-title">${d.title}</div>
                  <div class="deadline-date">${d.date}</div>
                </div>
              </div>`).join('')}
            </div>
          </div>` : ''}

        </div><!-- /side col -->
      </div>
    </div>

    <!-- FULL-BLEED PROGRAMS SLIDER (bottom of page) -->
    <section class="programs-section">
      <div class="programs-section-header">
        <h2 class="programs-section-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          ${tx.programs}
        </h2>
        ${programs.length > 1 ? `<span class="programs-count">${programs.length} ${language === 'nl' ? 'opleidingen' : 'programs'}</span>` : ''}
      </div>

      ${programs.length === 0
        ? `<p class="no-programs-msg">${tx.noPrograms}</p>`
        : `<div class="slider-viewport" id="slider-viewport">
            <div class="slider-track" id="slider-track">
              ${[...programs, ...programs].map((p) => {
                const tuition = p.tuitionCost && p.tuitionCost !== '0' && p.tuitionCost !== 'free'
                  ? p.tuitionCost : null;
                const tuitionShort = tuition && tuition.length > 30
                  ? tuition.slice(0, 30).trimEnd() + '…'
                  : tuition;
                const tuitionOverflows = tuition && tuition.length > 30;
                return `
                <div class="slider-card">
                  <div class="slider-card-inner">
                    <div class="slider-cluster-tag">${p.cluster || ''}</div>
                    <h3 class="slider-program-name">${p.name}</h3>
                    <div class="slider-badges">
                      ${p.duration ? `<span class="badge-duration">${p.duration}</span>` : ''}
                      ${tuition
                        ? `<span class="badge-tuition badge-tuition--compact" title="${tuition}">${tuitionShort}${tuitionOverflows ? ` <a href="program-detail.html?id=${p.id}" class="badge-more-link">${language === 'nl' ? 'meer' : 'more'} →</a>` : ''}</span>`
                        : `<span class="badge-tuition">${tx.free}</span>`}
                    </div>
                    ${p.description ? `<p class="slider-desc">${p.description.replace(/\s*\|\s*Niveau:[^|]*/i,'').replace(/^Vakkenpakket:\s*/i,'').trim().slice(0, 110)}${p.description.length > 110 ? '…' : ''}</p>` : ''}
                    <a href="program-detail.html?id=${p.id}" class="slider-link">
                      ${language === 'nl' ? 'Bekijk opleiding' : 'View program'} →
                    </a>
                  </div>
                </div>`;
              }).join('')}
            </div>
            ${programs.length > 1 ? `
            <button class="slider-arrow slider-arrow-left"  id="slider-prev" aria-label="Vorige">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button class="slider-arrow slider-arrow-right" id="slider-next" aria-label="Volgende">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>` : ''}
          </div>`
      }
    </section>`;

  // Reveal hero now that content is ready (removes the initial hidden state)
  const heroEl = document.getElementById('hero-section');
  if (heroEl) { heroEl.style.visibility = 'visible'; heroEl.style.animation = 'fadeIn .3s ease'; }

  // Init slider after DOM is painted
  if ((school.programs || []).length > 1) {
    requestAnimationFrame(initSlider);
  }
}

// ── Full-bleed slider ─────────────────────────────────────────
let _sliderTimer   = null;
let _sliderIndex   = 0;
let _sliderTotal   = 0;
let _cardWidth     = 0;
let _visibleCards  = 3;

function initSlider() {
  const track    = document.getElementById('slider-track');
  const viewport = document.getElementById('slider-viewport');
  const prevBtn  = document.getElementById('slider-prev');
  const nextBtn  = document.getElementById('slider-next');
  if (!track || !viewport) return;

  const cards = track.querySelectorAll('.slider-card');
  _sliderTotal = Math.floor(cards.length / 2); // real count (we doubled for loop)
  if (_sliderTotal < 2) return;

  function getVisibleCount() {
    const w = viewport.offsetWidth;
    if (w >= 1024) return 3;
    if (w >= 640)  return 2;
    return 1;
  }

  function layout() {
    _visibleCards = getVisibleCount();
    _cardWidth    = viewport.offsetWidth / _visibleCards;
    cards.forEach(c => { c.style.width = _cardWidth + 'px'; });
    track.style.width = (cards.length * _cardWidth) + 'px';
    jumpTo(_sliderIndex, false);
  }

  function jumpTo(idx, animate = true) {
    _sliderIndex = ((idx % _sliderTotal) + _sliderTotal) % _sliderTotal;
    track.style.transition = animate ? 'transform .5s cubic-bezier(.4,0,.2,1)' : 'none';
    track.style.transform  = `translateX(${-_sliderIndex * _cardWidth}px)`;
  }

  function next() { jumpTo(_sliderIndex + 1); }
  function prev() { jumpTo(_sliderIndex - 1); }

  function startAuto() {
    stopAuto();
    _sliderTimer = setInterval(next, 3500);
  }

  function stopAuto() { clearInterval(_sliderTimer); }

  nextBtn?.addEventListener('click', () => { next(); startAuto(); });
  prevBtn?.addEventListener('click', () => { prev(); startAuto(); });

  viewport.addEventListener('mouseenter', stopAuto);
  viewport.addEventListener('mouseleave', startAuto);

  window.addEventListener('resize', () => { stopAuto(); layout(); startAuto(); });

  layout();
  startAuto();
}

// ── Favorite toggle ───────────────────────────────────────────
function toggleFavorite() {
  if (!currentSchool) return;
  const id = currentSchool.id;

  window.FavSync.toggle('schools', id).then(added => {
    favorites = JSON.parse(localStorage.getItem('fav_schools') || '[]');
    const btn = document.getElementById('btn-fav');
    const tx  = T[language];
    if (btn) {
      btn.classList.toggle('fav-active', added);
      btn.innerHTML = `${added ? icons.heartFill : icons.heart}<span>${added ? tx.removeFav : tx.addFav}</span>`;
    }
  });
}

// ── Compare toggle ────────────────────────────────────────────
function toggleCompare() {
  if (!currentSchool) return;
  const id  = currentSchool.id;
  const idx = compareItems.indexOf(id);
  if (idx === -1) {
    if (compareItems.length >= 3) { alert(language === 'nl' ? 'Je kunt max. 3 scholen vergelijken.' : 'Max 3 schools can be compared.'); return; }
    compareItems.push(id);
  } else {
    compareItems.splice(idx, 1);
  }
  localStorage.setItem('school_compare', JSON.stringify(compareItems));
  const isCmp = compareItems.includes(id);
  const btn   = document.getElementById('btn-cmp');
  const tx    = T[language];
  if (btn) {
    btn.classList.toggle('cmp-active', isCmp);
    btn.innerHTML = `${icons.compare}<span>${isCmp ? tx.removeCompare : tx.addCompare}</span>`;
  }
}

// ── Open House registration ───────────────────────────────────
function registerOH(id, title) {
  const name  = prompt(language === 'nl' ? 'Jouw naam:' : 'Your name:');
  if (!name) return;
  const email = prompt(language === 'nl' ? 'Jouw e-mailadres:' : 'Your email:');
  if (!email) return;

  fetch(`/openhouses/${id}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email }),
  }).then(res => {
    if (res.ok) {
      alert(language === 'nl' ? `✅ Je bent aangemeld voor: ${title}` : `✅ Registered for: ${title}`);
      const reg = JSON.parse(localStorage.getItem('oh_registered') || '[]');
      if (!reg.includes(id)) { reg.push(id); localStorage.setItem('oh_registered', JSON.stringify(reg)); }
    } else {
      alert(language === 'nl' ? 'Aanmelding mislukt. Probeer opnieuw.' : 'Registration failed. Please try again.');
    }
  }).catch(() => {
    alert(language === 'nl' ? 'Server niet bereikbaar.' : 'Server unreachable.');
  });
}

// ── Language toggle ───────────────────────────────────────────
function applyLanguage(lang) {
  language = lang;
  localStorage.setItem('language', lang);
  document.getElementById('btn-nl').classList.toggle('active', lang === 'nl');
  document.getElementById('btn-en').classList.toggle('active', lang === 'en');
  if (currentSchool) renderPage();
}

document.getElementById('btn-nl').addEventListener('click', () => applyLanguage('nl'));
document.getElementById('btn-en').addEventListener('click', () => applyLanguage('en'));

// ── Hamburger ─────────────────────────────────────────────────
document.getElementById('hamburger-btn').addEventListener('click', () => {
  document.getElementById('mobile-nav').classList.toggle('open');
});

// ── Auth / Profile ────────────────────────────────────────────
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
  document.getElementById('login-btn').style.display      = 'none';
  document.getElementById('profile-btn').style.display    = 'flex';
  document.getElementById('mobile-login').style.display   = 'none';
  document.getElementById('mobile-profile').style.display = 'block';
  document.getElementById('profile-name-label').textContent = payload.name  || 'Profiel';
  document.getElementById('popup-name').textContent          = payload.name  || 'Student';
  document.getElementById('popup-email').textContent         = payload.email || '';
  document.getElementById('popup-role').textContent          = payload.role === 'admin' ? '🛡️ Admin' : '🎓 Student';
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

// ── Boot ──────────────────────────────────────────────────────
applyLanguage(language);
initAuth();
window.FavSync.loadFromDB().then(() => {
  favorites = JSON.parse(localStorage.getItem('fav_schools') || '[]');
  loadSchool();
});