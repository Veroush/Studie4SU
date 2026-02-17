const express = require("express");
const app = express();
const path = require("path");

app.use(express.static(path.join(__dirname, "../public")));

module.exports = app;

const authRoutes = require("../routes/authRoutes.js");
app.use("/auth", authRoutes);

