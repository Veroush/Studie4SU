// src/routes/schoolRoutes.js
const express = require('express');
const router  = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma  = new PrismaClient();

// GET /schools — all schools
router.get('/', async (req, res) => {
  try {
    const schools = await prisma.school.findMany({
      include: { _count: { select: { programs: true } } },
      orderBy: { name: 'asc' }
    });
    res.json(schools);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /schools/:id — single school with programs
router.get('/:id', async (req, res) => {
  try {
    const school = await prisma.school.findUnique({
      where: { id: req.params.id },
      include: { programs: true }
    });
    if (!school) return res.status(404).json({ error: 'Not found' });
    res.json(school);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;