const express = require("express");
const router = express.Router();
const { getSettings, updateSettings } = require("../controllers/adminSettings");

// GET /admin/settings
router.get("/", getSettings);

// PUT /admin/settings
router.put("/", updateSettings);

module.exports = router;