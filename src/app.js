// src/app.js
// Express app setup — middleware and route registration
require("dotenv").config();

const express = require("express");
const path    = require("path");
const app     = express();

// ── Middleware ────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// ── Auth middleware ───────────────────────────────────────────
const { requireAuth, adminOnly } = require("../middleware/auth.js");

// ── Routes ───────────────────────────────────────────────────
const authRoutes          = require("../routes/authRoutes.js");
const quizRoutes          = require("../routes/quizRoutes.js");
const adminRoutes         = require("../routes/adminRoutes.js");
const openHouseRoutes     = require("../routes/openHouseRoutes.js");
const schoolRoutes        = require("../routes/schoolRoutes.js");
const programRoutes       = require("../routes/programRoutes.js");
const favoritesRoutes     = require('../routes/favoritesRoutes.js');
const adminSettingsRoutes = require("../routes/adminSettingsRoutes.js");

app.use("/auth",             authRoutes);
app.use("/api/quiz",         quizRoutes);
app.use("/admin",            requireAuth, adminOnly, adminRoutes);
app.use("/admin/settings",   requireAuth, adminOnly, adminSettingsRoutes);
app.use("/openhouses",       openHouseRoutes);
app.use("/admin/openhouses", requireAuth, adminOnly, openHouseRoutes);
app.use("/schools",          schoolRoutes);
app.use("/programs",         programRoutes);
app.use('/favorites',        favoritesRoutes);

// ── Public about page content ─────────────────────────────────
// Added: returns only the aboutUs field from AdminSettings.
// No auth required — this is read-only public content.
// The about.html page fetches this instead of using hardcoded text.
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

app.get("/api/about", async (req, res) => {
  try {
    const settings = await prisma.adminSettings.findFirst();
    if (!settings || !settings.aboutUs) {
      return res.status(404).json({ error: "About content not found" });
    }
    res.json(settings.aboutUs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch about content" });
  }
});

module.exports = app;