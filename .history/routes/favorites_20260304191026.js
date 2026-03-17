const express = require("express");
const router = express.Router();
const { getUserFavorites, addFavoriteSchool } = require("../controllers/favoritesController");

router.get("/:userId", getUserFavorites);
router.post("/school", addFavoriteSchool);

module.exports = router;