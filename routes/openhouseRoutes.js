// routes/openHouseRoutes.js
// Open House routes for Studie4SU
//
// Routes in this file:
//   GET    /openhouses              → list all active open houses (public)
//   GET    /openhouses/:id          → get one open house by ID (public)
//   POST   /admin/openhouses        → create an open house (admin)
//   PUT    /admin/openhouses/:id    → update an open house (admin)
//   DELETE /admin/openhouses/:id    → delete an open house (admin)
//
// Note: The public GET routes are registered under /openhouses
//       The admin write routes are registered under /admin/openhouses
//       Both sets of routes live in this one file for convenience.
//       In app.js you'll register this file TWICE:
//         app.use('/openhouses',       openHouseRoutes);
//         app.use('/admin/openhouses', openHouseRoutes);

const express = require('express');
const router  = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma  = new PrismaClient();
const { requireAuth, optionalAuth } = require('../middleware/auth');
const ctrl = require('../controllers/openHousesController');


// ================================================================
//  PUBLIC ROUTES  (read-only)
// ================================================================

// GET /openhouses
// Returns all active open houses, soonest first.
// Optional query param: ?schoolId=school_natin  → filter by school
// optionalAuth: if logged in, response includes registered:true/false per event
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { schoolId } = req.query;

    const openHouses = await prisma.openHouse.findMany({
      where: {
        isActive: true,
        ...(schoolId && { schoolId })
      },
      orderBy: { date: 'asc' },
      include: {
        school: {
          select: { id: true, name: true, shortName: true, type: true }
        },
        registrations: { select: { userId: true } },
      }
    });

    const userId = req.userId || null;

    const data = openHouses.map(oh => ({
      id:                oh.id,
      title:             oh.title,
      description:       oh.description,
      date:              oh.date,
      location:          oh.location,
      isOnline:          oh.isOnline,
      registrationUrl:   oh.registrationUrl,
      school:            oh.school?.shortName || oh.school?.name || oh.title,
      registered:        userId ? oh.registrations.some(r => r.userId === userId) : false,
      registrationCount: oh.registrations.length,
    }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch open houses' });
  }
});

// GET /openhouses/:id
// Returns one open house by ID
router.get('/:id', async (req, res) => {
  try {
    const openHouse = await prisma.openHouse.findUnique({
      where:   { id: req.params.id },
      include: { school: true }
    });

    if (!openHouse) {
      return res.status(404).json({ error: 'Open house not found' });
    }

    res.json(openHouse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch open house' });
  }
});


// ================================================================
//  ADMIN ROUTES  (create / update / delete)
// ================================================================

// POST /admin/openhouses
// Creates a new open house event
//
// Required body fields:
//   title    (string)  — e.g. "Open Dag NATIN"
//   date     (string)  — ISO 8601 date string, e.g. "2026-03-15T10:00:00"
//   schoolId (string)  — must match an existing school ID
//
// Optional body fields:
//   description      (string)
//   location         (string)  — e.g. "Paramaribo, Suriname"
//   isOnline         (boolean) — default false
//   registrationUrl  (string)  — external link
//   isActive         (boolean) — default true
router.post('/', async (req, res) => {
  try {
    const {
      title, description, date, location,
      isOnline, registrationUrl, isActive, schoolId
    } = req.body;

    // Validate required fields
    if (!title || !date || !schoolId) {
      return res.status(400).json({
        error: 'title, date, and schoolId are required'
      });
    }

    // Validate the date is a valid date string
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        error: 'date must be a valid ISO 8601 date string, e.g. "2026-03-15T10:00:00"'
      });
    }

    // Check that the school exists
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) {
      return res.status(404).json({ error: `School with id "${schoolId}" not found` });
    }

    const openHouse = await prisma.openHouse.create({
      data: {
        title,
        description:     description     || null,
        date:            parsedDate,
        location:        location        || null,
        isOnline:        isOnline        ?? false,
        registrationUrl: registrationUrl || null,
        isActive:        isActive        ?? true,
        schoolId
      },
      include: { school: true }
    });

    res.status(201).json(openHouse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create open house' });
  }
});

// PUT /admin/openhouses/:id
// Updates an existing open house
// Send only the fields you want to change
router.put('/:id', async (req, res) => {
  try {
    const {
      title, description, date, location,
      isOnline, registrationUrl, isActive, schoolId
    } = req.body;

    // Check the open house exists
    const existing = await prisma.openHouse.findUnique({
      where: { id: req.params.id }
    });
    if (!existing) {
      return res.status(404).json({ error: 'Open house not found' });
    }

    // If a new date was provided, validate it
    let parsedDate;
    if (date !== undefined) {
      parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          error: 'date must be a valid ISO 8601 date string, e.g. "2026-03-15T10:00:00"'
        });
      }
    }

    // If schoolId is being changed, verify the new school exists
    if (schoolId) {
      const school = await prisma.school.findUnique({ where: { id: schoolId } });
      if (!school) {
        return res.status(404).json({ error: `School with id "${schoolId}" not found` });
      }
    }

    const updated = await prisma.openHouse.update({
      where: { id: req.params.id },
      data: {
        ...(title           !== undefined && { title }),
        ...(description     !== undefined && { description }),
        ...(date            !== undefined && { date: parsedDate }),
        ...(location        !== undefined && { location }),
        ...(isOnline        !== undefined && { isOnline }),
        ...(registrationUrl !== undefined && { registrationUrl }),
        ...(isActive        !== undefined && { isActive }),
        ...(schoolId        !== undefined && { schoolId })
      },
      include: { school: true }
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update open house' });
  }
});

// DELETE /admin/openhouses/:id
// Deletes an open house event permanently
// Tip: consider using PUT to set isActive: false instead of deleting
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.openHouse.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Open house not found' });
    }

    await prisma.openHouse.delete({ where: { id: req.params.id } });

    res.json({ success: true, message: 'Open house deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete open house' });
  }
});


// ================================================================
//  REGISTRATION ROUTES  (auth required)
// ================================================================

// POST /openhouses/:id/register   → register the logged-in user
router.post('/:id/register', requireAuth, ctrl.register);

// DELETE /openhouses/:id/register → unregister the logged-in user
router.delete('/:id/register', requireAuth, ctrl.unregister);


module.exports = router;