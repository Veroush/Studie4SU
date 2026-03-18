# Studie4SU

Studie4SU is a web platform for students in Suriname to explore higher-education options, compare study programs, view open house events, and take a study-choice quiz that recommends programs based on their interests and profile.

The project combines a static multi-page frontend with an Express API and a Prisma/MySQL database. It also includes an admin area for managing schools, programs, quiz content, open houses, users, platform settings, and quiz statistics.

## Features

- Browse schools and view school detail pages with linked study programs.
- Browse study programs and open detailed program pages.
- Take a study-choice quiz and receive stored recommendations.
- Compare programs on a dedicated comparison page.
- Save favorite schools, programs, and open houses.
- Register and log in with JWT-based authentication.
- Request password reset emails and complete password resets.
- Browse upcoming open houses and register for events when logged in.
- View an About page whose content can be managed from admin settings.
- Access an admin dashboard to manage:
  - schools
  - programs
  - quiz questions and answers
  - open houses
  - users
  - platform settings
  - quiz result statistics

## Tech Stack

**Backend**
- Node.js
- Express
- Prisma ORM
- MySQL
- JWT authentication
- bcrypt for password hashing
- Nodemailer for password reset email delivery

**Frontend**
- HTML
- CSS
- Vanilla JavaScript

**Development tools**
- Nodemon

## Installation

### Prerequisites

- Node.js and npm
- A MySQL database

### 1. Clone the repository

```bash
git clone https://github.com/Veroush/Studie4SU.git
cd Studie4SU
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file

Create a `.env` file in the project root and configure the variables used by the app:

```env
PORT=3000
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE"
JWT_SECRET="your_jwt_secret"
APP_URL="http://localhost:3000"

SMTP_HOST="your_smtp_host"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your_smtp_user"
SMTP_PASS="your_smtp_password"
SMTP_FROM="Studie4SU <no-reply@example.com>"
```

### 4. Set up the database

Generate the Prisma client, apply migrations, and optionally seed the database:

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

If you are developing locally and want to create/update the schema interactively, you can use `npx prisma migrate dev` instead of `npx prisma migrate deploy`.

### 5. Start the development server

```bash
npm run dev
```

The app runs on `http://localhost:3000` by default.

## Usage

After starting the server, the frontend pages are served from the `public/` directory.

### Main pages

- `/` - home page
- `/schools.html` - school directory
- `/school-detail.html` - school detail page
- `/program-detail.html` - program detail page
- `/program-compare.html` - program comparison page
- `/quiz.html` - study-choice quiz
- `/open-houses.html` - open house overview
- `/favorites.html` - saved favorites
- `/about.html` - about page
- `/login.html` - login and registration entry point
- `/forgot-password.html` and `/reset-password.html` - password recovery flow
- `/settings.html` - user settings page

### Admin pages

Admin-facing screens are available as static pages such as:

- `/admin-dashboard.html`
- `/admin-schools.html`
- `/admin-programs.html`
- `/admin-quiz.html`
- `/admin-openhouses.html`
- `/admin-users.html`
- `/admin-settings.html`
- `/admin-statistics.html`

The corresponding API routes are protected with JWT authentication, and admin-only routes also require the authenticated user to have the `admin` role.

### API overview

The Express app exposes route groups for:

- `/auth` - registration, login, password reset flow
- `/api/quiz` - quiz recommendation and quiz result submission
- `/schools` - public school data
- `/programs` - public study program data
- `/openhouses` - public open house data and event registration
- `/favorites` - favorite schools, programs, and open houses
- `/admin` - admin CRUD and reporting routes
- `/admin/settings` - admin platform settings
- `/api/about` - public about-page content from admin settings

## Project Structure

```text
Studie4SU/
├── controllers/        # Auth, favorites, open house, and admin settings handlers
├── middleware/         # JWT auth and admin access middleware
├── prisma/             # Prisma schema, migrations, and seed script
├── public/             # Static frontend pages, CSS, JavaScript, and images
├── routes/             # Express route modules for public and admin APIs
├── src/                # App bootstrap, Express setup, shared constants
├── package.json        # Dependencies and npm scripts
└── README.md
```

## UI Description

Studie4SU is a multi-page website rather than a single-page app. The public side includes a landing page, school and program browsing pages, a quiz flow, open house listings, favorites, and an about page. The admin side provides dedicated management pages for content and reporting. Styling and page behavior are implemented with page-specific CSS and vanilla JavaScript files inside `public/css` and `public/js`.

## Future Improvements

- Add automated tests for API routes and frontend behavior.
- Add a production-ready build and deployment guide.
- Consolidate route/controller organization where overlapping open house logic exists.
- Remove unused dependencies or document future integrations if they are kept.

## Notes

- The current `npm test` script is a placeholder and does not run a real test suite.
- The app depends on a configured database and environment variables before most pages and API routes will work correctly.
