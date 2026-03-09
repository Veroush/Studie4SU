// src/routes/programRoutes.js
const express = require('express');
const router  = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma  = new PrismaClient();

// GET /programs — all programs
router.get('/', async (req, res) => {
  try {
    const programs = await prisma.studyProgram.findMany({
      include: { school: true },
      orderBy: { name: 'asc' }
    });
    res.json(programs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /programs/:id — single program with school
router.get('/:id', async (req, res) => {
  try {
    const program = await prisma.studyProgram.findUnique({
      where: { id: req.params.id },
      include: { school: true }
    });
    if (!program) return res.status(404).json({ error: 'Not found' });
    res.json(program);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;