'use strict';
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

// ── Helper: extract user from JWT ─────────────────────────────
function getUserFromToken(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// ── GET /favorites/me ─────────────────────────────────────────
async function getMyFavorites(req, res) {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const [schools, programs, openhouses] = await Promise.all([
      prisma.favoriteSchool.findMany({
        where: { userId: user.id },
        select: { schoolId: true },
      }),
      prisma.favoriteProgram.findMany({
        where: { userId: user.id },
        select: { programId: true },
      }),
      prisma.favoriteOpenHouse.findMany({
        where: { userId: user.id },
        select: { openHouseId: true },
      }),
    ]);

    res.json({
      schools:    schools.map(f => f.schoolId),
      programs:   programs.map(f => f.programId),
      openhouses: openhouses.map(f => f.openHouseId),
    });
  } catch (err) {
    console.error('[GET /favorites/me]', err);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
}

// ── POST /favorites/schools ───────────────────────────────────
async function addSchool(req, res) {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  const { schoolId } = req.body;
  if (!schoolId) return res.status(400).json({ error: 'schoolId required' });

  try {
    const fav = await prisma.favoriteSchool.upsert({
      where:  { userId_schoolId: { userId: user.id, schoolId } },
      create: { userId: user.id, schoolId },
      update: {},
    });
    res.json(fav);
  } catch (err) {
    console.error('[POST /favorites/schools]', err);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
}

// ── DELETE /favorites/schools/:schoolId ───────────────────────
async function removeSchool(req, res) {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  try {
    await prisma.favoriteSchool.delete({
      where: { userId_schoolId: { userId: user.id, schoolId: req.params.schoolId } },
    });
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') return res.json({ success: true });
    console.error('[DELETE /favorites/schools]', err);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
}

// ── POST /favorites/programs ──────────────────────────────────
async function addProgram(req, res) {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  const { programId } = req.body;
  if (!programId) return res.status(400).json({ error: 'programId required' });

  try {
    const fav = await prisma.favoriteProgram.upsert({
      where:  { userId_programId: { userId: user.id, programId } },
      create: { userId: user.id, programId },
      update: {},
    });
    res.json(fav);
  } catch (err) {
    console.error('[POST /favorites/programs]', err);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
}

// ── DELETE /favorites/programs/:programId ─────────────────────
async function removeProgram(req, res) {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  try {
    await prisma.favoriteProgram.delete({
      where: { userId_programId: { userId: user.id, programId: req.params.programId } },
    });
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') return res.json({ success: true });
    console.error('[DELETE /favorites/programs]', err);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
}

// ── POST /favorites/openhouses ────────────────────────────────
async function addOpenHouse(req, res) {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  const { openHouseId } = req.body;
  if (!openHouseId) return res.status(400).json({ error: 'openHouseId required' });

  try {
    const fav = await prisma.favoriteOpenHouse.upsert({
      where:  { userId_openHouseId: { userId: user.id, openHouseId } },
      create: { userId: user.id, openHouseId },
      update: {},
    });
    res.json(fav);
  } catch (err) {
    console.error('[POST /favorites/openhouses]', err);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
}

// ── DELETE /favorites/openhouses/:openHouseId ─────────────────
async function removeOpenHouse(req, res) {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  try {
    await prisma.favoriteOpenHouse.delete({
      where: { userId_openHouseId: { userId: user.id, openHouseId: req.params.openHouseId } },
    });
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') return res.json({ success: true });
    console.error('[DELETE /favorites/openhouses]', err);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
}

module.exports = {
  getMyFavorites,
  addSchool, removeSchool,
  addProgram, removeProgram,
  addOpenHouse, removeOpenHouse,
};