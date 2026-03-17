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
const { requireAuth, adminOnly } = require("../middleware/auth.js"); // ADDED

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
app.use("/admin",            requireAuth, adminOnly, adminRoutes);         // CHANGED
app.use("/admin/settings",   requireAuth, adminOnly, adminSettingsRoutes); // CHANGED
// Open houses: public read routes at /openhouses
//              admin write routes at /admin/openhouses
app.use("/openhouses",       openHouseRoutes);
app.use("/admin/openhouses", requireAuth, adminOnly, openHouseRoutes);     // CHANGED

// Public routes
app.use("/schools",          schoolRoutes);
app.use("/programs",         programRoutes);
app.use('/favorites',        favoritesRoutes);

module.exports = app;