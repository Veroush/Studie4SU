// routes/adminRoutes.js
// Admin routes for Studie4SU
//
// Routes in this file:
//   Quiz results:
//     GET  /admin/results
//     GET  /admin/results/count
//     GET  /admin/results/by-cluster
//
//   Users:
//     GET  /admin/users
//
//   Schools:
//     GET    /admin/schools           → list all schools
//     GET    /admin/schools/:id       → get one school (with its programs)
//     POST   /admin/schools           → create a school
//     PUT    /admin/schools/:id       → update a school
//     DELETE /admin/schools/:id       → delete a school
//
//   Programs:
//     GET    /admin/programs          → list all programs (with school info)
//     GET    /admin/programs/:id      → get one program
//     POST   /admin/programs          → create a program
//     PUT    /admin/programs/:id      → update a program
//     DELETE /admin/programs/:id      → delete a program

const express = require('express');
const router  = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma  = new PrismaClient();


// ================================================================
//  QUIZ RESULTS  (existing routes — unchanged)
// ================================================================

// GET /admin/results
// Returns all quiz results, newest first, including program + school
router.get('/results', async (req, res) => {
  try {
    const results = await prisma.quizResult.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        recommendedProgram: {
          include: { school: true }
        }
      }
    });
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// GET /admin/results/count
// Returns the total number of quiz results
router.get('/results/count', async (req, res) => {
  try {
    const count = await prisma.quizResult.count();
    res.json({ totalStudents: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch count' });
  }
});

// GET /admin/results/by-cluster
// Returns quiz result counts grouped by topCluster
router.get('/results/by-cluster', async (req, res) => {
  try {
    const grouped = await prisma.quizResult.groupBy({
      by: ['topCluster'],
      _count: { topCluster: true },
      orderBy: { _count: { topCluster: 'desc' } }
    });
    // Rename _count.topCluster → count for easier frontend use
    const formatted = grouped.map(g => ({
      topCluster: g.topCluster,
      count:      g._count.topCluster
    }));
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cluster data' });
  }
});


// ================================================================
//  USERS
// ================================================================

// GET /admin/users
// Returns all registered users. NEVER returns the password field.
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id:        true,
        email:     true,
        createdAt: true
        // password is intentionally NOT selected
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});


// ================================================================
//  SCHOOLS
// ================================================================

// GET /admin/schools
// Returns all schools, newest first
router.get('/schools', async (req, res) => {
  try {
    const schools = await prisma.school.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        // Include a count of programs for each school
        _count: { select: { programs: true } }
      }
    });
    res.json(schools);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
});

// GET /admin/schools/:id
// Returns one school by ID, including all its programs
router.get('/schools/:id', async (req, res) => {
  try {
    const school = await prisma.school.findUnique({
      where: { id: req.params.id },
      include: { programs: true }
    });

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.json(school);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch school' });
  }
});

// POST /admin/schools
// Creates a new school
// Required body fields: name, type
// Optional body fields: shortName, website, location
router.post('/schools', async (req, res) => {
  try {
    const { name, shortName, type, website, location } = req.body;

    // Validate required fields
    if (!name || !type) {
      return res.status(400).json({ error: 'name and type are required' });
    }

    const school = await prisma.school.create({
      data: {
        name,
        shortName: shortName || null,
        type,
        website:   website  || null,
        location:  location || null
      }
    });

    res.status(201).json(school);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create school' });
  }
});

// PUT /admin/schools/:id
// Updates an existing school
// Any of these body fields will be updated: name, shortName, type, website, location
router.put('/schools/:id', async (req, res) => {
  try {
    const { name, shortName, type, website, location } = req.body;

    // Check the school exists first
    const existing = await prisma.school.findUnique({
      where: { id: req.params.id }
    });
    if (!existing) {
      return res.status(404).json({ error: 'School not found' });
    }

    const updated = await prisma.school.update({
      where: { id: req.params.id },
      data: {
        // Only update fields that were actually sent in the request
        // If a field is undefined, Prisma will leave it unchanged
        ...(name      !== undefined && { name }),
        ...(shortName !== undefined && { shortName }),
        ...(type      !== undefined && { type }),
        ...(website   !== undefined && { website }),
        ...(location  !== undefined && { location })
      }
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update school' });
  }
});

// DELETE /admin/schools/:id
// Deletes a school by ID
// ⚠️  WARNING: This will fail if the school has programs linked to it.
//     Delete or reassign those programs first, or use onDelete: Cascade in schema.
router.delete('/schools/:id', async (req, res) => {
  try {
    // Check the school exists first
    const existing = await prisma.school.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { programs: true } } }
    });

    if (!existing) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Block deletion if the school still has programs
    if (existing._count.programs > 0) {
      return res.status(400).json({
        error: `Cannot delete school — it still has ${existing._count.programs} program(s) linked to it. Delete those programs first.`
      });
    }

    await prisma.school.delete({ where: { id: req.params.id } });

    res.json({ success: true, message: 'School deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete school' });
  }
});


// ================================================================
//  PROGRAMS
// ================================================================

// GET /admin/programs
// Returns all study programs, including their school
router.get('/programs', async (req, res) => {
  try {
    const programs = await prisma.studyProgram.findMany({
      orderBy: { createdAt: 'desc' },
      include: { school: true }
    });
    res.json(programs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch programs' });
  }
});

// GET /admin/programs/:id
// Returns one program by ID, including its school
router.get('/programs/:id', async (req, res) => {
  try {
    const program = await prisma.studyProgram.findUnique({
      where:   { id: req.params.id },
      include: { school: true }
    });

    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }

    res.json(program);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch program' });
  }
});

// POST /admin/programs
// Creates a new study program
// Required body fields: name, cluster, schoolId
// Optional: description, duration, levelRequired, tuitionCost, careers
router.post('/programs', async (req, res) => {
  try {
    const {
      name, description, cluster, duration,
      levelRequired, tuitionCost, careers, schoolId
    } = req.body;

    // Validate required fields
    if (!name || !cluster || !schoolId) {
      return res.status(400).json({ error: 'name, cluster, and schoolId are required' });
    }

    // Check that the school actually exists
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) {
      return res.status(404).json({ error: `School with id "${schoolId}" not found` });
    }

    const program = await prisma.studyProgram.create({
      data: {
        name,
        description:   description   || null,
        cluster,
        duration:      duration      || null,
        levelRequired: levelRequired || null,
        tuitionCost:   tuitionCost   || null,
        careers:       careers       || null,
        schoolId
      },
      include: { school: true }
    });

    res.status(201).json(program);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create program' });
  }
});

// PUT /admin/programs/:id
// Updates an existing study program
// Send only the fields you want to change
router.put('/programs/:id', async (req, res) => {
  try {
    const {
      name, description, cluster, duration,
      levelRequired, tuitionCost, careers, schoolId
    } = req.body;

    // Check the program exists
    const existing = await prisma.studyProgram.findUnique({
      where: { id: req.params.id }
    });
    if (!existing) {
      return res.status(404).json({ error: 'Program not found' });
    }

    // If schoolId is being changed, verify the new school exists
    if (schoolId) {
      const school = await prisma.school.findUnique({ where: { id: schoolId } });
      if (!school) {
        return res.status(404).json({ error: `School with id "${schoolId}" not found` });
      }
    }

    const updated = await prisma.studyProgram.update({
      where: { id: req.params.id },
      data: {
        ...(name          !== undefined && { name }),
        ...(description   !== undefined && { description }),
        ...(cluster       !== undefined && { cluster }),
        ...(duration      !== undefined && { duration }),
        ...(levelRequired !== undefined && { levelRequired }),
        ...(tuitionCost   !== undefined && { tuitionCost }),
        ...(careers       !== undefined && { careers }),
        ...(schoolId      !== undefined && { schoolId })
      },
      include: { school: true }
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update program' });
  }
});

// DELETE /admin/programs/:id
// Deletes a study program by ID
// ⚠️  WARNING: This will fail if there are quiz results linked to this program.
//     The admin dashboard should warn before deleting.
router.delete('/programs/:id', async (req, res) => {
  try {
    // Check the program exists
    const existing = await prisma.studyProgram.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { quizResults: true } } }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Program not found' });
    }

    // Warn if this program has quiz results attached
    if (existing._count.quizResults > 0) {
      return res.status(400).json({
        error: `Cannot delete program — it has ${existing._count.quizResults} quiz result(s) linked to it.`
      });
    }

    await prisma.studyProgram.delete({ where: { id: req.params.id } });

    res.json({ success: true, message: 'Program deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete program' });
  }
});


module.exports = router;