// src/app.js
// Express app setup — middleware and route registration
require("dotenv").config();

const express = require("express");
const path    = require("path");
const app     = express();

// ── Middleware ────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// ── Routes ───────────────────────────────────────────────────
const authRoutes      = require("../routes/authRoutes.js");
const quizRoutes      = require("../routes/quizRoutes.js");
const adminRoutes     = require("../routes/adminRoutes.js");
const openHouseRoutes = require("../routes/openHouseRoutes.js");

app.use("/auth",               authRoutes);
app.use("/api/quiz",           quizRoutes);
app.use("/admin",              adminRoutes);

// Open houses: public read routes at /openhouses
//              admin write routes at /admin/openhouses
app.use("/openhouses",         openHouseRoutes);
app.use("/admin/openhouses",   openHouseRoutes);

module.exports = app;