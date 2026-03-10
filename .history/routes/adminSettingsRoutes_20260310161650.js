const express = require("express");
const router  = express.Router();
const { getSettings, updateSettings } = require("../controllers/adminSettings");

router.get("/",  getSettings);
router.put("/",  updateSettings);

module.exports = router;