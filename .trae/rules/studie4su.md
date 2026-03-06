# Studie4SU — Full Project Handoff Prompt 

You are continuing development on **Studie4SU**, a study-choice guide web app for students in Suriname. Read this entire document carefully before touching anything. Everything below is the complete current state of the project: architecture, file structure, backend routes, models, middleware, frontend patterns, what has been built, what has been fixed, what is still pending, and all design rules.

---

## 1. WHAT THE APP IS

Studie4SU helps Surinamese students find the right school and study program in Suriname. Core features:
- Browse schools and their programs
- Filter/search schools by type (University / HBO / MBO)
- View school detail pages with programs, open days, contact info
- View program detail pages
- Take a quiz to find a matching study program
- Browse and register for open houses (open dagen)
- Save favourite schools, programs, and open houses
- Login / register as a student or admin
- Compare two schools side by side
- Admin panel to manage schools, programs, open houses, quiz, users, statistics, and app settings

**Language:** The entire frontend supports Dutch (NL) and English (EN). Language is toggled per page via `localStorage.getItem('language')`. All pages have `data-nl` / `data-en` attributes on nav links and JS translation objects `T = { nl: {...}, en: {...} }`.

**Theme colours:**
- Dark green background: `#0d2b1f` (CSS var `--bg-dark`)
- Gold accent: `#e8b84b` (CSS var `--gold`)
- Green mid: `#1a4a32`, accent green: `#2d7a4f`, light green: `#3d9b65`, teal: `#3da08a`
- Fonts: `Playfair Display` (headings/logo), `DM Sans` (body)

---

## 2. TECH STACK — IMPORTANT CORRECTION FROM ORIGINAL DOCS

The original handoff doc described MongoDB + Mongoose. **This is wrong.** The actual stack is:

- **Database:** MySQL
- **ORM:** Prisma (not Mongoose)
- **Schema file:** `prisma/schema.prisma`
- **Seed file:** `prisma/seed.js`
- **Backend:** Node.js + Express
- **Auth:** JWT (jsonwebtoken), passwords hashed with bcrypt
- **Frontend:** Vanilla HTML/CSS/JS, no framework
- **Fonts:** Google Fonts (Playfair Display + DM Sans)

Do NOT reference Mongoose, MongoDB, or `.mongoose` patterns anywhere. Use Prisma client (`prisma.school.findMany()` etc.).

---

## 3. PRISMA SCHEMA — ALL MODELS

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String
  role      String   @default("student")
  createdAt DateTime @default(now())
}

model School {
  id         String         @id @default(cuid())
  name       String
  shortName  String?
  type       String
  website    String?
  location   String?
  createdAt  DateTime       @default(now())
  programs   StudyProgram[]
  openHouses OpenHouse[]
}

model StudyProgram {
  id            String       @id @default(cuid())
  name          String
  description   String?      @db.Text
  cluster       String
  duration      String?
  levelRequired String?      @db.Text
  tuitionCost   String?
  careers       String?      @db.Text
  createdAt     DateTime     @default(now())
  schoolId      String
  school        School       @relation(fields: [schoolId], references: [id])
  quizResults   QuizResult[]
}

model OpenHouse {
  id              String   @id @default(cuid())
  title           String
  description     String?  @db.Text
  date            DateTime
  location        String?
  isOnline        Boolean  @default(false)
  registrationUrl String?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  schoolId        String
  school          School   @relation(fields: [schoolId], references: [id])
}

model QuizResult {
  id                 String       @id @default(cuid())
  scores             Json
  topCluster         String
  createdAt          DateTime     @default(now())
  studentId          String?
  student            Student?     @relation(fields: [studentId], references: [id])
  programId          String
  recommendedProgram StudyProgram @relation(fields: [programId], references: [id])
}

model Student {
  id          String       @id @default(cuid())
  name        String?
  email       String?      @unique
  schoolYear  String?
  createdAt   DateTime     @default(now())
  quizResults QuizResult[]
}

model QuizQuestion {
  id        String       @id @default(cuid())
  text      String
  type      String       // "single" | "multiple"
  order     Int          @default(0)
  answers   QuizAnswer[]
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
}

model QuizAnswer {
  id          String       @id @default(cuid())
  questionId  String
  question    QuizQuestion @relation(fields: [questionId], references: [id])
  text        String
  programLink String?      // matches quiz cluster scoring e.g. "Technologie"
  order       Int          @default(0)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Question {
  id         String         @id @default(cuid())
  text       String
  orderIndex Int
  isActive   Boolean        @default(true)
  createdAt  DateTime       @default(now())
  options    AnswerOption[]
}

model AnswerOption {
  id         String   @id @default(cuid())
  text       String
  weights    Json
  questionId String
  question   Question @relation(fields: [questionId], references: [id])
}
```

**Seeded school IDs** (real string IDs in the DB, used by frontend):
- `school_adekus` — Anton de Kom Universiteit van Suriname
- `school_ptc` — Polytechnic College Suriname
- `school_fhr` — Frederik Hendrik Rudolf Lim A Po Institute

**Seeded program IDs** (sample — cluster field matches quiz scoring):
- `prog_aa1` Agrarische Produktie — TECH
- `prog_aa2` Bedrijfskunde — BUS
- `prog_aa3` Biologie — SCI
- `prog_aa6` Electrotechniek — TECH
- `prog_aa7` Fysiotherapie — MED
- `prog_aa8` Geneeskunde — MED
- `prog_aa16` Onderwijs- en Pedagogische Wetenschappen — EDU
- `prog_aa17` Psychologie — SOC
- `prog_aa20` Rechtswetenschappen — LAW
- `prog_ba4` Elektrotechniek (PTC) — TECH
- `prog_ba8` ICT (PTC) — TECH
- `prog_ca1` Business Management (FHR) — BUS

---

## 4. COMPLETE FOLDER STRUCTURE

```
studie4su/
├── public/
│   ├── index.html
│   ├── schools.html
│   ├── school-detail.html
│   ├── school-compare.html        ✅
│   ├── program-detail.html
│   ├── quiz.html
│   ├── open-houses.html
│   ├── login.html
│   ├── register.html
│   ├── favorites.html             ✅
│   ├── admin/
│   │   ├── admin-dashboard.html
│   │   ├── admin-schools.html
│   │   ├── admin-programs.html
│   │   ├── admin-openhouses.html
│   │   ├── admin-quiz.html
│   │   ├── admin-users.html
│   │   ├── admin-statistics.html
│   │   └── admin-settings.html    ✅ BUILT
│   ├── css/
│   │   ├── style.css
│   │   ├── schools.css            ← CANONICAL DESIGN REFERENCE (public header/footer)
│   │   ├── school-detail.css
│   │   ├── school-compare.css
│   │   ├── program-detail.css
│   │   ├── favorites.css
│   │   ├── quiz.css
│   │   ├── open-houses.css
│   │   ├── admin-dashboard.css    ← CANONICAL DESIGN REFERENCE (admin pages)
│   │   ├── admin-statistics.css
│   │   └── admin-settings.css     ✅ BUILT
│   └── js/
│       ├── index.js
│       ├── schools.js
│       ├── school-detail.js
│       ├── school-compare.js
│       ├── program-detail.js
│       ├── quiz.js
│       ├── open-houses.js
│       ├── favorites.js
│       ├── floating-icons.js
│       └── admin/
│           ├── admin-dashboard.js
│           ├── admin-schools.js
│           ├── admin-programs.js
│           ├── admin-openhouses.js
│           ├── admin-quiz.js
│           ├── admin-users.js
│           ├── admin-statistics.js
│           └── admin-settings.js  ✅ BUILT
│
├── server/
│   ├── server.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── schools.js
│   │   ├── programs.js
│   │   ├── openHouses.js
│   │   └── admin.js
│   ├── middleware/
│   │   ├── auth.js                ← requireAuth (JWT verify)
│   │   └── adminOnly.js           ← checks role === 'admin'
│   └── controllers/
│       ├── schoolsController.js
│       ├── programsController.js
│       ├── openHousesController.js
│       └── adminController.js
│
├── prisma/
│   ├── schema.prisma
│   └── seed.js
│
├── .env                           ← DATABASE_URL, JWT_SECRET, PORT
└── package.json
```

---

## 5. BACKEND — API ROUTES

**Auth:**
- `POST /auth/login` → validates credentials, returns JWT
- `POST /auth/register` → creates user, returns JWT
- JWT payload: `{ id, name, email, role }` — role is `'student'` or `'admin'`
- Token stored in `localStorage` as `auth_token`
- Decoded client-side: `JSON.parse(atob(token.split('.')[1]))`
- Expiry check: `payload.exp * 1000 < Date.now()`

**Public routes (no auth):**
- `GET /schools` — all schools
- `GET /schools/:id` — single school with programs
- `GET /programs` — all programs
- `GET /programs/:id` — single program with school
- `GET /open-houses` — upcoming open houses

**Admin routes (requireAuth + adminOnly):**
- `GET/POST /admin/schools`
- `PUT/DELETE /admin/schools/:id`
- Same pattern for `/admin/programs` and `/admin/open-houses`
- `GET/PUT /admin/settings` — **backend NOT YET IMPLEMENTED** (frontend ✅ built)

---

## 6. ADMIN PANEL — DESIGN SYSTEM

The admin panel uses a completely **separate design system** from the public site. It is a light/gray professional dashboard — NOT the dark green public theme.

**CSS:**
- `admin-dashboard.css` — base for ALL admin pages (sidebar, topbar, cards, tables, stats, charts)
- `admin-statistics.css` — additive on top of dashboard.css
- `admin-settings.css` — additive on top of dashboard.css

**Layout pattern (every admin page):**
- Fixed left sidebar (`256px`) with nav: Main / Manage / Analytics / System
- `.main-container` with `margin-left: var(--sidebar-width)`
- Sticky `.top-bar` with page title, user info (`id="admin-name"`), logout button
- `.content-area` as scrollable main area
- Mobile: sidebar slides in, overlay covers content

**Admin sidebar nav links:**
- Dashboard → `admin-dashboard.html`
- Schools → `admin-schools.html`
- Programs → `admin-programs.html`
- Open Houses → `admin-openhouses.html`
- Quiz → `admin-quiz.html`
- Users → `admin-users.html`
- Statistics → `admin-statistics.html`
- Settings → `admin-settings.html` ✅

**Admin JS boot pattern (every admin page — always first):**
```js
function checkAdminAccess() {
  const token = localStorage.getItem('auth_token');
  if (!token) { window.location.href = 'login.html'; return; }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role !== 'admin') { window.location.href = 'index.html'; }
    document.getElementById('admin-name').textContent = payload.name || 'Admin';
  } catch {
    window.location.href = 'login.html';
  }
}
checkAdminAccess();
```

**Admin settings page — FULLY BUILT:**
- 5 sections: Language Management, Platform Configuration, User Features, Notifications, Data & Privacy
- `GET /admin/settings` on load → falls back to defaults if backend unavailable
- `PUT /admin/settings` on save
- Auto-saves draft to `localStorage('settings_draft')` every 800ms
- Unsaved changes badge, Ctrl+S shortcut, `beforeunload` warning
- Toast system for success/error
- Reset to defaults button

---

## 7. FRONTEND PATTERNS — EVERY PUBLIC PAGE

### Auth / Profile popup:
```js
function decodeToken(token) {
  try { return JSON.parse(atob(token.split('.')[1])); }
  catch { return null; }
}
function initAuth() {
  const token = localStorage.getItem('auth_token');
  if (!token) return;
  const payload = decodeToken(token);
  if (!payload || payload.exp * 1000 < Date.now()) {
    localStorage.removeItem('auth_token'); return;
  }
  document.getElementById('login-btn').style.display    = 'none';
  document.getElementById('profile-btn').style.display  = 'flex';
  document.getElementById('mobile-login').style.display   = 'none';
  document.getElementById('mobile-profile').style.display = 'block';
  document.getElementById('profile-name-label').textContent = payload.name || 'Profiel';
  document.getElementById('popup-name').textContent  = payload.name  || 'Student';
  document.getElementById('popup-email').textContent = payload.email || '';
  document.getElementById('popup-role').textContent  = payload.role === 'admin' ? '🛡️ Admin' : '🎓 Student';
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
```

### Fallback data pattern:
```js
try {
  const res = await fetch('/schools');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
} catch (err) {
  console.warn('[Studie4SU] Backend unavailable, using fallback:', err.message);
  // use FALLBACK_SCHOOLS
}
```
**Never remove fallback data — app must work without backend.**

### Boot sequence:
```js
document.addEventListener('DOMContentLoaded', () => {
  initAuth();      // always first
  applyLang(lang);
  init();          // page-specific
});
```

### Fav toast pattern (schools.js / school-detail.js):
```js
let _toastTimer;
function showFavToast(added) {
  let el = document.getElementById('fav-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'fav-toast';
    el.className = 'fav-toast';
    document.body.appendChild(el);
  }
  const msg = added
    ? (lang === 'nl' ? 'Toegevoegd aan favorieten' : 'Added to favourites')
    : (lang === 'nl' ? 'Verwijderd uit favorieten' : 'Removed from favourites');
  el.innerHTML = added
    ? `${msg} &nbsp;<a href="favorites.html" class="toast-fav-link">${lang === 'nl' ? 'Bekijk favorieten →' : 'View favourites →'}</a>`
    : msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}
```
CSS for this toast lives in `schools.css` (canonical) and is copied into `school-detail.css`.

---

## 8. LOCALSTORAGE KEYS — COMPLETE MAP

| Key | Written by | Read by | Purpose |
|-----|-----------|---------|---------|
| `auth_token` | login page | all pages | JWT token |
| `language` | all pages | all pages | `'nl'` or `'en'` |
| `fav_schools` | `schools.js`, `school-detail.js` | `favorites.js`, `schools.js`, `school-detail.js` | Array of school IDs |
| `fav_programs` | **nobody yet ← bug** | `favorites.js` | Array of program IDs |
| `fav_openhouses` | `open-houses.js` | `favorites.js`, `open-houses.js` | Array of open house IDs |
| `fav_openhouses_data` | `open-houses.js` | `favorites.js` | Full open house objects for offline display |
| `oh_registered` | `open-houses.js` | `open-houses.js` | Array of registered open house IDs |
| `compare_school_a` | `school-detail.js` | `school-compare.js` | School ID for compare slot A |
| `compare_school_b` | `schools.js` | `school-compare.js` | School ID for compare slot B |
| `quiz_pending_answers` | `quiz.js` | `quiz.js` | Saved answers before login redirect |
| `quiz_pending_lang` | `quiz.js` | `quiz.js` | Language at time of quiz save |
| `settings_draft` | `admin-settings.js` | `admin-settings.js` | Auto-saved settings draft |

**Fixed this session:** `school-detail.js` previously used `school_favorites` (wrong key). Now correctly uses `fav_schools` for both read and write.

---

## 9. PAGE-BY-PAGE DETAILS

### index.html / index.js
- Hero, features grid, schools preview, events preview, quiz banner
- `fetchSchools()` → `GET /schools`, falls back to `FALLBACK_SCHOOLS`
- Events section: still hardcoded `upcomingEvents` array (needs `fetchEvents()`)
- Has cinematic parallax floating icons (`floating-icons.js`)

### schools.html / schools.js / schools.css
- Search, filter by type/location/level, sort
- **Known bug:** calls `/admin/schools` instead of `/schools` — do not fix until teammate confirms public route returns populated data
- Compare feature: sticky bar → `school-compare.html`
- Picking mode (`?picking=true`): banner + "✓ Selecteer" buttons → saves to `compare_school_b`
- Fav toggle writes to `fav_schools`, shows fav toast with link

### school-detail.html / school-detail.js / school-detail.css
- Loads by `?id=`
- Hero, stats bar, content grid, full-bleed programs slider
- Fav button writes to `fav_schools` ✅ (fixed from `school_favorites`)
- Fav toast on add/remove with "Bekijk favorieten →" link ✅
- Compare button → saves `compare_school_a` → redirects to `school-compare.html`
- Fallback `SCHOOL_DATA` for: `school_adekus`, `school_natin`, `school_iol`, `school_covab`, `school_imeao`, `school_ptc`, `school_igsr`

### school-compare.html / school-compare.js / school-compare.css
- Reads `compare_school_a` + `compare_school_b`
- Comparison table with gold highlight on differing rows
- "Change school" → picking mode; Reset → clears keys, back to `schools.html`

### program-detail.html / program-detail.js / program-detail.css
- Loads by `?id=`
- Shows name, school, duration, tuition, description, required subjects, careers
- **No favourite button** — `fav_programs` has no writer (see Section 11)

### quiz.html / quiz.js / quiz.css
- 8 questions, bilingual
- 7 clusters: TECH, MED, BUS, SOC, EDU, SCI, LAW
- "Bekijk School" → `school-detail.html?id=` via `PROGRAM_SCHOOL_MAP` ✅
- "Bekijk Programma" → `program-detail.html?id=` via `PROGRAM_ID_MAP` ✅ (was broken)
- `PROGRAM_ID_MAP`:
  ```js
  const PROGRAM_ID_MAP = {
    program_technology:  'prog_aa6',
    program_medical:     'prog_aa8',
    program_business:    'prog_aa2',
    program_social_work: 'prog_aa17',
    program_education:   'prog_aa16',
    program_science:     'prog_aa3',
    program_law:         'prog_aa20',
  };
  ```
- UI compacted ✅: 2-column answer grid, max-width 68rem, fits on 900px laptop without scrolling

### open-houses.html / open-houses.js / open-houses.css
- List + calendar view, filter: All / Upcoming / Saved
- Fav toast link text now translates correctly ✅ (was hardcoded Dutch)
- Register → Google Calendar
- **Pending:** hardcoded `EVENTS` array, needs migration to `GET /open-houses`

### favorites.html / favorites.js / favorites.css
- 3 tabs: Scholen / Opleidingen / Open Dagen
- Reads: `fav_schools`, `fav_programs`, `fav_openhouses`
- Remove button animates, shows empty state when tab empty

### admin-settings.html + admin-settings.js + admin-settings.css ✅ FULLY BUILT
- See Section 6 for full details

---

## 10. TEAMMATE'S TASKS (database manager — do not touch)

- `PATCH /users/me/favorites` endpoint (array of school IDs)
- `GET/PUT /admin/settings` backend + Prisma model (singleton)
- Seed `OpenHouse` table with real data
- Confirm `StudyProgram` IDs match `PROGRAM_ID_MAP`
- Confirm `GET /schools` returns populated programs before `schools.js` route fix
- DB indexes, data validation, soft deletes

---

## 11. WHAT STILL NEEDS TO BE DONE — YOUR TASKS

### Unblocked (can do now):

1. **404 / bad ID handling** — `school-detail.html` and `program-detail.html` show broken UI on invalid `?id=`. Need graceful error state with "niet gevonden" message and back button. Also a general `404.html` page for missing routes.

2. **`fav_programs` writer missing** — `favorites.js` reads `fav_programs` and shows a programs tab, but no page in the app ever writes to this key. `program-detail.js` has no favourite button. Users can never populate the programs tab. Fix: add a favourite button to `program-detail.html` that writes to `fav_programs`, matching the toast pattern from `school-detail.js`.

### Blocked until teammate finishes:

3. **`open-houses.js` → real API** — swap hardcoded `EVENTS` for `GET /open-houses` (needs seeding)
4. **`schools.js` route fix** — `/admin/schools` → `/schools` (needs teammate to confirm populated response)
5. **Homepage events preview** — `fetchEvents()` calling `GET /open-houses` (needs seeding)
6. **Favourites DB sync** — once `PATCH /users/me/favorites` exists, `favorites.js` needs to sync when logged in

### Infrastructure (unclaimed):

7. **CORS config** — localhost only, needs updating before deployment
8. **Error boundaries** — unexpected API shapes silently break several pages

---

## 12. KNOWN ISSUES & THINGS THAT GO WRONG

1. **`str_replace` on files with `\r\n` line endings** — use Python string replacement instead:
   ```bash
   python3 - << 'EOF'
   with open('/home/claude/file.js', 'r') as f: c = f.read()
   c = c.replace('old string', 'new string')
   with open('/home/claude/file.js', 'w') as f: f.write(c)
   EOF
   ```
2. **CSS stacking contexts** — never add `filter`, `transform`, or `will-change` to page sections.
3. **Header** — always copy from `schools.html`. Logo: gold text + white span. Hamburger: SVG 3-line, NOT `☰`. Mobile nav: flat `<a>` tags, no `<ul>`.
4. **Profile popup** — must include all four IDs: `profile-btn`, `login-btn`, `mobile-login`, `mobile-profile`. Missing any causes `initAuth()` errors.
5. **Fallback data** — never remove. App must work without backend.
6. **`initAuth()` must always be called first** in the boot sequence.
7. **Language** — all dynamic HTML uses ternaries `lang === 'nl' ? '...' : '...'`. Never hardcode Dutch only.
8. **Admin pages** — always check token + `role === 'admin'` at load.
9. **`schools.js` wrong route** — still calls `/admin/schools`. Leave it until teammate confirms `/schools` is ready.
10. **Floating icons** — never animate `.fi-wrap`. Never `display:none` on icons.
11. **Admin CSS is separate** — never apply the dark green public theme to admin pages. Two completely different design systems.
12. **Prisma, not Mongoose** — MySQL + Prisma. Never use Mongoose syntax.

---

## 13. DESIGN RULES

**Public site:**
- `schools.css` = canonical reference for headers/footers
- Cards: `border-radius: 16px`, `box-shadow: var(--shadow-md)`
- Headings: `Playfair Display`, gold or green `<span>` for key word
- Primary CTA: gold (`#e8b84b`) dark text. Secondary: ghost border
- Never green buttons on dark backgrounds
- Fonts: `Playfair Display` + `DM Sans` only

**Admin panel:**
- `admin-dashboard.css` = canonical base for all admin pages
- Light/gray design — white backgrounds, gray borders, green accents
- Sidebar: `var(--color-gray-50)`, `256px` wide
- Active nav: `background: var(--color-green-600); color: white`

---

## 14. CINEMATIC PARALLAX FLOATING ICONS (index.html only)

- 4 layers, 58 icons total, 8 types, all generated by `floating-icons.js` at runtime
- Click animations per icon type
- **Rules:** never animate `.fi-wrap`, always animate `.fi-icon` or SVG children, never `display:none`
- Coordinate-based click detection — do not change this approach

---

## 15. WHAT WAS FIXED IN THE PREVIOUS SESSION

1. **`school-detail.js`** — localStorage key `school_favorites` → `fav_schools` (lines 5 and 683)
2. **`school-detail.js` + `school-detail.css`** — added `showFavToast()` with "Bekijk favorieten →" / "View favourites →" link, matching `schools.js` pattern exactly
3. **`open-houses.js`** — added `viewFavourites` to both NL/EN translation objects; replaced hardcoded Dutch link text in `showToast()` with `t('viewFavourites')`
4. **`quiz.js`** — added `PROGRAM_ID_MAP`; fixed "Bekijk Programma" from `schools.html` dead-end to `program-detail.html?id=${programId}`; button disabled if no ID found
5. **`quiz.css`** — compacted layout: page max-width `48rem` → `68rem`; answers converted to 2-column CSS grid (collapses to 1 col below 560px); question card padding/heading sizes reduced; nav buttons tightened; progress bar margin halved
6. **`admin-settings.html` + `admin-settings.js` + `admin-settings.css`** — entire settings page built from scratch; 5 sections; GET/PUT `/admin/settings`; draft auto-save; toast system; reset to defaults

---

assignemt criteria:
hashing, middleware, error handling, security and jwt, protected routes and authorization

At the end of each session when asked, generate a detailed session log including: 
what was built, what was fixed, errors solved, decisions made and why, ideas that were brainstormed and what's still pending.